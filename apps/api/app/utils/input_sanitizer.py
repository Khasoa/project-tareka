from __future__ import annotations

import re

_MAX_LEN = 2000


def sanitize_text(text: str) -> str:
    """Remove control chars, trim whitespace, and cap payload size."""
    if text is None:
        return ""
    stripped = re.sub(r"[\x00-\x1F\x7F]", " ", str(text))
    compact = re.sub(r"\s+", " ", stripped).strip()
    return compact[:_MAX_LEN]


def summarize_input(text: str) -> str:
    """Safe short summary for logs only (never store full input)."""
    cleaned = sanitize_text(text)
    if not cleaned:
        return ""
    if len(cleaned) <= 140:
        return cleaned
    return f"{cleaned[:137]}..."
