#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  <<-EOSQL
    CREATE USER ${APP_DB_USER} WITH PASSWORD '${APP_DB_PASSWORD}';
    CREATE DATABASE ${APP_DB_NAME} OWNER ${APP_DB_USER};

    CREATE USER ${AIRFLOW_DB_USER} WITH PASSWORD '${AIRFLOW_DB_PASSWORD}';
    CREATE DATABASE ${AIRFLOW_DB_NAME} OWNER ${AIRFLOW_DB_USER};
EOSQL


# 01-create-databases.sh adalah script inisialisasi PostgreSQL yang otomatis membuat dua database terpisah, yaitu stock_intelligence untuk kebutuhan aplikasi Stock Intelligence Platform dan airflow_metadata untuk kebutuhan internal Apache Airflow. Script juga membuat user dan mengatur hak kepemilikan masing-masing database. Script ini dijalankan otomatis oleh Docker saat PostgreSQL pertama kali menginisialisasi direktori data kosong.