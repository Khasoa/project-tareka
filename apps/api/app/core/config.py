from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "tareka API"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    APP_VERSION: str = "0.1.0"

    DATABASE_URL: str = "postgresql://user:password@localhost:5432/tareka_dev"
    REDIS_URL: str = "redis://localhost:6379"

    SECRET_KEY: str = Field(default="change-me-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ALLOWED_ORIGINS: str = "http://localhost:3000"

    ANTHROPIC_API_KEY: str = ""
    KOTANI_API_KEY: str = ""
    KOTANI_BASE_URL: str = "https://api.kotanipay.io"
    AFRICASTALKING_USERNAME: str = "sandbox"
    AFRICASTALKING_API_KEY: str = ""

    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
