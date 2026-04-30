from __future__ import annotations

import json
from uuid import uuid4

from anthropic import AsyncAnthropic
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.audit_log import AuditLog
from app.utils.input_sanitizer import sanitize_text, summarize_input


class AIService:
    def __init__(self, db: Session, actor_user_id: str | None = None):
        self.db = db
        self.actor_user_id = actor_user_id
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def company_onboarding_assistant(
        self, company_name: str, materials: list[str], reward_config: dict
    ) -> dict[str, str]:
        safe_name = sanitize_text(company_name)
        safe_materials = [sanitize_text(m) for m in materials][:10]
        safe_reward_cfg = json.loads(sanitize_text(json.dumps(reward_config or {})) or "{}")

        prompt = (
            "You are an onboarding assistant for tareka, a recycling platform in Kenya. "
            "Guide the company with one practical next question only. "
            "Do not suggest specific reward values.\n\n"
            f"Company: {safe_name}\n"
            f"Materials: {safe_materials}\n"
            f"Reward config (current): {safe_reward_cfg}\n\n"
            "Return strict JSON with keys: message, next_step."
        )

        try:
            response = await self._claude_json(prompt)
            result = {
                "message": sanitize_text(response.get("message", "Let's continue setup one step at a time.")),
                "next_step": sanitize_text(response.get("next_step", "Confirm accepted materials and operating hours.")),
            }
            self._log_action("ai_onboard", prompt, "anthropic", settings.ANTHROPIC_MODEL, True)
            return result
        except Exception:
            self._log_action("ai_onboard", prompt, "anthropic", settings.ANTHROPIC_MODEL, False)
            return {
                "message": "Let's continue setup one question at a time. Which material types will your first site accept?",
                "next_step": "Provide your accepted materials and site operating days.",
            }

    async def generate_product_listing(
        self, product_name: str, notes: str, material_source: str
    ) -> dict[str, object]:
        safe_product = sanitize_text(product_name)
        safe_notes = sanitize_text(notes)
        safe_source = sanitize_text(material_source)

        prompt = (
            "Create a concise factual product listing for tareka marketplace. "
            "No exaggeration, no financial promises.\n\n"
            f"Product name: {safe_product}\n"
            f"Notes: {safe_notes}\n"
            f"Material source: {safe_source}\n\n"
            "Return strict JSON with keys: title, material_story, description, seo_tags (array of <=6 short tags)."
        )

        try:
            raw = await self._claude_json(prompt)
            result = {
                "title": sanitize_text(raw.get("title", safe_product or "Recycled Product")),
                "material_story": sanitize_text(raw.get("material_story", "Made from recovered materials with verified sourcing.")),
                "description": sanitize_text(raw.get("description", "Product details pending human review.")),
                "seo_tags": [sanitize_text(str(t)) for t in (raw.get("seo_tags") or [])][:6],
                "ai_generated": True,
                "is_published": False,
                "human_review_required": True,
            }
            self._log_action("ai_product_listing", f"{safe_product} {safe_source}", "anthropic", settings.ANTHROPIC_MODEL, True)
            return result
        except Exception:
            self._log_action("ai_product_listing", f"{safe_product} {safe_source}", "anthropic", settings.ANTHROPIC_MODEL, False)
            return {
                "title": safe_product or "Recycled Product",
                "material_story": "Material origin captured. Human review required before publish.",
                "description": "Draft listing generated with safe fallback content.",
                "seo_tags": ["recycled", "kenya", "sustainable"],
                "ai_generated": True,
                "is_published": False,
                "human_review_required": True,
            }

    async def generate_impact_narrative(
        self, total_dropoffs: int, co2_kg: float, kg_diverted: float, period: str
    ) -> dict[str, str]:
        safe_period = sanitize_text(period)
        prompt = (
            "Write a plain-language impact narrative for tareka. "
            "Do not exaggerate. CO2 and weight are estimates. No financial promises.\n\n"
            f"total_dropoffs={total_dropoffs}, co2_kg_estimate={co2_kg}, kg_diverted_estimate={kg_diverted}, period={safe_period}\n\n"
            "Return strict JSON with keys: narrative, disclaimer."
        )

        disclaimer = "Figures are estimates based on average material weights."
        try:
            raw = await self._claude_json(prompt)
            result = {
                "narrative": sanitize_text(raw.get("narrative", "Impact estimates were generated from verified drop-offs.")),
                "disclaimer": disclaimer,
            }
            self._log_action("ai_impact_narrative", safe_period, "anthropic", settings.ANTHROPIC_MODEL, True)
            return result
        except Exception:
            self._log_action("ai_impact_narrative", safe_period, "anthropic", settings.ANTHROPIC_MODEL, False)
            return {
                "narrative": "Verified drop-offs increased this period, and estimated impact metrics continue to improve.",
                "disclaimer": disclaimer,
            }

    async def suggest_material_redistribution(
        self, material_type: str, quantity: int, nearby_companies: list[dict]
    ) -> dict[str, str]:
        safe_material = sanitize_text(material_type)
        safe_companies = nearby_companies[:10]
        prompt = (
            "Suggest one redistribution option using ONLY the provided nearby companies. "
            "Do not invent companies or details.\n\n"
            f"material_type={safe_material}, quantity={quantity}\n"
            f"nearby_companies={safe_companies}\n\n"
            "Return strict JSON with keys: suggestion, reason."
        )

        try:
            raw = await self._claude_json(prompt)
            result = {
                "suggestion": sanitize_text(raw.get("suggestion", "Use the nearest verified company from the provided list.")),
                "reason": sanitize_text(raw.get("reason", "Selected from your provided options only.")),
            }
            self._log_action("ai_redistribute", f"{safe_material}:{quantity}", "anthropic", settings.ANTHROPIC_MODEL, True)
            return result
        except Exception:
            self._log_action("ai_redistribute", f"{safe_material}:{quantity}", "anthropic", settings.ANTHROPIC_MODEL, False)
            return {
                "suggestion": "Choose the nearest verified company from your provided list.",
                "reason": "Fallback response used due to temporary AI provider issue.",
            }

    async def recommend_redeemables(
        self, token_balance: int, available_rewards: list[dict]
    ) -> dict[str, list[dict]]:
        prompt = (
            "Recommend up to 3 rewards from the given available_rewards list only. "
            "Do not invent rewards or values.\n\n"
            f"token_balance={token_balance}\n"
            f"available_rewards={available_rewards[:25]}\n\n"
            "Return strict JSON with key: recommendations (array)."
        )

        try:
            raw = await self._claude_json(prompt)
            options = available_rewards or []
            by_id = {str(i.get("id")): i for i in options if isinstance(i, dict)}
            clean: list[dict] = []
            for rec in raw.get("recommendations", []):
                if not isinstance(rec, dict):
                    continue
                rec_id = str(rec.get("id", ""))
                if rec_id in by_id and by_id[rec_id] not in clean:
                    clean.append(by_id[rec_id])
                if len(clean) == 3:
                    break
            if not clean:
                clean = options[:3]
            self._log_action("ai_recommend", str(token_balance), "anthropic", settings.ANTHROPIC_MODEL, True)
            return {"recommendations": clean}
        except Exception:
            self._log_action("ai_recommend", str(token_balance), "anthropic", settings.ANTHROPIC_MODEL, False)
            return {"recommendations": (available_rewards or [])[:3]}

    async def strict_translate_with_claude(
        self, text: str, target_language: str
    ) -> dict[str, str]:
        safe_text = sanitize_text(text)
        safe_target = sanitize_text(target_language)
        prompt = (
            "Translate the text exactly without adding or removing meaning. "
            "Preserve proper nouns and the brand name tareka unchanged. "
            "Do not summarize or rewrite style. Output only the translated text.\n\n"
            f"Target language: {safe_target}\n"
            f"Text: {safe_text}"
        )
        try:
            translated = await self._claude_text(prompt)
            self._log_action("translation_claude_fallback", safe_text, "anthropic", settings.ANTHROPIC_MODEL, True)
            return {"translated": sanitize_text(translated)}
        except Exception:
            self._log_action("translation_claude_fallback", safe_text, "anthropic", settings.ANTHROPIC_MODEL, False)
            raise

    async def _claude_text(self, prompt: str) -> str:
        response = await self.client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=settings.AI_MAX_TOKENS,
            temperature=0,
            messages=[{"role": "user", "content": prompt}],
        )
        chunks = []
        for part in response.content:
            text = getattr(part, "text", None)
            if text:
                chunks.append(text)
        return "\n".join(chunks).strip()

    async def _claude_json(self, prompt: str) -> dict:
        txt = await self._claude_text(prompt)
        raw = txt.strip()
        if raw.startswith("```"):
            raw = raw.strip("`")
            if raw.startswith("json"):
                raw = raw[4:].strip()
        data = json.loads(raw)
        if not isinstance(data, dict):
            raise ValueError("Expected JSON object from Claude")
        return data

    def _log_action(
        self,
        action: str,
        input_text: str,
        provider: str,
        model: str,
        success: bool,
    ) -> None:
        entry = AuditLog(
            id=str(uuid4()),
            actor_user_id=self.actor_user_id,
            action=action,
            entity_type="ai",
            entity_id=(self.actor_user_id or "system")[:36],
            metadata_json={
                "input_summary": summarize_input(input_text),
                "provider": provider,
                "model": model,
                "success": success,
            },
        )
        self.db.add(entry)
        self.db.commit()
