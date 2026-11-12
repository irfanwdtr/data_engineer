import os
import boto3
import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv()

s3 = boto3.client(
    "s3",
    endpoint_url=os.getenv("S3_ENDPOINT_URL"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
)

gold = pd.read_csv(
    s3.get_object(
        Bucket=os.getenv("S3_BUCKET"),
        Key="gold/customer_summary.csv"
    )["Body"],
    usecols=["customer_id"]
)

gold_ids = set(gold["customer_id"].astype(str))

conn = psycopg2.connect(
    host=os.getenv("POSTGRES_HOST"),
    port=os.getenv("POSTGRES_PORT"),
    dbname=os.getenv("POSTGRES_DB"),
    user=os.getenv("POSTGRES_USER"),
    password=os.getenv("POSTGRES_PASSWORD"),
)

with conn.cursor() as cur:
    cur.execute("SELECT customer_id FROM gold_customer_summary")
    db_ids = {row[0] for row in cur.fetchall()}

conn.close()

stale_ids = db_ids - gold_ids

print(f"Gold customers     : {len(gold_ids)}")
print(f"PostgreSQL customers: {len(db_ids)}")
print(f"Stale customers    : {len(stale_ids)}")
print("\nCustomer yang tidak ada di Gold:")

for customer_id in sorted(stale_ids):
    print(customer_id)
