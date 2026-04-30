from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.company import Company
from app.models.site import Site
from app.services.impact_service import get_company_impact
from app.utils.geo import find_nearby_sites

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("")
def list_companies(
    country: str | None = Query(default=None),
    city: str | None = Query(default=None),
    near_lat: float | None = Query(default=None),
    near_lng: float | None = Query(default=None),
    radius_km: float = Query(default=10.0, ge=0.1, le=100.0),
    db: Session = Depends(get_db),
):
    stmt = select(Company).where(Company.is_active.is_(True))

    if country or city:
        stmt = stmt.join(Site, Site.company_id == Company.id)
        if city:
            stmt = stmt.where(Site.city == city)
        if country:
            # Backward-compatible pre-location fallback: Kenya-scoped sites currently.
            if country.lower() != "kenya":
                return []

    if near_lat is not None and near_lng is not None:
        nearby_sites = find_nearby_sites(db, near_lat, near_lng, radius_km=radius_km, limit=100)
        company_ids = {s.company_id for s in nearby_sites}
        if not company_ids:
            return []
        stmt = stmt.where(Company.id.in_(company_ids))

    rows = db.scalars(stmt).all()
    dedup: dict[str, Company] = {r.id: r for r in rows}
    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "description": c.description,
            "is_verified": c.is_verified,
        }
        for c in dedup.values()
    ]


@router.get("/{company_id}")
def get_company(company_id: str, db: Session = Depends(get_db)):
    row = db.scalars(select(Company).where(Company.id == company_id)).first()
    if not row:
        return {"message": "Company not found"}
    return {
        "id": row.id,
        "name": row.name,
        "slug": row.slug,
        "description": row.description,
        "is_active": row.is_active,
        "is_verified": row.is_verified,
    }


@router.get("/{company_id}/impact")
def company_impact(company_id: str, db: Session = Depends(get_db)):
    return get_company_impact(db, company_id)
