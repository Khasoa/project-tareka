from __future__ import annotations

from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.cache import cache_delete, cache_get_json, cache_set_json
from app.models.company import Company
from app.models.dropoff import Dropoff

IMPACT_PLATFORM_CACHE_KEY = "impact:platform:v1"


def invalidate_platform_cache() -> None:
    cache_delete(IMPACT_PLATFORM_CACHE_KEY)


def _estimate_labels() -> tuple[str, str]:
    return "estimate", "estimate"


def get_platform_totals(db: Session) -> dict:
    cached = cache_get_json(IMPACT_PLATFORM_CACHE_KEY)
    if cached is not None:
        return cached

    weight_label, co2_label = _estimate_labels()
    total_weight = db.scalar(select(func.coalesce(func.sum(Dropoff.estimated_weight_kg), 0))) or 0
    total_co2 = db.scalar(select(func.coalesce(func.sum(Dropoff.co2_avoided_kg), 0))) or 0
    dropoff_count = db.scalar(select(func.count()).select_from(Dropoff)) or 0
    company_count = db.scalar(
        select(func.count()).select_from(Company).where(Company.is_active.is_(True))
    ) or 0

    payload = {
        "total_estimated_weight_kg": float(Decimal(total_weight)),
        "estimated_weight_label": weight_label,
        "total_estimated_co2_avoided_kg": float(Decimal(total_co2)),
        "co2_estimate_label": co2_label,
        "verified_dropoffs": int(dropoff_count),
        "active_companies": int(company_count or 0),
        "is_estimate": True,
    }
    cache_set_json(IMPACT_PLATFORM_CACHE_KEY, payload, 60)
    return payload


def get_company_impact(db: Session, company_id: str) -> dict:
    weight_label, co2_label = _estimate_labels()
    total_weight = db.scalar(
        select(func.coalesce(func.sum(Dropoff.estimated_weight_kg), 0)).where(
            Dropoff.company_id == company_id
        )
    ) or 0
    total_co2 = db.scalar(
        select(func.coalesce(func.sum(Dropoff.co2_avoided_kg), 0)).where(Dropoff.company_id == company_id)
    ) or 0
    dropoff_count = db.scalar(
        select(func.count()).select_from(Dropoff).where(Dropoff.company_id == company_id)
    ) or 0
    return {
        "company_id": company_id,
        "total_estimated_weight_kg": float(Decimal(total_weight)),
        "estimated_weight_label": weight_label,
        "total_estimated_co2_avoided_kg": float(Decimal(total_co2)),
        "co2_estimate_label": co2_label,
        "verified_dropoffs": int(dropoff_count),
        "is_estimate": True,
    }


def get_recycler_impact(db: Session, recycler_id: str) -> dict:
    weight_label, co2_label = _estimate_labels()
    total_weight = db.scalar(
        select(func.coalesce(func.sum(Dropoff.estimated_weight_kg), 0)).where(
            Dropoff.recycler_id == recycler_id
        )
    ) or 0
    total_co2 = db.scalar(
        select(func.coalesce(func.sum(Dropoff.co2_avoided_kg), 0)).where(
            Dropoff.recycler_id == recycler_id
        )
    ) or 0
    dropoff_count = db.scalar(
        select(func.count()).select_from(Dropoff).where(Dropoff.recycler_id == recycler_id)
    ) or 0
    return {
        "recycler_id": recycler_id,
        "total_estimated_weight_kg": float(Decimal(total_weight)),
        "estimated_weight_label": weight_label,
        "total_estimated_co2_avoided_kg": float(Decimal(total_co2)),
        "co2_estimate_label": co2_label,
        "verified_dropoffs": int(dropoff_count),
        "is_estimate": True,
    }
