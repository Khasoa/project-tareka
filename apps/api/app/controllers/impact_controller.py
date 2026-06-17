from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.access import authorize_company_access, authorize_recycler_dropoffs
from app.db.session import get_db
from app.models.user import User
from app.services.impact_service import (
    get_company_impact,
    get_network_impact_public,
    get_platform_totals,
    get_recycler_impact,
)

router = APIRouter(prefix="/impact", tags=["impact"])


@router.get("/platform")
def platform_impact(db: Session = Depends(get_db)):
    return get_platform_totals(db)


@router.get("/network")
def network_impact_experience(db: Session = Depends(get_db)):
    """Public ecosystem telemetry — collective network intelligence only."""
    return get_network_impact_public(db)


@router.get("/company/{company_id}")
def company_impact(
    company_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(authorize_company_access),
):
    """Authenticated org view; public directory uses GET /companies/{id}.public_impact."""
    return get_company_impact(db, company_id)


@router.get("/recycler/{recycler_id}")
def recycler_impact(
    recycler_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(authorize_recycler_dropoffs),
):
    return get_recycler_impact(db, recycler_id)
