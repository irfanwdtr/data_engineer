
import os
import json
import logging
from io import BytesIO
from pathlib import Path
from datetime import datetime, timezone

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

SILVER_PREFIX = "silver"
REPORT_KEY = "quality/reports/quality_report.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)

checks = []


def create_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_DEFAULT_REGION,
        config=Config(signature_version="s3v4")
    )


def read_silver_csv(s3, filename):
    key = f"{SILVER_PREFIX}/{filename}"

    response = s3.get_object(
        Bucket=S3_BUCKET,
        Key=key
    )

    logger.info("Reading Silver: %s", key)

    return pd.read_csv(response["Body"])


def add_check(name, passed, failed_records, details):
    checks.append({
        "check_name": name,
        "status": "PASS" if passed else "FAIL",
        "failed_records": int(failed_records),
        "details": details
    })

    logger.info(
        "%s | %s | Failed records: %s",
        "PASS" if passed else "FAIL",
        name,
        failed_records
    )


def check_required_columns(df, required, dataset):
    missing = [col for col in required if col not in df.columns]

    add_check(
        f"{dataset}_required_columns",
        len(missing) == 0,
        len(missing),
        f"Missing columns: {missing}"
    )

    return len(missing) == 0


def check_required_fields(df, required, dataset):
    invalid = df[required].isna().any(axis=1)

    for col in required:
        invalid |= (
            df[col].astype("string").str.strip().eq("").fillna(True)
        )

    add_check(
        f"{dataset}_required_fields",
        not invalid.any(),
        invalid.sum(),
        "Required fields must not be null or empty"
    )


def check_unique_id(df, column, dataset):
    duplicates = df[column].duplicated(keep=False)

    add_check(
        f"unique_{dataset}_id",
        not duplicates.any(),
        duplicates.sum(),
        f"{column} must be unique"
    )


def check_branches(df):
    required = [
        "branch_id",
        "branch_name",
        "city",
        "branch_type"
    ]

    if not check_required_columns(df, required, "branch"):
        return

    check_required_fields(df, required, "branch")
    check_unique_id(df, "branch_id", "branch")


def check_customers(df):
    required = [
        "customer_id",
        "customer_name",
        "gender",
        "city",
        "registration_date",
        "customer_segment"
    ]

    if not check_required_columns(df, required, "customer"):
        return

    check_required_fields(df, required, "customer")
    check_unique_id(df, "customer_id", "customer")

    valid_gender = df["gender"].isin(["M", "F"])

    add_check(
        "valid_customer_gender",
        valid_gender.all(),
        (~valid_gender).sum(),
        "Gender must be M or F"
    )

    valid_segment = df["customer_segment"].isin([
        "REGULAR", "PREMIUM", "PRIORITY"
    ])

    add_check(
        "valid_customer_segment",
        valid_segment.all(),
        (~valid_segment).sum(),
        "Customer segment must be REGULAR, PREMIUM, or PRIORITY"
    )

    registration_date = pd.to_datetime(
        df["registration_date"],
        errors="coerce"
    )

    invalid_date = registration_date.isna()

    add_check(
        "valid_customer_registration_date",
        not invalid_date.any(),
        invalid_date.sum(),
        "Registration date must be valid"
    )


def check_accounts(df):
    required = [
        "account_id",
        "customer_id",
        "branch_id",
        "account_type",
        "account_status",
        "opening_balance"
    ]

    if not check_required_columns(df, required, "account"):
        return

    check_required_fields(df, required, "account")
    check_unique_id(df, "account_id", "account")

    valid_types = df["account_type"].isin([
        "SAVINGS", "CURRENT", "PAYROLL"
    ])

    add_check(
        "valid_account_type",
        valid_types.all(),
        (~valid_types).sum(),
        "Account type must be SAVINGS, CURRENT, or PAYROLL"
    )

    valid_status = df["account_status"].isin([
        "ACTIVE", "INACTIVE"
    ])

    add_check(
        "valid_account_status",
        valid_status.all(),
        (~valid_status).sum(),
        "Account status must be ACTIVE or INACTIVE"
    )

    balance = pd.to_numeric(
        df["opening_balance"],
        errors="coerce"
    )

    invalid_balance = balance.isna() | (balance < 0)

    add_check(
        "valid_account_opening_balance",
        not invalid_balance.any(),
        invalid_balance.sum(),
        "Opening balance must be numeric and non-negative"
    )


