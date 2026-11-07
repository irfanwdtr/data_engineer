from pydantic import BaseModel
from typing import List, Optional


class PipelineTask(BaseModel):
    task_id: str
    state: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[float] = None


class PipelineRun(BaseModel):
    run_id: str
    state: str
    execution_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[float] = None


class PipelineStatus(BaseModel):
    is_healthy: bool
    status: str
    last_run_time: Optional[str] = None
    duration: Optional[float] = None
    tasks: List[PipelineTask] = []
    message: str
    latest_ingestion_date: Optional[str] = None
    feature_engineering_status: str
    data_quality_status: str

