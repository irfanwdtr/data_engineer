from airflow import DAG
from airflow.providers.standard.operators.python import PythonOperator
from datetime import datetime
import pandas as pd
import yfinance as yf


def extract():
    df = yf.download("AAPL", period="5d", interval="1d")

    if df.empty:
        raise ValueError("Data kosong dari yfinance")

    df.to_csv("/tmp/raw_stock.csv", index=True)


def transform():
    df = pd.read_csv("/tmp/raw_stock.csv")

    # Pastikan kolom Close ada
    if "Close" not in df.columns:
        raise ValueError(f"Kolom Close tidak ditemukan. Kolom tersedia: {df.columns.tolist()}")

    # Paksa jadi numeric
    df["Close"] = pd.to_numeric(df["Close"], errors="coerce")

    # Drop baris yang Close-nya kosong
    df = df.dropna(subset=["Close"])

    # Hitung return harian
    df["daily_return_%"] = df["Close"].pct_change(fill_method=None) * 100

    avg_close = df["Close"].mean()
    print("==== DEBUG INFO ====")
    print(df.dtypes)
    print(df.head())
    print(f"Rata-rata Close: {avg_close}")

    df.to_csv("/tmp/transformed_stock.csv", index=False)


def load():
    df = pd.read_csv("/tmp/transformed_stock.csv")
    print("Data Final:")
    print(df.tail())


with DAG(
    dag_id="mini_yfinance_etl",
    start_date=datetime(2024, 1, 1),
    schedule="@daily",
    catchup=False,
    tags=["example", "stock"],
) as dag:

    extract_task = PythonOperator(
        task_id="extract",
        python_callable=extract,
    )

    transform_task = PythonOperator(
        task_id="transform",
        python_callable=transform,
    )

    load_task = PythonOperator(
        task_id="load",
        python_callable=load,
    )

    extract_task >> transform_task >> load_task