from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.stock_service import StockService
from app.schemas.stock import StockOverview, StockDetail, StockHistoryPoint, TechnicalIndicatorsSummary
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("", response_model=List[StockOverview])
def get_stocks(
    search: Optional[str] = Query(None, description="Search by ticker or company name"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    sort_by: Optional[str] = Query(None, description="Sort field: price, change_percent, volume, ticker"),
    sort_order: Optional[str] = Query("desc", description="Sort order: asc or desc"),
):
    try:
        return StockService.get_all_stocks(
            search=search,
            sector=sector,
            sort_by=sort_by,
            sort_order=sort_order
        )
    except Exception as e:
        logger.exception(f"Error fetching stocks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch stock catalog")


@router.get("/{ticker}", response_model=StockDetail)
def get_stock_by_ticker(ticker: str):
    stock = StockService.get_stock_detail(ticker)
    if not stock:
        raise HTTPException(status_code=404, detail=f"Stock '{ticker}' not found")
    return stock


@router.get("/{ticker}/history", response_model=List[StockHistoryPoint])
def get_stock_history(
    ticker: str,
    timeframe: Optional[str] = Query("1M", description="Timeframe: 1D, 5D, 1M, 3M, 6M, 1Y, ALL")
):
    history = StockService.get_stock_history(ticker, timeframe=timeframe)
    if not history:
        raise HTTPException(status_code=404, detail=f"No price history found for ticker '{ticker}'")
    return history


@router.get("/{ticker}/features", response_model=TechnicalIndicatorsSummary)
def get_stock_features(ticker: str):
    return StockService.get_stock_technical_indicators(ticker)

