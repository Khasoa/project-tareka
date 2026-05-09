from __future__ import annotations

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.product import Product
from app.models.reward_redemption import RewardRedemption
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


def aggregate_company_material_tags(
    db: Session,
    company_id: str,
    limit: int = 8,
) -> list[str]:
    stmt = (
        select(Product.materials_used)
        .where(
            Product.company_id == company_id,
            _PUBLIC_PRODUCT,
            Product.materials_used.isnot(None),
        )
    )
    rows = db.scalars(stmt).all()
    seen: set[str] = set()
    out: list[str] = []
    for raw in rows:
        if raw is None:
            continue
        entries = raw if isinstance(raw, list) else [raw]
        for item in entries:
            label: str | None = None
            if isinstance(item, str):
                label = item.strip() or None
            elif isinstance(item, dict):
                for key in ("material", "name", "label"):
                    val = item.get(key)
                    if isinstance(val, str) and val.strip():
                        label = val.strip()
                        break
            if label and len(label) < 120 and label not in seen:
                seen.add(label)
                out.append(label)
                if len(out) >= limit:
                    return out
    return out


def company_product_capability_flags(
    db: Session,
    company_id: str,
) -> tuple[bool, bool, bool]:
    stmt = (
        select(
            func.coalesce(func.bool_or(Product.is_discountable.is_(True)), False),
            func.coalesce(func.bool_or(Product.is_redeemable.is_(True)), False),
            func.coalesce(func.bool_or(Product.token_requirement.isnot(None)), False),
        ).where(Product.company_id == company_id, _PUBLIC_PRODUCT)
    )
    row = db.execute(stmt).first()
    if not row:
        return (False, False, False)
    return (bool(row[0]), bool(row[1]), bool(row[2]))


def bulk_company_product_counts(db: Session, company_ids: list[str]) -> dict[str, int]:
    if not company_ids:
        return {}
    stmt = (
        select(Product.company_id, func.count())
        .where(Product.company_id.in_(company_ids), _PUBLIC_PRODUCT)
        .group_by(Product.company_id)
    )
    return {str(cid): int(cnt) for cid, cnt in db.execute(stmt).all()}


def bulk_company_material_previews(
    db: Session,
    company_ids: list[str],
    limit_per_company: int = 8,
) -> dict[str, list[str]]:
    if not company_ids:
        return {}
    stmt = (
        select(Product.company_id, Product.materials_used)
        .where(
            Product.company_id.in_(company_ids),
            _PUBLIC_PRODUCT,
            Product.materials_used.isnot(None),
        )
    )
    acc: dict[str, list[str]] = {cid: [] for cid in company_ids}
    seen: dict[str, set[str]] = {cid: set() for cid in company_ids}

    for cid, raw in db.execute(stmt).all():
        cid_s = str(cid)
        if cid_s not in acc:
            continue
        if len(acc[cid_s]) >= limit_per_company:
            continue
        if raw is None:
            continue
        entries = raw if isinstance(raw, list) else [raw]
        for item in entries:
            label: str | None = None
            if isinstance(item, str):
                label = item.strip() or None
            elif isinstance(item, dict):
                for key in ("material", "name", "label"):
                    val = item.get(key)
                    if isinstance(val, str) and val.strip():
                        label = val.strip()
                        break
            if label and len(label) < 120 and label not in seen[cid_s]:
                seen[cid_s].add(label)
                acc[cid_s].append(label)
                if len(acc[cid_s]) >= limit_per_company:
                    break

    return acc


def bulk_company_capability_flags(
    db: Session,
    company_ids: list[str],
) -> dict[str, tuple[bool, bool, bool]]:
    """Per company_id: any discountable listing, redeemable listing, listings with tokens."""
    if not company_ids:
        return {}
    stmt = (
        select(
            Product.company_id,
            func.coalesce(func.bool_or(Product.is_discountable.is_(True)), False),
            func.coalesce(func.bool_or(Product.is_redeemable.is_(True)), False),
            func.coalesce(func.bool_or(Product.token_requirement.isnot(None)), False),
        )
        .where(Product.company_id.in_(company_ids), _PUBLIC_PRODUCT)
        .group_by(Product.company_id)
    )
    out: dict[str, tuple[bool, bool, bool]] = {}
    for row in db.execute(stmt).all():
        out[str(row[0])] = (bool(row[1]), bool(row[2]), bool(row[3]))
    return out


# ---------------------------------------------------------------------------
# Product detail
# ---------------------------------------------------------------------------


def get_product_detail(db: Session, product_id: str) -> Product | None:
    stmt = select(Product).where(Product.id == product_id, _PUBLIC_PRODUCT)
    return db.scalars(stmt).first()


# ---------------------------------------------------------------------------
# Wallet context
# ---------------------------------------------------------------------------


def get_active_company_by_slug(db: Session, slug: str) -> Company | None:
    stmt = select(Company).where(
        Company.slug == slug,
        Company.is_active.is_(True),
        Company.is_approved.is_(True),
    )
    return db.scalars(stmt).first()


def get_participating_company_by_slug(db: Session, slug: str) -> Company | None:
    """Company slug match plus at least one public-safe product."""
    company = get_active_company_by_slug(db, slug)
    if not company:
        return None
    if get_company_product_count(db, company.id) < 1:
        return None
    return company


def list_marketplace_products_with_companies(
    db: Session,
    limit: int,
    offset: int,
    company_slug: str | None = None,
) -> list[tuple[Product, Company]]:
    stmt = (
        select(Product, Company)
        .join(Company, Product.company_id == Company.id)
        .where(_PUBLIC_PRODUCT, _ACTIVE_APPROVED_COMPANY)
    )
    if company_slug:
        stmt = stmt.where(Company.slug == company_slug)

    stmt = stmt.order_by(Product.created_at.desc()).limit(limit).offset(offset)
    return list(db.execute(stmt).all())


def count_marketplace_products(
    db: Session,
    company_slug: str | None = None,
) -> int:
    stmt = (
        select(func.count())
        .select_from(Product)
        .join(Company, Product.company_id == Company.id)
        .where(_PUBLIC_PRODUCT, _ACTIVE_APPROVED_COMPANY)
    )
    if company_slug:
        stmt = stmt.where(Company.slug == company_slug)
    return db.scalar(stmt) or 0


def list_reward_redemptions_for_user(
    db: Session,
    user_id: str,
    limit: int,
    offset: int,
) -> list[tuple[RewardRedemption, Product, Company]]:
    stmt = (
        select(RewardRedemption, Product, Company)
        .join(Product, RewardRedemption.product_id == Product.id)
        .join(Company, RewardRedemption.company_id == Company.id)
        .where(RewardRedemption.user_id == user_id)
        .order_by(RewardRedemption.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.execute(stmt).all())


def count_reward_redemptions_for_user(db: Session, user_id: str) -> int:
    stmt = select(func.count()).select_from(RewardRedemption).where(RewardRedemption.user_id == user_id)
    return db.scalar(stmt) or 0


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
