from typing import List, Dict, Any, Optional
from datetime import datetime, date
from app.repositories.stock_repository import StockRepository
from app.repositories.pipeline_repository import PipelineRepository
from app.core.constants import TICKER_METADATA
from app.schemas.stock import StockOverview, StockDetail, StockHistoryPoint, TechnicalIndicatorsSummary
from app.schemas.dashboard import DashboardSummary, MarketIndexPoint, TopMoversGroup


class StockService:

    @staticmethod
    def _format_date(d: Any) -> str:
        if isinstance(d, (datetime, date)):
            return d.strftime("%d %b %Y")
        return str(d)

    @staticmethod
    def _map_stock_overview(row: Dict[str, Any]) -> StockOverview:
        ticker = row["ticker"]
        meta = TICKER_METADATA.get(ticker, {
            "name": ticker,
            "sector": "Lainnya",
            "market_cap": "N/A"
        })

        close_price = float(row["close"] or 0)
        prev_close = float(row.get("prev_close") or close_price)
        change = close_price - prev_close
        change_pct = float(row.get("daily_return") or 0) * 100
        if change_pct == 0 and prev_close > 0:
            change_pct = (change / prev_close) * 100

        return StockOverview(
            ticker=ticker,
            name=meta.get("name", ticker),
            sector=meta.get("sector", "Lainnya"),
            price=close_price,
            change=round(change, 2),
            change_percent=round(change_pct, 2),
            volume=int(row.get("volume") or 0),
            market_cap=meta.get("market_cap", "N/A"),
            trade_date=str(row["trade_date"])
        )

    @classmethod
    def get_all_stocks(
        cls,
        search: Optional[str] = None,
        sector: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: Optional[str] = "desc"
    ) -> List[StockOverview]:
        raw_stocks = StockRepository.get_all_latest_stocks()
        stocks = [cls._map_stock_overview(r) for r in raw_stocks]

        # Filter by search
        if search:
            s = search.lower().strip()
            stocks = [
                st for st in stocks
                if s in st.ticker.lower() or s in st.name.lower()
            ]

        # Filter by sector
        if sector and sector.lower() not in ["semua", "all", ""]:
            stocks = [
                st for st in stocks
                if st.sector.lower() == sector.lower()
            ]

        # Sort
        reverse = (sort_order.lower() == "desc") if sort_order else False
        if sort_by == "price":
            stocks.sort(key=lambda x: x.price, reverse=reverse)
        elif sort_by in ["change", "change_percent", "perubahan"]:
            stocks.sort(key=lambda x: x.change_percent, reverse=reverse)
        elif sort_by == "volume":
            stocks.sort(key=lambda x: x.volume, reverse=reverse)
        elif sort_by == "ticker":
            stocks.sort(key=lambda x: x.ticker, reverse=reverse)

        return stocks

    @classmethod
    def get_stock_detail(cls, ticker: str) -> Optional[StockDetail]:
        ticker = ticker.upper()
        raw = StockRepository.get_stock_detail(ticker)
        if not raw:
            return None

        meta = TICKER_METADATA.get(ticker, {
            "name": ticker,
            "sector": "Lainnya",
            "market_cap": "N/A",
            "pe_ratio": None,
            "pbv": None,
            "description": ""
        })

        close_price = float(raw["close"] or 0)
        prev_close = float(raw.get("prev_close") or close_price)
        change = close_price - prev_close
        change_pct = ((change / prev_close) * 100) if prev_close > 0 else 0.0

        return StockDetail(
            ticker=ticker,
            name=meta.get("name", ticker),
            sector=meta.get("sector", "Lainnya"),
            price=close_price,
            change=round(change, 2),
            change_percent=round(change_pct, 2),
            open=float(raw.get("open") or close_price),
            high=float(raw.get("high") or close_price),
            low=float(raw.get("low") or close_price),
            volume=int(raw.get("volume") or 0),
            market_cap=meta.get("market_cap", "N/A"),
            pe_ratio=meta.get("pe_ratio"),
            pbv=meta.get("pbv"),
            description=meta.get("description"),
            trade_date=str(raw["trade_date"])
        )

    @classmethod
    def get_stock_history(cls, ticker: str, timeframe: str = "1M") -> List[StockHistoryPoint]:
        ticker = ticker.upper()
        limit_map = {
            "1D": 2,
            "5D": 5,
            "1M": 22,
            "3M": 66,
            "6M": 130,
            "1Y": 252,
            "ALL": None
        }
        limit = limit_map.get(timeframe.upper(), 22)
        raw_history = StockRepository.get_stock_history(ticker, limit=limit)

        points = []
        for row in raw_history:
            points.append(StockHistoryPoint(
                date=str(row["trade_date"]),
                open=float(row["open"] or 0),
                high=float(row["high"] or 0),
                low=float(row["low"] or 0),
                close=float(row["close"] or 0),
                volume=int(row["volume"] or 0)
            ))
        return points

    @classmethod
    def get_stock_technical_indicators(cls, ticker: str) -> TechnicalIndicatorsSummary:
        ticker = ticker.upper()
        latest_features = StockRepository.get_latest_features(ticker)
        if not latest_features:
            return TechnicalIndicatorsSummary()

        rsi = float(latest_features["rsi_14"]) if latest_features.get("rsi_14") is not None else None
        rsi_status = "Neutral"
        if rsi is not None:
            if rsi > 70:
                rsi_status = "Overbought"
            elif rsi < 30:
                rsi_status = "Oversold"

        price_to_sma5 = float(latest_features["price_to_sma_5"]) if latest_features.get("price_to_sma_5") is not None else 0.0
        price_to_sma20 = float(latest_features["price_to_sma_20"]) if latest_features.get("price_to_sma_20") is not None else 0.0

        p_sma5_status = "Above" if price_to_sma5 > 0 else "Below"
        p_sma20_status = "Above" if price_to_sma20 > 0 else "Below"

        return TechnicalIndicatorsSummary(
            rsi_14=round(rsi, 2) if rsi is not None else None,
            rsi_status=rsi_status,
            sma_5=float(latest_features["sma_5"]) if latest_features.get("sma_5") is not None else None,
            sma_10=float(latest_features["sma_10"]) if latest_features.get("sma_10") is not None else None,
            sma_20=float(latest_features["sma_20"]) if latest_features.get("sma_20") is not None else None,
            price_vs_sma_5=p_sma5_status,
            price_vs_sma_20=p_sma20_status,
            volatility_20=round(float(latest_features["volatility_20"]) * 100, 2) if latest_features.get("volatility_20") is not None else None,
            volume_ratio_20=round(float(latest_features["volume_ratio_20"]), 2) if latest_features.get("volume_ratio_20") is not None else None,
            momentum_5=round(float(latest_features["momentum_5"]) * 100, 2) if latest_features.get("momentum_5") is not None else None,
            momentum_10=round(float(latest_features["momentum_10"]) * 100, 2) if latest_features.get("momentum_10") is not None else None,
        )

    @classmethod
    def get_top_movers_by_period(cls) -> Dict[str, TopMoversGroup]:
        rows = StockRepository.get_stocks_with_multi_period_returns()
        result = {}

        for period, ret_key, close_past_key in [
            ("1D", "return_1d", "close_1d"),
            ("5D", "return_5d", "close_5d"),
            ("1M", "return_1m", "close_1m"),
        ]:
            period_stocks = []
            for r in rows:
                ticker = r["ticker"]
                meta = TICKER_METADATA.get(ticker, {
                    "name": ticker,
                    "sector": "Lainnya",
                    "market_cap": "N/A"
                })
                close_price = float(r["close"] or 0)
                past_close = float(r.get(close_past_key) or close_price)
                change = round(close_price - past_close, 2)

                if r.get(ret_key) is not None:
                    ret_pct = float(r[ret_key])
                else:
                    ret_pct = round(((close_price - past_close) / past_close * 100), 2) if past_close > 0 else 0.0

                period_stocks.append(StockOverview(
                    ticker=ticker,
                    name=meta.get("name", ticker),
                    sector=meta.get("sector", "Lainnya"),
                    price=close_price,
                    change=change,
                    change_percent=ret_pct,
                    volume=int(r.get("volume") or 0),
                    market_cap=meta.get("market_cap", "N/A"),
                    trade_date=str(r["trade_date"])
                ))

            sorted_gainers = sorted(period_stocks, key=lambda x: x.change_percent, reverse=True)[:5]
            sorted_losers = sorted(period_stocks, key=lambda x: x.change_percent)[:5]
            result[period] = TopMoversGroup(gainers=sorted_gainers, losers=sorted_losers)

        return result

    @classmethod
    def get_dashboard_summary(cls, period: str = "5D") -> DashboardSummary:
        stocks = cls.get_all_stocks()
        total_stocks = len(stocks)

        rising = [s for s in stocks if s.change > 0]
        falling = [s for s in stocks if s.change < 0]
        unchanged = [s for s in stocks if s.change == 0]

        rising_count = len(rising)
        falling_count = len(falling)
        rising_pct = round((rising_count / total_stocks * 100), 1) if total_stocks > 0 else 0.0
        falling_pct = round((falling_count / total_stocks * 100), 1) if total_stocks > 0 else 0.0

        # Multi-period top movers calculation
        top_movers_map = cls.get_top_movers_by_period()
        target_period = (period or "5D").upper()
        if target_period not in top_movers_map:
            target_period = "5D"

        active_group = top_movers_map[target_period]
        top_gainers = active_group.gainers
        top_losers = active_group.losers

        # Market movement series (composite index from average returns)
        raw_movement = StockRepository.get_market_movement_history(days=10)
        base_index = 1000.0
        index_points = []
        for m in raw_movement:
            ret = float(m.get("avg_return") or 0)
            base_index = base_index * (1.0 + ret)
            index_points.append(MarketIndexPoint(
                date=cls._format_date(m["trade_date"]),
                index_value=round(base_index, 2),
                change_percent=round(ret * 100, 2)
            ))

        # Average return 5D
        if len(index_points) >= 5:
            first_val = index_points[-5].index_value
            last_val = index_points[-1].index_value
            avg_return_5d = round(((last_val - first_val) / first_val) * 100, 2) if first_val > 0 else 0.0
        elif len(index_points) > 1:
            first_val = index_points[0].index_value
            last_val = index_points[-1].index_value
            avg_return_5d = round(((last_val - first_val) / first_val) * 100, 2) if first_val > 0 else 0.0
        else:
            avg_return_5d = 0.0

        latest_date = StockRepository.get_max_trade_date()
        latest_date_str = cls._format_date(latest_date) if latest_date else "N/A"

        # Airflow status check
        latest_run = PipelineRepository.get_latest_dag_run()
        pipeline_healthy = (latest_run is not None and latest_run.get("state") == "success")
        last_run_formatted = cls._format_date(latest_run["start_date"]) if latest_run and latest_run.get("start_date") else None

        return DashboardSummary(
            total_stocks=total_stocks,
            avg_return_5d=avg_return_5d,
            rising_stocks=rising_count,
            falling_stocks=falling_count,
            rising_percent=rising_pct,
            falling_percent=falling_pct,
            market_movement=index_points,
            top_gainers=top_gainers,
            top_losers=top_losers,
            selected_period=target_period,
            top_movers_by_period=top_movers_map,
            latest_update=latest_date_str,
            pipeline_healthy=pipeline_healthy,
            pipeline_last_run=last_run_formatted
        )

