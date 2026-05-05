from __future__ import annotations

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.location import Location
from app.models.site import Site
from app.models.user import User
from app.repositories import product_repo
from app.schemas.product import (
    CompanyCatalogueResponse,
    CompanyProductSummaryResponse,
    LocationSummary,
    PaginatedResponse,
    ProductDetailResponse,
    ProductListItemResponse,
    RewardContext,
    RewardEligibility,
)


# ---------------------------------------------------------------------------
# Location resolution — safe, never raises
# ---------------------------------------------------------------------------


def _resolve_company_location(db: Session, company: Company) -> LocationSummary:
    """
    Resolve a location summary for a company.

    Priority:
    1. company.headquarters_location
    2. first active site with a linked Location
    3. graceful null fallback
    """
    # 1. HQ location
    if company.headquarters_location_id:
        try:
            loc = db.scalars(
                select(Location).where(Location.id == company.headquarters_location_id)
            ).first()
            if loc:
                return LocationSummary(
                    country=loc.country,
                    city=loc.city,
                    area=loc.area,
                    formatted_address=loc.formatted_address,
                )
        except Exception:
            pass

    # 2. First active site with a linked Location
    try:
        site = db.scalars(
            select(Site)
            .join(Location, Site.location_id == Location.id)
            .where(Site.company_id == company.id, Site.is_active.is_(True))
            .limit(1)
        ).first()
        if site and site.location:
            loc = site.location
            return LocationSummary(
                country=loc.country,
                city=loc.city,
                area=loc.area,
                formatted_address=loc.formatted_address,
            )
    except Exception:
        pass

    return LocationSummary()


def _company_to_summary(
    db: Session,
    company: Company,
    product_count: int,
) -> CompanyProductSummaryResponse:
    return CompanyProductSummaryResponse(
        id=company.id,
        name=company.name,
        slug=company.slug,
        description=company.description,
        location=_resolve_company_location(db, company),
        image_url=None,
        product_count=product_count,
    )


# ---------------------------------------------------------------------------
# Service functions
# ---------------------------------------------------------------------------


def list_participating_companies(
    db: Session,
    limit: int = 20,
    offset: int = 0,
) -> PaginatedResponse[CompanyProductSummaryResponse]:
    companies = product_repo.get_participating_companies(db, limit=limit, offset=offset)
    items = [
        _company_to_summary(db, c, product_repo.get_company_product_count(db, c.id))
        for c in companies
    ]
    return PaginatedResponse(items=items, limit=limit, offset=offset, count=len(items))


def get_company_catalogue(
    db: Session,
    company_id: str,
    current_user: User | None = None,
    limit: int = 20,
    offset: int = 0,
) -> CompanyCatalogueResponse:
    company = db.scalars(select(Company).where(Company.id == company_id)).first()
    if not company or not company.is_active or not company.is_approved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found",
        )

    product_count = product_repo.get_company_product_count(db, company_id)
    company_summary = _company_to_summary(db, company, product_count)

    products = product_repo.get_company_catalogue(db, company_id, limit=limit, offset=offset)
    product_items = [
        ProductListItemResponse(
            id=p.id,
            company_id=p.company_id,
            title=p.title,
            short_description=p.short_description,
            image_url=p.image_url,
            materials_used=p.materials_used,
            price_kes=p.price_kes,
            token_requirement=p.token_requirement,
            is_redeemable=p.is_redeemable,
            is_discountable=p.is_discountable,
        )
        for p in products
    ]

    paginated_products: PaginatedResponse[ProductListItemResponse] = PaginatedResponse(
        items=product_items,
        limit=limit,
        offset=offset,
        count=len(product_items),
    )

    return CompanyCatalogueResponse(company=company_summary, products=paginated_products)


def get_product_detail(
    db: Session,
    product_id: str,
    current_user: User | None = None,
) -> ProductDetailResponse:
    product = product_repo.get_product_detail(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    company = db.scalars(select(Company).where(Company.id == product.company_id)).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    user_token_balance: int | None = None
    reward_context: RewardContext | None = None

    if current_user is not None:
        wallet = product_repo.get_user_company_wallet_context(
            db, current_user.id, product.company_id
        )
        if wallet is not None:
            user_token_balance = int(wallet.token_balance)

        reward_context = _build_reward_context(product, wallet)

    return ProductDetailResponse(
        id=product.id,
        company_id=product.company_id,
        company_name=company.name,
        company_slug=company.slug,
        title=product.title,
        short_description=product.short_description,
        description=product.description,
        material_story=product.material_story,
        materials_used=product.materials_used,
        product_story=product.product_story,
        image_url=product.image_url,
        price_kes=product.price_kes,
        token_requirement=product.token_requirement,
        token_discount_value=product.token_discount_value,
        is_redeemable=product.is_redeemable,
        is_discountable=product.is_discountable,
        availability=product.availability,
        is_published=product.is_published,
        user_token_balance=user_token_balance,
        reward_context=reward_context,
    )


def _build_reward_context(product, wallet) -> RewardContext:
    """
    Build generic reward eligibility context.
    Extends naturally when new reward types are added.
    Never fails if wallet is missing.
    """
    rewards: list[RewardEligibility] = []

    if product.is_redeemable and product.token_requirement is not None:
        balance = int(wallet.token_balance) if wallet else 0
        requirement = product.token_requirement
        is_eligible = balance >= requirement
        shortage = requirement - balance
        reason = (
            None
            if is_eligible
            else f"You need {shortage} more token{'s' if shortage != 1 else ''} to qualify"
        )
        rewards.append(
            RewardEligibility(
                reward_type="tokens",
                label="Redeem with tokens",
                is_eligible=is_eligible,
                reason=reason,
            )
        )
    elif product.is_redeemable and product.token_requirement is None:
        # token_requirement not set — do not assume free redemption
        rewards.append(
            RewardEligibility(
                reward_type="tokens",
                label="Redeem with tokens",
                is_eligible=False,
                reason="Redemption criteria not configured",
            )
        )

    if product.is_discountable and product.token_discount_value is not None:
        balance = int(wallet.token_balance) if wallet else 0
        requirement = int(product.token_discount_value)
        is_eligible = balance >= requirement
        shortage = requirement - balance
        reason = (
            None
            if is_eligible
            else f"You need {shortage} more token{'s' if shortage != 1 else ''} for a discount"
        )
        rewards.append(
            RewardEligibility(
                reward_type="token_discount",
                label="Discount with tokens",
                is_eligible=is_eligible,
                reason=reason,
            )
        )

    return RewardContext(has_context=len(rewards) > 0, rewards=rewards)
