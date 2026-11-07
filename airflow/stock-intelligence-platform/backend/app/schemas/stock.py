from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class StockOverview(BaseModel):
    ticker: str
    name: str
    sector: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: str
    trade_date: str


class StockDetail(BaseModel):
    ticker: str
    name: str
    sector: str
    price: float
    change: float
    change_percent: float
    open: float
    high: float
    low: float
    volume: int
    market_cap: str
    pe_ratio: Optional[float] = None
    pbv: Optional[float] = None
    description: Optional[str] = None
    trade_date: str


class StockHistoryPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class StockFeatures(BaseModel):
    trade_date: str
    daily_return: Optional[float] = None
    sma_5: Optional[float] = None
    sma_10: Optional[float] = None
    sma_20: Optional[float] = None
    rsi_14: Optional[float] = None
    volatility_20: Optional[float] = None
    volume_ratio_20: Optional[float] = None
    price_to_sma_5: Optional[float] = None
    price_to_sma_10: Optional[float] = None
    price_to_sma_20: Optional[float] = None
    momentum_5: Optional[float] = None
    momentum_10: Optional[float] = None


class TechnicalIndicatorsSummary(BaseModel):
    rsi_14: Optional[float] = None
    rsi_status: Optional[str] = "Neutral"
    sma_5: Optional[float] = None
    sma_10: Optional[float] = None
    sma_20: Optional[float] = None
    price_vs_sma_5: Optional[str] = "Neutral"
    price_vs_sma_20: Optional[str] = "Neutral"
    volatility_20: Optional[float] = None
    volume_ratio_20: Optional[float] = None
    momentum_5: Optional[float] = None
    momentum_10: Optional[float] = None

