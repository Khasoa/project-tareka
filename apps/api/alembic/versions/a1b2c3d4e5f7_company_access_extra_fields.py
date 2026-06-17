"""company_access_requests: phone, county, materials

Revision ID: a1b2c3d4e5f7
Revises: f1a2b3c4d5e6
Create Date: 2026-05-09
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "a1b2c3d4e5f7"
down_revision = "f1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("company_access_requests", sa.Column("phone", sa.String(30), nullable=True))
    op.add_column("company_access_requests", sa.Column("county_location", sa.String(160), nullable=True))
    op.add_column("company_access_requests", sa.Column("materials_handled", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("company_access_requests", "materials_handled")
    op.drop_column("company_access_requests", "county_location")
    op.drop_column("company_access_requests", "phone")
