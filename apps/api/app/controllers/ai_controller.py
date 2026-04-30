from __future__ import annotations

from celery.result import AsyncResult
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, require_role
from app.core.celery_app import celery_app
from app.db.session import get_db
from app.models.user import User
from app.schemas.ai import (
    ImpactNarrativeRequest,
    OnboardRequest,
    ProductListingRequest,
    RecommendRequest,
    RedistributeRequest,
    TranslateRequest,
)
from app.services.ai_service import AIService
from app.tasks.ai_tasks import (
    generate_impact_narrative_task,
    generate_listing_task,
    translate_content_task,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/onboard")
async def ai_onboard(
    body: OnboardRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("company_admin", "platform_admin")),
):
    service = AIService(db, actor_user_id=current_user.id)
    result = await service.company_onboarding_assistant(
        body.company_name, body.materials, body.reward_config
    )
    return result


@router.post("/product-listing")
def ai_product_listing(
    body: ProductListingRequest,
    _: User = Depends(require_role("company_admin", "platform_admin")),
):
    job = generate_listing_task.delay(body.product_name)
    return {
        "status": "queued",
        "task_id": job.id,
        "message": "Product listing generation queued for background processing.",
    }


@router.post("/impact-narrative")
def ai_impact_narrative(
    body: ImpactNarrativeRequest,
    current_user: User = Depends(require_role("company_admin", "platform_admin")),
):
    job = generate_impact_narrative_task.delay(current_user.company_id or current_user.id, body.period)
    return {
        "status": "queued",
        "task_id": job.id,
        "disclaimer": "Figures are estimates based on average material weights.",
        "message": "Impact narrative generation queued for background processing.",
    }


@router.post("/translate")
def ai_translate(
    body: TranslateRequest,
    current_user: User = Depends(get_current_active_user),
):
    job = translate_content_task.delay(body.text, body.target_language)
    return {
        "status": "queued",
        "task_id": job.id,
        "provider": "nllb",
        "fallback_used": False,
    }


@router.post("/redistribute")
async def ai_redistribute(
    body: RedistributeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("operator", "company_admin", "platform_admin")),
):
    service = AIService(db, actor_user_id=current_user.id)
    result = await service.suggest_material_redistribution(
        body.material_type, body.quantity, body.nearby_companies
    )
    return result


@router.post("/recommend")
async def ai_recommend(
    body: RecommendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    service = AIService(db, actor_user_id=current_user.id)
    result = await service.recommend_redeemables(body.token_balance, body.available_rewards)
    return result


@router.get("/tasks/{task_id}")
def ai_task_status(
    task_id: str,
    _: User = Depends(get_current_active_user),
):
    try:
        task = AsyncResult(task_id, app=celery_app)
        status_map = {
            "PENDING": "pending",
            "RECEIVED": "running",
            "STARTED": "running",
            "RETRY": "retrying",
            "SUCCESS": "success",
            "FAILURE": "failed",
            "REVOKED": "cancelled",
        }
        safe_status = status_map.get(task.status, "pending")
        result = task.result if safe_status == "success" and isinstance(task.result, (dict, list, str, int, float, bool, type(None))) else None
        return {
            "task_id": task_id,
            "status": safe_status,
            "result": result,
        }
    except Exception:
        return {
            "task_id": task_id,
            "status": "unavailable",
            "result": None,
            "message": "Task backend is currently unavailable.",
        }
