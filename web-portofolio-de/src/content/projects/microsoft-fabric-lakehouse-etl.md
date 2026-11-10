---
title: "End-to-End Data Engineering & Lakehouse: Microsoft Fabric & Power BI"
description: "Pipeline data end-to-end skala enterprise menggunakan Microsoft Fabric: ingesti 400.000+ data penjualan multi-format, transformasi Medallion Architecture (Bronze ke Silver) via PySpark, pemodelan Star Schema di Fabric Warehouse, dan dashboard Power BI."
category: "Cloud Data Platform & Lakehouse"
date: "2026-09-01"
featured: true
order: 7
tags:
  - "Microsoft Fabric"
  - "Lakehouse"
  - "Fabric Warehouse"
  - "PySpark"
  - "Medallion Architecture"
  - "Star Schema"
  - "Data Pipeline"
  - "Semantic Model"
  - "Power BI"
  - "SQL"
githubUrl: "https://github.com/irfanwdtr/data_engineer"
architectureImage: "/images/projects/project-fabric-lakehouse.jpg"
projectType: "Personal / Lab Project"
isPlaceholder: false
---

## Detail Proyek

Proyek ini merekayasa arsitektur **End-to-End Data Engineering** modern berbasis platform cloud **Microsoft Fabric**. Sistem ini memproses lebih dari **400.000 baris transaksi penjualan** dari berbagai format file mentah, mengimplementasikan **Medallion Architecture**, memodelkan data warehouse ke dalam **Star Schema**, dan menyajikan dashboard analitik eksekutif menggunakan **Power BI**.

---

### Alur Arsitektur & Medallion Pipeline

```
[ Sales Data Multi-Format ] (CSV, JSON, Parquet, Excel ~400k baris)
            │
            ▼
[ Lakehouse Bronze ]        ──> Ingesti data mentah tanpa perubahan (bronze_sales)
            │
    (Notebook PySpark)      ──> Data cleaning, standardisasi kolom, penanganan NULL & duplikat
            │
            ▼
[ Lakehouse Silver ]        ──> Data bersih tervalidasi siap konsumsi (silver_sales)
            │
  (Fabric Data Pipeline)    ──> Orkestrasi ETL terjadwal (PL_Silver_To_Warehouse)
            │
            ▼
[ Fabric Warehouse ]        ──> Pemodelan analitik Star Schema (fact_sales & dimensions)
            │
            ▼
[ Semantic Model ]          ──> Relasi One-to-Many & Single Filter Direction
            │
            ▼
[ Power BI Dashboard ]      ──> Visualisasi KPI interaktif & laporan tren performa
```

---

### Komponen & Tahapan Rekayasa Data

1. **Bronze Layer (Raw Ingestion)**:
   - Mengonsolidasi data transaksi penjualan multi-format (CSV, JSON, Parquet, dan Excel) ke dalam satu wadah Lakehouse terpusat.
   - Menggabungkan data mentah ke dalam tabel `bronze_sales` dengan mempertahankan format aslinya (*lossless storage*).

2. **Silver Layer (PySpark Transformation)**:
   - Standarisasi penamaan kolom dan *type casting* skema data.
   - Pembersihan data mendalam: eliminasi data duplikat, validasi nilai kosong/NULL, dan kalkulasi metrik konsisten.
   - Menyimpan hasil pembersihan ke dalam tabel terstruktur `silver_sales`.

3. **Data Pipeline & Orchestration (ETL)**:
   - Membangun alur orkestrasi otomatis `PL_Silver_To_Warehouse` menggunakan Fabric Data Pipeline.
   - Mengintegrasikan mekanisme *scheduler* otomatis agar sinkronisasi data dari Lakehouse Silver ke Warehouse berjalan periodik tanpa intervensi manual.

4. **Fabric Warehouse & Star Schema Modeling**:
   - Merancang model dimensional Ralph Kimball untuk kueri analitik cepat:
     - **Fact Table**: `fact_sales` (Volume transaksi, kuantitas, pendapatan, laba, biaya).
     - **Dimension Tables**: `dim_country`, `dim_product`, dan `dim_date`.
   - Mengonfigurasi **Semantic Model** dengan relasi *One-to-Many* dan *Single Filter Direction* untuk menjamin konsistensi agregasi metrik.

5. **Power BI Executive Dashboard**:
   - **Metrik Utama (KPI Cards)**: *Total Revenue*, *Total Profit*, *Total Cost*, *Total Units Sold*, dan *Total Orders*.
   - **Visualisasi Interaktif**: *Revenue Trend*, *Top 10 Country*, *Top Products*, dan kontribusi *Sales Channel*.
   - **Fitur Slicer**: Penyelaman data granular berbasis filter dinamis tahun, bulan, dan segmen pasar.

---

### Hasil & Nilai Tambah Rekayasa

- **Unifikasi Data Multi-Format**: Sukses mengonsolidasi 4 format file heterogen ke dalam satu ekosistem lakehouse tunggal.
- **Arsitektur Medallion Terstandarisasi**: Menjamin keterlacakan data (*data lineage*) dari raw layer hingga gold-ready warehouse layer.
- **Efisiensi Kueri Analitik**: Desain Star Schema dan Semantic Model teroptimasi menghasilkan waktu respons laporan Power BI yang cepat dan akurat.
