"""phase4 site operator and user company scoping

Revision ID: f4c2a1b8d7e6
Revises: e28efea57d6e
Create Date: 2026-04-30
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "f4c2a1b8d7e6"
down_revision = "e28efea57d6e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("company_id", sa.String(length=36), nullable=True))
    op.create_foreign_key(
        "fk_users_company_id_companies",
        "users",
        "companies",
        ["company_id"],
        ["id"],
    )
    op.create_index(op.f("ix_users_company_id"), "users", ["company_id"], unique=False)

    op.add_column("sites", sa.Column("operator_id", sa.String(length=36), nullable=True))
    op.create_foreign_key(
        "fk_sites_operator_id_users",
        "sites",
        "users",
        ["operator_id"],
        ["id"],
    )
    op.create_index(op.f("ix_sites_operator_id"), "sites", ["operator_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_sites_operator_id"), table_name="sites")
    op.drop_constraint("fk_sites_operator_id_users", "sites", type_="foreignkey")
    op.drop_column("sites", "operator_id")

    op.drop_index(op.f("ix_users_company_id"), table_name="users")
    op.drop_constraint("fk_users_company_id_companies", "users", type_="foreignkey")
    op.drop_column("users", "company_id")
