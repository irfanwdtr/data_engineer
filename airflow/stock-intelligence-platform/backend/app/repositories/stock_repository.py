from typing import List, Dict, Any, Optional
from datetime import date
from app.core.database import get_app_db
from app.core.constants import TICKER_METADATA


class StockRepository:

    @staticmethod
    def get_all_latest_stocks() -> List[Dict[str, Any]]:
        query = """
            WITH ranked_prices AS (
                SELECT
                    ticker,
                    trade_date,
                    open,
                    high,
                    low,
                    close,
                    volume,
                    LAG(close) OVER (PARTITION BY ticker ORDER BY trade_date) AS prev_close,
                    ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY trade_date DESC) AS rn
                FROM stock_prices
            ),
            latest_features AS (
                SELECT
                    ticker,
                    trade_date,
                    daily_return,
                    rsi_14,
                    sma_5,
                    sma_20,
                    ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY trade_date DESC) AS rn
                FROM stock_features
            )
            SELECT
                p.ticker,
                p.trade_date,
                p.open,
                p.high,
                p.low,
                p.close,
                p.prev_close,
                p.volume,
                COALESCE(f.daily_return, CASE WHEN p.prev_close > 0 THEN (p.close - p.prev_close) / p.prev_close ELSE 0 END) AS daily_return,
                f.rsi_14,
                f.sma_5,
                f.sma_20
            FROM ranked_prices p
            LEFT JOIN latest_features f ON p.ticker = f.ticker AND f.rn = 1
            WHERE p.rn = 1
            ORDER BY p.ticker;
        """
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                return cur.fetchall()

    @staticmethod
    def get_stock_detail(ticker: str) -> Optional[Dict[str, Any]]:
        query = """
            WITH ranked_prices AS (
                SELECT
                    ticker,
                    trade_date,
                    open,
                    high,
                    low,
                    close,
                    volume,
                    LAG(close) OVER (PARTITION BY ticker ORDER BY trade_date) AS prev_close,
                    ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY trade_date DESC) AS rn
                FROM stock_prices
                WHERE ticker = %s
            )
            SELECT
                ticker,
                trade_date,
                open,
                high,
                low,
                close,
                prev_close,
                volume
            FROM ranked_prices
            WHERE rn = 1;
        """
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (ticker,))
                return cur.fetchone()

    @staticmethod
    def get_stock_history(ticker: str, limit: Optional[int] = None, start_date: Optional[str] = None) -> List[Dict[str, Any]]:
        params = [ticker]
        date_filter = ""
        if start_date:
            date_filter = "AND trade_date >= %s"
            params.append(start_date)

        limit_clause = ""
        if limit:
            limit_clause = f"LIMIT {int(limit)}"

        # If limit is specified, fetch the last N records and return them in chronological order
        query = f"""
            SELECT * FROM (
                SELECT
                    trade_date,
                    open,
                    high,
                    low,
                    close,
                    volume
                FROM stock_prices
                WHERE ticker = %s {date_filter}
                ORDER BY trade_date DESC
                {limit_clause}
            ) sub
            ORDER BY trade_date ASC;
        """
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query, tuple(params))
                return cur.fetchall()

    @staticmethod
    def get_stock_features_history(ticker: str, limit: int = 60) -> List[Dict[str, Any]]:
        query = """
            SELECT * FROM (
                SELECT
                    trade_date,
                    daily_return,
                    sma_5,
                    sma_10,
                    sma_20,
                    rsi_14,
                    volatility_20,
                    volume_ratio_20,
                    price_to_sma_5,
                    price_to_sma_10,
                    price_to_sma_20,
                    momentum_5,
                    momentum_10
                FROM stock_features
                WHERE ticker = %s
                ORDER BY trade_date DESC
                LIMIT %s
            ) sub
            ORDER BY trade_date ASC;
        """
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (ticker, limit))
                return cur.fetchall()

    @staticmethod
    def get_latest_features(ticker: str) -> Optional[Dict[str, Any]]:
        query = """
            SELECT
                trade_date,
                daily_return,
                sma_5,
                sma_10,
                sma_20,
                rsi_14,
                volatility_20,
                volume_ratio_20,
                price_to_sma_5,
                price_to_sma_10,
                price_to_sma_20,
                momentum_5,
                momentum_10
            FROM stock_features
            WHERE ticker = %s
            ORDER BY trade_date DESC
            LIMIT 1;
        """
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (ticker,))
                return cur.fetchone()

    @staticmethod
    def get_latest_model_evaluation() -> Optional[Dict[str, Any]]:
        query = """
            SELECT
                model_name,
                train_start_date,
                train_end_date,
                test_start_date,
                test_end_date,
                accuracy,
                precision_score,
                recall_score,
                f1_score,
                roc_auc,
                created_at
            FROM model_evaluations
            ORDER BY created_at DESC
            LIMIT 1;
        """
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                return cur.fetchone()

    @staticmethod
    def get_market_movement_history(days: int = 10) -> List[Dict[str, Any]]:
        query = """
            WITH daily_avg AS (
                SELECT
                    trade_date,
                    AVG(daily_return) AS avg_return,
                    COUNT(DISTINCT ticker) AS ticker_count
                FROM stock_features
                GROUP BY trade_date
                ORDER BY trade_date DESC
                LIMIT %s
            )
            SELECT
                trade_date,
                avg_return,
                ticker_count
            FROM daily_avg
            ORDER BY trade_date ASC;
        """
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query, (days,))
                return cur.fetchall()

    @staticmethod
    def get_total_stock_count() -> int:
        query = "SELECT COUNT(DISTINCT ticker) FROM stock_prices;"
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                res = cur.fetchone()
                return res["count"] if res else 0

    @staticmethod
    def get_max_trade_date() -> Optional[date]:
        query = "SELECT MAX(trade_date) FROM stock_prices;"
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                res = cur.fetchone()
                return res["max"] if res else None

    @staticmethod
    def get_stocks_with_multi_period_returns() -> List[Dict[str, Any]]:
        query = """
            WITH ranked_prices AS (
                SELECT
                    ticker,
                    trade_date,
                    open,
                    high,
                    low,
                    close,
                    volume,
                    LAG(close, 1) OVER (PARTITION BY ticker ORDER BY trade_date) AS close_1d,
                    LAG(close, 5) OVER (PARTITION BY ticker ORDER BY trade_date) AS close_5d,
                    LAG(close, 21) OVER (PARTITION BY ticker ORDER BY trade_date) AS close_1m,
                    ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY trade_date DESC) AS rn
                FROM stock_prices
            )
            SELECT
                ticker,
                trade_date,
                open,
                high,
                low,
                close,
                volume,
                close_1d,
                ROUND(((close - close_1d) / NULLIF(close_1d, 0) * 100)::numeric, 2) AS return_1d,
                close_5d,
                ROUND(((close - close_5d) / NULLIF(close_5d, 0) * 100)::numeric, 2) AS return_5d,
                close_1m,
                ROUND(((close - close_1m) / NULLIF(close_1m, 0) * 100)::numeric, 2) AS return_1m
            FROM ranked_prices
            WHERE rn = 1
            ORDER BY ticker;
        """
        with get_app_db() as conn:
            with conn.cursor() as cur:
                cur.execute(query)
                return cur.fetchall()

