
from src.database.connection import get_connection


def get_latest_trade_date(ticker):
    conn = get_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT MAX(trade_date)
            FROM stock_prices
            WHERE ticker = %s
            """,
            (ticker,),
        )

        result = cursor.fetchone()
        return result[0]

    finally:
        conn.close()


def save_stock_data(data):
    if data is None or data.empty:
        return 0

    conn = get_connection()

    try:
        cursor = conn.cursor()

        query = """
            INSERT INTO stock_prices (
                ticker,
                trade_date,
                open,
                high,
                low,
                close,
                volume,
                dividends,
                stock_splits
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (ticker, trade_date)
            DO UPDATE SET
                open = EXCLUDED.open,
                high = EXCLUDED.high,
                low = EXCLUDED.low,
                close = EXCLUDED.close,
                volume = EXCLUDED.volume,
                dividends = EXCLUDED.dividends,
                stock_splits = EXCLUDED.stock_splits
        """

        values = [
            (
                row["Ticker"],
                row["Date"].date(),
                row["Open"],
                row["High"],
                row["Low"],
                row["Close"],
                int(row["Volume"]),
                row["Dividends"],
                row["Stock Splits"],
            )
            for _, row in data.iterrows()
        ]

        cursor.executemany(query, values)

        inserted_rows = cursor.rowcount

        conn.commit()

        print(
            f"Data diproses: {len(data)} | "
            f"Data baru masuk: {inserted_rows}"
        )

        return inserted_rows

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()
