import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "Stock Intelligence Platform API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "postgres")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))

    APP_DB_NAME: str = os.getenv("APP_DB_NAME", "stock_intelligence")
    APP_DB_USER: str = os.getenv("APP_DB_USER", "stock_user")
    APP_DB_PASSWORD: str = os.getenv("APP_DB_PASSWORD", "stock_dev_password_2026")

    AIRFLOW_DB_NAME: str = os.getenv("AIRFLOW_DB_NAME", "airflow_metadata")
    AIRFLOW_DB_USER: str = os.getenv("AIRFLOW_DB_USER", "airflow_user")
    AIRFLOW_DB_PASSWORD: str = os.getenv("AIRFLOW_DB_PASSWORD", "1")

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

