from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.cache import cache_delete, cache_get_json, cache_set_json
from app.models.company import Company
from app.models.dropoff import Dropoff
from app.models.site import Site
from app.models.user import User
from app.utils.enums import UserRole

IMPACT_PLATFORM_CACHE_KEY = "impact:platform:v1"
IMPACT_NETWORK_CACHE_KEY = "impact:network:v1"


def invalidate_platform_cache() -> None:
    cache_delete(IMPACT_PLATFORM_CACHE_KEY)
    cache_delete(IMPACT_NETWORK_CACHE_KEY)


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


def get_network_impact_public(db: Session) -> dict:
    """Ecosystem-level, public-safe telemetry (no personal identities). Cached briefly."""
    cached = cache_get_json(IMPACT_NETWORK_CACHE_KEY)
    if cached is not None:
        return cached

    base = get_platform_totals(db)
    active_recyclers = (
        db.scalar(
            select(func.count())
            .select_from(User)
            .where(User.role == UserRole.recycler, User.is_active.is_(True))
        )
        or 0
    )
    operational_hubs = (
        db.scalar(select(func.count()).select_from(Site).where(Site.is_active.is_(True))) or 0
    )

    now = datetime.now(timezone.utc)
    recent_rows = db.execute(
        select(Dropoff.confirmed_at, Site.city, Dropoff.material_type, Company.name)
        .join(Site, Site.id == Dropoff.site_id)
        .join(Company, Company.id == Dropoff.company_id)
        .order_by(desc(Dropoff.confirmed_at), desc(Dropoff.id))
        .limit(14)
    ).all()
    recent_verified_activity = [
        {
            "confirmed_at": row[0].isoformat(),
            "city": str(row[1]),
            "material_type": str(row[2]),
            "partner_name": str(row[3]),
        }
        for row in recent_rows
    ]

    since_30d = now - timedelta(days=30)
    regional_rows = db.execute(
        select(Site.city, func.count(Dropoff.id))
        .select_from(Dropoff)
        .join(Site, Site.id == Dropoff.site_id)
        .where(Dropoff.confirmed_at >= since_30d)
        .group_by(Site.city)
        .order_by(desc(func.count(Dropoff.id)))
        .limit(8)
    ).all()
    regional_momentum = [
        {"city": str(r[0]), "verified_dropoffs": int(r[1])} for r in regional_rows
    ]

    d7 = now - timedelta(days=7)
    d14 = now - timedelta(days=14)
    last_7d = (
        db.scalar(
            select(func.count()).select_from(Dropoff).where(Dropoff.confirmed_at >= d7)
        )
        or 0
    )
    prior_7d = (
        db.scalar(
            select(func.count())
            .select_from(Dropoff)
            .where(Dropoff.confirmed_at >= d14, Dropoff.confirmed_at < d7)
        )
        or 0
    )
    if last_7d > prior_7d:
        trend = "up"
    elif last_7d < prior_7d:
        trend = "down"
    else:
        trend = "steady"

    milestones: list[dict[str, str]] = []
    vd = int(base["verified_dropoffs"])
    ac = int(base["active_companies"])
    kg = float(base["total_estimated_weight_kg"])
    co2 = float(base["total_estimated_co2_avoided_kg"])
    if vd > 0:
        milestones.append(
            {
                "title": "Verified participation",
                "body": f"{vd:,} operator-confirmed contributions recorded across the network.",
            }
        )
    if ac > 0:
        milestones.append(
            {
                "title": "Collection partners",
                "body": f"{ac} active businesses hosting operational intake capacity.",
            }
        )
    if kg >= 1000:
        milestones.append(
            {
                "title": "Material recovery scale",
                "body": f"An estimated {kg / 1000:.2f} tonnes of material attributed through verified intake.",
            }
        )
    elif kg > 0:
        milestones.append(
            {
                "title": "Material in motion",
                "body": "Estimated recovery totals build as hubs continue to confirm intake.",
            }
        )
    if co2 >= 1000:
        milestones.append(
            {
                "title": "Climate signal (est.)",
                "body": f"Roughly {co2 / 1000:.2f} tonnes CO₂e avoided — methodology estimate, not certification.",
            }
        )

    payload = {
        **base,
        "active_recyclers": int(active_recyclers),
        "operational_hubs": int(operational_hubs),
        "recent_verified_activity": recent_verified_activity,
        "regional_momentum": regional_momentum,
        "milestones": milestones[:5],
        "momentum": {
            "last_7d_verified_dropoffs": int(last_7d),
            "prior_7d_verified_dropoffs": int(prior_7d),
            "trend": trend,
        },
        "generated_at": now.isoformat(),
    }
    cache_set_json(IMPACT_NETWORK_CACHE_KEY, payload, 60)
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
