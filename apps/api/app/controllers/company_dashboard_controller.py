from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.access import authorize_company_access
from app.api.deps import get_db
from app.models.user import User
from app.services.company_dashboard_service import get_company_dashboard_summary

router = APIRouter(prefix="/company-dashboard", tags=["company-dashboard"])


@router.get("/{company_id}")
def company_dashboard_summary(
    company_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(authorize_company_access),
):
    return get_company_dashboard_summary(db, company_id)
