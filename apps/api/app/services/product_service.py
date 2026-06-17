from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.company import Company
from app.models.reward_redemption import RewardRedemption
from app.models.location import Location
from app.models.site import Site
from app.models.user import User
from app.repositories import product_repo
from app.schemas.product import (
    CompanyCatalogueResponse,
    CompanyProductSummaryResponse,
    LocationSummary,
    MarketplaceFeedResponse,
    MarketplaceListingItemResponse,
    PaginatedResponse,
    ProductDetailResponse,
    ProductListItemResponse,
    ProductRedeemResponse,
    RedemptionHistoryResponse,
    RewardContext,
    RewardEligibility,
    RewardRedemptionItemResponse,
)
from app.services.reward_programme_service import marketplace_redemption_allowed, minimum_balance_reserve_tokens
from app.services.wallet_service import WalletService


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


def _region_label(loc: LocationSummary) -> str | None:
    parts = [p for p in (loc.city, loc.country) if p and str(p).strip()]
    if not parts:
        return None
    return " · ".join(str(p).strip() for p in parts[:2])


def _reward_offerings_labels(
    company: Company,
    has_discount_listing: bool,
    has_redeem_listing: bool,
    has_token_gate: bool,
) -> list[str]:
    labels: list[str] = []
    if company.reward_tokens_enabled:
        labels.append("Token redemption" if has_token_gate else "Appreciation tokens")
    if company.reward_kes_enabled:
        labels.append("Priced offers (KES)")
    if company.reward_sats_enabled:
        labels.append("Sats")
    if has_discount_listing:
        labels.append("Discounts & vouchers")
    if has_redeem_listing:
        labels.append("Redemptions")
    return list(dict.fromkeys(labels))


def _company_to_summary(
    db: Session,
    company: Company,
    product_count: int,
    *,
    materials_preview: list[str] | None = None,
    capability: tuple[bool, bool, bool] | None = None,
) -> CompanyProductSummaryResponse:
    loc = _resolve_company_location(db, company)
    mats = (
        materials_preview
        if materials_preview is not None
        else product_repo.aggregate_company_material_tags(db, company.id)
    )
    caps = (
        capability
        if capability is not None
        else product_repo.company_product_capability_flags(db, company.id)
    )
    has_disc, has_redeem, tok_req_products = caps
    return CompanyProductSummaryResponse(
        id=company.id,
        name=company.name,
        slug=company.slug,
        description=company.description,
        is_verified=company.is_verified,
        location=loc,
        image_url=None,
        product_count=product_count,
        region_label=_region_label(loc),
        materials_preview=mats,
        reward_offerings=_reward_offerings_labels(
            company,
            has_disc,
            has_redeem,
            tok_req_products,
        ),
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
    ids = [c.id for c in companies]
    counts = product_repo.bulk_company_product_counts(db, ids)
    mats_map = product_repo.bulk_company_material_previews(db, ids)
    caps_map = product_repo.bulk_company_capability_flags(db, ids)

    items = [
        _company_to_summary(
            db,
            c,
            counts.get(c.id, 0),
            materials_preview=mats_map.get(c.id, []),
            capability=caps_map.get(c.id, (False, False, False)),
        )
        for c in companies
    ]
    return PaginatedResponse(items=items, limit=limit, offset=offset, count=len(items))


def get_partner_catalogue_by_slug(
    db: Session,
    slug: str,
    current_user: User | None = None,
    limit: int = 20,
    offset: int = 0,
) -> CompanyCatalogueResponse:
    company = product_repo.get_participating_company_by_slug(db, slug)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found",
        )
    return get_company_catalogue(db, company.id, current_user, limit=limit, offset=offset)


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


# ---------------------------------------------------------------------------
# Marketplace — aggregates public partner rewards (not speculative trading UX)
# ---------------------------------------------------------------------------


def _environmental_category_from_story(story: dict | None) -> str | None:
    if not isinstance(story, dict):
        return None
    return story.get("environmental_category") or story.get("category")


def _availability_summary(availability: list | None) -> str | None:
    if not isinstance(availability, list) or not availability:
        return None
    first = availability[0]
    if isinstance(first, dict):
        title = first.get("name") or first.get("type")
        cnt = len(availability)
        if cnt == 1 or not title:
            return title
        return f"{title} · +{cnt - 1}"
    return None


def _fulfillment_instructions_snapshot(product) -> str | None:
    avail = product.availability
    if not isinstance(avail, list) or not avail:
        return None
    chunks: list[str] = []
    for slot in avail[:4]:
        if not isinstance(slot, dict):
            continue
        bits = [slot.get(n) for n in ("name", "location", "contact")]
        chunk = " — ".join(b for b in bits if isinstance(b, str) and b.strip())
        if chunk:
            chunks.append(chunk.strip())
    if not chunks:
        return None
    return "; ".join(chunks)


