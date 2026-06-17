from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.user import User
from app.models.sat_payout import SatPayout
from app.utils.enums import SatPayoutStatus, SatsRewardRail
from app.schemas.sats_reward_channel import (
    RecyclerSatsParticipationSummary,
    RecyclerSatsPayoutPreferences,
    RecyclerSatsPayoutPreferencesPut,
    SatPayoutActivityRow,
    SatsRewardRailsReference,
)


def rails_reference() -> SatsRewardRailsReference:
    return SatsRewardRailsReference(rails=[r.value for r in SatsRewardRail])


def get_normalized_preferences(user: User) -> RecyclerSatsPayoutPreferences:
    raw = user.sats_payout_preferences
    if not isinstance(raw, dict):
        return RecyclerSatsPayoutPreferences()
    la = raw.get("lightning_address_placeholder")
    lo = raw.get("low_connectivity_opt_in")
    return RecyclerSatsPayoutPreferences(
        lightning_address_placeholder=la.strip() if isinstance(la, str) and la.strip() else None,
        low_connectivity_opt_in=bool(lo) if lo is not None else False,
    )


def put_preferences(db: Session, user: User, body: RecyclerSatsPayoutPreferencesPut) -> RecyclerSatsPayoutPreferences:
    payload = {
        "lightning_address_placeholder": body.lightning_address_placeholder.strip()
        if isinstance(body.lightning_address_placeholder, str) and body.lightning_address_placeholder.strip()
        else None,
        "low_connectivity_opt_in": body.low_connectivity_opt_in,
        "schema_version": 1,
    }
    user.sats_payout_preferences = payload
    db.add(user)
    db.commit()
    db.refresh(user)
    return get_normalized_preferences(user)


def get_recycler_sats_summary(db: Session, user_id: str, recent_limit: int = 8) -> RecyclerSatsParticipationSummary:
    pending_sum = (
        db.scalar(
            select(func.coalesce(func.sum(SatPayout.sats_amount), 0)).where(
                SatPayout.user_id == user_id,
                SatPayout.status == SatPayoutStatus.pending.value,
            )
        )
        or 0
    )
    sent_sum = (
        db.scalar(
            select(func.coalesce(func.sum(SatPayout.sats_amount), 0)).where(
                SatPayout.user_id == user_id,
                SatPayout.status == SatPayoutStatus.sent.value,
            )
        )
        or 0
    )
    failed_sum = (
        db.scalar(
            select(func.coalesce(func.sum(SatPayout.sats_amount), 0)).where(
                SatPayout.user_id == user_id,
                SatPayout.status == SatPayoutStatus.failed.value,
            )
        )
        or 0
    )

    pending_cnt = (
        db.scalar(
            select(func.count()).select_from(SatPayout).where(
                SatPayout.user_id == user_id,
                SatPayout.status == SatPayoutStatus.pending.value,
            )
        )
        or 0
    )

    recent_rows = list(
        db.scalars(
            select(SatPayout)
            .where(SatPayout.user_id == user_id)
            .order_by(SatPayout.created_at.desc())
            .limit(recent_limit)
        ).all()
    )
    company_names: dict[str, str | None] = {}
    if recent_rows:
        ids = {sp.company_id for sp in recent_rows}
        for cid in ids:
            co = db.scalars(select(Company).where(Company.id == cid)).first()
            company_names[cid] = co.name if co else None

    activity = [
        SatPayoutActivityRow(
            id=sp.id,
            company_id=sp.company_id,
            company_name=company_names.get(sp.company_id),
            sats_amount=sp.sats_amount,
            status=sp.status,
            payout_rail=sp.payout_rail,
            created_at=sp.created_at,
        )
        for sp in recent_rows
    ]

    return RecyclerSatsParticipationSummary(
        pending_total_sats=int(pending_sum),
        sent_total_sats=int(sent_sum),
        failed_total_sats=int(failed_sum),
        pending_count=int(pending_cnt),
        recent_activity=activity,
    )
