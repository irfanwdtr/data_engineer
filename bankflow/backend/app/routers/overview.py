from typing import Optional
from fastapi import APIRouter, Query
from app.services.analytics_service import AnalyticsService
from app.schemas.overview import OverviewResponse, KPIMetrics

router = APIRouter(prefix="/api", tags=["Overview"])

@router.get("/overview", response_model=OverviewResponse)
def get_overview(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    return AnalyticsService.get_overview(start_date=start_date, end_date=end_date)

@router.get("/overview/kpis", response_model=KPIMetrics)
def get_kpis():
    return AnalyticsService.get_kpis()

