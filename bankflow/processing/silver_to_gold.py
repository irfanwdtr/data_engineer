
import os
import logging
from io import BytesIO

import boto3
import pandas as pd
from dotenv import load_dotenv
from botocore.client import Config

load_dotenv()

S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET")

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


def read_silver(s3, filename):
    key = f"silver/{filename}"

    response = s3.get_object(
        Bucket=S3_BUCKET,
        Key=key
    )

    logger.info("Reading Silver: %s", key)

    return pd.read_csv(response["Body"])


def add_transaction_metrics(grouped):
    """Add transaction counts and amounts by status."""

    return grouped.agg(
        total_transactions=("transaction_id", "count"),
        successful_transactions=(
            "status", lambda x: (x == "SUCCESS").sum()
        ),
        failed_transactions=(
            "status", lambda x: (x == "FAILED").sum()
        ),
        pending_transactions=(
            "status", lambda x: (x == "PENDING").sum()
        ),
        total_amount=("amount", "sum"),
        successful_amount=(
            "amount",
            lambda x: x[grouped.obj.loc[x.index, "status"] == "SUCCESS"].sum()
        )
    ).reset_index()


def create_transaction_summary(transactions):
    logger.info("Creating transaction summary")

    summary = (
        add_transaction_metrics(
            transactions.groupby(
                ["transaction_type", "status"]
            )
        )
    )

    averages = (
        transactions.groupby(
            ["transaction_type", "status"]
        )["amount"]
        .mean()
        .reset_index(name="average_amount")
    )

    summary = summary.merge(
        averages,
        on=["transaction_type", "status"],
        how="left"
    )

    numeric_columns = [
        "total_amount", "successful_amount", "average_amount"
    ]

    summary[numeric_columns] = summary[numeric_columns].round(2)

    return summary


def create_customer_summary(transactions, customers):
    logger.info("Creating customer summary")

    summary = add_transaction_metrics(
        transactions.groupby("customer_id")
    )

    summary = summary.merge(
        customers[
            ["customer_id", "customer_name", "city", "customer_segment"]
        ],
        on="customer_id",
        how="left",
        validate="one_to_one"
    )

    summary["total_amount"] = summary["total_amount"].round(2)
    summary["successful_amount"] = summary["successful_amount"].round(2)

    return summary


def create_branch_summary(transactions, branches):
    logger.info("Creating branch summary")

    summary = add_transaction_metrics(
        transactions.groupby("branch_id")
    )

    summary = summary.merge(
        branches[
            ["branch_id", "branch_name", "city", "branch_type"]
        ],
        on="branch_id",
        how="left",
        validate="one_to_one"
    )

    summary["total_amount"] = summary["total_amount"].round(2)
    summary["successful_amount"] = summary["successful_amount"].round(2)

    return summary


def create_channel_summary(transactions):
    logger.info("Creating channel summary")

    summary = add_transaction_metrics(
        transactions.groupby("channel")
    )

    summary["total_amount"] = summary["total_amount"].round(2)
    summary["successful_amount"] = summary["successful_amount"].round(2)

    return summary


def create_daily_summary(transactions):
    logger.info("Creating daily summary")

    df = transactions.copy()

    df["transaction_date"] = pd.to_datetime(
        df["transaction_date"],
        errors="raise"
    ).dt.date

    summary = add_transaction_metrics(
        df.groupby("transaction_date")
    )

    summary["total_amount"] = summary["total_amount"].round(2)
    summary["successful_amount"] = summary["successful_amount"].round(2)

    return summary


def create_account_summary(transactions, accounts, customers, branches):
    logger.info("Creating account summary")

    summary = add_transaction_metrics(
        transactions.groupby("account_id")
    )

    summary = summary.merge(
        accounts[
            [
                "account_id", "customer_id", "branch_id",
                "account_type", "account_status", "opening_balance"
            ]
        ],
        on="account_id",
        how="left",
        validate="one_to_one"
    )

    summary = summary.merge(
        customers[
            ["customer_id", "customer_name", "city"]
        ],
        on="customer_id",
        how="left",
        validate="many_to_one"
    )

    summary = summary.merge(
        branches[
            ["branch_id", "branch_name"]
        ],
        on="branch_id",
        how="left",
        validate="many_to_one"
    )

    summary["total_amount"] = summary["total_amount"].round(2)
    summary["successful_amount"] = summary["successful_amount"].round(2)

    return summary


def upload_gold(s3, dataframe, filename):
    buffer = BytesIO()

    dataframe.to_csv(
        buffer,
        index=False,
        encoding="utf-8"
    )

    buffer.seek(0)

    object_key = f"gold/{filename}"

    s3.upload_fileobj(
        buffer,
        S3_BUCKET,
        object_key
    )

    logger.info(
        "Uploaded: s3://%s/%s | Rows: %s",
        S3_BUCKET,
        object_key,
        len(dataframe)
    )


def main():
    logger.info("Starting Silver to Gold pipeline")

    s3 = create_s3_client()

    # Read all Silver datasets
    transactions = read_silver(s3, "transactions.csv")
    customers = read_silver(s3, "customers.csv")
    accounts = read_silver(s3, "accounts.csv")
    branches = read_silver(s3, "branches.csv")

    # Normalize transaction date
    transactions["transaction_date"] = pd.to_datetime(
        transactions["transaction_date"],
        errors="raise"
    )

    # Generate Gold datasets
    gold_datasets = {
        "transaction_summary.csv": create_transaction_summary(
            transactions
        ),
        "customer_summary.csv": create_customer_summary(
            transactions, customers
        ),
        "branch_summary.csv": create_branch_summary(
            transactions, branches
        ),
        "channel_summary.csv": create_channel_summary(
            transactions
        ),
        "daily_summary.csv": create_daily_summary(
            transactions
        ),
        "account_summary.csv": create_account_summary(
            transactions, accounts, customers, branches
        )
    }

    # Upload all Gold datasets
    for filename, dataframe in gold_datasets.items():
        upload_gold(s3, dataframe, filename)

    logger.info("====================================")
    logger.info("GOLD LAYER PIPELINE COMPLETED")

    for filename, dataframe in gold_datasets.items():
        logger.info("%s: %s rows", filename, len(dataframe))

    logger.info("====================================")


if __name__ == "__main__":
    main()
