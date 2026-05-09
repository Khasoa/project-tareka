from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class CompanyPublicImpactSummary(BaseModel):
    """Directory-safe intake aggregates only (no identities, payouts, or logs)."""

    verified_dropoffs: int
    total_estimated_weight_kg: float
    estimated_weight_label: str
    total_estimated_co2_avoided_kg: float
    co2_estimate_label: str
    is_estimate: bool


class CompanyListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: str | None
    is_verified: bool


class CompanyDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: str | None
    is_active: bool
    is_verified: bool
    public_impact: CompanyPublicImpactSummary
