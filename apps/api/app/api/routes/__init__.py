from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.controllers.auth_controller import router as auth_router
from app.controllers.ai_controller import router as ai_router
from app.controllers.bitcoin_controller import router as bitcoin_router
from app.controllers.dropoff_controller import router as dropoff_router
from app.controllers.impact_controller import router as impact_router
from app.controllers.payout_controller import router as payout_router
from app.controllers.wallet_controller import router as wallet_router
from app.controllers.ussd_controller import router as ussd_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(ai_router)
api_router.include_router(bitcoin_router)
api_router.include_router(dropoff_router)
api_router.include_router(wallet_router)
api_router.include_router(payout_router)
api_router.include_router(impact_router)
api_router.include_router(ussd_router)
