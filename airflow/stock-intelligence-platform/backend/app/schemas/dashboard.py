from pydantic import BaseModel
from typing import List, Optional, Dict
from app.schemas.stock import StockOverview


class MarketIndexPoint(BaseModel):
    date: str
    index_value: float
    change_percent: float


class TopMoversGroup(BaseModel):
    gainers: List[StockOverview]
    losers: List[StockOverview]


class DashboardSummary(BaseModel):
    total_stocks: int
    avg_return_5d: float
    rising_stocks: int
    falling_stocks: int
    rising_percent: float
    falling_percent: float
    market_movement: List[MarketIndexPoint]
    top_gainers: List[StockOverview]
    top_losers: List[StockOverview]
    selected_period: str = "5D"
    top_movers_by_period: Optional[Dict[str, TopMoversGroup]] = None
    latest_update: str
    pipeline_healthy: bool
    pipeline_last_run: Optional[str] = None

