"""initial schema placeholder (revision exists in deployed databases)

Revision ID: e28efea57d6e
Revises:
Create Date: 2026-04-30
"""

from __future__ import annotations

from alembic import op

revision = "e28efea57d6e"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Schema is created outside this repository revision in some environments.
    pass


def downgrade() -> None:
    pass
