from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator


class DropoffConfirmRequest(BaseModel):
    site_id: str = Field(min_length=1, max_length=36)
    material_type: str = Field(min_length=1, max_length=32)
    item_count: int = Field(ge=1, le=10_000)
    recycler_id: str | None = Field(default=None, max_length=36)
    recycler_phone: str | None = Field(default=None, max_length=30)
    client_reference_id: str | None = Field(default=None, max_length=128)

    @model_validator(mode="after")
    def require_recycler_identifier(self) -> "DropoffConfirmRequest":
        if not self.recycler_id and not self.recycler_phone:
            raise ValueError("recycler_id or recycler_phone is required")
        return self


class RewardSummary(BaseModel):
    tokens: Decimal
    kes_obligation: Decimal
    sats_pending: int


class DropoffResponse(BaseModel):
    id: str
    site_id: str
    company_id: str
    recycler_id: str
    operator_id: str
    material_type: str
    item_count: int
    estimated_weight_kg: float | None
    estimated_weight_label: str
    co2_avoided_kg: float | None
    co2_estimate_label: str
    confirmed_at: datetime
    reward_issued: bool
    reward_summary: RewardSummary | None = None

    model_config = {"from_attributes": False}


class PaginatedDropoffsResponse(BaseModel):
    items: list[DropoffResponse]
    limit: int
    offset: int
    count: int


def reward_summary_from_dict(data: dict) -> RewardSummary:
    return RewardSummary(
        tokens=Decimal(data.get("tokens", 0)),
        kes_obligation=Decimal(data.get("kes_obligation", 0)),
        sats_pending=int(data.get("sats_pending", 0)),
    )


def dropoff_to_response(
    dropoff,
    *,
    reward_summary: dict | RewardSummary | None = None,
) -> DropoffResponse:
    weight_label = "estimate"
    co2_label = "estimate"
    rs: RewardSummary | None = None
    if isinstance(reward_summary, dict):
        rs = reward_summary_from_dict(reward_summary)
    elif isinstance(reward_summary, RewardSummary):
        rs = reward_summary

    base = DropoffResponse(
        id=dropoff.id,
        site_id=dropoff.site_id,
        company_id=dropoff.company_id,
        recycler_id=dropoff.recycler_id,
        operator_id=dropoff.operator_id,
        material_type=dropoff.material_type,
        item_count=dropoff.item_count,
        estimated_weight_kg=float(dropoff.estimated_weight_kg)
        if dropoff.estimated_weight_kg is not None
        else None,
        estimated_weight_label=weight_label,
        co2_avoided_kg=float(dropoff.co2_avoided_kg) if dropoff.co2_avoided_kg is not None else None,
        co2_estimate_label=co2_label,
        confirmed_at=dropoff.confirmed_at,
        reward_issued=dropoff.reward_issued,
        reward_summary=rs,
    )
    return base
