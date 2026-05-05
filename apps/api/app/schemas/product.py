from __future__ import annotations

from decimal import Decimal
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    limit: int
    offset: int
    count: int


class LocationSummary(BaseModel):
    """Resolved location for a company. All fields nullable — never fails if location is missing."""

    country: str | None = None
    city: str | None = None
    area: str | None = None
    formatted_address: str | None = None


class RewardEligibility(BaseModel):
    """Eligibility status for a single reward type. Generic — not hardcoded to tokens/KES/sats."""

    reward_type: str
    label: str
    is_eligible: bool
    reason: str | None = None


class RewardContext(BaseModel):
    has_context: bool
    rewards: list[RewardEligibility]


class CompanyProductSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    description: str | None
    location: LocationSummary
    image_url: str | None = None
    product_count: int


class ProductListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    title: str
    short_description: str | None = None
    image_url: str | None = None
    materials_used: list[Any] | None = None
    price_kes: Decimal | None = None
    token_requirement: int | None = None
    is_redeemable: bool = False
    is_discountable: bool = False


class ProductDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    company_name: str
    company_slug: str | None = None
    title: str
    short_description: str | None = None
    description: str | None = None
    material_story: str | None = None
    materials_used: list[Any] | None = None
    product_story: dict[str, Any] | None = None
    image_url: str | None = None
    price_kes: Decimal | None = None
    token_requirement: int | None = None
    token_discount_value: Decimal | None = None
    is_redeemable: bool = False
    is_discountable: bool = False
    availability: list[Any] | None = None
    is_published: bool = False

    # Enrichment — only populated for authenticated requests
    user_token_balance: int | None = None
    reward_context: RewardContext | None = None


class CompanyCatalogueResponse(BaseModel):
    company: CompanyProductSummaryResponse
    products: PaginatedResponse[ProductListItemResponse]
