from __future__ import annotations

import logging
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sat_payout import SatPayout
from app.utils.enums import SatPayoutStatus

_log = logging.getLogger(__name__)

# Phase 5 will connect this to Kotani Pay sandbox.


def queue_pending_sat_payout(db: Session, sat_payout: SatPayout) -> None:
    """Register a pending sat payout for later async processing (no external API calls)."""
    _log.info(
        "sat_payout_pending_async id=%s company_id=%s dropoff_id=%s sats=%s rail=%s issuance=%s",
        sat_payout.id,
        sat_payout.company_id,
        sat_payout.dropoff_id,
        sat_payout.sats_amount,
        getattr(sat_payout, "payout_rail", None),
        getattr(sat_payout, "issuance_metadata", None),
    )


def get_pending_sat_payouts(db: Session, *, limit: int = 50) -> Sequence[SatPayout]:
    stmt = (
        select(SatPayout)
        .where(SatPayout.status == SatPayoutStatus.pending.value)
        .order_by(SatPayout.created_at.asc())
        .limit(limit)
    )
    return list(db.scalars(stmt).all())
