import re

from pydantic import BaseModel, Field, field_validator, model_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str | None = None
    phone: str | None = None
    password: str = Field(min_length=8, max_length=128)
    language: str = "en"

    @field_validator("full_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Full name is required")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", normalized):
            raise ValueError("Invalid email format")
        return normalized

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = re.sub(r"[^\d+]", "", value.strip())
        if normalized.startswith("00"):
            normalized = f"+{normalized[2:]}"
        if normalized and not normalized.startswith("+"):
            normalized = f"+{normalized}"
        digits = normalized.replace("+", "")
        if not digits.isdigit() or len(digits) < 7 or len(digits) > 15:
            raise ValueError("Invalid phone number format")
        return normalized

    @field_validator("language")
    @classmethod
    def normalize_language(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"en", "sw"}:
            raise ValueError("Unsupported language")
        return normalized

    @model_validator(mode="after")
    def validate_contact(self) -> "RegisterRequest":
        if not self.email and not self.phone:
            raise ValueError("Email or phone is required")
        return self


class LoginRequest(BaseModel):
    email: str | None = None
    phone: str | None = None
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", normalized):
            raise ValueError("Invalid email format")
        return normalized

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = re.sub(r"[^\d+]", "", value.strip())
        if normalized.startswith("00"):
            normalized = f"+{normalized[2:]}"
        if normalized and not normalized.startswith("+"):
            normalized = f"+{normalized}"
        digits = normalized.replace("+", "")
        if not digits.isdigit() or len(digits) < 7 or len(digits) > 15:
            raise ValueError("Invalid phone number format")
        return normalized

    @model_validator(mode="after")
    def validate_contact(self) -> "LoginRequest":
        if not self.email and not self.phone:
            raise ValueError("Email or phone is required")
        return self


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str | None
    phone: str | None
    role: str
    language: str
    is_active: bool
    is_verified: bool
    company_id: str | None = None
