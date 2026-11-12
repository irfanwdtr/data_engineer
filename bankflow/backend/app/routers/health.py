from fastapi import APIRouter
from app.database import check_db_health
from app.config import settings

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health")
def health_check():
    db_ok = check_db_health()
    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
    }

