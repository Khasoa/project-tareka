from uuid import uuid4

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, require_role
from app.core.config import settings
from app.core.rate_limit import limiter
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def _cookie_secure() -> bool:
    return settings.ENVIRONMENT.lower() in {"production", "staging"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def register(
    request: Request, payload: RegisterRequest, db: Session = Depends(get_db)
) -> dict[str, str]:
    _ = request
    service = AuthService(db)
    service.register_user(payload)
    return {"message": "Registration successful"}


@router.post("/login")
@limiter.limit("5/minute")
def login(
    request: Request,
    response: Response,
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> dict[str, str]:
    service = AuthService(db)
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    try:
        user = service.authenticate_user(payload)
    except Exception:
        service.log_auth_event(
            action="login_failed",
            actor_user_id=None,
            entity_id="auth",
            metadata_json={
                "event_id": str(uuid4()),
                "ip": client_ip,
                "user_agent": user_agent,
            },
        )
        raise

    tokens = service.generate_tokens(user)
    response.set_cookie(
        key="access_token",
        value=tokens.access_token,
        httponly=True,
        samesite="lax",
        secure=_cookie_secure(),
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        httponly=True,
        samesite="lax",
        secure=_cookie_secure(),
        path="/",
    )
    service.log_auth_event(
        action="login_success",
        actor_user_id=user.id,
        entity_id=user.id,
        metadata_json={"event_id": str(uuid4()), "ip": client_ip, "user_agent": user_agent},
    )
    return {"message": "Login successful"}


@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> dict[str, str]:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    service = AuthService(db)
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    service.log_auth_event(
        action="logout",
        actor_user_id=current_user.id,
        entity_id=current_user.id,
        metadata_json={"event_id": str(uuid4()), "ip": client_ip, "user_agent": user_agent},
    )
    return {"message": "Logout successful"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_active_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        role=str(current_user.role),
        language=current_user.language,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        company_id=current_user.company_id,
    )


@router.get("/admin-check")
def admin_check(_: User = Depends(require_role("platform_admin"))) -> dict[str, str]:
    return {"message": "authorized"}
