import pandas as pd

from src.database.connection import get_connection


def build_labels(data):
    """
    Membuat target prediksi arah harga saham
    untuk 5 hari perdagangan berikutnya.
    """

    data = data.copy()
    data = data.sort_values("trade_date")

    data["close"] = pd.to_numeric(data["close"])

    # Harga penutupan 5 hari perdagangan ke depan
    data["future_close_5d"] = data["close"].shift(-5)

    # Return 5 hari ke depan
    data["future_return_5d"] = (
        data["future_close_5d"] / data["close"]
    ) - 1

    # Label: 1 jika naik, 0 jika tidak naik
    data["target_up_5d"] = data["future_return_5d"].apply(
        lambda value: 1 if pd.notna(value) and value > 0
        else (0 if pd.notna(value) else None)
    )

    return data


def run_dataset_generation():
    conn = get_connection()

    try:
        query = """
            SELECT ticker, trade_date, close
            FROM stock_prices
            ORDER BY ticker, trade_date;
        """

        data = pd.read_sql_query(query, conn)

        if data.empty:
            print("Tidak ada data stock_prices.")
            return

        all_labels = []

        for ticker, ticker_data in data.groupby("ticker"):
            print(f"Membuat label {ticker}...")

            labels = build_labels(ticker_data)
            all_labels.append(labels)

        result = pd.concat(all_labels, ignore_index=True)

        result = result.astype(object).where(
            pd.notnull(result), None
        )

        cursor = conn.cursor()

        for _, row in result.iterrows():
            cursor.execute(
                """
                INSERT INTO stock_labels (
                    ticker,
                    trade_date,
                    future_return_5d,
                    target_up_5d
                )
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (ticker, trade_date)
                DO UPDATE SET
                    future_return_5d = EXCLUDED.future_return_5d,
                    target_up_5d = EXCLUDED.target_up_5d;
                """,
                (
                    row["ticker"],
                    row["trade_date"],
                    row["future_return_5d"],
                    row["target_up_5d"],
                ),
            )

        conn.commit()

        print("\n========== DATASET GENERATION SUMMARY ==========")
        print(f"Total ticker: {result['ticker'].nunique()}")
        print(f"Total label diproses: {len(result)}")
        print(
            f"Label tersedia: "
            f"{result['target_up_5d'].notna().sum()}"
        )
        print("Dataset generation berhasil!")

    except Exception:
        conn.rollback()
        raise

    finally:
        conn.close()


if __name__ == "__main__":
    run_dataset_generation()