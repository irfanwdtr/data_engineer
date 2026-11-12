from typing import List, Optional
from pydantic import BaseModel

class CheckItem(BaseModel):
    check_name: str
    status: str
    failed_records: int
    details: str
    dataset: str
    category: str

class QualitySummary(BaseModel):
    total_checks: int
    passed: int
    failed: int
    pass_rate: float

class DataQualityResponse(BaseModel):
    has_report: bool
    generated_at: Optional[str] = None
    overall_status: str
    summary: QualitySummary
    checks: List[CheckItem]

