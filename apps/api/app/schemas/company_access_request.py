import re

from pydantic import BaseModel, Field, field_validator


class CompanyAccessRequestCreate(BaseModel):
    company_name: str = Field(min_length=2, max_length=200)
    contact_person: str = Field(min_length=2, max_length=120)
    work_email: str = Field(min_length=5, max_length=255)
    phone: str = Field(min_length=7, max_length=30)
    company_type: str = Field(min_length=2, max_length=100)
    county_location: str = Field(min_length=2, max_length=160)
    materials_handled: str = Field(min_length=2, max_length=2000)
    optional_message: str | None = Field(default=None, max_length=1000)

    @field_validator("optional_message")
    @classmethod
    def collapse_optional_message(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None

    @field_validator("company_name", "contact_person", "company_type", "county_location", "materials_handled")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Field cannot be blank")
        return cleaned

    @field_validator("work_email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", normalized):
            raise ValueError("Invalid email format")
        return normalized

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str) -> str:
        normalized = re.sub(r"[^\d+]", "", value.strip())
        if normalized.startswith("00"):
            normalized = f"+{normalized[2:]}"
        if normalized and not normalized.startswith("+"):
            normalized = f"+{normalized}"
        digits = normalized.replace("+", "")
        if not digits.isdigit() or len(digits) < 7 or len(digits) > 15:
            raise ValueError("Invalid phone number format")
        return normalized
