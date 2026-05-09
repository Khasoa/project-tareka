from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_role
from app.db.session import get_db
from app.models.user import User
from app.services.platform_ops_service import get_platform_operations_snapshot

router = APIRouter(prefix="/platform", tags=["platform"])


@router.get("/operations")
def platform_operations(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("platform_admin")),
):
    """Read-only ecosystem snapshot for internal network operations."""
    return get_platform_operations_snapshot(db)
