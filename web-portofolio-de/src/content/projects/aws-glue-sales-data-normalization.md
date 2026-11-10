---
title: "AWS Glue Visual ETL: Normalisasi Data Penjualan & Pemodelan Star Schema"
description: "Pipeline ETL cloud serverless menggunakan AWS Glue Visual ETL dan Amazon S3 untuk mentransformasi transaksi mentah menjadi model Star Schema dalam format Parquet (Snappy)."
category: "Cloud Data Engineering & ETL"
date: "2026-05-15"
featured: true
order: 5
tags:
  - "AWS Glue"
  - "Amazon S3"
  - "Apache Spark"
  - "Glue Data Catalog"
  - "Star Schema"
  - "Parquet"
  - "ETL Pipeline"
githubUrl: "https://github.com/irfanwdtr/data_engineer/tree/main/AWS/aws-glue-sales-etl"
architectureImage: "/images/projects/project-aws-glue-etl.jpg"
isPlaceholder: false
---

## Detail Proyek

Proyek ini membangun pipeline data ETL *serverless* berbasis cloud AWS untuk mengekstrak data transaksi penjualan mentah dari Amazon S3, menjalankan transformasi data terdistribusi menggunakan engine Apache Spark pada AWS Glue, menormalisasi data ke dalam model **Star Schema**, dan menyimpannya kembali ke S3 dalam format columnar terkompresi **Parquet (Snappy)**.

---

### Alur Arsitektur End-to-End

- **1. Raw Layer (Amazon S3)**:
  - File mentah `sales_data.csv` mendarat di bucket `s3://glue-belajar-irfan/raw/`.
  - Atribut transaksi: `order_id`, `order_date`, `customer_name`, `city`, `product`, `category`, `quantity`, `price`.

- **2. Schema Discovery (AWS Glue Crawler & Data Catalog)**:
  - Glue Crawler memindai folder raw S3 untuk mendeteksi skema tabel secara otomatis.
  - Mendaftarkan metadata ke Glue Data Catalog: Database `db_irfan_belajar` (tabel: `raw`).

- **3. Distributed Transformation (AWS Glue Visual ETL)**:
  - Job visual ETL berbasis Spark membagi pemrosesan menjadi 3 cabang paralel:
    - **`dim_customer`**: Memilih kolom `customer_name` & `city`, lalu menerapkan `DropDuplicates` untuk membentuk dimensi pelanggan unik.
    - **`dim_product`**: Memilih kolom `product` & `category`, lalu menerapkan `DropDuplicates` untuk dimensi produk.
    - **`fact_sales`**: Mengambil transaksi lengkap, menjalankan transformasi SQL query untuk menghitung kolom `total_amount = quantity * price`, dan menyematkan validasi kualitas data (`EvaluateDataQuality`).

- **4. Storage Target (Processed Layer Parquet)**:
  - Menyimpan hasil normalisasi ke Amazon S3 dalam format **Parquet** dengan kompresi **Snappy**:
    - `s3://glue-belajar-irfan/processed/dim_customer/`
    - `s3://glue-belajar-irfan/processed/dim_product/`
    - `s3://glue-belajar-irfan/processed/fact_sales/`

---

### Pemodelan Data (Star Schema)

Arsitektur data dinormalisasi mengikuti metodologi dimensional Kimball:

- **Fact Table (`fact_sales`)**: Berisi detail transaksi, metrik kuantitas (`quantity`), harga (`price`), dan pendapatan (`total_amount`).
- **Dimension Table (`dim_customer`)**: Tabel dimensi referensi entitas pelanggan dan lokasi kota.
- **Dimension Table (`dim_product`)**: Tabel dimensi referensi entitas produk dan kategori barang.

---

### Hasil & Dampak Implementasi

- **Serverless & Scalable**: Tidak memerlukan pengelolaan server fisik; komputasi Spark berjalan otomatis sesuai kebutuhan payload data.
- **Efisiensi Penyimpanan & Biaya**: Format Parquet berbasis kolom (*columnar*) dan kompresi Snappy mereduksi ukuran penyimpanan hingga ~70% dibanding CSV mentah.
- **Kecepatan Query Analitik**: Pemodelan Star Schema mempercepat kinerja query agregasi BI (misal via Amazon Athena atau Power BI).

