---
title: "Sales ETL Automation Scheduler & BI Project (Databricks Lakehouse)"
description: "Implementasi end-to-end data pipeline pada Databricks Lakehouse: ingestion CSV mentah via Unity Catalog Volume, transformasi PySpark, penyimpanan Delta Table, automasi scheduler Databricks Jobs, dan visualisasi Lakeview Dashboard."
category: "Lakehouse & Big Data Engineering"
date: "2026-04-20"
featured: true
order: 4
tags:
  - "Databricks"
  - "PySpark"
  - "Delta Lake"
  - "Unity Catalog"
  - "Databricks Jobs"
  - "SQL"
  - "Lakeview BI"
  - "ETL Pipeline"
githubUrl: "https://github.com/irfanwdtr/data_engineer/tree/main/databricks/etl_automation_scheduler"
architectureImage: "/images/projects/project-databricks-lakehouse.png"
isPlaceholder: false
---

## Detail Proyek

Proyek ini mengimplementasikan data pipeline end-to-end berbasis **Databricks Lakehouse**, mulai dari ingestion file transaksi mentah, transformasi PySpark, penyimpanan berkinerja tinggi dalam format Delta Table, orkestrasi terjadwal, hingga penyajian KPI pada dashboard Business Intelligence (BI).

Arsitektur ini merefleksikan alur kerja modern Data Engineering: **Ingestion $\rightarrow$ Transformation $\rightarrow$ Storage $\rightarrow$ Orchestration $\rightarrow$ Visualization**.

---

### Alur Arsitektur & Komponen Utama

- **1. Raw Layer (Unity Catalog Volume)**:
  - Menyimpan file sumber mentah (`sales.csv`) pada path `/Volumes/workspace/demo_etl/raw/sales.csv`.
  - Berfungsi sebagai landing zone yang dapat diperbarui (*overwrite*) secara berkala saat data transaksi baru tiba.

- **2. Transformation Layer (PySpark Notebook)**:
  - Membaca file CSV dengan opsi inferensi skema otomatis.
  - Melakukan *type casting* (`order_id` ke Long, `order_date` ke Date, `qty` ke Int, `price` ke Double).
  - Menghitung kolom turunan baru: `revenue = qty * price`.
  - Menulis hasil transformasi ke dalam **Delta Table**: `workspace.demo_etl.sales_raw`.

- **3. Job Orchestration (Databricks Jobs)**:
  - Menjalankan notebook ETL secara otomatis menggunakan **Serverless Compute**.
  - Dikonfigurasi dengan scheduler berkala (setiap 1 jam) untuk menjamin pembaruan data secara kontinu.

- **4. SQL Query Layer**:
  - Mengagregasi metrik analitik bisnis langsung di atas Delta Table:
    - **Daily Revenue Trend**: Analisis tren pendapatan harian.
    - **Revenue per Product**: Peringkat performa penjualan per produk.
    - **KPI Summary**: Total transaksi, total kuantitas, total omzet, dan rata-rata nilai order (AOV).

- **5. Visualization Layer (Lakeview Dashboard)**:
  - Menampilkan visualisasi terpadu dalam satu halaman:
    - *Line Chart*: Tren pendapatan harian (*Daily Revenue*).
    - *Bar Chart*: Kontribusi pendapatan per kategori produk.
    - *KPI Cards*: Ringkasan eksekutif total order dan total revenue.
  - Dashboard otomatis diperbarui setiap kali job ETL selesai dijalankan atau dataset di-refresh.

---

### Simulasi Data Inkremental

- Saat file mentah `sales.csv` diperbarui dengan batch data baru, Databricks Job terjadwal secara otomatis memproses perubahan tersebut.
- Data pada Delta Table bertambah secara konsisten dengan integritas ACID transactions, dan dashboard visualisasi langsung merefleksikan angka terkini.

---

### Tumpukan Teknologi

- **Storage & Governance**: Unity Catalog Volume, Delta Table
- **Engine Pemrosesan**: Apache Spark, PySpark (Python)
- **Orkestrasi Alur Kerja**: Databricks Jobs (Serverless)
- **Lapisan Kueri Analitik**: Databricks SQL Editor
- **Business Intelligence**: Databricks Lakeview Dashboard

