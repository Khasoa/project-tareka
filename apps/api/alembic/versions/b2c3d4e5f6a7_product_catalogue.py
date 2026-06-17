"""product catalogue: products table, company.is_approved, reward_transaction.metadata_json

Revision ID: b2c3d4e5f6a7
Revises: c9d0e1f2a3b5
Create Date: 2026-05-04
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "b2c3d4e5f6a7"
down_revision = "c9d0e1f2a3b5"
branch_labels = None
depends_on = None


def _column_names(insp: sa.Inspector, table: str) -> set[str]:
    return {c["name"] for c in insp.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)

    # ── reward_transactions: metadata_json (may have been added manually) ───
    if "metadata_json" not in _column_names(insp, "reward_transactions"):
        op.add_column(
            "reward_transactions",
            sa.Column("metadata_json", sa.JSON(), nullable=True),
        )

    # ── companies: is_approved ──────────────────────────────────────────────
    if "is_approved" not in _column_names(insp, "companies"):
        op.add_column(
            "companies",
            sa.Column(
                "is_approved",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )

    # ── products table ──────────────────────────────────────────────────────
    insp = sa.inspect(bind)
    if not insp.has_table("products"):
        op.create_table(
            "products",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("company_id", sa.String(length=36), nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("short_description", sa.Text(), nullable=True),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("material_story", sa.Text(), nullable=True),
            sa.Column("materials_used", sa.JSON(), nullable=True),
            sa.Column("product_story", sa.JSON(), nullable=True),
            sa.Column("image_url", sa.String(length=500), nullable=True),
            sa.Column("price_kes", sa.Numeric(precision=12, scale=2), nullable=True),
            sa.Column("token_requirement", sa.Integer(), nullable=True),
            sa.Column("token_discount_value", sa.Integer(), nullable=True),
            sa.Column(
                "is_redeemable", sa.Boolean(), nullable=False, server_default=sa.false()
            ),
            sa.Column(
                "is_discountable", sa.Boolean(), nullable=False, server_default=sa.false()
            ),
            sa.Column("availability", sa.JSON(), nullable=True),
            sa.Column(
                "is_published", sa.Boolean(), nullable=False, server_default=sa.false()
            ),
            sa.Column(
                "ai_generated", sa.Boolean(), nullable=False, server_default=sa.false()
            ),
            sa.Column(
                "reviewed_by_human", sa.Boolean(), nullable=False, server_default=sa.false()
            ),
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
            sa.ForeignKeyConstraint(
                ["company_id"], ["companies.id"], name="fk_products_company_id"
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_products_id"), "products", ["id"], unique=False)
        op.create_index(
            op.f("ix_products_company_id"), "products", ["company_id"], unique=False
        )
        op.create_index(
            op.f("ix_products_is_published"), "products", ["is_published"], unique=False
        )


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)

    if insp.has_table("products"):
        existing_ix = {ix["name"] for ix in insp.get_indexes("products")}
        for ix_name in (
            "ix_products_is_published",
            "ix_products_company_id",
            "ix_products_id",
        ):
            if ix_name in existing_ix:
                op.drop_index(ix_name, table_name="products")
        op.drop_table("products")

    insp = sa.inspect(bind)
    if "is_approved" in _column_names(insp, "companies"):
        op.drop_column("companies", "is_approved")

    insp = sa.inspect(bind)
    if "metadata_json" in _column_names(insp, "reward_transactions"):
        op.drop_column("reward_transactions", "metadata_json")
