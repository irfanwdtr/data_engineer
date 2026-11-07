from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.services.stock_service import StockService
from app.schemas.dashboard import DashboardSummary
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    period: Optional[str] = Query("5D", description="Period for top movers: 1D, 5D, 1M")
):
    try:
        return StockService.get_dashboard_summary(period=period)
    except Exception as e:
        logger.exception(f"Error getting dashboard summary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard summary: {str(e)}")

