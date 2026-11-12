import decimal
import datetime
from contextlib import contextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from app.config import settings

def serialize_row(row: dict) -> dict:
    """Convert Decimals, dates, and datetimes into JSON-serializable primitives."""
    clean = {}
    for k, v in row.items():
        if isinstance(v, decimal.Decimal):
            clean[k] = float(v)
        elif isinstance(v, (datetime.date, datetime.datetime)):
            clean[k] = v.isoformat()
        else:
            clean[k] = v
    return clean

@contextmanager
def get_db_cursor():
    """Context manager for BankFlow Data Warehouse queries."""
    conn = psycopg2.connect(
        host=settings.POSTGRES_HOST,
        port=settings.POSTGRES_PORT,
        dbname=settings.POSTGRES_DB,
        user=settings.POSTGRES_USER,
        password=settings.POSTGRES_PASSWORD,
        connect_timeout=5
    )
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            yield cursor
    finally:
        conn.close()

@contextmanager
def get_airflow_cursor():
    """Context manager for Airflow metadata queries."""
    conn = psycopg2.connect(
        host=settings.AIRFLOW_DB_HOST,
        port=settings.AIRFLOW_DB_PORT,
        dbname=settings.AIRFLOW_DB_NAME,
        user=settings.AIRFLOW_DB_USER,
        password=settings.AIRFLOW_DB_PASSWORD,
        connect_timeout=5
    )
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            yield cursor
    finally:
        conn.close()

def check_db_health() -> bool:
    try:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT 1")
            return cursor.fetchone() is not None
    except Exception:
        return False

