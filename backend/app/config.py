"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with defaults for local development."""

    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "resume_screening"
    JWT_SECRET: str = "dev-secret-key-2024-resume-screening"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    OPENAI_API_KEY: str = ""

    # Upload settings
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10 MB

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
