from __future__ import annotations

import asyncio
from uuid import uuid4

from sqlalchemy import select

from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.audit_log import AuditLog
from app.models.company import Company
from app.services.ai_service import AIService
from app.services.translation_service import translate_content
from app.utils.input_sanitizer import summarize_input


@celery_app.task(name="app.tasks.ai_tasks.generate_listing_task")
def generate_listing_task(product_id: str) -> dict:
    db = SessionLocal()
    try:
        ai = AIService(db, actor_user_id=None)
        listing = asyncio.run(
            ai.generate_product_listing(
                product_name=f"Product {product_id}",
                notes="Auto-generated listing task",
                material_source="verified_dropoff",
            )
        )

        # Persist task output in DB and update Product model if available later.
        _write_ai_result_log(
            db,
            action="ai_listing_task_result",
            entity_id=product_id,
            payload=listing,
        )
        return listing
    finally:
        db.close()


@celery_app.task(name="app.tasks.ai_tasks.generate_impact_narrative_task")
def generate_impact_narrative_task(company_id: str, period: str) -> dict:
    db = SessionLocal()
    try:
        company = db.scalars(select(Company).where(Company.id == company_id)).first()
        ai = AIService(db, actor_user_id=None)
        narrative = asyncio.run(
            ai.generate_impact_narrative(
                total_dropoffs=0,
                co2_kg=0.0,
                kg_diverted=0.0,
                period=period,
            )
        )
        _write_ai_result_log(
            db,
            action="ai_impact_task_result",
            entity_id=company_id,
            payload={"company_name": company.name if company else None, **narrative},
        )
        return narrative
    finally:
        db.close()


@celery_app.task(name="app.tasks.ai_tasks.translate_content_task")
def translate_content_task(text: str, target_language: str) -> dict:
    db = SessionLocal()
    try:
        result = asyncio.run(
            translate_content(
                db,
                text=text,
                target_language=target_language,
                actor_user_id=None,
            )
        )
        _write_ai_result_log(
            db,
            action="ai_translate_task_result",
            entity_id="translation",
            payload=result,
        )
        return result
    finally:
        db.close()


def _write_ai_result_log(db, *, action: str, entity_id: str, payload: dict) -> None:
    entry = AuditLog(
        id=str(uuid4()),
        actor_user_id=None,
        action=action,
        entity_type="ai_task",
        entity_id=(entity_id or "system")[:36],
        metadata_json={
            "input_summary": summarize_input(str(payload)),
            "provider": payload.get("provider", "anthropic"),
            "model": payload.get("model", "unknown"),
            "success": True,
            "result": payload,
        },
    )
    db.add(entry)
    db.commit()
