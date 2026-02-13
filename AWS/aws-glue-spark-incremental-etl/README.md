# AWS Glue Incremental ETL Project

##  Project Overview

Project ini merupakan implementasi **Incremental ETL Pipeline** menggunakan AWS Glue (Spark) untuk membangun arsitektur sederhana Data Lake dengan pendekatan Star Schema.

Pipeline ini melakukan:

- Membaca data mentah harian (raw layer)
- Transformasi data
- Membuat Fact dan Dimension tables
- Menyimpan hasil ke S3 dalam format Parquet ter-partition
- Menggunakan parameter runtime untuk incremental processing

---

#  Architecture

## High Level Flow

```
External System
        ↓
S3 (raw layer)
        ↓
AWS Glue Script (ETL)
        ↓
S3 (processed layer)
        ↓
Athena / BI / Analytics
```

---

#  S3 Structure

## Raw Layer (Landing Zone)

```
s3://glue-belajar-irfan/
├── raw/
│   └── sales/
│       ├── 2026-02-11/
│       │   └── sales_data.csv
│       ├── 2026-02-12/
│       │   └── sales_data.csv
│       └── 2026-02-13/
│           └── sales_data.csv
│
├── processed/
│   ├── dim_customer/
│   ├── dim_product/
│   └── fact_sales/
│       └── year=2026/month=02/day=13/part-*.parquet
│
└── logs/
    └── glue/
```

Data mentah masuk per tanggal:

```
s3://glue-belajar-irfan/raw/sales/YYYY-MM-DD/sales_data.csv
```

Contoh:

```
raw/sales/2024-02-11/sales_data.csv
raw/sales/2024-02-12/sales_data.csv
raw/sales/2024-02-13/sales_data.csv
```

Raw layer tidak dimodifikasi.

---

## Processed Layer (Curated Zone)

```
processed/
│
├── dim_customer/
├── dim_product/
└── fact_sales/
    └── year=YYYY/month=M/day=D/
```

Fact table dipartition berdasarkan:
- year
- month
- day

---

#  ETL Logic

## 1️ Extract

Glue membaca file berdasarkan parameter:

```
--processing_date = YYYY-MM-DD
```

Path input dibentuk secara dinamis:

```python
input_path = f"s3://bucket/raw/sales/{processing_date}/sales_data.csv"
```

Hanya folder tanggal tersebut yang diproses (incremental).

---

## 2️ Transform

### Data Cleaning
- Cast `order_date` menjadi tipe date

### Business Logic
- Hitung `total_amount = quantity * price`

### Partition Columns
- year(order_date)
- month(order_date)
- day(order_date)

---

## 3️ Dimension Tables

### dim_customer
Kolom:
- customer_name
- city

Logic:
- DropDuplicates()

### dim_product
Kolom:
- product
- category

Logic:
- DropDuplicates()

Disimpan dalam format Parquet (append mode).

---

## 4️ Fact Table

Kolom utama:
- order_id
- order_date
- customer_name
- product
- quantity
- price
- total_amount
- year
- month
- day

Disimpan dengan:
- Format: Parquet
- Mode: Append
- Partition: year, month, day

---

#  Glue Job Configuration

## Engine
- Spark

## Language
- Python

## Runtime Parameter

```
--processing_date
```

Contoh:

```
--processing_date = 2024-02-13
```

Parameter ini menentukan folder raw mana yang akan diproses.

---

#  Incremental Processing Strategy

Pipeline ini menggunakan pendekatan:

> Folder-based incremental

Setiap run hanya membaca folder tanggal tertentu.

Keuntungan:
- Tidak memproses ulang seluruh data
- Lebih efisien
- Lebih hemat biaya scan S3
- Production-ready pattern

---

#  Data Warehouse Design

## Star Schema

### Fact Table
- fact_sales

### Dimension Tables
- dim_customer
- dim_product

Fact menyimpan measure:
- quantity
- price
- total_amount

Dimension menyimpan atribut deskriptif.

---

#  Key Concepts Implemented

- Incremental ETL
- Parameterized Glue Job
- Spark DataFrame API
- Parquet Format
- Partitioned Storage
- Star Schema Modeling
- Raw vs Processed Layer Separation

---


#  Conclusion

Project ini menunjukkan implementasi lengkap:

- End-to-end ETL menggunakan AWS Glue Script
- Incremental data processing
- Data Lake layering (raw → processed)
- Star schema modeling
- Partitioned Parquet storage

# Tech Stack
- AWS Glue
- Pyspark
- Amazon S3
- ChatGpt ( untuk penyempurnaan kode & dokumentasi )
