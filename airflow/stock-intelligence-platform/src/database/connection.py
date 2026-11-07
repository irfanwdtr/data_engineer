import os

import psycopg2


def get_connection():
    return psycopg2.connect(
        host="postgres",
        port=5432,
        database=os.getenv("APP_DB_NAME"),
        user=os.getenv("APP_DB_USER"),
        password=os.getenv("APP_DB_PASSWORD"),
    )