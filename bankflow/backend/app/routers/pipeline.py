from typing import List
from fastapi import APIRouter
from app.services.pipeline_service import PipelineService
from app.schemas.pipeline import PipelineStatusResponse, PipelineRun

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline Monitoring"])

@router.get("/status", response_model=PipelineStatusResponse)
def get_pipeline_status():
    return PipelineService.get_pipeline_status()

@router.get("/runs", response_model=List[PipelineRun])
def get_pipeline_runs():
    status = PipelineService.get_pipeline_status()
    return status.recent_runs

