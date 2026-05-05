from __future__ import annotations

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.product import Product
from app.models.wallet import Wallet

# ---------------------------------------------------------------------------
# Reusable filter expressions
# ---------------------------------------------------------------------------

_PUBLIC_PRODUCT = and_(
    Product.is_published.is_(True),
    or_(
        Product.ai_assisted.is_(False),
        Product.human_reviewed.is_(True),
    ),
)

_ACTIVE_APPROVED_COMPANY = and_(
    Company.is_active.is_(True),
    Company.is_approved.is_(True),
)


# ---------------------------------------------------------------------------
# Company listing helpers
# ---------------------------------------------------------------------------


def get_participating_companies(
    db: Session,
    limit: int,
    offset: int,
) -> list[Company]:
    """Active, approved companies that have at least one public-safe product."""
    has_public_product = (
        select(Product.company_id)
        .where(_PUBLIC_PRODUCT)
        .correlate(Company)
        .scalar_subquery()
        .exists()
        .correlate(Company)
    )
    # build an exists check scoped to the current company
    has_product_stmt = (
        select(1)
        .select_from(Product)
        .where(
            Product.company_id == Company.id,
            _PUBLIC_PRODUCT,
        )
    )
    stmt = (
        select(Company)
        .where(_ACTIVE_APPROVED_COMPANY)
        .where(has_product_stmt.exists())
        .order_by(Company.name)
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(stmt).all())


def count_participating_companies(db: Session) -> int:
    has_product_stmt = (
        select(1)
        .select_from(Product)
        .where(
            Product.company_id == Company.id,
            _PUBLIC_PRODUCT,
        )
    )
    stmt = (
        select(func.count())
        .select_from(Company)
        .where(_ACTIVE_APPROVED_COMPANY)
        .where(has_product_stmt.exists())
    )
    return db.scalar(stmt) or 0


def get_company_product_count(db: Session, company_id: str) -> int:
    stmt = (
        select(func.count())
        .select_from(Product)
        .where(Product.company_id == company_id, _PUBLIC_PRODUCT)
    )
    return db.scalar(stmt) or 0


# ---------------------------------------------------------------------------
# Company catalogue
# ---------------------------------------------------------------------------


def get_company_catalogue(
    db: Session,
    company_id: str,
    limit: int,
    offset: int,
) -> list[Product]:
    stmt = (
        select(Product)
        .where(Product.company_id == company_id, _PUBLIC_PRODUCT)
        .order_by(Product.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(stmt).all())


def count_company_catalogue(db: Session, company_id: str) -> int:
    stmt = (
        select(func.count())
        .select_from(Product)
        .where(Product.company_id == company_id, _PUBLIC_PRODUCT)
    )
    return db.scalar(stmt) or 0


# ---------------------------------------------------------------------------
# Product detail
# ---------------------------------------------------------------------------


def get_product_detail(db: Session, product_id: str) -> Product | None:
    stmt = select(Product).where(Product.id == product_id, _PUBLIC_PRODUCT)
    return db.scalars(stmt).first()


# ---------------------------------------------------------------------------
# Wallet context
# ---------------------------------------------------------------------------


def get_user_company_wallet_context(
    db: Session,
    user_id: str,
    company_id: str,
) -> Wallet | None:
    """Return wallet for user/company pair. Returns None safely — never raises."""
    try:
        stmt = select(Wallet).where(
            Wallet.user_id == user_id,
            Wallet.company_id == company_id,
        )
        return db.scalars(stmt).first()
    except Exception:
        return None
