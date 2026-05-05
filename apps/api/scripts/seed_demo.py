"""
DEMO SEED SCRIPT — NOT FOR PRODUCTION USE

Inserts demo companies and products for local development and QA.
All records are clearly tagged or marked for easy identification/cleanup.

Usage:
    cd apps/api
    python scripts/seed_demo.py
"""

from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from uuid import uuid4

from app.db.session import SessionLocal
from app.models.company import Company
from app.models.product import Product

DEMO_TAG = "[DEMO]"

COMPANIES = [
    {
        "id": str(uuid4()),
        "name": f"{DEMO_TAG} Gjenge Makers",
        "slug": "gjenge-makers-demo",
        "description": "Transforming plastic waste into construction materials in Nairobi.",
        "is_active": True,
        "is_approved": True,
        "is_verified": True,
        "reward_tokens_enabled": True,
        "reward_kes_enabled": False,
        "reward_sats_enabled": False,
    },
    {
        "id": str(uuid4()),
        "name": f"{DEMO_TAG} TakaTaka Solutions",
        "slug": "takataka-solutions-demo",
        "description": "Integrated waste management and upcycling for a circular economy.",
        "is_active": True,
        "is_approved": True,
        "is_verified": False,
        "reward_tokens_enabled": True,
        "reward_kes_enabled": False,
        "reward_sats_enabled": False,
    },
    {
        "id": str(uuid4()),
        "name": f"{DEMO_TAG} Mr. Green Africa",
        "slug": "mr-green-africa-demo",
        "description": "Collecting and upcycling plastic waste across East Africa.",
        "is_active": True,
        "is_approved": True,
        "is_verified": True,
        "reward_tokens_enabled": True,
        "reward_kes_enabled": False,
        "reward_sats_enabled": False,
    },
]

PRODUCTS_BY_SLUG: dict[str, list[dict]] = {
    "gjenge-makers-demo": [
        {
            "id": str(uuid4()),
            "title": "Recycled Plastic Paver",
            "short_description": "Durable paving brick made from compressed post-consumer plastics.",
            "description": (
                "Gjenge Makers' signature paving bricks combine multiple plastic waste streams "
                "into a product that outlasts concrete by years. Each brick diverts roughly "
                "0.5 kg of plastic from landfill."
            ),
            "material_story": "Made from post-consumer HDPE, PP, and PET collected in Nairobi.",
            "materials_used": ["HDPE", "PP", "PET", "recycled plastic mix"],
            "product_story": {
                "source_note": "Plastic collected from households and light industry in Nairobi.",
                "process_note": "Sorted, cleaned, shredded, mixed, and compression-moulded.",
                "impact_note": "Each square metre of paving uses ~5 kg of recovered plastic.",
            },
            "price_kes": "1200.00",
            "token_requirement": 100,
            "token_discount_value": 50,
            "is_redeemable": False,
            "is_discountable": True,
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
            "ai_generated": False,
            "reviewed_by_human": True,
        }
    ],
    "takataka-solutions-demo": [
        {
            "id": str(uuid4()),
            "title": "Upcycled Plastic Storage Crate",
            "short_description": "Stackable crates made from recovered mixed plastics.",
            "description": (
                "Lightweight and durable, these storage crates give recovered plastic "
                "a second life in homes and small businesses."
            ),
            "material_story": "Mixed plastics recovered and granulated at TakaTaka sorting facilities.",
            "materials_used": ["mixed plastics", "recycled PP"],
            "product_story": {
                "source_note": "Plastic recovered from Nairobi households and commercial premises.",
                "process_note": "Manual sorting, washing, granulation, injection moulding.",
                "impact_note": "Every crate keeps approximately 1.2 kg of plastic out of landfill.",
            },
            "price_kes": "850.00",
            "token_requirement": 80,
            "token_discount_value": None,
            "is_redeemable": True,
            "is_discountable": False,
            "availability": [
                {
                    "name": "Online Enquiry",
                    "type": "online",
                    "contact": "info@takataka.co.ke",
                }
            ],
            "is_published": True,
            "ai_generated": False,
            "reviewed_by_human": True,
        }
    ],
    "mr-green-africa-demo": [
        {
            "id": str(uuid4()),
            "title": "Recycled Glass Décor Item",
            "short_description": "Hand-finished decorative piece crafted from recycled glass.",
            "description": (
                "Each piece is individually crafted from recovered glass bottles, "
                "making every item unique. Supports local artisans and closes the glass loop."
            ),
            "material_story": "Glass recovered from collection points across Nairobi and Mombasa.",
            "materials_used": ["recycled glass", "reclaimed glass bottles"],
            "product_story": {
                "source_note": "Glass bottles collected from hospitality partners.",
                "process_note": "Cleaned, crushed, melted, and hand-formed by artisans.",
                "impact_note": "Reduces glass sent to landfill and supports skilled local jobs.",
            },
            "price_kes": "650.00",
            "token_requirement": 60,
            "token_discount_value": None,
            "is_redeemable": True,
            "is_discountable": False,
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
            "ai_generated": False,
            "reviewed_by_human": True,
        }
    ],
}


def run() -> None:
    db = SessionLocal()
    try:
        inserted_companies = 0
        inserted_products = 0

        company_id_by_slug: dict[str, str] = {}

        for c_data in COMPANIES:
            slug = c_data["slug"]
            existing = db.query(Company).filter_by(slug=slug).first()
            if existing:
                print(f"  skip company (exists): {slug}")
                company_id_by_slug[slug] = existing.id
                continue

            company = Company(**c_data)
            db.add(company)
            db.flush()
            company_id_by_slug[slug] = company.id
            inserted_companies += 1
            print(f"  + company: {c_data['name']}")

        for slug, products in PRODUCTS_BY_SLUG.items():
            company_id = company_id_by_slug.get(slug)
            if not company_id:
                print(f"  warn: no company_id for slug {slug}, skipping products")
                continue
            for p_data in products:
                existing = db.query(Product).filter_by(id=p_data["id"]).first()
                if existing:
                    print(f"  skip product (exists): {p_data['title']}")
                    continue
                product = Product(
                    company_id=company_id,
                    **{k: v for k, v in p_data.items() if k != "price_kes"},
                    price_kes=p_data.get("price_kes"),
                )
                db.add(product)
                db.flush()
                inserted_products += 1
                print(f"  + product: {p_data['title']} → {slug}")

        db.commit()
        print(f"\nDone. {inserted_companies} companies, {inserted_products} products inserted.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("--- tareka DEMO SEED (not for production) ---")
    run()
