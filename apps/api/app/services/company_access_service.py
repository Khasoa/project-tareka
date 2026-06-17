"""Company access onboard — production should use reviewed invitations only."""

from __future__ import annotations

import re
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.company import Company
from app.models.company_access_request import CompanyAccessRequest
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.company_access_request import CompanyAccessRequestCreate
from app.utils.enums import UserRole

# MVP DEMO ONLY — replace with secure onboarding/password setup flow before production.
# Used only to derive a bcrypt hash; never persisted as plain text.
MVP_DEMO_COMPANY_DEFAULT_PASSWORD = "12345678"


def _slug_base(name: str) -> str:
    raw = name.strip().lower()
    raw = re.sub(r"[^a-z0-9]+", "-", raw)
    raw = re.sub(r"-+", "-", raw).strip("-")
    base = raw[:200] if raw else "company"
    return base


def _allocate_company_slug(db: Session, company_name: str) -> str:
    base = _slug_base(company_name)
    candidate = base
    for _ in range(120):
        existing = db.query(Company).filter(Company.slug == candidate).first()
        if not existing:
            return candidate
        candidate = f"{base[:220]}-{uuid4().hex[:8]}"
    return f"{base[:200]}-{uuid4().hex[:12]}"


def submit_company_access_request(db: Session, payload: CompanyAccessRequestCreate) -> None:
    """
    MVP DEMO ONLY — replace with secure onboarding/password setup flow before production.

    Auto-provisions company + company_admin with a fixed demo password (hashed).
    """
    user_repo = UserRepository(db)
    if payload.work_email and user_repo.get_by_email(payload.work_email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )
    if payload.phone and user_repo.get_by_phone(payload.phone):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this phone number already exists.",
        )

    try:
        # Never store plain text — hash immediately using production password utilities.
        hashed = hash_password(MVP_DEMO_COMPANY_DEFAULT_PASSWORD)

        company = db.query(Company).filter(Company.name == payload.company_name.strip()).first()
        if company:
            company.is_active = True
            company.is_verified = True
            company.is_approved = True
        else:
            company = Company(
                id=str(uuid4()),
                name=payload.company_name.strip(),
                slug=_allocate_company_slug(db, payload.company_name),
                description=None,
                is_active=True,
                is_verified=True,
                is_approved=True,
            )
            db.add(company)
            db.flush()

        admin_user = User(
            id=str(uuid4()),
            company_id=company.id,
            full_name=payload.contact_person.strip(),
            email=payload.work_email,
            phone=payload.phone,
            hashed_password=hashed,
            role=UserRole.company_admin,
            language="en",
            is_active=True,
            is_verified=True,
        )
        db.add(admin_user)

        entry = CompanyAccessRequest(
            id=str(uuid4()),
            company_name=payload.company_name.strip(),
            contact_person=payload.contact_person.strip(),
            work_email=payload.work_email,
            phone=payload.phone,
            county_location=payload.county_location.strip() if payload.county_location else None,
            materials_handled=payload.materials_handled.strip() if payload.materials_handled else None,
            industry=payload.company_type.strip(),
            optional_message=payload.optional_message,
            status="mvp_demo_auto",
        )
        db.add(entry)
        db.commit()
    except Exception:
        db.rollback()
        raise
