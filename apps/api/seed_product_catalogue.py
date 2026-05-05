"""
Seed script — Product Catalogue demo data
==========================================

Inserts demo companies, locations, and products for local development and QA.

Idempotent: safe to run multiple times. Uses slug (companies) and title+company
(products) as uniqueness keys — will not duplicate or overwrite existing records.

Usage:
    cd apps/api
    python seed_product_catalogue.py

Requires DATABASE_URL to be set (via .env in project root or apps/api).
"""

from __future__ import annotations

import os
import sys
from decimal import Decimal
from uuid import uuid4

# Resolve app root so imports work when run directly from apps/api/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.company import Company
from app.models.location import Location
from app.models.product import Product


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_or_create_company(db: Session, data: dict) -> tuple[Company, bool]:
    """Return (company, created). Matches on slug — never duplicates."""
    company = db.query(Company).filter_by(slug=data["slug"]).first()
    if company:
        return company, False
    company = Company(id=str(uuid4()), **data)
    db.add(company)
    db.flush()
    return company, True


def _get_or_create_location(db: Session, data: dict) -> tuple[Location, bool]:
    """Return (location, created). Matches on country+city+formatted_address."""
    loc = (
        db.query(Location)
        .filter_by(
            country=data["country"],
            city=data["city"],
            formatted_address=data.get("formatted_address"),
        )
        .first()
    )
    if loc:
        return loc, False
    loc = Location(id=str(uuid4()), **data)
    db.add(loc)
    db.flush()
    return loc, True


def _get_or_create_product(
    db: Session, company_id: str, title: str, data: dict
) -> tuple[Product, bool]:
    """Return (product, created). Matches on company_id + title."""
    product = (
        db.query(Product)
        .filter_by(company_id=company_id, title=title)
        .first()
    )
    if product:
        return product, False
    product = Product(id=str(uuid4()), company_id=company_id, title=title, **data)
    db.add(product)
    db.flush()
    return product, True


# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

NAIROBI_LOCATION = {
    "country": "Kenya",
    "region": "Nairobi County",
    "city": "Nairobi",
    "area": None,
    "latitude": -1.2921,
    "longitude": 36.8219,
    "formatted_address": "Nairobi, Kenya",
}

COMPANIES = [
    {
        "slug": "gjenge-makers",
        "name": "Gjenge Makers",
        "description": (
            "Gjenge Makers transforms plastic waste into affordable, durable "
            "construction materials in Nairobi."
        ),
        "is_active": True,
        "is_approved": True,
        "is_verified": True,
        "reward_tokens_enabled": True,
        "reward_kes_enabled": False,
        "reward_sats_enabled": False,
    },
    {
        "slug": "ecandi",
        "name": "Ecandi",
        "description": (
            "Ecandi designs and manufactures eco-friendly furniture and interior "
            "products from reclaimed and recycled materials."
        ),
        "is_active": True,
        "is_approved": True,
        "is_verified": False,
        "reward_tokens_enabled": True,
        "reward_kes_enabled": False,
        "reward_sats_enabled": False,
    },
    {
        "slug": "mr-green-africa",
        "name": "Mr. Green Africa",
        "description": (
            "Mr. Green Africa collects and upcycles plastic waste across East Africa, "
            "creating products and supporting local livelihoods."
        ),
        "is_active": True,
        "is_approved": True,
        "is_verified": True,
        "reward_tokens_enabled": True,
        "reward_kes_enabled": False,
        "reward_sats_enabled": False,
    },
]

