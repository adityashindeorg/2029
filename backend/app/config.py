import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/db2029"
    )
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-this-in-production-2029")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,*"
    )

    APPROVED_USER_1_EMAIL: str = os.getenv("APPROVED_USER_1_EMAIL", "partner1@2029.app")
    APPROVED_USER_1_NAME: str = os.getenv("APPROVED_USER_1_NAME", "Aditya")
    APPROVED_USER_1_TOTP_SECRET: str = os.getenv("APPROVED_USER_1_TOTP_SECRET", "JBSWY3DPEHPK3PXP")

    APPROVED_USER_2_EMAIL: str = os.getenv("APPROVED_USER_2_EMAIL", "partner2@2029.app")
    APPROVED_USER_2_NAME: str = os.getenv("APPROVED_USER_2_NAME", "Janhvi")
    APPROVED_USER_2_TOTP_SECRET: str = os.getenv("APPROVED_USER_2_TOTP_SECRET", "JBSWY3DPEHPK3PXQ")

    DEFAULT_START_DATE: str = os.getenv("DEFAULT_START_DATE", "2020-04-28")
    DEFAULT_MARRIAGE_DATE: str = os.getenv("DEFAULT_MARRIAGE_DATE", "2029-12-31")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
