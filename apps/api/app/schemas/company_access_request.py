import re

from pydantic import BaseModel, Field, field_validator


class CompanyAccessRequestCreate(BaseModel):
    company_name: str = Field(min_length=2, max_length=200)
    contact_person: str = Field(min_length=2, max_length=120)
    work_email: str = Field(min_length=5, max_length=255)
    industry: str = Field(min_length=2, max_length=100)
    optional_message: str | None = Field(default=None, max_length=1000)

    @field_validator("company_name", "contact_person", "industry")
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
