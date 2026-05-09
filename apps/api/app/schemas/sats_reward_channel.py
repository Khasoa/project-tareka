from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RecyclerSatsPayoutPreferences(BaseModel):
    """Optional recycler-side hints for future Lightning / batch settlement (non-custodial placeholders)."""

    lightning_address_placeholder: str | None = Field(
        default=None,
        max_length=120,
        description="Human-entered Lightning address / LNURL-pay alias — stored as preference only.",
    )
    low_connectivity_opt_in: bool = Field(
        default=False,
        description="Signals willingness for deferred / batched payouts when connectivity is unreliable.",
    )


class RecyclerSatsPayoutPreferencesPut(RecyclerSatsPayoutPreferences):
    """Replace semantics — omitted fields reset to defaults on merge in service."""

    model_config = ConfigDict(extra="forbid")


class SatPayoutActivityRow(BaseModel):
    model_config = ConfigDict(from_attributes=False)

    id: str
    company_id: str
    company_name: str | None = None
    sats_amount: int
    status: str
    payout_rail: str | None
    created_at: datetime


class RecyclerSatsParticipationSummary(BaseModel):
    framing_note: str = (
        "Bitcoin sats are optional participation incentives from verified partners—not trading balances."
    )
    pending_total_sats: int = 0
    sent_total_sats: int = 0
    failed_total_sats: int = 0
    pending_count: int = 0
    recent_activity: list[SatPayoutActivityRow] = Field(default_factory=list)


class SatsRewardRailsReference(BaseModel):
    """Stable identifiers partners may configure for downstream payout processors."""

    rails: list[str]

