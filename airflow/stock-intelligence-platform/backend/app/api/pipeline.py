from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.services.pipeline_service import PipelineService
from app.schemas.pipeline import PipelineStatus, PipelineRun
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pipeline", tags=["Pipeline"])


@router.get("/status", response_model=PipelineStatus)
def get_pipeline_status():
    try:
        return PipelineService.get_pipeline_status()
    except Exception as e:
        logger.exception(f"Error fetching pipeline status: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pipeline status")


@router.get("/runs", response_model=List[PipelineRun])
def get_pipeline_runs(limit: int = Query(15, ge=1, le=100)):
    try:
        return PipelineService.get_pipeline_runs(limit=limit)
    except Exception as e:
        logger.exception(f"Error fetching pipeline runs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch pipeline runs")

