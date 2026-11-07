from typing import List, Dict, Any, Optional
from datetime import datetime, date
from app.repositories.pipeline_repository import PipelineRepository
from app.repositories.stock_repository import StockRepository
from app.schemas.pipeline import PipelineStatus, PipelineTask, PipelineRun


class PipelineService:

    @staticmethod
    def _format_datetime(dt: Any) -> str:
        if isinstance(dt, (datetime, date)):
            return dt.strftime("%d %b %Y, %H:%M")
        return str(dt) if dt else "N/A"

    @classmethod
    def get_pipeline_status(cls) -> PipelineStatus:
        latest_run = PipelineRepository.get_latest_dag_run("market_ingestion")
        max_date = StockRepository.get_max_trade_date()
        latest_ingestion_date_str = max_date.strftime("%d %b %Y") if max_date else "N/A"

        if not latest_run:
            return PipelineStatus(
                is_healthy=False,
                status="Unavailable",
                last_run_time=None,
                duration=None,
                tasks=[],
                message="Koneksi ke metadata Apache Airflow tidak tersedia.",
                latest_ingestion_date=latest_ingestion_date_str,
                feature_engineering_status="Unavailable",
                data_quality_status="Unavailable"
            )

        run_id = latest_run["run_id"]
        state = latest_run.get("state", "unknown")
        is_success = (state == "success")
        duration = float(latest_run.get("duration") or 0.0)

        # Fetch tasks for this run
        raw_tasks = PipelineRepository.get_task_instances_for_run("market_ingestion", run_id)
        tasks_list: List[PipelineTask] = []
        fe_status = "Unknown"
        dq_status = "Unknown"

        for t in raw_tasks:
            t_id = t["task_id"]
            t_state = t.get("state", "unknown")
            t_dur = float(t.get("duration") or 0.0)
            tasks_list.append(PipelineTask(
                task_id=t_id,
                state=t_state,
                start_date=cls._format_datetime(t.get("start_date")),
                end_date=cls._format_datetime(t.get("end_date")),
                duration=round(t_dur, 2)
            ))

            if t_id == "run_feature_engineering":
                fe_status = t_state.capitalize()
            elif t_id == "validate_data_quality":
                dq_status = t_state.capitalize()

        status_text = "Success" if is_success else state.capitalize()
        message = "Semua proses berjalan normal" if is_success else f"Status pipeline: {state}"

        return PipelineStatus(
            is_healthy=is_success,
            status=status_text,
            last_run_time=cls._format_datetime(latest_run.get("start_date")),
            duration=round(duration, 2),
            tasks=tasks_list,
            message=message,
            latest_ingestion_date=latest_ingestion_date_str,
            feature_engineering_status=fe_status,
            data_quality_status=dq_status
        )

    @classmethod
    def get_pipeline_runs(cls, limit: int = 15) -> List[PipelineRun]:
        raw_runs = PipelineRepository.get_dag_runs_history("market_ingestion", limit=limit)
        runs_list = []
        for r in raw_runs:
            dur = float(r.get("duration") or 0.0)
            runs_list.append(PipelineRun(
                run_id=r["run_id"],
                state=r.get("state", "unknown"),
                execution_date=cls._format_datetime(r.get("execution_date")),
                start_date=cls._format_datetime(r.get("start_date")),
                end_date=cls._format_datetime(r.get("end_date")),
                duration=round(dur, 2)
            ))
        return runs_list

