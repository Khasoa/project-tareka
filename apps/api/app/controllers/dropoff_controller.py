from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.access import authorize_recycler_dropoffs, authorize_site_dropoffs
from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User
from app.schemas.dropoff import DropoffConfirmRequest, PaginatedDropoffsResponse, dropoff_to_response
from app.services.dropoff_service import confirm_dropoff
from app.services.impact_service import invalidate_platform_cache

router = APIRouter(prefix="/dropoffs", tags=["dropoffs"])


@router.post("/confirm")
def confirm_dropoff_endpoint(
    data: DropoffConfirmRequest,
    db: Session = Depends(get_db),
    operator: User = Depends(require_role("operator")),
):
    result = confirm_dropoff(db, operator, data)
    if result.cache_needs_refresh:
        invalidate_platform_cache()
    return dropoff_to_response(result.dropoff, reward_summary=result.reward_summary)


@router.get("/recycler/{recycler_id}")
def list_recycler_dropoffs(
    recycler_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(authorize_recycler_dropoffs),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    from app.repositories.dropoff_repo import DropoffRepository

    repo = DropoffRepository(db)
    rows = repo.get_by_recycler(recycler_id, limit=limit, offset=offset)
    items = [dropoff_to_response(row) for row in rows]
    return PaginatedDropoffsResponse(items=items, limit=limit, offset=offset, count=len(items))


@router.get("/site/{site_id}")
def list_site_dropoffs(
    site_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(authorize_site_dropoffs),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    from app.repositories.dropoff_repo import DropoffRepository

    repo = DropoffRepository(db)
    rows = repo.get_by_site(site_id, limit=limit, offset=offset)
    items = [dropoff_to_response(row) for row in rows]
    return PaginatedDropoffsResponse(items=items, limit=limit, offset=offset, count=len(items))
