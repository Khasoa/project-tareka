from __future__ import annotations

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_db
from app.models.company import Company
from app.models.user import User
from app.schemas.company_rewards import (
    MaterialRewardRule,
    RedemptionSettings,
    RewardPreviewRequest,
    RewardPreviewResponse,
    RewardProgrammePatch,
    RewardProgrammeResponse,
)
from app.services.reward_programme_service import (
    apply_reward_programme_patch,
    estimate_preview_sats,
    estimate_preview_tokens,
)
from app.services.reward_programme_service import response_from_company
from app.utils.enums import MaterialType, UserRole

router = APIRouter(prefix="/company-rewards", tags=["company-rewards"])


def _authorize_company_admin(company_id: str, user: User) -> None:
    if user.role != UserRole.company_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    if not user.company_id or user.company_id != company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


def _material_reward_rule_from_payload(rule: dict) -> MaterialRewardRule:
    return MaterialRewardRule(
        tokens_per_kg=Decimal(rule["tokens_per_kg"]) if rule.get("tokens_per_kg") is not None else None,
        sats_per_kg=Decimal(rule["sats_per_kg"]) if rule.get("sats_per_kg") is not None else None,
        min_threshold_kg=Decimal(rule["min_threshold_kg"]) if rule.get("min_threshold_kg") is not None else None,
        monthly_cap_tokens=int(rule["monthly_cap_tokens"]) if rule.get("monthly_cap_tokens") is not None else None,
    )


def _to_reward_programme_response(company: Company) -> RewardProgrammeResponse:
    raw = response_from_company(company)
    mr_out: dict[str, MaterialRewardRule] = {}
    for key, rule in raw["material_rules"].items():
        if isinstance(rule, dict):
            mr_out[key] = _material_reward_rule_from_payload(rule)
    redemption = RedemptionSettings(**raw["redemption"])
    return RewardProgrammeResponse(
        programme_enabled=raw["programme_enabled"],
        reward_mode=raw["reward_mode"],
        material_rules=mr_out,
        redemption=redemption,
        reward_tokens_enabled=raw["reward_tokens_enabled"],
        reward_sats_enabled=raw["reward_sats_enabled"],
        reward_kes_enabled=raw["reward_kes_enabled"],
    )


@router.get("/{company_id}", response_model=RewardProgrammeResponse)
def get_reward_programme(
    company_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    _authorize_company_admin(company_id, user)
    company = db.scalars(select(Company).where(Company.id == company_id)).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return _to_reward_programme_response(company)


@router.put("/{company_id}", response_model=RewardProgrammeResponse)
def put_reward_programme(
    company_id: str,
    patch: RewardProgrammePatch,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    _authorize_company_admin(company_id, user)
    company = db.scalars(select(Company).where(Company.id == company_id)).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    try:
        apply_reward_programme_patch(db, company, patch)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    db.refresh(company)
    return _to_reward_programme_response(company)


@router.post("/{company_id}/preview", response_model=RewardPreviewResponse)
def preview_reward_estimate(
    company_id: str,
    body: RewardPreviewRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_active_user),
):
    _authorize_company_admin(company_id, user)
    company = db.scalars(select(Company).where(Company.id == company_id)).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    try:
        MaterialType(body.material_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid material_type") from exc

    w = body.weight_kg
    tokens = estimate_preview_tokens(company, body.material_type, w)
    sats = estimate_preview_sats(company, body.material_type, w)
    notes = (
        "Preview uses current programme rules. Monthly caps and verification gates apply when a "
        "drop-off is actually confirmed."
    )
    return RewardPreviewResponse(
        material_type=body.material_type,
        weight_kg=float(w),
        estimated_tokens=format(tokens, "f"),
        estimated_sats=sats,
        notes=notes,
    )
