import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


@contextmanager
def get_app_db():
    conn = None
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            database=settings.APP_DB_NAME,
            user=settings.APP_DB_USER,
            password=settings.APP_DB_PASSWORD,
            cursor_factory=RealDictCursor,
            connect_timeout=5,
        )
        yield conn
    except Exception as e:
        logger.error(f"Failed to connect to application database: {e}")
        raise
    finally:
        if conn is not None and not conn.closed:
            conn.close()


@contextmanager
def get_airflow_db():
    conn = None
    try:
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            database=settings.AIRFLOW_DB_NAME,
            user=settings.AIRFLOW_DB_USER,
            password=settings.AIRFLOW_DB_PASSWORD,
            cursor_factory=RealDictCursor,
            connect_timeout=5,
        )
        yield conn
    except Exception as e:
        logger.warning(f"Could not connect to Airflow metadata database: {e}")
        yield None
    finally:
        if conn is not None and not conn.closed:
            conn.close()

