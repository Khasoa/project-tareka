from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.sats_reward_channel import (
    RecyclerSatsParticipationSummary,
    RecyclerSatsPayoutPreferences,
    RecyclerSatsPayoutPreferencesPut,
    SatsRewardRailsReference,
)
from app.services import sats_reward_channel_service as sats_channel

router = APIRouter(prefix="/reward-channels", tags=["reward-channels"])


@router.get("/sats/rails", response_model=SatsRewardRailsReference)
def list_sats_reward_rails() -> SatsRewardRailsReference:
    """Public reference of configured settlement rails (for admin tooling / docs). No sensitive data."""
    return sats_channel.rails_reference()


@router.get("/sats/me/preferences", response_model=RecyclerSatsPayoutPreferences)
def get_my_sats_preferences(current_user: User = Depends(require_role("recycler"))) -> RecyclerSatsPayoutPreferences:
    return sats_channel.get_normalized_preferences(current_user)


@router.put("/sats/me/preferences", response_model=RecyclerSatsPayoutPreferences)
def update_my_sats_preferences(
    body: RecyclerSatsPayoutPreferencesPut,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
) -> RecyclerSatsPayoutPreferences:
    """Store optional Lightning / batch payout placeholders only—no on-chain signing in tareka."""
    return sats_channel.put_preferences(db, current_user, body)


@router.get("/sats/me/summary", response_model=RecyclerSatsParticipationSummary)
def get_my_sats_participation_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
) -> RecyclerSatsParticipationSummary:
    """Aggregated pending/sent sats from verified participation (read-only)."""
    return sats_channel.get_recycler_sats_summary(db, current_user.id)
