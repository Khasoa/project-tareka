from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_optional_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.product import (
    CompanyCatalogueResponse,
    PaginatedResponse,
    ProductDetailResponse,
    CompanyProductSummaryResponse,
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
