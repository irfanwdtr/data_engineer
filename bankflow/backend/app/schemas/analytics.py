from typing import List, Optional
from pydantic import BaseModel
from app.schemas.overview import (
    DailyTrendItem,
    StatusDistributionItem,
    TypeAnalysisItem,
    ChannelPerformanceItem,
    BranchPerformanceItem,
)

class CustomerSegmentItem(BaseModel):
    segment: str
    total_customers: int
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    pending_transactions: int
    total_amount: float
    successful_amount: float
    avg_amount_per_customer: float
    avg_transactions_per_customer: float
    success_rate: float

class DailyTransactionsResponse(BaseModel):
    total_records: int
    start_date: Optional[str]
    end_date: Optional[str]
    items: List[DailyTrendItem]

class TransactionAnalyticsSummary(BaseModel):
    total_transactions: int
    total_amount: float
    successful_transactions: int
    successful_amount: float
    failed_transactions: int
    pending_transactions: int
    avg_daily_volume: float
    highest_day_volume: Optional[DailyTrendItem] = None

