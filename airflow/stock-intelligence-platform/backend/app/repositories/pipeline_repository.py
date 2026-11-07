from typing import List, Dict, Any, Optional
from app.core.database import get_airflow_db
import logging

logger = logging.getLogger(__name__)


class PipelineRepository:

    @staticmethod
    def get_latest_dag_run(dag_id: str = "market_ingestion") -> Optional[Dict[str, Any]]:
        query = """
            SELECT
                run_id,
                state,
                execution_date,
                start_date,
                end_date,
                EXTRACT(EPOCH FROM (end_date - start_date)) AS duration
            FROM dag_run
            WHERE dag_id = %s
            ORDER BY start_date DESC NULLS LAST
            LIMIT 1;
        """
        with get_airflow_db() as conn:
            if conn is None:
                return None
            try:
                with conn.cursor() as cur:
                    cur.execute(query, (dag_id,))
                    return cur.fetchone()
            except Exception as e:
                logger.error(f"Error fetching latest dag run: {e}")
                return None

    @staticmethod
    def get_task_instances_for_run(dag_id: str, run_id: str) -> List[Dict[str, Any]]:
        query = """
            SELECT
                task_id,
                state,
                start_date,
                end_date,
                duration
            FROM task_instance
            WHERE dag_id = %s AND run_id = %s
            ORDER BY start_date ASC;
        """
        with get_airflow_db() as conn:
            if conn is None:
                return []
            try:
                with conn.cursor() as cur:
                    cur.execute(query, (dag_id, run_id))
                    return cur.fetchall()
            except Exception as e:
                logger.error(f"Error fetching task instances: {e}")
                return []

    @staticmethod
    def get_dag_runs_history(dag_id: str = "market_ingestion", limit: int = 15) -> List[Dict[str, Any]]:
        query = """
            SELECT
                run_id,
                state,
                execution_date,
                start_date,
                end_date,
                EXTRACT(EPOCH FROM (end_date - start_date)) AS duration
            FROM dag_run
            WHERE dag_id = %s
            ORDER BY start_date DESC NULLS LAST
            LIMIT %s;
        """
        with get_airflow_db() as conn:
            if conn is None:
                return []
            try:
                with conn.cursor() as cur:
                    cur.execute(query, (dag_id, limit))
                    return cur.fetchall()
            except Exception as e:
                logger.error(f"Error fetching dag runs history: {e}")
                return []

