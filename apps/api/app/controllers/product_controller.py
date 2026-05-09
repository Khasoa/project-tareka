from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_optional_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import (
    CompanyCatalogueResponse,
    CompanyProductSummaryResponse,
    MarketplaceFeedResponse,
    PaginatedResponse,
    ProductDetailResponse,
    ProductRedeemResponse,
    RedemptionHistoryResponse,
)
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/companies", response_model=PaginatedResponse[CompanyProductSummaryResponse])
def list_companies_with_products(
    db: Session = Depends(get_db),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    Public. Returns active, approved companies that have at least one public-safe product.
    """
    return product_service.list_participating_companies(db, limit=limit, offset=offset)


@router.get("/company/by-slug/{slug}", response_model=CompanyCatalogueResponse)
def get_partner_catalogue_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Public catalogue for a verified partner keyed by slug (URL-safe)."""
    return product_service.get_partner_catalogue_by_slug(
        db,
        slug=slug,
        current_user=current_user,
        limit=limit,
        offset=offset,
    )


@router.get("/company/{company_id}", response_model=CompanyCatalogueResponse)
def get_company_catalogue(
    company_id: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """
    Public. Returns company info and its public-safe product list.
    Optional auth enrichment allowed (reserved for future use).
    Empty catalogue returns items: [] — never errors.
    """
    return product_service.get_company_catalogue(
        db,
        company_id=company_id,
        current_user=current_user,
        limit=limit,
        offset=offset,
    )


@router.get("/marketplace", response_model=MarketplaceFeedResponse)
def list_marketplace(
    db: Session = Depends(get_db),
    limit: int = Query(default=24, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    partner: str | None = Query(default=None, description="Filter rewards by partner slug"),
):
    """Aggregated civic reward listings from participating verified partners."""
    return product_service.list_marketplace_feed(
        db, limit=limit, offset=offset, partner_slug=partner
    )


@router.get("/redemptions/me", response_model=RedemptionHistoryResponse)
def list_my_redemptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    """Signed-in recycler (or user) redemption history for marketplace fulfilment."""
    return product_service.list_user_reward_redemptions(
        db,
        user_id=current_user.id,
        limit=limit,
        offset=offset,
    )


@router.post("/{product_id}/redeem", response_model=ProductRedeemResponse)
def redeem_marketplace_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Record a token redemption toward a redeemable catalogue reward."""
    return product_service.redeem_product(db, current_user=current_user, product_id=product_id)


@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product_detail(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    """
    Public. Returns public-safe product detail.
    Authenticated users receive wallet balance and reward eligibility context.
    Unreviewed AI-generated products or unpublished products return 404.
    """
    return product_service.get_product_detail(db, product_id=product_id, current_user=current_user)
