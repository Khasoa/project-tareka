"""add metadata_json to reward_transactions

Revision ID: a1b2c3d4e5f6
Revises: c9d0e1f2a3b5
Create Date: 2026-05-04
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "a1b2c3d4e5f6"
down_revision = "c9d0e1f2a3b5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reward_transactions", sa.Column("metadata_json", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("reward_transactions", "metadata_json")
