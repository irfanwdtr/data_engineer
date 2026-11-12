from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, overview, analytics, pipeline, quality, explorer

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for BankFlow Banking Data Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(overview.router)
app.include_router(analytics.router)
app.include_router(pipeline.router)
app.include_router(quality.router)
app.include_router(explorer.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to BankFlow Banking Data Intelligence API",
        "docs": "/docs",
        "health": "/api/health",
    }

