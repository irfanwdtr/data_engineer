import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    APP_NAME: str = "BankFlow Data Intelligence API"
    APP_ENV: str = "production"
    DEBUG: bool = False

    # PostgreSQL Data Warehouse
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5437
    POSTGRES_DB: str = "bankflow_dw"
    POSTGRES_USER: str = "bankflow_user"
    POSTGRES_PASSWORD: str = ""

    # Airflow Metadata Database
    AIRFLOW_DB_HOST: str = "localhost"
    AIRFLOW_DB_PORT: int = 5437
    AIRFLOW_DB_NAME: str = "airflow_metadata"
    AIRFLOW_DB_USER: str = "airflow_user"
    AIRFLOW_DB_PASSWORD: str = ""

    # Airflow REST API
    AIRFLOW_API_URL: str = "http://localhost:8080"
    AIRFLOW_API_USER: str = ""
    AIRFLOW_API_PASSWORD: str = ""

    # Data Quality
    QUALITY_REPORT_PATH: str = str(
        BASE_DIR / "data_quality" / "reports" / "quality_report.json"
    )

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()