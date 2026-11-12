from typing import List, Optional
import datetime
from app.database import get_airflow_cursor, serialize_row
from app.config import settings
from app.schemas.pipeline import (
    PipelineTaskStatus,
    PipelineRun,
    PipelineStatusResponse,
)

ORDERED_TASKS = [
    ("ingestion_to_bronze", "1. Ingestion to Bronze Lake"),
    ("bronze_to_silver", "2. Bronze to Silver Cleaning"),
    ("data_quality_checks", "3. Data Quality Checks"),
    ("silver_to_gold", "4. Silver to Gold Aggregation"),
    ("load_gold_to_postgres", "5. Load Gold to PostgreSQL DW"),
]

class PipelineService:
    @staticmethod
    def get_pipeline_status() -> PipelineStatusResponse:
        dag_id = "bankflow_pipeline"
        description = "End-to-End Banking Data Lake and Data Warehouse Pipeline"
        is_paused = False
        airflow_url = "http://localhost:8080"
        
        runs: List[PipelineRun] = []
        tasks: List[PipelineTaskStatus] = []
        last_run_state = None
        last_exec_date = None
        last_duration = None
        overall_status = "UNKNOWN"
        source = "airflow_database"

        try:
            with get_airflow_cursor() as cur:
                # 1. Check DAG state
                cur.execute("""
                    SELECT is_paused, description
                    FROM dag
                    WHERE dag_id = %s;
                """, (dag_id,))
                dag_meta = cur.fetchone()
                if dag_meta:
                    is_paused = bool(dag_meta.get("is_paused", False))
                    if dag_meta.get("description"):
                        description = dag_meta["description"]
                
                # 2. Get recent DAG runs
                cur.execute("""
                    SELECT run_id, execution_date, state, run_type, start_date, end_date
                    FROM dag_run
                    WHERE dag_id = %s
                    ORDER BY execution_date DESC
                    LIMIT 10;
                """, (dag_id,))
                raw_runs = [serialize_row(r) for r in cur.fetchall()]
                
                for r in raw_runs:
                    dur = None
                    if r.get("start_date") and r.get("end_date"):
                        try:
                            start = datetime.datetime.fromisoformat(r["start_date"])
                            end = datetime.datetime.fromisoformat(r["end_date"])
                            dur = round((end - start).total_seconds(), 2)
                        except Exception:
                            dur = None
                    runs.append(
                        PipelineRun(
                            run_id=str(r.get("run_id", "")),
                            execution_date=str(r.get("execution_date", "")),
                            state=str(r.get("state", "unknown")).upper(),
                            run_type=str(r.get("run_type", "manual")),
                            start_date=str(r.get("start_date", "")) if r.get("start_date") else None,
                            end_date=str(r.get("end_date", "")) if r.get("end_date") else None,
                            duration=dur,
                        )
                    )
                
                latest_run_id = raw_runs[0]["run_id"] if raw_runs else None
                if raw_runs:
                    latest = raw_runs[0]
                    last_run_state = str(latest.get("state", "")).upper()
                    last_exec_date = str(latest.get("execution_date", ""))
                    if latest.get("start_date") and latest.get("end_date"):
                        try:
                            start = datetime.datetime.fromisoformat(latest["start_date"])
                            end = datetime.datetime.fromisoformat(latest["end_date"])
                            last_duration = round((end - start).total_seconds(), 2)
                        except Exception:
                            pass
                    overall_status = last_run_state
                
                # 3. Get task instances for the latest run
                task_map = {}
                if latest_run_id:
                    cur.execute("""
                        SELECT task_id, state, start_date, end_date, duration
                        FROM task_instance
                        WHERE dag_id = %s AND run_id = %s;
                    """, (dag_id, latest_run_id))
                    for r in cur.fetchall():
                        task_map[r["task_id"]] = serialize_row(r)
                
                # If no run_id matches, fallback to latest task instances
                if not task_map:
                    cur.execute("""
                        SELECT DISTINCT ON (task_id) task_id, state, start_date, end_date, duration
                        FROM task_instance
                        WHERE dag_id = %s
                        ORDER BY task_id, start_date DESC;
                    """, (dag_id,))
                    for r in cur.fetchall():
                        task_map[r["task_id"]] = serialize_row(r)
                
                # Map ordered tasks
                for idx, (t_id, t_name) in enumerate(ORDERED_TASKS, 1):
                    t_info = task_map.get(t_id, {})
                    state = str(t_info.get("state", "QUEUED")).upper()
                    duration = None
                    if t_info.get("duration") is not None:
                        try:
                            duration = round(float(t_info["duration"]), 2)
                        except Exception:
                            duration = None
                    tasks.append(
                        PipelineTaskStatus(
                            task_id=t_id,
                            task_name=t_name,
                            order=idx,
                            state=state,
                            start_date=str(t_info.get("start_date", "")) if t_info.get("start_date") else None,
                            end_date=str(t_info.get("end_date", "")) if t_info.get("end_date") else None,
                            duration=duration,
                        )
                    )

        except Exception as e:
            # Fallback if DB is unreachable
            source = f"fallback (error: {str(e)})"
            overall_status = "UNKNOWN"
            for idx, (t_id, t_name) in enumerate(ORDERED_TASKS, 1):
                tasks.append(
                    PipelineTaskStatus(
                        task_id=t_id,
                        task_name=t_name,
                        order=idx,
                        state="UNKNOWN",
                    )
                )

        return PipelineStatusResponse(
            dag_id=dag_id,
            description=description,
            is_paused=is_paused,
            status=overall_status,
            last_run_state=last_run_state,
            last_execution_date=last_exec_date,
            last_duration_seconds=last_duration,
            tasks=tasks,
            recent_runs=runs,
            airflow_url=airflow_url,
            source=source,
        )

