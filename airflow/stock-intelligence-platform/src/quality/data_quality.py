
import time

from src.database.connection import get_connection
from src.utils.logger import get_logger


logger = get_logger(__name__)


def check_duplicates(cursor):
    """Memeriksa duplikasi ticker dan tanggal perdagangan."""

    cursor.execute("""
        SELECT COUNT(*)
        FROM (
            SELECT ticker, trade_date
            FROM stock_prices
            GROUP BY ticker, trade_date
            HAVING COUNT(*) > 1
        ) AS duplicates;
    """)

    return cursor.fetchone()[0]


def check_missing_prices(cursor):
    """Memeriksa nilai NULL pada data harga saham."""

    cursor.execute("""
        SELECT COUNT(*)
        FROM stock_prices
        WHERE open IS NULL
           OR high IS NULL
           OR low IS NULL
           OR close IS NULL
           OR volume IS NULL;
    """)

    return cursor.fetchone()[0]


def check_invalid_prices(cursor):
    """Memeriksa harga saham yang tidak valid."""

    cursor.execute("""
        SELECT COUNT(*)
        FROM stock_prices
        WHERE open <= 0
           OR high <= 0
           OR low <= 0
           OR close <= 0
           OR high < low
           OR open > high
           OR open < low
           OR close > high
           OR close < low;
    """)

    return cursor.fetchone()[0]


def check_negative_volume(cursor):
    """Memeriksa volume perdagangan negatif."""

    cursor.execute("""
        SELECT COUNT(*)
        FROM stock_prices
        WHERE volume < 0;
    """)

    return cursor.fetchone()[0]


def check_missing_features(cursor):
    """
    Memeriksa missing features setelah warm-up
    20 hari perdagangan per ticker.
    """

    cursor.execute("""
        WITH ranked_features AS (
            SELECT
                *,
                ROW_NUMBER() OVER (
                    PARTITION BY ticker
                    ORDER BY trade_date
                ) AS row_num
            FROM stock_features
        )
        SELECT COUNT(*)
        FROM ranked_features
        WHERE row_num > 20
          AND (
              daily_return IS NULL
              OR sma_5 IS NULL
              OR sma_10 IS NULL
              OR sma_20 IS NULL
              OR price_to_sma_5 IS NULL
              OR price_to_sma_10 IS NULL
              OR price_to_sma_20 IS NULL
              OR momentum_5 IS NULL
              OR momentum_10 IS NULL
              OR rsi_14 IS NULL
              OR volatility_20 IS NULL
              OR volume_ratio_20 IS NULL
          );
    """)

    return cursor.fetchone()[0]


def check_feature_coverage(cursor):
    """Memeriksa apakah setiap data harga memiliki fitur."""

    cursor.execute("""
        SELECT COUNT(*)
        FROM stock_prices sp
        LEFT JOIN stock_features sf
            ON sp.ticker = sf.ticker
            AND sp.trade_date = sf.trade_date
        WHERE sf.ticker IS NULL;
    """)

    return cursor.fetchone()[0]


def run_data_quality():
    start_time = time.perf_counter()

    conn = None

    checks = [
        ("Duplicate stock prices", check_duplicates),
        ("Missing stock prices", check_missing_prices),
        ("Invalid stock prices", check_invalid_prices),
        ("Negative trading volume", check_negative_volume),
        ("Missing stock features", check_missing_features),
        ("Missing feature coverage", check_feature_coverage),
    ]

    failed_checks = []
    passed_checks = 0

    logger.info("=" * 60)
    logger.info("STARTING DATA QUALITY VALIDATION")
    logger.info("Total checks: %s", len(checks))
    logger.info("=" * 60)

    try:
        conn = get_connection()
        cursor = conn.cursor()

        for index, (check_name, check_function) in enumerate(
            checks,
            start=1
        ):
            logger.info(
                "[%s/%s] Running check: %s",
                index,
                len(checks),
                check_name,
            )

            try:
                result = check_function(cursor)

                if result == 0:
                    passed_checks += 1

                    logger.info(
                        "%s: PASS (%s problematic rows)",
                        check_name,
                        result,
                    )

                else:
                    failed_checks.append(
                        f"{check_name}: {result} rows"
                    )

                    logger.error(
                        "%s: FAIL (%s problematic rows)",
                        check_name,
                        result,
                    )

            except Exception:
                logger.exception(
                    "Error executing data quality check: %s",
                    check_name,
                )
                raise

        duration = time.perf_counter() - start_time

        logger.info("=" * 60)
        logger.info("DATA QUALITY VALIDATION SUMMARY")
        logger.info("Total checks: %s", len(checks))
        logger.info("Passed: %s", passed_checks)
        logger.info("Failed: %s", len(failed_checks))
        logger.info("Duration: %.2f seconds", duration)

        if failed_checks:
            logger.error("Data quality issues detected:")

            for failure in failed_checks:
                logger.error("- %s", failure)

            raise RuntimeError(
                f"Data Quality Validation failed: "
                f"{len(failed_checks)} checks failed."
            )

        logger.info("All data quality checks passed!")
        logger.info("=" * 60)

    except Exception:
        logger.exception("Data quality validation pipeline failed.")
        raise

    finally:
        if conn is not None:
            conn.close()


if __name__ == "__main__":
        run_data_quality()
