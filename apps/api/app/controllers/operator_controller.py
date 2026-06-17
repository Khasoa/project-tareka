from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.access import authorize_site_dropoffs
from app.api.deps import get_db, require_role
from app.models.company import Company
from app.models.site import Site
from app.models.user import User
from app.schemas.operator import OperatorSiteResponse, RecyclerSearchHit, SiteRewardContextResponse
from app.services.reward_programme_service import derive_reward_booleans, normalized_reward_programme
from app.utils.enums import UserRole

router = APIRouter(prefix="/operators", tags=["operators"])


def _sites_visible_for_user(db: Session, user: User) -> list[Site]:
    stmt = select(Site).where(Site.is_active.is_(True))
    if user.role == UserRole.company_admin:
        if not user.company_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        rows = db.scalars(stmt.where(Site.company_id == user.company_id).order_by(Site.name)).all()
        return list(rows)

    if user.role == UserRole.operator:
        clauses = [Site.operator_id == user.id]
        if user.company_id:
            clauses.append(
                (Site.company_id == user.company_id)
                & ((Site.operator_id.is_(None)) | (Site.operator_id == user.id))
            )
        rows = db.scalars(stmt.where(or_(*clauses)).order_by(Site.name)).all()
        by_id: dict[str, Site] = {}
        for s in rows:
            by_id[s.id] = s
        return sorted(by_id.values(), key=lambda s: s.name.lower())

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


@router.get("/sites", response_model=list[OperatorSiteResponse])
def list_operator_sites(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("operator", "company_admin")),
):
    sites = _sites_visible_for_user(db, user)
    return [
        OperatorSiteResponse(
            id=s.id,
            name=s.name,
            city=s.city,
            address=s.address,
            company_id=s.company_id,
        )
        for s in sites
    ]


@router.get("/sites/{site_id}/reward-context", response_model=SiteRewardContextResponse)
def site_reward_context(
    site_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(authorize_site_dropoffs),
):
    site = db.scalars(select(Site).where(Site.id == site_id)).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    company = db.scalars(select(Company).where(Company.id == site.company_id)).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid company")
    cfg = normalized_reward_programme(company.reward_programme_config)
    tok, kes_on, sats_on = derive_reward_booleans(cfg)
    return SiteRewardContextResponse(
        site_id=site.id,
        company_id=site.company_id,
        reward_tokens_enabled=tok,
        reward_kes_enabled=kes_on,
        reward_sats_enabled=sats_on,
    )


@router.get("/recyclers/search", response_model=list[RecyclerSearchHit])
def search_recyclers(
    q: str = Query("", min_length=1, max_length=120),
    limit: int = Query(default=12, ge=1, le=30),
    db: Session = Depends(get_db),
    _: User = Depends(require_role("operator", "company_admin")),
):
    raw = q.strip()
    if len(raw) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query must be at least 2 characters",
        )
    pattern = f"%{raw}%"

    stmt = (
        select(User)
        .where(
            User.role == UserRole.recycler,
            User.is_active.is_(True),
            or_(
                User.id == raw,
                User.phone.ilike(pattern),
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
            ),
        )
        .order_by(User.full_name)
        .limit(limit)
    )
    rows = db.scalars(stmt).all()
    return [
        RecyclerSearchHit(id=u.id, full_name=u.full_name, phone=u.phone, email=u.email) for u in rows
    ]
