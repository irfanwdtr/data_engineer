
import os
import logging

import boto3
import pandas as pd
import psycopg2

from dotenv import load_dotenv
from botocore.client import Config
from psycopg2.extras import execute_values

load_dotenv()

# S3 configuration
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET")

# PostgreSQL configuration
POSTGRES_CONFIG = {
    "host": os.getenv("POSTGRES_HOST"),
    "port": os.getenv("POSTGRES_PORT"),
    "database": os.getenv("POSTGRES_DB"),
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD"),
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)


def create_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_DEFAULT_REGION,
        config=Config(signature_version="s3v4")
    )


def read_gold_csv(s3, filename):
    key = f"gold/{filename}"

    response = s3.get_object(
        Bucket=S3_BUCKET,
        Key=key
    )

    logger.info("Reading Gold dataset: %s", key)

    return pd.read_csv(response["Body"])


def load_dataset(cursor, dataframe, table, columns, conflict_keys):
    """Synchronize PostgreSQL table with the latest Gold snapshot."""

    if dataframe.empty:
        raise ValueError(
            f"Gold dataset is empty. Aborting synchronization: {table}"
        )

    clean_df = dataframe[columns].astype(object)
    clean_df = clean_df.where(pd.notna(clean_df), None)

    records = list(
        clean_df.itertuples(index=False, name=None)
    )

    # Delete existing snapshot
    cursor.execute(f"DELETE FROM {table}")
    deleted_rows = cursor.rowcount

    # Insert latest Gold snapshot
    column_sql = ", ".join(columns)

    query = f"""
        INSERT INTO {table} ({column_sql})
        VALUES %s;
    """

    execute_values(
        cursor,
        query,
        records,
        page_size=2000
    )

    logger.info(
        "SYNCED %s | Deleted: %s | Inserted: %s",
        table,
        deleted_rows,
        len(records)
    )


def main():
    logger.info("Starting Gold to PostgreSQL pipeline")

    s3 = create_s3_client()

    datasets = {
        "transaction_summary": read_gold_csv(
            s3, "transaction_summary.csv"
        ),
        "customer_summary": read_gold_csv(
            s3, "customer_summary.csv"
        ),
        "branch_summary": read_gold_csv(
            s3, "branch_summary.csv"
        ),
        "channel_summary": read_gold_csv(
            s3, "channel_summary.csv"
        ),
        "daily_summary": read_gold_csv(
            s3, "daily_summary.csv"
        ),
        "account_summary": read_gold_csv(
            s3, "account_summary.csv"
        )
    }

    # Map Gold columns to PostgreSQL columns
    datasets["customer_summary"] = (
        datasets["customer_summary"].rename(columns={
            "total_amount": "total_transaction_amount",
            "successful_amount": "successful_transaction_amount"
        })
    )

    load_config = [
        {
            "dataset": "transaction_summary",
            "table": "gold_transaction_summary",
            "columns": [
                "transaction_type", "status",
                "total_transactions", "successful_transactions",
                "failed_transactions", "pending_transactions",
                "total_amount", "successful_amount", "average_amount"
            ],
            "keys": ["transaction_type", "status"]
        },
        {
            "dataset": "customer_summary",
            "table": "gold_customer_summary",
            "columns": [
                "customer_id", "customer_name", "city",
                "customer_segment", "total_transactions",
                "successful_transactions", "failed_transactions",
                "pending_transactions", "total_transaction_amount",
                "successful_transaction_amount"
            ],
            "keys": ["customer_id"]
        },
        {
            "dataset": "branch_summary",
            "table": "gold_branch_summary",
            "columns": [
                "branch_id", "branch_name", "city", "branch_type",
                "total_transactions", "successful_transactions",
                "failed_transactions", "pending_transactions",
                "total_amount", "successful_amount"
            ],
            "keys": ["branch_id"]
        },
        {
            "dataset": "channel_summary",
            "table": "gold_channel_summary",
            "columns": [
                "channel", "total_transactions",
                "successful_transactions", "failed_transactions",
                "pending_transactions", "total_amount",
                "successful_amount"
            ],
            "keys": ["channel"]
        },
        {
            "dataset": "daily_summary",
            "table": "gold_daily_summary",
            "columns": [
                "transaction_date", "total_transactions",
                "successful_transactions", "failed_transactions",
                "pending_transactions", "total_amount",
                "successful_amount"
            ],
            "keys": ["transaction_date"]
        },
        {
            "dataset": "account_summary",
            "table": "gold_account_summary",
            "columns": [
                "account_id", "customer_id", "branch_id",
                "account_type", "account_status", "opening_balance",
                "customer_name", "city", "branch_name",
                "total_transactions", "successful_transactions",
                "failed_transactions", "pending_transactions",
                "total_amount", "successful_amount"
            ],
            "keys": ["account_id"]
        }
    ]

    connection = None

    try:
        connection = psycopg2.connect(**POSTGRES_CONFIG)

        # All six tables synchronize in one transaction
        with connection:
            with connection.cursor() as cursor:
                for config in load_config:
                    load_dataset(
                        cursor=cursor,
                        dataframe=datasets[config["dataset"]],
                        table=config["table"],
                        columns=config["columns"],
                        conflict_keys=config["keys"]
                    )

        logger.info("====================================")
        logger.info("GOLD TO POSTGRESQL LOAD COMPLETED")

        for config in load_config:
            logger.info(
                "%s: %s rows",
                config["table"],
                len(datasets[config["dataset"]])
            )

        logger.info("====================================")

    except Exception:
        logger.exception("Failed loading Gold datasets")
        raise

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    main()
