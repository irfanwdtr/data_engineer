
import os
import logging
from pathlib import Path

import boto3
from dotenv import load_dotenv
from botocore.client import Config

# Load environment variables
load_dotenv()

# Configuration
S3_ENDPOINT_URL = os.getenv("S3_ENDPOINT_URL")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
S3_BUCKET = os.getenv("S3_BUCKET")

SOURCE_DIR = Path("data/generated")
BRONZE_PREFIX = "bronze"

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

logger = logging.getLogger(__name__)


def create_s3_client():
    """Create connection to S3-compatible object storage."""

    required = {
        "S3_ENDPOINT_URL": S3_ENDPOINT_URL,
        "AWS_ACCESS_KEY_ID": AWS_ACCESS_KEY_ID,
        "AWS_SECRET_ACCESS_KEY": AWS_SECRET_ACCESS_KEY,
        "S3_BUCKET": S3_BUCKET,
    }

    missing = [key for key, value in required.items() if not value]

    if missing:
        raise ValueError(f"Missing environment variables: {missing}")

    return boto3.client(
        "s3",
        endpoint_url=S3_ENDPOINT_URL,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_DEFAULT_REGION,
        config=Config(signature_version="s3v4")
    )


def upload_files():
    """Find and upload all CSV files to Bronze Layer."""

    s3 = create_s3_client()

    if not SOURCE_DIR.exists():
        raise FileNotFoundError(
            f"Source directory not found: {SOURCE_DIR.resolve()}"
        )

    csv_files = list(SOURCE_DIR.rglob("*.csv"))

    if not csv_files:
        raise FileNotFoundError(
            f"No CSV files found in {SOURCE_DIR.resolve()}"
        )

    logger.info("Found %s CSV file(s)", len(csv_files))

    success_count = 0
    failed_count = 0

    for file_path in csv_files:
        relative_path = file_path.relative_to(SOURCE_DIR)
        object_key = f"{BRONZE_PREFIX}/{relative_path.as_posix()}"

        try:
            s3.upload_file(
                str(file_path),
                S3_BUCKET,
                object_key
            )

            logger.info(
                "SUCCESS: %s -> s3://%s/%s",
                file_path,
                S3_BUCKET,
                object_key
            )

            success_count += 1

        except Exception:
            logger.exception("FAILED uploading %s", file_path)
            failed_count += 1

    logger.info(
        "INGESTION SUMMARY | Success: %s | Failed: %s",
        success_count,
        failed_count
    )

    # Fail the pipeline if any file upload fails
    if failed_count > 0:
        raise RuntimeError(
            f"Ingestion failed: {failed_count} file(s) could not be uploaded"
        )

    logger.info("INGESTION COMPLETED SUCCESSFULLY")


if __name__ == "__main__":
    upload_files()
