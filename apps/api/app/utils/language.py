from __future__ import annotations

import re

from app.utils.input_sanitizer import sanitize_text

_SW_WORDS = {
    "na",
    "kwa",
    "katika",
    "hii",
    "hiyo",
    "tafadhali",
    "asante",
    "habari",
    "karibu",
    "sawa",
    "nina",
    "weza",
    "weza",
    "ya",
    "za",
    "fuatilia",
    "athari",
}

_EN_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "this",
    "that",
    "please",
    "hello",
    "welcome",
    "your",
    "you",
    "is",
    "are",
    "track",
    "impact",
    "recycling",
}


def detect_language(text: str) -> str:
    """Lightweight heuristic detector for en/sw/unknown."""
    clean = sanitize_text(text).lower()
    if not clean:
        return "unknown"

    tokens = re.findall(r"[a-zA-Z']+", clean)
    if not tokens:
        return "unknown"

    sw_hits = sum(1 for t in tokens if t in _SW_WORDS or t.startswith(("ni", "ki", "wa", "ku")))
    en_hits = sum(1 for t in tokens if t in _EN_WORDS)

    if sw_hits >= 1 and sw_hits > en_hits:
        return "sw"
    if en_hits >= 1 and en_hits > sw_hits:
        return "en"
    return "unknown"
