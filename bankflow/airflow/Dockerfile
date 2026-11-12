FROM apache/airflow:2.10.5-python3.11

USER airflow

RUN pip install --no-cache-dir \
    boto3==1.44.1 \
    pandas==2.2.3 \
    psycopg2-binary==2.9.10 \
    python-dotenv==1.0.1