# Products keyed by company slug
PRODUCTS: dict[str, list[dict]] = {
    "gjenge-makers": [
        {
            "title": "Recycled Plastic Paver",
            "short_description": (
                "Durable paving brick made from compressed post-consumer plastics."
            ),
            "description": (
                "Each brick diverts roughly 0.5 kg of plastic from landfill and "
                "outlasts conventional concrete pavers. Suitable for walkways, "
                "patios, and light-traffic driveways."
            ),
            "material_story": (
                "Made from post-consumer HDPE, PP, and PET collected from "
                "Nairobi households and light industry."
            ),
            "materials_used": ["HDPE", "PP", "PET", "recycled plastic mix"],
            "product_story": {
                "source_note": (
                    "Plastic collected from households and businesses across Nairobi."
                ),
                "process_note": (
                    "Sorted, cleaned, shredded, mixed, and compression-moulded."
                ),
                "impact_note": (
                    "Each square metre of paving uses approximately 5 kg of recovered plastic."
                ),
            },
            "price_kes": Decimal("1200.00"),
            "availability": [
                {
                    "name": "Gjenge Makers Showroom",
                    "type": "showroom",
                    "location": "Industrial Area, Nairobi",
                    "contact": "+254700000001",
                },
                {
                    "name": "Partner Hardware Store",
                    "type": "retailer",
                    "location": "Westlands, Nairobi",
                },
            ],
            "is_published": True,
            "ai_assisted": False,
            "human_reviewed": False,
            "is_redeemable": False,
            "is_discountable": False,
        },
        {
            "title": "Recycled Plastic Tile",
            "short_description": (
                "Lightweight interlocking floor tile made from mixed recycled plastics."
            ),
            "materials_used": ["mixed recycled plastics", "PP"],
            "product_story": {
                "impact_note": "Each tile keeps approximately 0.3 kg of plastic out of landfill.",
            },
            "price_kes": Decimal("850.00"),
            "is_published": True,
            "ai_assisted": False,
            "human_reviewed": False,
            "is_redeemable": False,
            "is_discountable": False,
        },
    ],
    "ecandi": [
        {
            "title": "Upcycled Plastic Storage Crate",
            "short_description": (
                "Stackable crate made from recovered mixed plastics — built to last."
            ),
            "description": (
                "Lightweight and durable, these storage crates give recovered plastic "
                "a second life in homes and small businesses."
            ),
            "material_story": (
                "Mixed plastics recovered and granulated at Ecandi sorting facilities."
            ),
            "materials_used": ["mixed plastics", "recycled PP"],
            "product_story": {
                "source_note": "Plastic recovered from Nairobi households and commercial premises.",
                "process_note": "Manual sorting, washing, granulation, injection moulding.",
                "impact_note": "Every crate keeps approximately 1.2 kg of plastic out of landfill.",
            },
            "price_kes": Decimal("950.00"),
            "token_requirement": 80,
            "availability": [
                {
                    "name": "Online Enquiry",
                    "type": "online",
                    "contact": "hello@ecandi.co.ke",
                },
            ],
            "is_published": True,
            "is_redeemable": True,
            "ai_assisted": False,
            "human_reviewed": False,
            "is_discountable": False,
        },
    ],
    "mr-green-africa": [
        {
            "title": "Recycled Glass Décor Item",
            "short_description": (
                "Hand-finished decorative piece crafted from recovered glass bottles."
            ),
            "description": (
                "Each piece is individually crafted — no two are identical. "
                "Supports local artisans and closes the glass collection loop."
            ),
            "material_story": (
                "Glass recovered from hospitality partners in Nairobi and Mombasa."
            ),
            "materials_used": ["recycled glass", "reclaimed glass bottles"],
            "product_story": {
                "source_note": "Glass bottles collected from hotel and restaurant partners.",
                "process_note": "Cleaned, crushed, melted, and hand-formed by local artisans.",
                "impact_note": "Reduces glass sent to landfill and supports skilled local jobs.",
            },
            "price_kes": Decimal("650.00"),
            "token_requirement": 60,
            "availability": [
                {
                    "name": "Mr. Green Showroom",
                    "type": "showroom",
                    "location": "Kilimani, Nairobi",
                    "contact": "+254700000003",
                },
                {
                    "name": "Partner Retailer",
                    "type": "retailer",
                    "location": "Westlands, Nairobi",
                },
            ],
            "is_published": True,
            "is_redeemable": True,
            "ai_assisted": False,
            "human_reviewed": False,
            "is_discountable": False,
        },
    ],
}


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def run() -> None:
    db: Session = SessionLocal()
    try:
        print("tareka — product catalogue seed\n")

        # 1. Shared Nairobi location
        nairobi_loc, loc_created = _get_or_create_location(db, NAIROBI_LOCATION)
        print(f"  location  {'+ created' if loc_created else '  exists '}: Nairobi, Kenya")

        company_ids: dict[str, str] = {}

        # 2. Companies
        for c_data in COMPANIES:
            slug = c_data["slug"]
            company, created = _get_or_create_company(db, c_data)
            company_ids[slug] = company.id

            # Attach location if not already set
            if not company.headquarters_location_id:
                company.headquarters_location_id = nairobi_loc.id
                db.flush()

            print(f"  company   {'+ created' if created else '  exists '}: {c_data['name']}")

        # 3. Products
        for slug, products in PRODUCTS.items():
            company_id = company_ids.get(slug)
            if not company_id:
                print(f"  warn: company not found for slug={slug}, skipping products")
                continue
            for p_data in products:
                title = p_data.pop("title")
                product, created = _get_or_create_product(db, company_id, title, p_data)
                p_data["title"] = title  # restore for safety
                print(f"  product   {'+ created' if created else '  exists '}: {title}")

        db.commit()
        print("\nDone.")

    except Exception as exc:
        db.rollback()
        print(f"\nSeed failed — rolled back. Error: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
