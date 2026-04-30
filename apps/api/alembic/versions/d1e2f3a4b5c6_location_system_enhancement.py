"""location system enhancement

Revision ID: d1e2f3a4b5c6
Revises: c9f1e2d3a4b5
Create Date: 2026-04-30
"""

from __future__ import annotations

from uuid import uuid4

import sqlalchemy as sa
from alembic import op

revision = "d1e2f3a4b5c6"
down_revision = "c9f1e2d3a4b5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "locations",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("country", sa.String(length=100), nullable=False),
        sa.Column("region", sa.String(length=100), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("area", sa.String(length=100), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("formatted_address", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_index("ix_location_country_city", "locations", ["country", "city"], unique=False)
    op.create_index("ix_locations_country", "locations", ["country"], unique=False)
    op.create_index("ix_locations_region", "locations", ["region"], unique=False)
    op.create_index("ix_locations_city", "locations", ["city"], unique=False)
    op.create_index("ix_locations_latitude", "locations", ["latitude"], unique=False)
    op.create_index("ix_locations_longitude", "locations", ["longitude"], unique=False)

    op.add_column("sites", sa.Column("location_id", sa.String(length=36), nullable=True))
    op.create_foreign_key("fk_sites_location_id_locations", "sites", "locations", ["location_id"], ["id"])
    op.create_index("ix_sites_location_id", "sites", ["location_id"], unique=False)

    op.add_column("companies", sa.Column("headquarters_location_id", sa.String(length=36), nullable=True))
    op.create_foreign_key(
        "fk_companies_headquarters_location_id_locations",
        "companies",
        "locations",
        ["headquarters_location_id"],
        ["id"],
    )
    op.create_index("ix_companies_headquarters_location_id", "companies", ["headquarters_location_id"], unique=False)

    conn = op.get_bind()
    sites = conn.execute(
        sa.text(
            """
            SELECT id, city, address, latitude, longitude
            FROM sites
            WHERE latitude IS NOT NULL AND longitude IS NOT NULL
            """
        )
    ).fetchall()

    for site in sites:
        location_id = str(uuid4())
        city = site.city if site.city else "Nairobi"
        conn.execute(
            sa.text(
                """
                INSERT INTO locations (
                    id, country, region, city, area,
                    latitude, longitude, formatted_address
                ) VALUES (
                    :id, :country, :region, :city, :area,
                    :latitude, :longitude, :formatted_address
                )
                """
            ),
            {
                "id": location_id,
                "country": "Kenya",
                "region": "Nairobi County",
                "city": city,
                "area": None,
                "latitude": float(site.latitude),
                "longitude": float(site.longitude),
                "formatted_address": site.address,
            },
        )
        conn.execute(
            sa.text("UPDATE sites SET location_id = :location_id WHERE id = :site_id"),
            {"location_id": location_id, "site_id": site.id},
        )


def downgrade() -> None:
    op.drop_index("ix_companies_headquarters_location_id", table_name="companies")
    op.drop_constraint("fk_companies_headquarters_location_id_locations", "companies", type_="foreignkey")
    op.drop_column("companies", "headquarters_location_id")

    op.drop_index("ix_sites_location_id", table_name="sites")
    op.drop_constraint("fk_sites_location_id_locations", "sites", type_="foreignkey")
    op.drop_column("sites", "location_id")

    op.drop_index("ix_locations_longitude", table_name="locations")
    op.drop_index("ix_locations_latitude", table_name="locations")
    op.drop_index("ix_locations_city", table_name="locations")
    op.drop_index("ix_locations_region", table_name="locations")
    op.drop_index("ix_locations_country", table_name="locations")
    op.drop_index("ix_location_country_city", table_name="locations")
    op.drop_table("locations")
