from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.company import Company
from app.models.dropoff import Dropoff
from app.models.reward_transaction import RewardTransaction
from app.models.sat_payout import SatPayout
from app.models.site import Site
from app.models.user import User
from app.repositories.dropoff_repo import DropoffRepository
from app.schemas.dropoff import DropoffConfirmRequest
from app.services.bitcoin_payout_service import queue_pending_sat_payout
from app.services.reward_engine import issue_reward
from app.utils.enums import MaterialType, RewardType, UserRole
from app.utils.hash_chain import generate_dropoff_hash
from app.utils.material_config import estimate_co2, estimate_weight, kes_obligation_per_dropoff, sats_pending_per_dropoff


@dataclass
class ConfirmDropoffResult:
    dropoff: Dropoff
    reward_summary: dict[str, Decimal | int]
    cache_needs_refresh: bool = True


def _parse_material(value: str) -> str:
    try:
        return MaterialType(value).value
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid material_type",
        ) from exc


def _decimal_to_hash_str(value: Decimal | None) -> str | None:
    if value is None:
        return None
    return format(value, "f")


def _dropoff_hash_payload(
    *,
    dropoff_id: str,
    site_id: str,
    company_id: str,
    recycler_id: str,
    operator_id: str,
    material_type: str,
    item_count: int,
    estimated_weight_kg: Decimal | None,
    co2_avoided_kg: Decimal | None,
    confirmed_at: datetime,
    previous_hash: str,
) -> dict:
    return {
        "id": dropoff_id,
        "site_id": site_id,
        "company_id": company_id,
        "recycler_id": recycler_id,
        "operator_id": operator_id,
        "material_type": material_type,
        "item_count": item_count,
        "estimated_weight_kg": _decimal_to_hash_str(estimated_weight_kg),
        "co2_avoided_kg": _decimal_to_hash_str(co2_avoided_kg),
        "confirmed_at": confirmed_at,
        "previous_hash": previous_hash,
    }


def _reconstruct_reward_summary(db: Session, company: Company, dropoff: Dropoff) -> dict[str, Decimal | int]:
    token_sum = db.scalar(
        select(func.coalesce(func.sum(RewardTransaction.amount), 0)).where(
            RewardTransaction.dropoff_id == dropoff.id,
            RewardTransaction.reward_type == RewardType.tokens.value,
        )
    )
    tokens = Decimal(str(token_sum or 0))

    kes = Decimal("0")
    if company.reward_kes_enabled:
        kes = kes_obligation_per_dropoff(dropoff.material_type, dropoff.item_count)

    sats_pending = 0
    if company.reward_sats_enabled:
        sp = db.scalars(select(SatPayout).where(SatPayout.dropoff_id == dropoff.id).limit(1)).first()
        sats_pending = (
            int(sp.sats_amount)
            if sp
            else sats_pending_per_dropoff(dropoff.material_type, dropoff.item_count)
        )

    return {"tokens": tokens, "kes_obligation": kes, "sats_pending": sats_pending}


def _resolve_recycler(db: Session, data: DropoffConfirmRequest) -> User:
    if data.recycler_id:
        user = db.scalars(select(User).where(User.id == data.recycler_id)).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
        return user
    if data.recycler_phone:
        user = db.scalars(select(User).where(User.phone == data.recycler_phone)).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
        return user
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="recycler_id or recycler_phone is required",
    )


def _validate_operator_site_company(operator: User, site: Site) -> None:
    if operator.role != UserRole.operator:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    if site.operator_id:
        if operator.id != site.operator_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return
    if operator.company_id and operator.company_id == site.company_id:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


def confirm_dropoff(db: Session, operator: User, data: DropoffConfirmRequest) -> ConfirmDropoffResult:
    if data.item_count <= 0 or data.item_count > 10_000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="item_count must be between 1 and 10000",
        )
    material = _parse_material(data.material_type)

    site = db.scalars(select(Site).where(Site.id == data.site_id)).first()
    if not site or not site.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid site")

    company = db.scalars(select(Company).where(Company.id == site.company_id)).first()
    if not company or not company.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid company")

    _validate_operator_site_company(operator, site)

    recycler = _resolve_recycler(db, data)
    if not recycler.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")

    estimated_weight_kg = estimate_weight(material, data.item_count)
    co2_avoided_kg = estimate_co2(material, data.item_count)

    dropoff_repo = DropoffRepository(db)
    confirmed_at = datetime.now(timezone.utc)
    dropoff_id = DropoffRepository.new_id()

    try:
        dropoff_repo.lock_company_row(site.company_id)
        if data.client_reference_id:
            existing = dropoff_repo.get_by_client_reference(site.company_id, data.client_reference_id)
            if existing is not None:
                summary = _reconstruct_reward_summary(db, company, existing)
                db.commit()
                db.refresh(existing)
                return ConfirmDropoffResult(
                    dropoff=existing,
                    reward_summary=summary,
                    cache_needs_refresh=False,
                )

        last_hash = dropoff_repo.get_last_record_hash(site.company_id)
        previous_hash = last_hash if last_hash else "GENESIS"
        payload = _dropoff_hash_payload(
            dropoff_id=dropoff_id,
            site_id=site.id,
            company_id=site.company_id,
            recycler_id=recycler.id,
            operator_id=operator.id,
            material_type=material,
            item_count=data.item_count,
            estimated_weight_kg=estimated_weight_kg,
            co2_avoided_kg=co2_avoided_kg,
            confirmed_at=confirmed_at,
            previous_hash=previous_hash,
        )
        record_hash = generate_dropoff_hash(payload)

        dropoff = Dropoff(
            id=dropoff_id,
            site_id=site.id,
            company_id=site.company_id,
            recycler_id=recycler.id,
            operator_id=operator.id,
            material_type=material,
            item_count=data.item_count,
            estimated_weight_kg=estimated_weight_kg,
            co2_avoided_kg=co2_avoided_kg,
            client_reference_id=data.client_reference_id,
            reward_type="tokens",
            reward_amount=Decimal("0"),
            reward_issued=False,
            previous_hash=previous_hash,
            record_hash=record_hash,
            confirmed_at=confirmed_at,
        )
        dropoff_repo.create(dropoff)

        reward_summary = issue_reward(db, dropoff, company)

        audit = AuditLog(
            id=str(uuid4()),
            actor_user_id=operator.id,
            action="dropoff_confirmed",
            entity_type="dropoff",
            entity_id=dropoff.id,
            metadata_json={
                "site_id": site.id,
                "company_id": site.company_id,
                "recycler_id": recycler.id,
                "material_type": material,
                "item_count": data.item_count,
            },
        )
        db.add(audit)
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(dropoff)
    if company.reward_sats_enabled:
        for sp in db.scalars(select(SatPayout).where(SatPayout.dropoff_id == dropoff.id)).all():
            queue_pending_sat_payout(db, sp)
    return ConfirmDropoffResult(dropoff=dropoff, reward_summary=reward_summary, cache_needs_refresh=True)