def _reward_model_tags(product, company: Company) -> list[str]:
    tags: list[str] = []
    story = product.product_story if isinstance(product.product_story, dict) else {}

    if isinstance(story.get("reward_models"), list):
        for x in story["reward_models"]:
            if isinstance(x, str) and x.strip():
                tags.append(x.strip())

    if product.is_discountable:
        tags.append("partner_discount")
    if product.is_redeemable:
        tags.append("redeemable_offer")

    extras = story.get("reward_model_hints")
    if isinstance(extras, list):
        for x in extras:
            if isinstance(x, str) and x.strip():
                tags.append(x.strip())

    if company.reward_sats_enabled and story.get("sats_eligible", True):
        tags.append("sats_partner_program")

    # stable order, unique
    seen: set[str] = set()
    ordered: list[str] = []
    for t in tags:
        tl = t.lower()
        if tl not in seen:
            seen.add(tl)
            ordered.append(t)

    return ordered


def _to_marketplace_item(product, company: Company) -> MarketplaceListingItemResponse:
    cat = _environmental_category_from_story(
        product.product_story if isinstance(product.product_story, dict) else None
    )
    return MarketplaceListingItemResponse(
        id=product.id,
        company_id=company.id,
        company_name=company.name,
        company_slug=company.slug,
        partner_verified=company.is_verified,
        partner_sats_program=bool(company.reward_sats_enabled),
        title=product.title,
        short_description=product.short_description,
        image_url=product.image_url,
        price_kes=product.price_kes,
        token_requirement=product.token_requirement,
        is_redeemable=product.is_redeemable,
        is_discountable=product.is_discountable,
        environmental_category=cat,
        reward_models=_reward_model_tags(product, company),
        availability_summary=_availability_summary(product.availability),
    )


def list_marketplace_feed(
    db: Session,
    limit: int = 24,
    offset: int = 0,
    partner_slug: str | None = None,
) -> MarketplaceFeedResponse:
    total = product_repo.count_marketplace_products(db, company_slug=partner_slug)
    rows = product_repo.list_marketplace_products_with_companies(
        db, limit=limit, offset=offset, company_slug=partner_slug
    )
    items = [_to_marketplace_item(p, c) for p, c in rows]
    return MarketplaceFeedResponse(items=items, limit=limit, offset=offset, count=len(items), total=total)


def redeem_product(
    db: Session,
    current_user: User,
    product_id: str,
) -> ProductRedeemResponse:
    """Spend appreciation tokens toward a redeemable catalogue item."""
    product = product_repo.get_product_detail(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not available",
        )
    company = db.scalars(select(Company).where(Company.id == product.company_id)).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not available")

    if not product.is_redeemable or product.token_requirement is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This item is not open for appreciation-token redemption.",
        )

    if not marketplace_redemption_allowed(company):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Catalogue redemption is paused for this partner programme.",
        )

    wallet = product_repo.get_user_company_wallet_context(db, current_user.id, product.company_id)
    if wallet is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No recognition wallet exists for this partner yet. Complete a verified drop-off with "
            "them to earn appreciation tokens.",
        )

    qty = Decimal(str(product.token_requirement))
    reserve = Decimal(minimum_balance_reserve_tokens(company))
    if wallet.token_balance < qty + reserve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient appreciation balance for this redemption (partner reserve applies).",
        )

    svc = WalletService(db)
    try:
        svc.redeem_tokens(wallet, qty)
    except HTTPException:
        db.rollback()
        raise

    snapshot = _fulfillment_instructions_snapshot(product)
    redemption = RewardRedemption(
        id=str(uuid4()),
        user_id=current_user.id,
        wallet_id=wallet.id,
        company_id=product.company_id,
        product_id=product.id,
        tokens_spent=qty,
        instructions_snapshot=snapshot,
    )
    db.add(redemption)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return ProductRedeemResponse(
        redemption_id=redemption.id,
        product_id=product.id,
        product_title=product.title,
        company_name=company.name,
        tokens_spent=qty,
        message="Redemption recorded. Follow the fulfilment hints from the partner.",
        instructions_snapshot=snapshot,
    )


def list_user_reward_redemptions(
    db: Session,
    user_id: str,
    limit: int = 30,
    offset: int = 0,
) -> RedemptionHistoryResponse:
    rows = product_repo.list_reward_redemptions_for_user(db, user_id, limit=limit, offset=offset)
    total = product_repo.count_reward_redemptions_for_user(db, user_id)
    items = [
        RewardRedemptionItemResponse(
            id=rr.id,
            product_id=prod.id,
            product_title=prod.title,
            company_name=c.name,
            company_slug=c.slug,
            tokens_spent=rr.tokens_spent,
            instructions_snapshot=rr.instructions_snapshot,
            created_at=rr.created_at,
        )
        for rr, prod, c in rows
    ]
    return RedemptionHistoryResponse(
        items=items, limit=limit, offset=offset, count=len(items), total=total
    )
