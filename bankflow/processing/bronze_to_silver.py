
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

BRONZE_PREFIX = "bronze"
SILVER_PREFIX = "silver"

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


def read_csv_from_bronze(s3, filename):
    object_key = f"{BRONZE_PREFIX}/{filename}"

    response = s3.get_object(
        Bucket=S3_BUCKET,
        Key=object_key
    )

    logger.info("Reading Bronze: %s", object_key)

    return pd.read_csv(response["Body"])


def clean_branches(df):
    required = [
        "branch_id",
        "branch_name",
        "city",
        "branch_type"
    ]

    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"Missing branch columns: {missing}")

    initial = len(df)
    df = df.copy()

    for col in required:
        df[col] = df[col].astype("string").str.strip()

    df = df.dropna(subset=required)
    df = df[~df[required].eq("").any(axis=1)]
    df["branch_type"] = df["branch_type"].str.upper()

    df = df.drop_duplicates(
        subset=["branch_id"],
        keep="first"
    )

    logger.info("Branches: %s -> %s rows", initial, len(df))
    return df


def clean_customers(df):
    required = [
        "customer_id",
        "customer_name",
        "gender",
        "city",
        "registration_date",
        "customer_segment"
    ]

    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"Missing customer columns: {missing}")

    initial = len(df)
    df = df.copy()

    for col in [
        "customer_id",
        "customer_name",
        "gender",
        "city",
        "customer_segment"
    ]:
        df[col] = df[col].astype("string").str.strip()

    df["gender"] = df["gender"].str.upper()
    df["customer_segment"] = df["customer_segment"].str.upper()
    df["registration_date"] = pd.to_datetime(
        df["registration_date"],
        errors="coerce"
    )

    df = df.dropna(subset=required)
    df = df[~df[required].astype("string").eq("").any(axis=1)]
    df = df[df["gender"].isin(["M", "F"])]
    df = df[df["customer_segment"].isin([
        "REGULAR", "PREMIUM", "PRIORITY"
    ])]

    df = df.drop_duplicates(
        subset=["customer_id"],
        keep="first"
    )

    logger.info("Customers: %s -> %s rows", initial, len(df))
    return df


def clean_accounts(df):
    required = [
        "account_id",
        "customer_id",
        "branch_id",
        "account_type",
        "account_status",
        "opening_balance"
    ]

    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"Missing account columns: {missing}")

    initial = len(df)
    df = df.copy()

    for col in [
        "account_id",
        "customer_id",
        "branch_id",
        "account_type",
        "account_status"
    ]:
        df[col] = df[col].astype("string").str.strip()

    df["account_type"] = df["account_type"].str.upper()
    df["account_status"] = df["account_status"].str.upper()
    df["opening_balance"] = pd.to_numeric(
        df["opening_balance"],
        errors="coerce"
    )

    df = df.dropna(subset=required)
    df = df[~df[required].astype("string").eq("").any(axis=1)]
    df = df[df["opening_balance"] >= 0]
    df = df[df["account_type"].isin([
        "SAVINGS", "CURRENT", "PAYROLL"
    ])]
    df = df[df["account_status"].isin([
        "ACTIVE", "INACTIVE"
    ])]

    df = df.drop_duplicates(
        subset=["account_id"],
        keep="first"
    )

    logger.info("Accounts: %s -> %s rows", initial, len(df))
    return df


def clean_transactions(df):
    required = [
        "transaction_id",
        "account_id",
        "customer_id",
        "branch_id",
        "transaction_date",
        "transaction_type",
        "amount",
        "status",
        "channel"
    ]

    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f"Missing transaction columns: {missing}")

    initial = len(df)
    df = df.copy()

    for col in [
        "transaction_id",
        "account_id",
        "customer_id",
        "branch_id",
        "transaction_type",
        "status",
        "channel"
    ]:
        df[col] = df[col].astype("string").str.strip()

    df["transaction_type"] = df["transaction_type"].str.upper()
    df["status"] = df["status"].str.upper()
    df["channel"] = df["channel"].str.upper()

    df["amount"] = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    df["transaction_date"] = pd.to_datetime(
        df["transaction_date"],
        errors="coerce"
    )

    df = df.dropna(subset=required)
    df = df[~df[required].astype("string").eq("").any(axis=1)]
    df = df[df["amount"] > 0]

    df = df[df["status"].isin([
        "SUCCESS", "FAILED", "PENDING"
    ])]

    df = df[df["transaction_type"].isin([
        "TRANSFER", "WITHDRAWAL", "DEPOSIT",
        "PAYMENT", "PURCHASE"
    ])]

    df = df[df["channel"].isin([
        "MOBILE_BANKING", "ATM",
        "BRANCH", "INTERNET_BANKING"
    ])]

    df = df.drop_duplicates(
        subset=["transaction_id"],
        keep="first"
    )

    logger.info("Transactions: %s -> %s rows", initial, len(df))
    return df


