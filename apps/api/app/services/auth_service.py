from dataclasses import dataclass
from uuid import uuid4

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.audit_log import AuditLog
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest


@dataclass
class TokenPair:
    access_token: str
    refresh_token: str


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repository = UserRepository(db)

    def register_user(self, payload: RegisterRequest) -> User:
        if payload.email and self.user_repository.get_by_email(payload.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")
        if payload.phone and self.user_repository.get_by_phone(payload.phone):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone already in use")

        hashed = hash_password(payload.password)
        return self.user_repository.create_user(payload, hashed)

    def authenticate_user(self, payload: LoginRequest) -> User:
        user = self.user_repository.get_by_email(payload.email)
        if not user:
            user = self.user_repository.get_by_phone(payload.phone)

        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        if not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        return user

    def generate_tokens(self, user: User) -> TokenPair:
        access_token = create_access_token(user_id=user.id, role=str(user.role))
        refresh_token = create_refresh_token(user_id=user.id)
        return TokenPair(access_token=access_token, refresh_token=refresh_token)

    def log_auth_event(
        self,
        *,
        action: str,
        actor_user_id: str | None,
        metadata_json: dict,
        entity_id: str = "auth",
    ) -> None:
        entry = AuditLog(
            id=str(metadata_json.get("event_id") or uuid4()),
            actor_user_id=actor_user_id,
            action=action,
            entity_type="auth",
            entity_id=entity_id[:36],
            metadata_json=metadata_json,
        )
        self.db.add(entry)
        self.db.commit()
