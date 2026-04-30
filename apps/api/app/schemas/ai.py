from __future__ import annotations

from pydantic import BaseModel, Field


class OnboardRequest(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    materials: list[str] = Field(default_factory=list)
    reward_config: dict = Field(default_factory=dict)


class ProductListingRequest(BaseModel):
    product_name: str = Field(min_length=1, max_length=255)
    notes: str = Field(default="", max_length=4000)
    material_source: str = Field(min_length=1, max_length=255)


class ImpactNarrativeRequest(BaseModel):
    total_dropoffs: int = Field(ge=0)
    co2_kg: float = Field(ge=0)
    kg_diverted: float = Field(ge=0)
    period: str = Field(min_length=1, max_length=64)


class TranslateRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000)
    target_language: str = Field(min_length=2, max_length=8)


class RedistributeRequest(BaseModel):
    material_type: str = Field(min_length=1, max_length=64)
    quantity: int = Field(ge=1)
    nearby_companies: list[dict] = Field(default_factory=list)


class RecommendRequest(BaseModel):
    token_balance: int = Field(ge=0)
    available_rewards: list[dict] = Field(default_factory=list)
