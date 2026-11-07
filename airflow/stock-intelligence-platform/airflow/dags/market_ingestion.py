
from datetime import timedelta

import pendulum

from airflow import DAG
from airflow.operators.bash import BashOperator


default_args = {
    "owner": "data-engineering",
    "depends_on_past": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
    "retry_exponential_backoff": True,
    "max_retry_delay": timedelta(minutes=15),
    "execution_timeout": timedelta(minutes=30),
}


with DAG(
    dag_id="market_ingestion",
    description="Stock market ETL pipeline with data quality validation",
    default_args=default_args,
    start_date=pendulum.datetime(2026, 1, 1, tz="Asia/Jakarta"),
    schedule="0 19 * * 1-5",
    catchup=False,
    max_active_runs=1,
    tags=["stock", "etl", "data-engineering"],
) as dag:

    ingest_market_data = BashOperator(
        task_id="ingest_market_data",
        bash_command=(
            "cd /opt/airflow && "
            "python -m src.ingestion.run_ingestion"
        ),
    )

    run_feature_engineering = BashOperator(
        task_id="run_feature_engineering",
        bash_command=(
            "cd /opt/airflow && "
            "python -m src.features.feature_engineering"
        ),
    )

    validate_data_quality = BashOperator(
        task_id="validate_data_quality",
        bash_command=(
            "cd /opt/airflow && "
            "python -m src.quality.data_quality"
        ),
    )

    (
        ingest_market_data
        >> run_feature_engineering
        >> validate_data_quality
    )
