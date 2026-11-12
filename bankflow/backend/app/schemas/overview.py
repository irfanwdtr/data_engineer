from typing import List, Optional
from pydantic import BaseModel

class KPIMetrics(BaseModel):
    total_transactions: int
    total_customers: int
    total_accounts: int
    total_branches: int
    successful_transactions: int
    failed_transactions: int
    pending_transactions: int
    successful_amount: float
    total_amount: float
    success_rate: float
    fail_rate: float
    pending_rate: float

class DailyTrendItem(BaseModel):
    date: str
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    pending_transactions: int
    total_amount: float
    successful_amount: float

class StatusDistributionItem(BaseModel):
    status: str
    count: int
    percentage: float
    total_amount: float

class TypeAnalysisItem(BaseModel):
    transaction_type: str
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    pending_transactions: int
    total_amount: float
    successful_amount: float
    average_amount: float
    success_rate: float

class ChannelPerformanceItem(BaseModel):
    channel: str
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    pending_transactions: int
    total_amount: float
    successful_amount: float
    success_rate: float

class BranchPerformanceItem(BaseModel):
    branch_id: str
    branch_name: str
    city: str
    branch_type: str
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    pending_transactions: int
    total_amount: float
    successful_amount: float
    success_rate: float

class OverviewResponse(BaseModel):
    kpis: KPIMetrics
    daily_trends: List[DailyTrendItem]
    status_distribution: List[StatusDistributionItem]
    type_analysis: List[TypeAnalysisItem]
    channel_performance: List[ChannelPerformanceItem]
    top_branches: List[BranchPerformanceItem]

