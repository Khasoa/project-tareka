from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.company import CompanyDetailResponse, CompanyListItemResponse, CompanyPublicImpactSummary
from app.services.company_directory_service import get_company_by_id, list_companies_for_directory
from app.services.impact_service import get_company_impact

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=list[CompanyListItemResponse])
def list_companies(
    db: Session = Depends(get_db),
    country: str | None = Query(None, description="Filter by site Location.country"),
    city: str | None = Query(None, description="Filter by site Location.city"),
    near_lat: float | None = Query(None),
    near_lng: float | None = Query(None),
    radius_km: float = Query(10.0, ge=0.0, le=100.0),
):
    if (near_lat is None) ^ (near_lng is None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="near_lat and near_lng must be provided together",
        )
    return list_companies_for_directory(
        db,
        country=country,
        city=city,
        near_lat=near_lat,
        near_lng=near_lng,
        radius_km=radius_km,
    )


@router.get("/{company_id}", response_model=CompanyDetailResponse)
def get_company(company_id: str, db: Session = Depends(get_db)):
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    pi = get_company_impact(db, company_id)
    return CompanyDetailResponse(
        id=company.id,
        name=company.name,
        slug=company.slug,
        description=company.description,
        is_active=company.is_active,
        is_verified=company.is_verified,
        public_impact=CompanyPublicImpactSummary(
            verified_dropoffs=pi["verified_dropoffs"],
            total_estimated_weight_kg=pi["total_estimated_weight_kg"],
            estimated_weight_label=pi["estimated_weight_label"],
            total_estimated_co2_avoided_kg=pi["total_estimated_co2_avoided_kg"],
            co2_estimate_label=pi["co2_estimate_label"],
            is_estimate=pi["is_estimate"],
        ),
    )
