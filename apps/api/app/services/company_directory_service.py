from __future__ import annotations

from sqlalchemy import exists, select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.location import Location
from app.models.site import Site
from app.utils.geo import find_nearby_sites


def list_companies_for_directory(
    db: Session,
    *,
    country: str | None = None,
    city: str | None = None,
    near_lat: float | None = None,
    near_lng: float | None = None,
    radius_km: float = 10.0,
) -> list[Company]:
    """Active companies for public directory, with optional location filters."""
    if near_lat is not None and near_lng is not None:
        sites = find_nearby_sites(db, near_lat, near_lng, radius_km=radius_km, limit=100)
        if country:
            sites = [s for s in sites if s.location is not None and s.location.country == country]
        if city:
            sites = [s for s in sites if s.location is not None and s.location.city == city]
        ordered_ids: list[str] = []
        seen: set[str] = set()
        for site in sites:
            cid = site.company_id
            if cid in seen:
                continue
            seen.add(cid)
            ordered_ids.append(cid)
        if not ordered_ids:
            return []
        rows = db.scalars(select(Company).where(Company.id.in_(ordered_ids))).all()
        by_id = {c.id: c for c in rows}
        return [by_id[i] for i in ordered_ids if i in by_id and by_id[i].is_active]

    stmt = select(Company).where(Company.is_active.is_(True)).order_by(Company.name)
    if country or city:
        loc_filter = [
            Site.company_id == Company.id,
            Site.is_active.is_(True),
            Site.location_id.is_not(None),
        ]
        if country:
            loc_filter.append(Location.country == country)
        if city:
            loc_filter.append(Location.city == city)
        stmt = stmt.where(
            exists(
                select(1)
                .select_from(Site)
                .join(Location, Site.location_id == Location.id)
                .where(*loc_filter)
            )
        )
    return list(db.scalars(stmt).all())


def get_company_by_id(db: Session, company_id: str) -> Company | None:
    return db.scalars(select(Company).where(Company.id == company_id)).first()
