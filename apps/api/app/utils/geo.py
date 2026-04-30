from __future__ import annotations

from math import asin, cos, radians, sin, sqrt

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.site import Site


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    c = 2 * asin(sqrt(a))
    return r * c


def find_nearby_sites(
    db: Session,
    lat: float,
    lng: float,
    radius_km: float = 10.0,
    limit: int = 50,
) -> list[Site]:
    radius_km = max(0.1, min(radius_km, 100.0))
    limit = max(1, min(limit, 100))

    # coarse bbox first for performance before Haversine
    lat_delta = radius_km / 111.0
    lng_delta = radius_km / max(1.0, (111.0 * cos(radians(lat))))

    rows = db.scalars(
        select(Site)
        .where(
            Site.location_id.is_not(None),
            Site.latitude.is_not(None),
            Site.longitude.is_not(None),
            Site.latitude >= (lat - lat_delta),
            Site.latitude <= (lat + lat_delta),
            Site.longitude >= (lng - lng_delta),
            Site.longitude <= (lng + lng_delta),
        )
    ).all()

    dist_pairs: list[tuple[float, Site]] = []
    for site in rows:
        d = _haversine_km(lat, lng, float(site.latitude), float(site.longitude))
        if d <= radius_km:
            dist_pairs.append((d, site))

    dist_pairs.sort(key=lambda x: x[0])
    return [s for _, s in dist_pairs[:limit]]
