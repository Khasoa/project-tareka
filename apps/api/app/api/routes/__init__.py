from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.controllers.auth_controller import router as auth_router
from app.controllers.company_access_controller import router as company_access_router
from app.controllers.company_controller import router as company_router
from app.controllers.company_dashboard_controller import router as company_dashboard_router
from app.controllers.company_rewards_controller import router as company_rewards_router
from app.controllers.dropoff_controller import router as dropoff_router
from app.controllers.impact_controller import router as impact_router
from app.controllers.operator_controller import router as operator_router
from app.controllers.payout_controller import router as payout_router
from app.controllers.platform_controller import router as platform_router
from app.controllers.product_controller import router as product_router
from app.controllers.sats_reward_channel_controller import router as sats_reward_channel_router
from app.controllers.wallet_controller import router as wallet_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(company_access_router)
api_router.include_router(company_router)
api_router.include_router(company_dashboard_router)
api_router.include_router(company_rewards_router)
api_router.include_router(dropoff_router)
api_router.include_router(operator_router)
api_router.include_router(wallet_router)
api_router.include_router(payout_router)
api_router.include_router(platform_router)
api_router.include_router(impact_router)
api_router.include_router(product_router)
api_router.include_router(sats_reward_channel_router)
