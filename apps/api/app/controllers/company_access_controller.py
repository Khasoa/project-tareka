from uuid import uuid4

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.company_access_request import CompanyAccessRequest
from app.schemas.company_access_request import CompanyAccessRequestCreate
from fastapi import Request

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/company-access-requests", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def request_company_access(
    request: Request,
    payload: CompanyAccessRequestCreate,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    _ = request
    entry = CompanyAccessRequest(
        id=str(uuid4()),
        company_name=payload.company_name,
        contact_person=payload.contact_person,
        work_email=payload.work_email,
        industry=payload.industry,
        optional_message=payload.optional_message,
        status="pending_approval",
    )
    db.add(entry)
    db.commit()
    return {"message": "Request received. We will review and contact you at the provided email."}