def check_transactions(df):
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

    if not check_required_columns(df, required, "transaction"):
        return

    check_required_fields(df, required, "transaction")
    check_unique_id(df, "transaction_id", "transaction")

    amount = pd.to_numeric(
        df["amount"],
        errors="coerce"
    )

    invalid_amount = amount.isna() | (amount <= 0)

    add_check(
        "valid_transaction_amount",
        not invalid_amount.any(),
        invalid_amount.sum(),
        "Transaction amount must be numeric and greater than zero"
    )

    valid_status = df["status"].isin([
        "SUCCESS", "FAILED", "PENDING"
    ])

    add_check(
        "valid_transaction_status",
        valid_status.all(),
        (~valid_status).sum(),
        "Allowed values: SUCCESS, FAILED, PENDING"
    )

    valid_types = df["transaction_type"].isin([
        "TRANSFER", "WITHDRAWAL", "DEPOSIT",
        "PAYMENT", "PURCHASE"
    ])

    add_check(
        "valid_transaction_type",
        valid_types.all(),
        (~valid_types).sum(),
        "Transaction type must be valid"
    )

    valid_channels = df["channel"].isin([
        "MOBILE_BANKING", "ATM",
        "BRANCH", "INTERNET_BANKING"
    ])

    add_check(
        "valid_transaction_channel",
        valid_channels.all(),
        (~valid_channels).sum(),
        "Transaction channel must be valid"
    )

    transaction_date = pd.to_datetime(
        df["transaction_date"],
        errors="coerce"
    )

    invalid_date = transaction_date.isna()

    add_check(
        "valid_transaction_date",
        not invalid_date.any(),
        invalid_date.sum(),
        "Transaction date must be valid"
    )


def check_foreign_keys(
    accounts,
    transactions,
    customers,
    branches
):
    customer_ids = set(customers["customer_id"].astype(str))
    branch_ids = set(branches["branch_id"].astype(str))
    account_ids = set(accounts["account_id"].astype(str))

    # Account -> Customer
    invalid_account_customer = ~accounts[
        "customer_id"
    ].astype(str).isin(customer_ids)

    add_check(
        "account_customer_reference",
        not invalid_account_customer.any(),
        invalid_account_customer.sum(),
        "Every account must reference an existing customer"
    )

    # Account -> Branch
    invalid_account_branch = ~accounts[
        "branch_id"
    ].astype(str).isin(branch_ids)

    add_check(
        "account_branch_reference",
        not invalid_account_branch.any(),
        invalid_account_branch.sum(),
        "Every account must reference an existing branch"
    )

    # Transaction -> Account
    invalid_transaction_account = ~transactions[
        "account_id"
    ].astype(str).isin(account_ids)

    add_check(
        "transaction_account_reference",
        not invalid_transaction_account.any(),
        invalid_transaction_account.sum(),
        "Every transaction must reference an existing account"
    )

    # Validate transaction against actual account ownership.
    account_mapping = accounts.set_index("account_id")[
        ["customer_id", "branch_id"]
    ]

    mapped = transactions.join(
        account_mapping,
        on="account_id",
        rsuffix="_account"
    )

    invalid_customer = (
        mapped["customer_id"] != mapped["customer_id_account"]
    )

    invalid_branch = (
        mapped["branch_id"] != mapped["branch_id_account"]
    )

    add_check(
        "transaction_customer_account_consistency",
        not invalid_customer.any(),
        invalid_customer.sum(),
        "Transaction customer must match account ownership"
    )

    add_check(
        "transaction_branch_account_consistency",
        not invalid_branch.any(),
        invalid_branch.sum(),
        "Transaction branch must match account branch"
    )


def save_report(s3):
    total = len(checks)

    passed = sum(
        check["status"] == "PASS"
        for check in checks
    )

    failed = total - passed

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "overall_status": "PASS" if failed == 0 else "FAIL",
        "summary": {
            "total_checks": total,
            "passed": passed,
            "failed": failed
        },
        "checks": checks
    }

    report_dir = Path("data_quality/reports")
    report_dir.mkdir(parents=True, exist_ok=True)

    report_path = report_dir / "quality_report.json"

    with open(report_path, "w", encoding="utf-8") as file:
        json.dump(
            report,
            file,
            indent=4,
            ensure_ascii=False
        )

    report_buffer = BytesIO(
        json.dumps(
            report,
            indent=4,
            ensure_ascii=False
        ).encode("utf-8")
    )

    s3.upload_fileobj(
        report_buffer,
        S3_BUCKET,
        REPORT_KEY
    )

    logger.info("Local report: %s", report_path)
    logger.info("S3 report: s3://%s/%s", S3_BUCKET, REPORT_KEY)

    logger.info(
        "QUALITY SUMMARY | Total: %s | Passed: %s | Failed: %s",
        total,
        passed,
        failed
    )

    return failed


def main():
    logger.info("Starting BankFlow Data Quality Checks")

    s3 = create_s3_client()

    branches = read_silver_csv(s3, "branches.csv")
    customers = read_silver_csv(s3, "customers.csv")
    accounts = read_silver_csv(s3, "accounts.csv")
    transactions = read_silver_csv(s3, "transactions.csv")

    check_branches(branches)
    check_customers(customers)
    check_accounts(accounts)
    check_transactions(transactions)

    check_foreign_keys(
        accounts,
        transactions,
        customers,
        branches
    )

    failed = save_report(s3)

    logger.info("DATA QUALITY MONITORING COMPLETED")

    if failed > 0:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
