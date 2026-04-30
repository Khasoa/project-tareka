from __future__ import annotations

from sqlalchemy import select

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.sat_payout import SatPayout
from app.services.bitcoin_service import trigger_sat_payout
from app.utils.enums import SatPayoutStatus


@celery_app.task(name="app.tasks.bitcoin_tasks.process_pending_sat_payouts")
def process_pending_sat_payouts(limit: int = 50) -> dict[str, int]:
    db = SessionLocal()
    try:
        payout_ids = db.scalars(
            select(SatPayout.id)
            .where(SatPayout.status == SatPayoutStatus.pending.value, SatPayout.attempt_count < 3)
            .order_by(SatPayout.created_at.asc())
            .limit(limit)
        ).all()
        processed = 0
        sent = 0
        failed = 0
        for pid in payout_ids:
            payout = db.scalars(select(SatPayout).where(SatPayout.id == pid)).first()
            if not payout:
                continue
            processed += 1
            if trigger_sat_payout(db, payout):
                sent += 1
            else:
                failed += 1
        return {"processed": processed, "sent": sent, "failed": failed}
    finally:
        db.close()


@celery_app.task(name="app.tasks.bitcoin_tasks.retry_failed_payouts")
def retry_failed_payouts(limit: int = 50) -> dict[str, int]:
    db = SessionLocal()
    try:
        payout_ids = db.scalars(
            select(SatPayout.id)
            .where(SatPayout.status == SatPayoutStatus.failed.value, SatPayout.attempt_count < 3)
            .order_by(SatPayout.updated_at.asc())
            .limit(limit)
        ).all()
        processed = 0
        sent = 0
        failed = 0
        for pid in payout_ids:
            payout = db.scalars(select(SatPayout).where(SatPayout.id == pid)).first()
            if not payout:
                continue
            processed += 1
            if trigger_sat_payout(db, payout):
                sent += 1
            else:
                failed += 1
        return {"processed": processed, "sent": sent, "failed": failed}
    finally:
        db.close()
