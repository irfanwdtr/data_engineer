import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import get_app_db
from app.api.dashboard import router as dashboard_router
from app.api.stocks import router as stocks_router
from app.api.predictions import router as predictions_router
from app.api.pipeline import router as pipeline_router
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("stock-platform-backend")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend REST API for Indonesian Stock Market Intelligence Platform"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)
app.include_router(stocks_router, prefix=settings.API_V1_PREFIX)
app.include_router(predictions_router, prefix=settings.API_V1_PREFIX)
app.include_router(pipeline_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
def health_check():
    db_connected = False
    try:
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                db_connected = bool(cur.fetchone())
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")

    return {
        "status": "healthy" if db_connected else "degraded",
        "database_connected": db_connected,
        "version": settings.VERSION,
        "environment": "production" if not os.getenv("DEBUG") else "development"
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Stock Intelligence Platform API is running",
        "docs_url": "/docs",
        "health_url": "/health",
        "version": settings.VERSION
    }
