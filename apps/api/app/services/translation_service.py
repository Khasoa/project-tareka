from __future__ import annotations

from hashlib import sha256

import logging
import httpx

from sqlalchemy.orm import Session

from app.core.cache import cache_get_json, cache_set_json
from app.core.config import settings
from app.services.ai_service import AIService
from app.utils.language import detect_language
from app.utils.input_sanitizer import sanitize_text

_log = logging.getLogger(__name__)

_LANG_MAP = {
    "en": "eng_Latn",
    "sw": "swh_Latn",
}


async def translate_content(
    db: Session,
    *,
    text: str,
    target_language: str,
    actor_user_id: str | None,
) -> dict[str, object]:
    ai = AIService(db, actor_user_id=actor_user_id)
    clean = sanitize_text(text)
    target = target_language.strip().lower()
    target = sanitize_text(target)
    source_lang = detect_language(clean)

    if target not in _LANG_MAP:
        return {
            "translated": clean,
            "source_lang": source_lang,
            "target_lang": target,
            "provider": "none",
            "model": "none",
            "fallback_used": False,
            "skipped": True,
            "reason": "unsupported_target_language",
        }

    if source_lang == target:
        _safe_log(ai, clean, "none", "none", True)
        return {
            "translated": clean,
            "source_lang": source_lang,
            "target_lang": target,
            "provider": "none",
            "model": "none",
            "fallback_used": False,
            "skipped": True,
            "reason": "source_equals_target",
        }

    cache_key = _translation_cache_key(clean, target)
    try:
        cached = cache_get_json(cache_key)
    except Exception:
        _log.warning("translation_cache_unavailable")
        cached = None
    if isinstance(cached, dict):
        return cached

    try:
        translated = await _translate_with_nllb(clean, source_lang, target)
        _safe_log(ai, clean, "nllb", settings.NLLB_MODEL, True)
        result = {
            "translated": translated,
            "source_lang": source_lang,
            "target_lang": target,
            "provider": "nllb",
            "model": settings.NLLB_MODEL,
            "fallback_used": False,
            "skipped": False,
        }
        try:
            cache_set_json(cache_key, result, ttl_seconds=24 * 60 * 60)
        except Exception:
            _log.warning("translation_cache_unavailable")
        return result
    except Exception:
        try:
            fallback = await ai.strict_translate_with_claude(clean, target)
            _safe_log(ai, clean, "claude", settings.ANTHROPIC_MODEL, True)
            return {
                "translated": fallback["translated"],
                "source_lang": source_lang,
                "target_lang": target,
                "provider": "claude",
                "model": settings.ANTHROPIC_MODEL,
                "fallback_used": True,
                "skipped": False,
            }
        except Exception:
            _safe_log(ai, clean, "none", "none", False)
            return {
                "translated": clean,
                "source_lang": source_lang,
                "target_lang": target,
                "provider": "none",
                "model": "none",
                "fallback_used": True,
                "skipped": False,
                "error": "translation_unavailable",
            }


async def translate_for_user(
    db: Session,
    *,
    text: str,
    user,
    target_language: str | None = None,
) -> dict[str, object]:
    requested_lang = sanitize_text(target_language or getattr(user, "language", "") or "en").lower()
    return await translate_content(
        db,
        text=text,
        target_language=requested_lang,
        actor_user_id=getattr(user, "id", None),
    )


async def translate_for_channel(
    db: Session,
    *,
    text: str,
    target_language: str,
    channel: str,
    actor_user_id: str | None = None,
) -> dict[str, object]:
    translated = await translate_content(
        db,
        text=text,
        target_language=target_language,
        actor_user_id=actor_user_id,
    )
    normalized_channel = sanitize_text(channel).lower()
    rendered = sanitize_text(str(translated.get("translated", text)))

    if normalized_channel in {"sms", "notification"}:
        rendered = rendered[:320]
    if normalized_channel == "ussd":
        rendered = rendered.replace(";", ",").replace(":", " - ").replace("!", ".")
        rendered = rendered[:182]

    translated["translated"] = rendered
    translated["channel"] = normalized_channel
    return translated


async def _translate_with_nllb(text: str, source_language: str, target_language: str) -> str:
    chunks = _chunk_text(text, 700)
    out: list[str] = []

    headers = {}
    hf_token = getattr(settings, "HUGGINGFACE_API_KEY", "")
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"

    model = settings.NLLB_MODEL
    url = f"https://api-inference.huggingface.co/models/{model}"
    src_lang = _source_to_nllb(source_language, target_language)

    async with httpx.AsyncClient(timeout=30.0) as client:
        for chunk in chunks:
            payload = {
                "inputs": _protect_terms(chunk),
                "parameters": {
                    "src_lang": src_lang,
                    "tgt_lang": _LANG_MAP[target_language],
                },
            }
            res = await client.post(url, headers=headers, json=payload)
            res.raise_for_status()
            data = res.json()
            translated = _extract_hf_text(data)
            out.append(_restore_terms(translated))

    return sanitize_text(" ".join(out))


def _extract_hf_text(data: object) -> str:
    if isinstance(data, list) and data and isinstance(data[0], dict):
        txt = data[0].get("translation_text") or data[0].get("generated_text")
        if txt:
            return str(txt)
    if isinstance(data, dict):
        txt = data.get("translation_text") or data.get("generated_text")
        if txt:
            return str(txt)
    raise ValueError("Unexpected NLLB response format")


def _chunk_text(text: str, size: int) -> list[str]:
    if len(text) <= size:
        return [text]
    chunks: list[str] = []
    cursor = 0
    while cursor < len(text):
        chunks.append(text[cursor : cursor + size])
        cursor += size
    return chunks


def _source_to_nllb(source_language: str, target_language: str) -> str:
    if source_language == "en":
        return "eng_Latn"
    if source_language == "sw":
        return "swh_Latn"
    # Unknown source: infer from target pair and proceed.
    return "eng_Latn" if target_language == "sw" else "swh_Latn"


def _translation_cache_key(text: str, target_language: str) -> str:
    digest = sha256(f"{text}{target_language}".encode("utf-8")).hexdigest()
    return f"translation:{digest}"


def _safe_log(ai: AIService, text: str, provider: str, model: str, success: bool) -> None:
    try:
        ai._log_action("ai_translate", text, provider, model, success)
    except Exception:
        ai.db.rollback()


def _protect_terms(text: str) -> str:
    return text.replace("tareka", "__TAREKA__").replace("Tareka", "__TAREKA__")


def _restore_terms(text: str) -> str:
    return text.replace("__TAREKA__", "tareka")
