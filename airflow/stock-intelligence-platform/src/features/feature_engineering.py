
import time
from datetime import timedelta

import pandas as pd
import numpy as np

from src.database.connection import get_connection
from src.utils.logger import get_logger


OVERLAP_DAYS = 5

logger = get_logger(__name__)


def calculate_features(data):
    """
    Menghitung indikator teknikal untuk satu ticker.
    Data harus sudah diurutkan berdasarkan tanggal.
    """

    data = data.copy()
    data = data.sort_values("trade_date")

    # Return harian
    data["daily_return"] = data["close"].pct_change()

    # Simple Moving Average
    data["sma_5"] = data["close"].rolling(window=5).mean()
    data["sma_10"] = data["close"].rolling(window=10).mean()
    data["sma_20"] = data["close"].rolling(window=20).mean()

    # Posisi harga terhadap SMA
    data["price_to_sma_5"] = (
        data["close"] / data["sma_5"]
    ) - 1

    data["price_to_sma_10"] = (
        data["close"] / data["sma_10"]
    ) - 1

    data["price_to_sma_20"] = (
        data["close"] / data["sma_20"]
    ) - 1

    # Momentum
    data["momentum_5"] = (
        data["close"] / data["close"].shift(5)
    ) - 1

    data["momentum_10"] = (
        data["close"] / data["close"].shift(10)
    ) - 1

    # RSI 14
    price_change = data["close"].diff()

    gains = price_change.clip(lower=0)
    losses = -price_change.clip(upper=0)

    avg_gain = gains.ewm(
        alpha=1 / 14,
        min_periods=14,
        adjust=False
    ).mean()

    avg_loss = losses.ewm(
        alpha=1 / 14,
        min_periods=14,
        adjust=False
    ).mean()

    relative_strength = avg_gain / avg_loss

    data["rsi_14"] = 100 - (
        100 / (1 + relative_strength)
    )

    # Volatilitas return 20 hari
    data["volatility_20"] = (
        data["daily_return"].rolling(window=20).std()
    )

    # Rasio volume
    average_volume = data["volume"].rolling(window=20).mean()

    data["volume_ratio_20"] = (
        data["volume"] / average_volume
    )

    return data


def get_latest_feature_date(cursor, ticker):
    cursor.execute(
        """
        SELECT MAX(trade_date)
        FROM stock_features
        WHERE ticker = %s
        """,
        (ticker,)
    )

    result = cursor.fetchone()
    return result[0]


def save_features(cursor, data):
    query = """
        INSERT INTO stock_features (
            ticker,
            trade_date,
            daily_return,
            sma_5,
            sma_10,
            sma_20,
            price_to_sma_5,
            price_to_sma_10,
            price_to_sma_20,
            momentum_5,
            momentum_10,
            rsi_14,
            volatility_20,
            volume_ratio_20
        )
        VALUES (
            %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s
        )
        ON CONFLICT (ticker, trade_date)
        DO UPDATE SET
            daily_return = EXCLUDED.daily_return,
            sma_5 = EXCLUDED.sma_5,
            sma_10 = EXCLUDED.sma_10,
            sma_20 = EXCLUDED.sma_20,
            price_to_sma_5 = EXCLUDED.price_to_sma_5,
            price_to_sma_10 = EXCLUDED.price_to_sma_10,
            price_to_sma_20 = EXCLUDED.price_to_sma_20,
            momentum_5 = EXCLUDED.momentum_5,
            momentum_10 = EXCLUDED.momentum_10,
            rsi_14 = EXCLUDED.rsi_14,
            volatility_20 = EXCLUDED.volatility_20,
            volume_ratio_20 = EXCLUDED.volume_ratio_20;
    """

    values = [
        (
            row["ticker"],
            row["trade_date"],
            row["daily_return"],
            row["sma_5"],
            row["sma_10"],
            row["sma_20"],
            row["price_to_sma_5"],
            row["price_to_sma_10"],
            row["price_to_sma_20"],
            row["momentum_5"],
            row["momentum_10"],
            row["rsi_14"],
            row["volatility_20"],
            row["volume_ratio_20"],
        )
        for _, row in data.iterrows()
    ]

    if values:
        cursor.executemany(query, values)

    return len(values)


