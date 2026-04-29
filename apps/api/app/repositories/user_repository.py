from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import RegisterRequest


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str | None) -> User | None:
        if not email:
            return None
        return self.db.query(User).filter(User.email == email).first()

    def get_by_phone(self, phone: str | None) -> User | None:
        if not phone:
            return None
        return self.db.query(User).filter(User.phone == phone).first()

    def create_user(self, payload: RegisterRequest, hashed_password: str) -> User:
        user = User(
            id=str(uuid4()),
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            hashed_password=hashed_password,
            role="recycler",
            language=payload.language,
            is_active=True,
            is_verified=False,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
