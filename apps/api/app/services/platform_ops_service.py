"""Aggregated, read-only network operations snapshot for platform administrators."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.company import Company
from app.models.company_access_request import CompanyAccessRequest
from app.models.dropoff import Dropoff
from app.models.site import Site
from app.models.user import User
from app.services.impact_service import get_platform_totals
from app.utils.enums import UserRole


def get_platform_operations_snapshot(db: Session) -> dict:
    """Single aggregated payload; auth enforced on the route."""
    platform = get_platform_totals(db)

    active_recyclers = (
        db.scalar(
            select(func.count())
            .select_from(User)
            .where(User.role == UserRole.recycler, User.is_active.is_(True))
        )
        or 0
    )
    active_operators = (
        db.scalar(
            select(func.count())
            .select_from(User)
            .where(User.role == UserRole.operator, User.is_active.is_(True))
        )
        or 0
    )
    operators_pending_verification = (
        db.scalar(
            select(func.count())
            .select_from(User)
            .where(User.role == UserRole.operator, User.is_verified.is_(False), User.is_active.is_(True))
        )
        or 0
    )

    active_businesses = (
        db.scalar(
            select(func.count()).select_from(Company).where(Company.is_active.is_(True))
        )
        or 0
    )
    businesses_pending_network_approval = (
        db.scalar(
            select(func.count())
            .select_from(Company)
            .where(Company.is_active.is_(True), Company.is_approved.is_(False))
        )
        or 0
    )

    operational_hubs = (
        db.scalar(select(func.count()).select_from(Site).where(Site.is_active.is_(True))) or 0
    )

    pending_access_requests = (
        db.scalar(
            select(func.count()).select_from(CompanyAccessRequest).where(
                CompanyAccessRequest.status == "pending_approval"
            )
        )
        or 0
    )

    since_7d = datetime.now(timezone.utc) - timedelta(days=7)
    failed_logins_7d = (
        db.scalar(
            select(func.count())
            .select_from(AuditLog)
            .where(AuditLog.action == "login_failed", AuditLog.created_at >= since_7d)
        )
        or 0
    )

    access_rows = db.execute(
        select(CompanyAccessRequest)
        .where(CompanyAccessRequest.status == "pending_approval")
        .order_by(desc(CompanyAccessRequest.created_at))
        .limit(12)
    ).scalars()
    access_requests = [
        {
            "id": r.id,
            "company_name": r.company_name,
            "contact_person": r.contact_person,
            "work_email": r.work_email,
            "industry": r.industry,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in access_rows
    ]

    companies_recent = db.execute(
        select(Company)
        .where(Company.is_active.is_(True))
        .order_by(desc(Company.created_at))
        .limit(10)
    ).scalars()
    partner_recent = [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "is_verified": c.is_verified,
            "is_approved": c.is_approved,
            "created_at": c.created_at.isoformat(),
        }
        for c in companies_recent
    ]

    audit_rows = db.scalars(
        select(AuditLog).order_by(desc(AuditLog.created_at)).limit(24)
    ).all()
    audit_tail = [
        {
            "id": a.id,
            "action": a.action,
            "entity_type": a.entity_type,
            "entity_id": a.entity_id,
            "actor_user_id": a.actor_user_id,
            "created_at": a.created_at.isoformat(),
        }
        for a in audit_rows
    ]

    suspicious_rows = db.scalars(
        select(AuditLog)
        .where(AuditLog.action == "login_failed")
        .order_by(desc(AuditLog.created_at))
        .limit(12)
    ).all()
    suspicious_auth = [
        {
            "id": a.id,
            "created_at": a.created_at.isoformat(),
            "entity_id": a.entity_id,
        }
        for a in suspicious_rows
    ]

    dropoff_event_stmt = (
        select(
            Dropoff.id,
            Dropoff.confirmed_at,
            Dropoff.material_type,
            Dropoff.company_id,
            Site.name,
            Site.city,
            Company.name,
        )
        .join(Site, Site.id == Dropoff.site_id)
        .join(Company, Company.id == Dropoff.company_id)
        .order_by(desc(Dropoff.confirmed_at), desc(Dropoff.id))
        .limit(16)
    )
    net_events = [
        {
            "id": str(row[0]),
            "confirmed_at": row[1].isoformat(),
            "material_type": str(row[2]),
            "company_id": str(row[3]),
            "site_name": str(row[4]),
            "city": str(row[5]),
            "company_name": str(row[6]),
        }
        for row in db.execute(dropoff_event_stmt).all()
    ]

    region_stmt = (
        select(
            Site.city,
            func.count(Dropoff.id),
            func.coalesce(func.sum(Dropoff.estimated_weight_kg), 0),
        )
        .select_from(Dropoff)
        .join(Site, Site.id == Dropoff.site_id)
        .group_by(Site.city)
        .order_by(desc(func.count(Dropoff.id)))
        .limit(14)
    )
    regional_intake = [
        {
            "city": str(r[0]),
            "verified_dropoffs": int(r[1]),
            "estimated_kg": float(Decimal(r[2] or 0)),
        }
        for r in db.execute(region_stmt).all()
    ]

    now = datetime.now(timezone.utc)
    return {
        "generated_at": now.isoformat(),
        "platform_impact": platform,
        "users": {
            "active_recyclers": int(active_recyclers),
            "active_operators": int(active_operators),
            "operators_pending_verification": int(operators_pending_verification),
        },
        "companies": {
            "active_businesses": int(active_businesses),
            "pending_network_approval": int(businesses_pending_network_approval),
        },
        "sites": {"operational_hubs": int(operational_hubs)},
        "onboarding": {
            "pending_company_access_requests": int(pending_access_requests),
            "recent_requests": access_requests,
        },
        "risk_signals": {
            "failed_logins_7d": int(failed_logins_7d),
            "recent_failed_logins": suspicious_auth,
            "automated_flagged_dropoffs": None,
            "note": "No automated fraud-score feed is wired yet; signals below are auth telemetry only.",
        },
        "partner_growth": {"recent_companies": partner_recent},
        "regional_intake": regional_intake,
        "network_events": net_events,
        "audit_tail": audit_tail,
    }