def run_feature_engineering():
    start_time = time.perf_counter()

    conn = None

    successful_tickers = []
    failed_tickers = []

    total_processed = 0
    total_upserted = 0
    skipped_tickers = 0

    logger.info("=" * 60)
    logger.info("STARTING INCREMENTAL FEATURE ENGINEERING")
    logger.info("Overlap period: %s days", OVERLAP_DAYS)
    logger.info("=" * 60)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """
            SELECT
                ticker,
                trade_date,
                close,
                volume
            FROM stock_prices
            ORDER BY ticker, trade_date;
        """

        data = pd.read_sql_query(query, conn)

        if data.empty:
            logger.warning("No stock_prices data available.")
            return

        grouped_data = data.groupby("ticker")
        total_tickers = data["ticker"].nunique()

        logger.info("Total tickers found: %s", total_tickers)
        logger.info("Total stock price rows: %s", len(data))

        for index, (ticker, ticker_data) in enumerate(
            grouped_data,
            start=1
        ):
            logger.info(
                "[%s/%s] Starting feature engineering for %s",
                index,
                total_tickers,
                ticker,
            )

            try:
                latest_feature_date = get_latest_feature_date(
                    cursor,
                    ticker
                )

                if latest_feature_date is None:
                    logger.info(
                        "%s: No existing features. Processing full history.",
                        ticker,
                    )
                    start_date = None

                else:
                    start_date = (
                        latest_feature_date
                        - timedelta(days=OVERLAP_DAYS)
                    )

                    logger.info(
                        "%s: Latest feature date %s. "
                        "Reprocessing from %s.",
                        ticker,
                        latest_feature_date,
                        start_date,
                    )

                # Histori penuh tetap digunakan agar RSI EWM konsisten.
                features = calculate_features(ticker_data)

                # Hanya simpan tanggal dalam rentang incremental.
                if start_date is not None:
                    features = features[
                        features["trade_date"] >= start_date
                    ].copy()

                if features.empty:
                    logger.warning(
                        "%s: No features need updating.",
                        ticker,
                    )
                    skipped_tickers += 1
                    successful_tickers.append(ticker)
                    continue

                # Bersihkan infinity dan NaN.
                features = features.replace(
                    [np.inf, -np.inf],
                    np.nan
                )

                features = features.astype(object).where(
                    pd.notnull(features),
                    None
                )

                processed = len(features)

                updated = save_features(
                    cursor,
                    features
                )

                total_processed += processed
                total_upserted += updated

                successful_tickers.append(ticker)

                logger.info(
                    "%s: Feature engineering completed. "
                    "Processed: %s rows, Upserted: %s rows.",
                    ticker,
                    processed,
                    updated,
                )

            except Exception:
                failed_tickers.append(ticker)

                logger.exception(
                    "%s: Feature engineering failed.",
                    ticker,
                )

                # Hentikan proses jika salah satu ticker gagal.
                raise

        conn.commit()

        duration = time.perf_counter() - start_time

        logger.info("=" * 60)
        logger.info("INCREMENTAL FEATURE ENGINEERING SUMMARY")
        logger.info("Total tickers: %s", total_tickers)
        logger.info("Successful tickers: %s", len(successful_tickers))
        logger.info("Failed tickers: %s", len(failed_tickers))
        logger.info("Skipped tickers: %s", skipped_tickers)
        logger.info("Total features processed: %s", total_processed)
        logger.info("Total rows upserted: %s", total_upserted)
        logger.info("Total duration: %.2f seconds", duration)
        logger.info(
            "Incremental feature engineering completed successfully!"
        )
        logger.info("=" * 60)

    except Exception:
        if conn is not None:
            conn.rollback()

        logger.exception("Feature engineering pipeline failed.")
        raise

    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
    run_feature_engineering()
