from typing import List, Optional
from pydantic import BaseModel

class PipelineTaskStatus(BaseModel):
    task_id: str
    task_name: str
    order: int
    state: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[float] = None

class PipelineRun(BaseModel):
    run_id: str
    execution_date: str
    state: str
    run_type: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[float] = None

class PipelineStatusResponse(BaseModel):
    dag_id: str
    description: str
    is_paused: bool
    status: str  # Overall pipeline health: SUCCESS, RUNNING, FAILED, UNKNOWN
    last_run_state: Optional[str] = None
    last_execution_date: Optional[str] = None
    last_duration_seconds: Optional[float] = None
    tasks: List[PipelineTaskStatus]
    recent_runs: List[PipelineRun]
    airflow_url: str
    source: str

