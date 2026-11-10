from fastapi import FastAPI
from app.api.v1.youtube import router as youtube_router


app = FastAPI(
    title="YouTube Comment Sentiment Analysis API",
    description="Backend API for YouTube comment collection and sentiment analysis.",
    version="1.0.0"
)


# Root endpoint
@app.get("/")
def root():
    return {
        "message": "YouTube Comment Sentiment Analysis API is running!",
        "status": "success"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "backend"
    }


# YouTube API routes
app.include_router(
    youtube_router,
    prefix="/api/v1"
)