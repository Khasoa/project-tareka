from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from threading import Thread
from uuid import uuid4

import httpx
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.audit_log import AuditLog
from app.models.sat_payout import SatPayout
from app.models.user import User
from app.utils.enums import SatPayoutStatus

_SAFE_PROVIDER_ERROR = "provider_unavailable"


async def trigger_sat_payout_async(db: Session, sat_payout: SatPayout) -> bool:
    now = datetime.now(timezone.utc)
    locked = db.scalars(
        select(SatPayout).where(SatPayout.id == sat_payout.id).with_for_update()
    ).first()
    if locked is None:
        return False

    if locked.status == SatPayoutStatus.sent.value:
        return False
    if locked.status not in {SatPayoutStatus.pending.value, SatPayoutStatus.failed.value}:
        return False
    if locked.attempt_count >= 3:
        return False

    recycler = db.scalars(select(User).where(User.id == locked.user_id)).first()
    phone = recycler.phone if recycler else None

    if not settings.KOTANI_API_KEY or not phone:
        locked.status = SatPayoutStatus.failed.value
        locked.failure_reason = "configuration_missing" if not settings.KOTANI_API_KEY else "phone_missing"
        locked.attempt_count += 1
        locked.last_attempt_at = now
        _audit_payout_attempt(db, locked, success=False, reason=locked.failure_reason)
        db.commit()
        return False

    headers = {"Authorization": f"Bearer {settings.KOTANI_API_KEY}"}
    payload = {
        "phone": phone,
        "amount_sats": locked.sats_amount,
        "reference": locked.id,
    }

    ok = False
    safe_reason = None
    external_reference = None

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                f"{settings.KOTANI_BASE_URL}/v1/payouts",
                headers=headers,
                json=payload,
            )
            if 200 <= response.status_code < 300:
                data = response.json() if response.content else {}
                external_reference = str(data.get("reference") or data.get("id") or locked.id)
                ok = True
            else:
                safe_reason = _SAFE_PROVIDER_ERROR
    except Exception:
        safe_reason = _SAFE_PROVIDER_ERROR

    locked.attempt_count += 1
    locked.last_attempt_at = now

    if ok:
        locked.status = SatPayoutStatus.sent.value
        locked.sent_at = now
        locked.external_reference = external_reference
        locked.failure_reason = None
        _audit_payout_attempt(db, locked, success=True, reason=None)
        db.commit()
        return True

    locked.status = SatPayoutStatus.failed.value
    locked.failure_reason = safe_reason or _SAFE_PROVIDER_ERROR
    _audit_payout_attempt(db, locked, success=False, reason=locked.failure_reason)
    db.commit()
    return False


def trigger_sat_payout(db: Session, sat_payout: SatPayout) -> bool:
    """Sync wrapper for Celery/tasks calling async payout flow."""
    try:
        asyncio.get_running_loop()
        has_loop = True
    except RuntimeError:
        has_loop = False

    if not has_loop:
        return asyncio.run(trigger_sat_payout_async(db, sat_payout))

    result: dict[str, bool] = {"value": False}

    def _runner() -> None:
        result["value"] = asyncio.run(trigger_sat_payout_async(db, sat_payout))

    t = Thread(target=_runner, daemon=True)
    t.start()
    t.join(timeout=30)
    return result["value"] if not t.is_alive() else False


def _audit_payout_attempt(db: Session, sat_payout: SatPayout, *, success: bool, reason: str | None) -> None:
    db.add(
        AuditLog(
            id=str(uuid4()),
            actor_user_id=None,
            action="bitcoin_payout_attempt",
            entity_type="sat_payout",
            entity_id=sat_payout.id,
            metadata_json={
                "success": success,
                "provider": "kotani",
                "reason": reason,
                "attempt_count": sat_payout.attempt_count,
                "company_id": sat_payout.company_id,
            },
        )
    )
