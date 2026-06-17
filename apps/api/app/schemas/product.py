from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

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
    is_verified: bool = False
    location: LocationSummary
    image_url: str | None = None
    product_count: int
    #: Human-readable place context (city / country) for catalogue browsing
    region_label: str | None = None
    #: Distinct material tags surfaced from published product payloads
    materials_preview: list[str] = Field(default_factory=list)
    #: Partner-supported benefit rails (tokens, sats, discounts, etc.)
    reward_offerings: list[str] = Field(default_factory=list)


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


class MarketplaceListingItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    company_id: str
    company_name: str
    company_slug: str
    partner_verified: bool = False
    partner_sats_program: bool = False

    title: str
    short_description: str | None = None
    image_url: str | None = None
    price_kes: Decimal | None = None
    token_requirement: int | None = None
    is_redeemable: bool = False
    is_discountable: bool = False

    environmental_category: str | None = None
    reward_models: list[str] = []
    availability_summary: str | None = None


class MarketplaceFeedResponse(BaseModel):
    """Marketplace index with stable total matching for paging."""

    items: list[MarketplaceListingItemResponse]
    limit: int
    offset: int
    count: int
    total: int


class ProductRedeemResponse(BaseModel):
    redemption_id: str
    product_id: str
    product_title: str
    company_name: str
    tokens_spent: Decimal
    message: str
    instructions_snapshot: str | None = None


class RewardRedemptionItemResponse(BaseModel):
    id: str
    product_id: str
    product_title: str
    company_name: str
    company_slug: str
    tokens_spent: Decimal
    instructions_snapshot: str | None = None
    created_at: datetime


class RedemptionHistoryResponse(BaseModel):
    items: list[RewardRedemptionItemResponse]
    limit: int
    offset: int
    count: int
    total: int
