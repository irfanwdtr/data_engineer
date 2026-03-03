from __future__ import annotations

from datetime import datetime, timedelta

import pandas as pd
import yfinance as yf

from airflow.decorators import dag, task
from airflow.providers.postgres.hooks.postgres import PostgresHook

TICKERS = [
    "ADRO.JK", "BREN.JK", "BBCA.JK", "BBRI.JK", "BMRI.JK",
    "TLKM.JK", "ASII.JK", "UNVR.JK", "PGAS.JK", "INDF.JK",
]

POSTGRES_CONN_ID = "postgres_default"
TABLE_NAME = "saham_naik_turun_daily"


def ensure_table(pg: PostgresHook) -> None:
    pg.run(f"""
    CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
        date DATE NOT NULL,
        ticker TEXT NOT NULL,
        close NUMERIC,
        prev_close NUMERIC,
        status TEXT,
        PRIMARY KEY (date, ticker)
    );
    """)


@dag(
    dag_id="etl_saham_naik_turun_sore_v2",
    start_date=datetime(2026, 1, 1),
    catchup=False,
    # Jam 17:00 UTC (00:00 WIB). Kalau mau 17:00 WIB pakai "0 10 * * 1-5"
    schedule="0 17 * * 1-5",
    default_args={"retries": 1, "retry_delay": timedelta(minutes=2)},
    tags=["etl", "idx", "simple"],
)
def etl_saham_naik_turun_sore():

    @task
    def extract_transform_today() -> list[dict]:
        tickers_str = " ".join(TICKERS)

        df = yf.download(
            tickers_str,
            period="10d",
            interval="1d",
            group_by="ticker",
            auto_adjust=False,
            threads=True,
            progress=False,
        )

        # Ambil Close saja -> long format
        if isinstance(df.columns, pd.MultiIndex):
            close = df.xs("Close", axis=1, level=1)
        else:
            close = df[["Close"]].rename(columns={"Close": TICKERS[0]})

        close = close.reset_index().rename(columns={"Date": "date"})
        long_df = close.melt(id_vars=["date"], var_name="ticker", value_name="close")
        long_df = long_df.dropna(subset=["close"]).sort_values(["ticker", "date"])

        long_df["prev_close"] = long_df.groupby("ticker")["close"].shift(1)
        long_df["status"] = "TETAP"
        long_df.loc[long_df["close"] > long_df["prev_close"], "status"] = "NAIK"
        long_df.loc[long_df["close"] < long_df["prev_close"], "status"] = "TURUN"

        latest_date = long_df["date"].max()
        out = long_df[long_df["date"] == latest_date].copy()

        # Convert ke list of dict biar ringan (XCom)
        out["date"] = pd.to_datetime(out["date"]).dt.date
        return out[["date", "ticker", "close", "prev_close", "status"]].to_dict("records")

    @task
    def load_to_postgres(rows: list[dict]) -> int:
        pg = PostgresHook(postgres_conn_id=POSTGRES_CONN_ID)
        ensure_table(pg)

        sql = f"""
        INSERT INTO {TABLE_NAME} (date, ticker, close, prev_close, status)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (date, ticker)
        DO UPDATE SET
            close = EXCLUDED.close,
            prev_close = EXCLUDED.prev_close,
            status = EXCLUDED.status;
        """

        n = 0
        for r in rows:
            pg.run(
                sql,
                parameters=(
                    r["date"],
                    r["ticker"],
                    float(r["close"]) if r["close"] is not None else None,
                    float(r["prev_close"]) if r["prev_close"] is not None else None,
                    r["status"],
                ),
            )
            n += 1
        return n

    @task
    def done(n: int) -> None:
        print(f"Loaded {n} rows into {TABLE_NAME}")

    rows = extract_transform_today()
    n = load_to_postgres(rows)
    done(n)


etl_saham_naik_turun_sore()