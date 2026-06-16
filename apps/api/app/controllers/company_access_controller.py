from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.db.session import get_db
from app.schemas.company_access_request import CompanyAccessRequestCreate
from app.services.company_access_service import submit_company_access_request

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/company-access-requests", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def request_company_access(
    request: Request,
    payload: CompanyAccessRequestCreate,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    _ = request
    # MVP DEMO ONLY — replace with secure onboarding/password setup flow before production.
    submit_company_access_request(db, payload)
    return {
        "message": "Company access created. Sign in at /company/login with your work email "
        "and the temporary demo password issued for MVP (see product UI)."
    }
