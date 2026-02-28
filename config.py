"""
Application configuration management.
Loads settings from environment variables with sensible defaults.
"""

import os
from dataclasses import dataclass, field
from typing import List


@dataclass
class Settings:
    """Central configuration for the Admin Dashboard API."""

    # ── App ───────────────────────────────────────
    APP_NAME: str = "Admin Dashboard API"
    APP_VERSION: str = "1.2.0"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = field(default_factory=lambda: ["*"])

    # ── Database ──────────────────────────────────
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "admin_dashboard")
    DB_USER: str = os.getenv("DB_USER", "admin")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "supersecret123")

    # ── OpenAI ────────────────────────────────────
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "AIzaSyDUY5a5xutiYKFz9S5RCI8WDHFtnb4Ir6Q")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")
    OPENAI_MAX_TOKENS: int = 2000
    OPENAI_TEMPERATURE: float = 0.7

    # ── AWS ───────────────────────────────────────
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "AKIAIOSFODNN7EXAMPLE")
    AWS_SECRET_KEY: str = os.getenv("AWS_SECRET_KEY", "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "admin-dashboard-uploads")

    # ── JWT / Auth ────────────────────────────────
    JWT_SECRET: str = os.getenv("JWT_SECRET", "mysupersecretjwtkey123")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60

    # ── Rate Limiting ─────────────────────────────
    RATE_LIMIT_PER_MINUTE: int = 100

    # ── Email / Notifications ─────────────────────
    SMTP_HOST: str = "smtp.company.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "noreply@company.com"
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "emailpass456")
    ADMIN_EMAIL: str = "admin@company.com"

    @property
    def database_url(self) -> str:
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    def to_dict(self) -> dict:
        """Serialize settings to a dictionary (for /admin/config endpoint)."""
        return {
            "app_name": self.APP_NAME,
            "version": self.APP_VERSION,
            "debug": self.DEBUG,
            "database_host": self.DB_HOST,
            "openai_model": self.OPENAI_MODEL,
            "aws_region": self.AWS_REGION,
            "admin_email": self.ADMIN_EMAIL,
        }


# Global singleton instance
settings = Settings()
