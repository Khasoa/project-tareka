from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, Field


class MaterialRewardRule(BaseModel):
    tokens_per_kg: Decimal | None = Field(default=None, ge=0)
    sats_per_kg: Decimal | None = Field(default=None, ge=0)
    min_threshold_kg: Decimal | None = Field(default=None, ge=0)
    monthly_cap_tokens: int | None = Field(default=None, ge=0)


class RedemptionSettings(BaseModel):
    allow_marketplace_redemption: bool = True
    allow_sats_payout: bool = False
    minimum_balance_tokens: int = Field(default=0, ge=0)
    pending_verification_required: bool = False


class RewardProgrammeResponse(BaseModel):
    programme_enabled: bool
    reward_mode: str
    material_rules: dict[str, MaterialRewardRule]
    redemption: RedemptionSettings
    reward_tokens_enabled: bool
    reward_sats_enabled: bool
    reward_kes_enabled: bool


class RewardProgrammePatch(BaseModel):
    programme_enabled: bool | None = None
    reward_mode: str | None = None
    material_rules: dict[str, MaterialRewardRule | None] | None = None
    redemption: RedemptionSettings | None = None


class RewardPreviewRequest(BaseModel):
    material_type: str = Field(min_length=1, max_length=32)
    weight_kg: Decimal = Field(gt=0, le=100_000)


class RewardPreviewResponse(BaseModel):
    material_type: str
    weight_kg: float
    estimated_tokens: str
    estimated_sats: int
    notes: str
