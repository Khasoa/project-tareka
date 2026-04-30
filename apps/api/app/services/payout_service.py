from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import and_, func, select, update
from sqlalchemy.orm import Session

from app.models.payout_ledger import PayoutLedger
from app.utils.enums import PayoutStatus


def _week_range_utc(week_of: date) -> tuple[datetime, datetime]:
    """week_of is any date within the ISO week; bounds are Monday 00:00 UTC to next Monday 00:00 UTC."""
    day = week_of
    start_date = day - timedelta(days=day.weekday())
    start_dt = datetime.combine(start_date, time.min, tzinfo=timezone.utc)
    end_dt = start_dt + timedelta(days=7)
    return start_dt, end_dt


def get_weekly_report(db: Session, company_id: str, week_of: date) -> list[PayoutLedger]:
    start_dt, end_dt = _week_range_utc(week_of)
    stmt = (
        select(PayoutLedger)
        .where(
            PayoutLedger.company_id == company_id,
            PayoutLedger.due_date >= start_dt,
            PayoutLedger.due_date < end_dt,
        )
        .order_by(PayoutLedger.due_date, PayoutLedger.id)
    )
    return list(db.scalars(stmt).all())


def mark_paid(
    db: Session,
    company_id: str,
    recycler_ids: list[str],
    week_of: date,
) -> int:
    if not recycler_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="recycler_ids is required",
        )
    start_dt, end_dt = _week_range_utc(week_of)
    now = datetime.now(timezone.utc)
    stmt = (
        update(PayoutLedger)
        .where(
            PayoutLedger.company_id == company_id,
            PayoutLedger.user_id.in_(recycler_ids),
            PayoutLedger.status == PayoutStatus.pending.value,
            PayoutLedger.due_date >= start_dt,
            PayoutLedger.due_date < end_dt,
        )
        .values(status=PayoutStatus.confirmed_paid.value, paid_at=now)
    )
    result = db.execute(stmt)
    db.commit()
    return int(result.rowcount or 0)


def sum_pending_kes_for_company_week(db: Session, company_id: str, week_of: date) -> Decimal:
    start_dt, end_dt = _week_range_utc(week_of)
    stmt = select(func.coalesce(func.sum(PayoutLedger.amount_kes), 0)).where(
        and_(
            PayoutLedger.company_id == company_id,
            PayoutLedger.status == PayoutStatus.pending.value,
            PayoutLedger.due_date >= start_dt,
            PayoutLedger.due_date < end_dt,
        )
    )
    total = db.scalar(stmt)
    return Decimal(total or 0)
