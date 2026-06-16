"""company reward_programme_config JSON

Revision ID: b8e9f0a1b2c3
Revises: a1b2c3d4e5f7
Create Date: 2026-05-09
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "b8e9f0a1b2c3"
down_revision = "a1b2c3d4e5f7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("companies", sa.Column("reward_programme_config", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("companies", "reward_programme_config")