def validate_relationships(
    customers,
    branches,
    accounts,
    transactions
):
    """Remove records with invalid foreign-key relationships."""

    valid_customers = set(customers["customer_id"])
    valid_branches = set(branches["branch_id"])

    initial_accounts = len(accounts)

    accounts = accounts[
        accounts["customer_id"].isin(valid_customers)
        & accounts["branch_id"].isin(valid_branches)
    ].copy()

    logger.info(
        "Account relationship validation: %s -> %s rows",
        initial_accounts,
        len(accounts)
    )

    valid_accounts = set(accounts["account_id"])

    # Map account ID to its actual customer and branch.
    account_mapping = accounts.set_index("account_id")[
        ["customer_id", "branch_id"]
    ]

    initial_transactions = len(transactions)

    transactions = transactions[
        transactions["account_id"].isin(valid_accounts)
        & transactions["customer_id"].isin(valid_customers)
    ].copy()

    transactions = transactions.join(
        account_mapping,
        on="account_id",
        rsuffix="_account"
    )

    transactions = transactions[
        (transactions["customer_id"] == transactions["customer_id_account"])
        & (transactions["branch_id"] == transactions["branch_id_account"])
    ].copy()

    transactions = transactions.drop(
        columns=["customer_id_account", "branch_id_account"]
    )

    logger.info(
        "Transaction relationship validation: %s -> %s rows",
        initial_transactions,
        len(transactions)
    )

    return accounts, transactions


def upload_to_silver(s3, df, filename):
    buffer = BytesIO()

    df.to_csv(
        buffer,
        index=False,
        encoding="utf-8"
    )

    buffer.seek(0)

    object_key = f"{SILVER_PREFIX}/{filename}"

    s3.upload_fileobj(
        buffer,
        S3_BUCKET,
        object_key
    )

    logger.info(
        "Silver uploaded: s3://%s/%s | Rows: %s",
        S3_BUCKET,
        object_key,
        len(df)
    )


def main():
    logger.info("Starting Bronze to Silver pipeline")

    s3 = create_s3_client()

    # Read Bronze datasets
    branches = read_csv_from_bronze(s3, "branches.csv")
    customers = read_csv_from_bronze(s3, "customers.csv")
    accounts = read_csv_from_bronze(s3, "accounts.csv")
    transactions = read_csv_from_bronze(s3, "transactions.csv")

    # Clean datasets
    branches_clean = clean_branches(branches)
    customers_clean = clean_customers(customers)
    accounts_clean = clean_accounts(accounts)
    transactions_clean = clean_transactions(transactions)

    # Validate relationships
    accounts_clean, transactions_clean = validate_relationships(
        customers_clean,
        branches_clean,
        accounts_clean,
        transactions_clean
    )

    # Upload all Silver datasets
    datasets = {
        "branches.csv": branches_clean,
        "customers.csv": customers_clean,
        "accounts.csv": accounts_clean,
        "transactions.csv": transactions_clean
    }

    for filename, dataframe in datasets.items():
        upload_to_silver(s3, dataframe, filename)

    logger.info("====================================")
    logger.info("BRONZE TO SILVER COMPLETED")
    logger.info("Branches: %s", len(branches_clean))
    logger.info("Customers: %s", len(customers_clean))
    logger.info("Accounts: %s", len(accounts_clean))
    logger.info("Transactions: %s", len(transactions_clean))
    logger.info("====================================")


if __name__ == "__main__":
    main()
