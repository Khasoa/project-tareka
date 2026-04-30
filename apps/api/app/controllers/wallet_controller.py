from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.access import authorize_wallet, ensure_wallet_owner_or_company_admin
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.wallet import TokenRedeemRequest, WalletResponse
from app.services.wallet_service import WalletService

router = APIRouter(tags=["wallet"])


@router.get("/wallet/{wallet_id}", response_model=WalletResponse)
def get_wallet_endpoint(
    wallet_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(authorize_wallet),
):
    service = WalletService(db)
    wallet = service.repo.get_by_id(wallet_id)
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
    return WalletResponse(
        id=wallet.id,
        user_id=wallet.user_id,
        company_id=wallet.company_id,
        token_balance=wallet.token_balance,
        lifetime_earned=wallet.lifetime_earned,
        lifetime_redeemed=wallet.lifetime_redeemed,
    )


@router.post("/tokens/redeem")
def redeem_tokens_endpoint(
    body: TokenRedeemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ensure_wallet_owner_or_company_admin(db, current_user, body.wallet_id)
    service = WalletService(db)
    wallet = service.repo.get_by_id(body.wallet_id)
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")
    service.redeem_tokens(wallet, body.amount)
    db.commit()
    return {"message": "Redeem successful"}
