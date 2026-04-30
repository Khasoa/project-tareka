from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.audit_log import AuditLog
from app.models.notification import Notification
from app.models.user import User
from app.services.translation_service import translate_for_channel


async def create_dropoff_notification(
    db: Session,
    *,
    user: User,
    message: str,
    channel: str = "notification",
) -> Notification:
    translated = await translate_for_channel(
        db,
        text=message,
        target_language=(user.language or "en"),
        channel=channel,
        actor_user_id=user.id,
    )
    note = Notification(
        id=str(uuid4()),
        user_id=user.id,
        title=f"{channel.title()} update",
        message=str(translated.get("translated", message)),
        is_read=False,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


async def create_sat_payout_notification(
    db: Session,
    *,
    user: User,
    sats_amount: int,
    status_text: str,
    channel: str = "notification",
) -> Notification:
    base_message = f"Sat payout update: {sats_amount} sats is {status_text}."
    return await create_dropoff_notification(db, user=user, message=base_message, channel=channel)


def send_sms(db: Session, *, user: User, message: str) -> None:
    # Stub only: do not dispatch SMS in this phase.
    db.add(
        AuditLog(
            id=str(uuid4()),
            actor_user_id=user.id,
            action="sms_stub",
            entity_type="notification",
            entity_id=user.id,
            metadata_json={
                "provider": "africastalking",
                "configured": bool(settings.AFRICASTALKING_API_KEY),
                "message_len": len(message),
                "success": False,
                "reason": "dispatch_not_enabled",
            },
        )
    )
    db.commit()
