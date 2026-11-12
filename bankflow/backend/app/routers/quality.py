from typing import List
from fastapi import APIRouter
from app.services.quality_service import QualityService
from app.schemas.quality import DataQualityResponse, QualitySummary, CheckItem

router = APIRouter(prefix="/api/data-quality", tags=["Data Quality"])

@router.get("/summary", response_model=DataQualityResponse)
def get_quality_summary():
    return QualityService.get_quality_report()

@router.get("/checks", response_model=List[CheckItem])
def get_quality_checks():
    report = QualityService.get_quality_report()
    return report.checks

