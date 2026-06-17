from __future__ import annotations

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.dropoff import Dropoff
from app.models.site import Site
from app.models.user import User
from app.utils.enums import UserRole


def authorize_recycler_dropoffs(
    recycler_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> User:
    if current_user.role == UserRole.recycler:
        if current_user.id != recycler_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    if current_user.role == UserRole.company_admin:
        if not current_user.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        exists = db.scalars(
            select(Dropoff.id)
            .where(
                Dropoff.recycler_id == recycler_id,
                Dropoff.company_id == current_user.company_id,
            )
            .limit(1)
        ).first()
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions",
    )


def authorize_site_dropoffs(
    site_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> User:
    site = db.scalars(select(Site).where(Site.id == site_id)).first()
    if not site:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Site not found")
    if current_user.role == UserRole.operator:
        if site.operator_id:
            if current_user.id != site.operator_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions",
                )
        elif not current_user.company_id or current_user.company_id != site.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    if current_user.role == UserRole.company_admin:
        if not current_user.company_id or current_user.company_id != site.company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions",
    )


def ensure_wallet_owner_or_company_admin(
    db: Session,
    current_user: User,
    wallet_id: str,
) -> None:
    from app.models.wallet import Wallet

    wallet = db.scalars(select(Wallet).where(Wallet.id == wallet_id)).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
    if current_user.role == UserRole.recycler and wallet.user_id == current_user.id:
        return
    if current_user.role == UserRole.company_admin and wallet.company_id == current_user.company_id:
        return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions",
    )


def authorize_wallet(
    wallet_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> User:
    ensure_wallet_owner_or_company_admin(db, current_user, wallet_id)
    return current_user


def authorize_company_admin(
    company_id: str,
    current_user: User = Depends(get_current_active_user),
) -> User:
    if current_user.role != UserRole.company_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    if not current_user.company_id or current_user.company_id != company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )
    return current_user


def authorize_company_access(
    company_id: str,
    current_user: User = Depends(get_current_active_user),
) -> User:
    """Company admins see only their org; platform admins may view any company."""
    if current_user.role == UserRole.platform_admin:
        return current_user
    if current_user.role == UserRole.company_admin:
        if not current_user.company_id or current_user.company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient permissions",
    )
