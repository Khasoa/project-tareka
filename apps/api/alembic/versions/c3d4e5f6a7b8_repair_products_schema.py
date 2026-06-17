"""repair products table: add missing catalogue fields, rename AI flags

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-05-05
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def _col_names(insp: sa.Inspector, table: str) -> set[str]:
    return {c["name"] for c in insp.get_columns(table)}


def _ix_names(insp: sa.Inspector, table: str) -> set[str]:
    return {ix["name"] for ix in insp.get_indexes(table)}


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing = _col_names(insp, "products")

    # ── Make description nullable (old schema had nullable=False) ────────────
    if "description" in existing:
        op.alter_column("products", "description", existing_type=sa.Text(), nullable=True)

    # ── Add missing optional text/numeric columns ────────────────────────────
    nullable_text_cols: list[tuple[str, sa.types.TypeEngine]] = [
        ("short_description", sa.Text()),
        ("material_story", sa.Text()),
        ("image_url", sa.String(500)),
    ]
    for col_name, col_type in nullable_text_cols:
        if col_name not in existing:
            op.add_column("products", sa.Column(col_name, col_type, nullable=True))

    nullable_json_cols = ["materials_used", "product_story", "availability"]
    for col_name in nullable_json_cols:
        if col_name not in existing:
            op.add_column("products", sa.Column(col_name, sa.JSON(), nullable=True))

    nullable_numeric_cols: list[tuple[str, sa.types.TypeEngine]] = [
        ("price_kes", sa.Numeric(12, 2)),
        ("token_discount_value", sa.Numeric(12, 2)),
    ]
    for col_name, col_type in nullable_numeric_cols:
        if col_name not in existing:
            op.add_column("products", sa.Column(col_name, col_type, nullable=True))

    if "token_requirement" not in existing:
        op.add_column("products", sa.Column("token_requirement", sa.Integer(), nullable=True))

    # ── Add boolean flags with safe server defaults ──────────────────────────
    bool_cols = ["is_redeemable", "is_discountable", "ai_assisted", "human_reviewed"]
    for col_name in bool_cols:
        if col_name not in existing:
            op.add_column(
                "products",
                sa.Column(
                    col_name,
                    sa.Boolean(),
                    nullable=False,
                    server_default=sa.false(),
                ),
            )

    # ── Index on is_published ─────────────────────────────────────────────────
    insp = sa.inspect(bind)
    if "ix_products_is_published" not in _ix_names(insp, "products"):
        op.create_index("ix_products_is_published", "products", ["is_published"])

    # ── Copy old AI flag values if old columns exist ─────────────────────────
    # Refresh column list after additions
    insp = sa.inspect(bind)
    existing_after = _col_names(insp, "products")

    if "ai_generated" in existing_after and "ai_assisted" in existing_after:
        bind.execute(
            sa.text(
                "UPDATE products SET ai_assisted = ai_generated WHERE ai_assisted = false"
            )
        )

    if "reviewed_by_human" in existing_after and "human_reviewed" in existing_after:
        bind.execute(
            sa.text(
                "UPDATE products SET human_reviewed = reviewed_by_human WHERE human_reviewed = false"
            )
        )


def downgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing = _col_names(insp, "products")

    for col_name in [
        "human_reviewed",
        "ai_assisted",
        "is_discountable",
        "is_redeemable",
        "token_requirement",
        "token_discount_value",
        "price_kes",
        "availability",
        "product_story",
        "materials_used",
        "image_url",
        "material_story",
        "short_description",
    ]:
        if col_name in existing:
            op.drop_column("products", col_name)

    if "ix_products_is_published" in _ix_names(insp, "products"):
        op.drop_index("ix_products_is_published", table_name="products")

    # Restore description to not-null (only safe if no NULLs were introduced)
    if "description" in existing:
        op.alter_column(
            "products",
            "description",
            existing_type=sa.Text(),
            nullable=False,
            server_default="",
        )
