# End-to-End Data Engineering Project Menggunakan Microsoft Fabric

## Deskripsi Proyek

Proyek ini merupakan implementasi **End-to-End Data Engineering** menggunakan **Microsoft Fabric**. Data penjualan dari berbagai format file diproses menggunakan arsitektur **Medallion (Bronze → Silver)**, kemudian dimuat ke **Fabric Warehouse** dengan model **Star Schema**, dan divisualisasikan menggunakan **Power BI Dashboard**.

Proyek ini bertujuan untuk mempelajari alur lengkap Data Engineering mulai dari proses ingest data, transformasi, pemodelan data hingga penyajian dashboard interaktif.

---

# Arsitektur Proyek

```text
          Sales Data
(CSV | JSON | Parquet | Excel)
               │
               ▼
      Lakehouse Bronze
               │
     Notebook (PySpark)
               │
               ▼
      Lakehouse Silver
               │
      Data Pipeline (ETL)
               │
               ▼
      Fabric Warehouse
        (Star Schema)
               │
               ▼
       Semantic Model
               │
               ▼
      Power BI Dashboard
```

---

# Teknologi yang Digunakan

| Teknologi | Kegunaan |
|-----------|----------|
| Microsoft Fabric | Platform Data Engineering |
| Lakehouse | Penyimpanan Bronze & Silver |
| PySpark Notebook | ETL & Data Cleaning |
| Data Pipeline | Orkestrasi ETL |
| Fabric Warehouse | Data Warehouse |
| SQL | Pemodelan Data |
| Semantic Model | Data Modeling |
| Power BI | Visualisasi Dashboard |

---

# Dataset

Dataset yang digunakan merupakan dataset penjualan dengan sekitar **400.000 transaksi**.

Format data yang digunakan:

- CSV
- JSON
- Parquet
- Excel

---

# Alur Pengerjaan

## 1. Bronze Layer

Tahap pertama adalah melakukan ingest data mentah ke dalam Lakehouse tanpa mengubah isi data.

Proses yang dilakukan:

- Upload file CSV
- Upload file JSON
- Upload file Parquet
- Upload file Excel
- Menggabungkan seluruh data menjadi satu tabel

Output:

```
bronze_sales
```

---

## 2. Silver Layer

Tahap transformasi data menggunakan Notebook PySpark.

Transformasi yang dilakukan:

- Standarisasi nama kolom
- Mengubah tipe data
- Validasi jumlah data
- Pemeriksaan NULL
- Pemeriksaan Duplicate
- Data Cleaning

Output:

```
silver_sales
```

---

## 3. Data Pipeline

Menggunakan **Fabric Data Pipeline** untuk memindahkan data dari Silver Layer ke Warehouse.

Pipeline:

```
PL_Silver_To_Warehouse
```

Pipeline juga dikonfigurasi menggunakan **Scheduler** sehingga proses ETL dapat berjalan otomatis.

---

## 4. Data Warehouse

Data dimodelkan menggunakan konsep **Star Schema**.

### Fact Table

```
fact_sales
```

### Dimension Table

```
dim_country

dim_product

dim_date
```

---

# Star Schema

```text
             dim_country
                  │
                  │
dim_date ───── fact_sales ───── dim_product
```

---

# Semantic Model

Membuat Semantic Model pada Microsoft Fabric dengan relationship:

- Fact Sales
- Dim Country
- Dim Product
- Dim Date

Relationship menggunakan:

- One-to-Many
- Single Filter Direction

---

# Dashboard

Dashboard dibuat menggunakan Power BI dengan beberapa visual utama:

### KPI

- Total Revenue
- Total Profit
- Total Cost
- Total Units Sold
- Total Order

### Visualisasi

- Revenue Trend
- Top 10 Country
- Top Product
- Revenue berdasarkan Sales Channel
- Detail Transaksi

### Filter (Slicer)

- Tahun
- Negara
- Produk
- Sales Channel

---

# Struktur Folder

```text
Fabric-Sales-Project
│
├── notebooks/
│   ├── NB_01_Bronze_Ingestion
│   └── NB_02_Bronze_To_Silver
│
├── pipeline/
│   └── PL_Silver_To_Warehouse
│
├── sql/
│   ├── dim_country.sql
│   ├── dim_product.sql
│   ├── dim_date.sql
│   └── fact_sales.sql
│
├── screenshots/
│   ├── architecture.png
│   ├── bronze.png
│   ├── silver.png
│   ├── warehouse.png
│   ├── semantic_model.png
│   └── dashboard.png
│
└── README.md
```

---

# Hasil Proyek

Melalui proyek ini berhasil dibuat sebuah solusi Data Engineering end-to-end yang meliputi:

- Ingest data multi-format
- Implementasi Medallion Architecture
- ETL menggunakan PySpark
- Data Cleaning
- Data Pipeline
- Data Warehouse
- Star Schema
- Semantic Model
- Dashboard Interaktif
- Pipeline Scheduler

---

# Pengembangan Selanjutnya

Beberapa pengembangan yang dapat dilakukan:

- Incremental Load
- Slowly Changing Dimension (SCD Type 2)
- Logging ETL
- Data Quality Validation
- Error Handling
- CI/CD Deployment
- Integrasi dengan REST API

---

# Screenshot

## Arsitektur

*(Tambahkan gambar architecture.png di sini)*

## Dashboard

*(Tambahkan screenshot dashboard di sini)*

## Semantic Model

*(Tambahkan screenshot semantic_model.png di sini)*

---

# Penulis

**Irfan Widiantoro**

Proyek Portofolio Data Engineering menggunakan Microsoft Fabric.
