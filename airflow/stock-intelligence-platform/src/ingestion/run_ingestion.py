
import time
from datetime import timedelta

from src.ingestion.tickers import TICKERS
from src.ingestion.market_data import fetch_stock_data
from src.database.stock_repository import (
    get_latest_trade_date,
    save_stock_data,
)
from src.utils.logger import get_logger


OVERLAP_DAYS = 5

logger = get_logger(__name__)


def run_ingestion():
    start_time = time.perf_counter()

    failed_tickers = []
    successful_tickers = []

    total_processed = 0
    total_inserted = 0

    total_tickers = len(TICKERS)

    logger.info("=" * 60)
    logger.info("STARTING INCREMENTAL STOCK INGESTION")
    logger.info("Total tickers: %s", total_tickers)
    logger.info("Overlap period: %s days", OVERLAP_DAYS)
    logger.info("=" * 60)

    for index, ticker in enumerate(TICKERS, start=1):
        logger.info(
            "[%s/%s] Starting ingestion for %s",
            index,
            total_tickers,
            ticker,
        )

        try:
            latest_date = get_latest_trade_date(ticker)

            if latest_date is None:
                logger.info(
                    "%s: No existing data. Fetching 2 years of history.",
                    ticker,
                )

                data = fetch_stock_data(
                    ticker,
                    period="2y",
                )

            else:
                start_date = latest_date - timedelta(
                    days=OVERLAP_DAYS
                )

                logger.info(
                    "%s: Latest date %s. Fetching from %s.",
                    ticker,
                    latest_date,
                    start_date,
                )

                data = fetch_stock_data(
                    ticker,
                    start=start_date.isoformat(),
                )

            if data is None or data.empty:
                logger.warning(
                    "%s: No new market data available.",
                    ticker,
                )

                successful_tickers.append(ticker)
                continue

            fetched_rows = len(data)

            inserted = save_stock_data(data)

            total_processed += fetched_rows
            total_inserted += inserted

            successful_tickers.append(ticker)

            logger.info(
                "%s: Ingestion completed. Fetched: %s rows, Inserted: %s rows.",
                ticker,
                fetched_rows,
                inserted,
            )

        except Exception:
            failed_tickers.append(ticker)

            logger.exception(
                "%s: Ingestion failed.",
                ticker,
            )

    duration = time.perf_counter() - start_time

    logger.info("=" * 60)
    logger.info("INCREMENTAL INGESTION SUMMARY")
    logger.info("Successful tickers: %s", len(successful_tickers))
    logger.info("Failed tickers: %s", len(failed_tickers))
    logger.info("Total processed: %s rows", total_processed)
    logger.info("Total inserted: %s rows", total_inserted)
    logger.info("Total duration: %.2f seconds", duration)

    if failed_tickers:
        logger.error(
            "Failed tickers: %s",
            ", ".join(failed_tickers),
        )

        logger.error("Incremental ingestion completed with failures.")

        raise RuntimeError(
            f"Ingestion failed for {len(failed_tickers)} tickers."
        )

    logger.info("Incremental ingestion completed successfully!")
    logger.info("=" * 60)


if __name__ == "__main__":
    run_ingestion()
