
from datetime import datetime

from airflow import DAG
from airflow.operators.bash import BashOperator


with DAG(
    dag_id="bankflow_pipeline",
    description="End-to-End Banking Data Lake and Data Warehouse Pipeline",
    start_date=datetime(2026, 1, 1),
    schedule=None,
    catchup=False,
    tags=["bankflow", "data-engineering"],
) as dag:

    ingestion = BashOperator(
        task_id="ingestion_to_bronze",
        bash_command="cd /opt/airflow/project && python ingestion/upload_to_lake.py",
    )

    bronze_to_silver = BashOperator(
        task_id="bronze_to_silver",
        bash_command="cd /opt/airflow/project && python processing/bronze_to_silver.py",
    )

    data_quality = BashOperator(
        task_id="data_quality_checks",
        bash_command="cd /opt/airflow/project && python data_quality/quality_checks.py",
    )

    silver_to_gold = BashOperator(
        task_id="silver_to_gold",
        bash_command="cd /opt/airflow/project && python processing/silver_to_gold.py",
    )

    load_to_postgres = BashOperator(
        task_id="load_gold_to_postgres",
        bash_command="cd /opt/airflow/project && python warehouse/load_gold_to_postgres.py",
    )

    ingestion >> bronze_to_silver >> data_quality >> silver_to_gold >> load_to_postgres
