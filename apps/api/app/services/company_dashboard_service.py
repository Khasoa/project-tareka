from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.dropoff import Dropoff
from app.models.site import Site
from app.repositories.dropoff_repo import DropoffRepository
from app.services.impact_service import get_company_impact
from app.services.payout_service import sum_pending_kes_for_company_week


def get_company_dashboard_summary(db: Session, company_id: str) -> dict:
    """Aggregated operational view for company / platform admins (auth enforced at route)."""
    base = get_company_impact(db, company_id)

    distinct_recyclers = (
        db.scalar(
            select(func.count(func.distinct(Dropoff.recycler_id))).where(Dropoff.company_id == company_id)
        )
        or 0
    )

    active_sites = (
        db.scalar(
            select(func.count())
            .select_from(Site)
            .where(Site.company_id == company_id, Site.is_active.is_(True))
        )
        or 0
    )

    material_rows = db.execute(
        select(
            Dropoff.material_type,
            func.coalesce(func.sum(Dropoff.estimated_weight_kg), 0),
            func.count(Dropoff.id),
        )
        .where(Dropoff.company_id == company_id)
        .group_by(Dropoff.material_type)
        .order_by(desc(func.coalesce(func.sum(Dropoff.estimated_weight_kg), 0)))
    ).all()

    material_mix = [
        {
            "material_type": str(r[0]),
            "estimated_kg": float(Decimal(r[1] or 0)),
            "dropoffs": int(r[2]),
        }
        for r in material_rows
    ]

    week_bucket = func.date_trunc("week", Dropoff.confirmed_at)
    weekly_rows = db.execute(
        select(
            week_bucket.label("wk"),
            func.count(Dropoff.id),
            func.coalesce(func.sum(Dropoff.estimated_weight_kg), 0),
        )
        .where(Dropoff.company_id == company_id)
        .group_by(week_bucket)
        .order_by(desc(week_bucket))
        .limit(8)
    ).all()

    weekly_intake = []
    for r in reversed(weekly_rows):
        wk = r[0]
        if isinstance(wk, datetime):
            wk_date = wk.date()
        else:
            wk_date = wk
        weekly_intake.append(
            {
                "week_start": wk_date.isoformat(),
                "dropoff_count": int(r[1]),
                "estimated_kg": float(Decimal(r[2] or 0)),
            }
        )

    site_rows = db.execute(
        select(
            Site.id,
            Site.name,
            func.count(Dropoff.id),
            func.coalesce(func.sum(Dropoff.estimated_weight_kg), 0),
        )
        .join(Dropoff, Dropoff.site_id == Site.id)
        .where(Site.company_id == company_id)
        .group_by(Site.id, Site.name)
        .order_by(desc(func.count(Dropoff.id)))
        .limit(12)
    ).all()

    sites = [
        {
            "site_id": str(r[0]),
            "site_name": str(r[1]),
            "dropoff_count": int(r[2]),
            "estimated_kg": float(Decimal(r[3] or 0)),
        }
        for r in site_rows
    ]

    repo = DropoffRepository(db)
    tip_hash = repo.get_last_record_hash(company_id)
    today_utc = datetime.now(timezone.utc).date()
    pending_kes = sum_pending_kes_for_company_week(db, company_id, today_utc)

    return {
        **base,
        "distinct_recyclers": int(distinct_recyclers),
        "active_sites": int(active_sites),
        "material_mix": material_mix,
        "weekly_intake": weekly_intake,
        "sites": sites,
        "ledger_tip_hash": tip_hash,
        "pending_kes_obligations_week": float(pending_kes),
    }
