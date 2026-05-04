"""locations table, site and company FKs, backfill from site coordinates

Revision ID: c9d0e1f2a3b5
Revises: d1e2f3a4b5c6
Create Date: 2026-05-03
"""

from __future__ import annotations

from uuid import uuid4

import sqlalchemy as sa
from alembic import op

revision = "c9d0e1f2a3b5"
down_revision = "d1e2f3a4b5c6"
branch_labels = None
depends_on = None


def _site_location_fk_exists(insp: sa.Inspector) -> bool:
    for fk in insp.get_foreign_keys("sites"):
        if fk.get("referred_table") == "locations" and fk.get("constrained_columns") == ["location_id"]:
            return True
    return False


def _company_hq_fk_exists(insp: sa.Inspector) -> bool:
    for fk in insp.get_foreign_keys("companies"):
        if fk.get("referred_table") == "locations" and fk.get("constrained_columns") == [
            "headquarters_location_id"
        ]:
            return True
    return False


def _column_names(insp: sa.Inspector, table: str) -> set[str]:
    return {c["name"] for c in insp.get_columns(table)}


def _index_names(insp: sa.Inspector, table: str) -> set[str]:
    return {ix["name"] for ix in insp.get_indexes(table)}


def _ensure_location_indexes(insp: sa.Inspector) -> None:
    existing = _index_names(insp, "locations")
    specs: list[tuple[str, list[str]]] = [
        ("ix_location_country_city", ["country", "city"]),
        ("ix_locations_country", ["country"]),
        ("ix_locations_region", ["region"]),
        ("ix_locations_city", ["city"]),
        ("ix_locations_latitude", ["latitude"]),
        ("ix_locations_longitude", ["longitude"]),
    ]
    for name, cols in specs:
        if name not in existing:
            op.create_index(name, "locations", cols, unique=False)
            existing.add(name)


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)

    if not insp.has_table("locations"):
        op.create_table(
            "locations",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("country", sa.String(length=100), nullable=False),
            sa.Column("region", sa.String(length=100), nullable=False),
            sa.Column("city", sa.String(length=100), nullable=False),
            sa.Column("area", sa.String(length=100), nullable=True),
            sa.Column("latitude", sa.Float(), nullable=False),
            sa.Column("longitude", sa.Float(), nullable=False),
            sa.Column("formatted_address", sa.String(length=255), nullable=True),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("CURRENT_TIMESTAMP"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )

    insp = sa.inspect(bind)
    _ensure_location_indexes(insp)

    sites_cols = _column_names(insp, "sites")
    if "location_id" not in sites_cols:
        op.add_column("sites", sa.Column("location_id", sa.String(length=36), nullable=True))
        op.create_index(op.f("ix_sites_location_id"), "sites", ["location_id"], unique=False)
        op.create_foreign_key(
            "fk_sites_location_id_locations",
            "sites",
            "locations",
            ["location_id"],
            ["id"],
        )
    elif not _site_location_fk_exists(insp):
        op.create_foreign_key(
            "fk_sites_location_id_locations",
            "sites",
            "locations",
            ["location_id"],
            ["id"],
        )

    insp = sa.inspect(bind)
    companies_cols = _column_names(insp, "companies")
    if "headquarters_location_id" not in companies_cols:
        op.add_column(
            "companies",
            sa.Column("headquarters_location_id", sa.String(length=36), nullable=True),
        )
        op.create_index(
            op.f("ix_companies_headquarters_location_id"),
            "companies",
            ["headquarters_location_id"],
            unique=False,
        )
        op.create_foreign_key(
            "fk_companies_headquarters_location_id_locations",
            "companies",
            "locations",
            ["headquarters_location_id"],
            ["id"],
        )
    elif not _company_hq_fk_exists(insp):
        op.create_foreign_key(
            "fk_companies_headquarters_location_id_locations",
            "companies",
            "locations",
            ["headquarters_location_id"],
            ["id"],
        )

    rows = bind.execute(
        sa.text(
            """
            SELECT id, city, latitude, longitude, address
            FROM sites
            WHERE location_id IS NULL
              AND latitude IS NOT NULL
              AND longitude IS NOT NULL
            """
        )
    ).mappings().all()

    insert_loc = sa.text(
        """
        INSERT INTO locations (
            id, country, region, city, area, latitude, longitude,
            formatted_address, created_at, updated_at
        ) VALUES (
            :id, :country, :region, :city, NULL, :lat, :lng,
            :addr, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        """
    )
    update_site = sa.text("UPDATE sites SET location_id = :lid WHERE id = :sid")

    for row in rows:
        lat, lng = row["latitude"], row["longitude"]
        if lat is None or lng is None:
            continue
        loc_id = str(uuid4())
        city_val = (row["city"] or "").strip() or "Nairobi"
        addr = row["address"]
        bind.execute(
            insert_loc,
            {
                "id": loc_id,
                "country": "Kenya",
                "region": "Nairobi County",
                "city": city_val,
                "lat": float(lat),
                "lng": float(lng),
                "addr": addr,
            },
        )
        bind.execute(update_site, {"lid": loc_id, "sid": row["id"]})


def downgrade() -> None:
    bind = op.get_bind()
    if not sa.inspect(bind).has_table("locations"):
        return

    op.execute(sa.text("UPDATE sites SET location_id = NULL"))
    op.execute(sa.text("UPDATE companies SET headquarters_location_id = NULL"))

    insp = sa.inspect(bind)
    if _company_hq_fk_exists(insp):
        op.drop_constraint(
            "fk_companies_headquarters_location_id_locations",
            "companies",
            type_="foreignkey",
        )
    insp = sa.inspect(bind)
    if "ix_companies_headquarters_location_id" in _index_names(insp, "companies"):
        op.drop_index(op.f("ix_companies_headquarters_location_id"), table_name="companies")
    if "headquarters_location_id" in _column_names(insp, "companies"):
        op.drop_column("companies", "headquarters_location_id")

    insp = sa.inspect(bind)
    if _site_location_fk_exists(insp):
        op.drop_constraint("fk_sites_location_id_locations", "sites", type_="foreignkey")
    insp = sa.inspect(bind)
    if "ix_sites_location_id" in _index_names(insp, "sites"):
        op.drop_index(op.f("ix_sites_location_id"), table_name="sites")
    if "location_id" in _column_names(insp, "sites"):
        op.drop_column("sites", "location_id")

    for ix in (
        "ix_locations_longitude",
        "ix_locations_latitude",
        "ix_locations_city",
        "ix_locations_region",
        "ix_locations_country",
        "ix_location_country_city",
    ):
        insp = sa.inspect(bind)
        if ix in _index_names(insp, "locations"):
            op.drop_index(ix, table_name="locations")
    op.drop_table("locations")
