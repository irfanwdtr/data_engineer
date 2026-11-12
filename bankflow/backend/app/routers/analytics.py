from typing import Optional, List
from fastapi import APIRouter, Query
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    CustomerSegmentItem,
    DailyTransactionsResponse,
)
from app.schemas.overview import (
    DailyTrendItem,
    StatusDistributionItem,
    TypeAnalysisItem,
    ChannelPerformanceItem,
    BranchPerformanceItem,
)

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/daily-transactions", response_model=DailyTransactionsResponse)
def get_daily_transactions(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: Optional[int] = Query(None, description="Limit records"),
):
    items = AnalyticsService.get_daily_trends(start_date=start_date, end_date=end_date, limit=limit)
    return DailyTransactionsResponse(
        total_records=len(items),
        start_date=start_date,
        end_date=end_date,
        items=items,
    )

@router.get("/transaction-status", response_model=List[StatusDistributionItem])
def get_transaction_status():
    return AnalyticsService.get_status_distribution()

@router.get("/transaction-types", response_model=List[TypeAnalysisItem])
def get_transaction_types():
    return AnalyticsService.get_type_analysis()

@router.get("/channels", response_model=List[ChannelPerformanceItem])
def get_channels():
    return AnalyticsService.get_channel_performance()

@router.get("/branches", response_model=List[BranchPerformanceItem])
def get_branches(limit: int = Query(20, ge=1, le=50)):
    return AnalyticsService.get_top_branches(limit=limit)

@router.get("/customer-segments", response_model=List[CustomerSegmentItem])
def get_customer_segments():
    return AnalyticsService.get_customer_segments()

