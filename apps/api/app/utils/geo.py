from __future__ import annotations

from math import asin, cos, radians, sin, sqrt

import sqlalchemy as sa
from sqlalchemy import cast, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.location import Location
from app.models.site import Site

EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two WGS84 points in kilometers."""
    rlat1, rlon1 = radians(lat1), radians(lon1)
    rlat2, rlon2 = radians(lat2), radians(lon2)
    dlat = rlat2 - rlat1
    dlon = rlon2 - rlon1
    h = sin(dlat / 2) ** 2 + cos(rlat1) * cos(rlat2) * sin(dlon / 2) ** 2
    h = min(1.0, max(0.0, h))
    return 2 * EARTH_RADIUS_KM * asin(sqrt(h))


def _effective_coordinates(site: Site) -> tuple[float, float] | None:
    if site.location_id and site.location is not None:
        lat, lon = site.location.latitude, site.location.longitude
    else:
        lat, lon = float(site.latitude), float(site.longitude)
    if lat is None or lon is None:
        return None
    if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
        return None
    return lat, lon


def find_nearby_sites(
    db: Session,
    lat: float,
    lng: float,
    radius_km: float = 10.0,
    limit: int = 50,
) -> list[Site]:
    """
    Return active sites within radius_km of (lat, lng), ordered by distance ascending.
    Uses a latitude/longitude bounding box prefilter, then Haversine in Python.
    """
    radius_km = min(float(radius_km), 100.0)
    limit = min(max(int(limit), 1), 100)

    lat_rad = radians(lat)
    cos_lat = max(abs(cos(lat_rad)), 1e-6)
    delta_lat = radius_km / 111.0
    delta_lng = min(radius_km / (111.0 * cos_lat), 180.0)

    lat_min, lat_max = lat - delta_lat, lat + delta_lat
    lng_min, lng_max = lng - delta_lng, lng + delta_lng

    eff_lat = func.coalesce(Location.latitude, cast(Site.latitude, sa.Float))
    eff_lng = func.coalesce(Location.longitude, cast(Site.longitude, sa.Float))

    stmt = (
        select(Site)
        .outerjoin(Location, Site.location_id == Location.id)
        .where(Site.is_active.is_(True))
        .where(eff_lat.between(lat_min, lat_max))
        .where(eff_lng.between(lng_min, lng_max))
        .options(joinedload(Site.location))
    )

    candidates = list(db.scalars(stmt).unique().all())

    scored: list[tuple[float, Site]] = []
    for site in candidates:
        coords = _effective_coordinates(site)
        if coords is None:
            continue
        slat, slng = coords
        dist = haversine_km(lat, lng, slat, slng)
        if dist <= radius_km:
            scored.append((dist, site))

    scored.sort(key=lambda x: x[0])
    return [s for _, s in scored[:limit]]
