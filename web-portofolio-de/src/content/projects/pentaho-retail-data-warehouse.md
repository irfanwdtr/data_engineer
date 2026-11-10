---
title: "Retail Data Warehouse & Orkestrasi ETL: Pentaho PDI (Spoon) & MySQL"
description: "Implementasi mini Data Warehouse end-to-end berbasis Star Schema menggunakan Pentaho Data Integration (PDI / Spoon) dan MySQL, dilengkapi multi-table stream lookup surrogate keys serta orkestrasi job terpadu."
category: "Data Warehousing & ETL Orchestration"
date: "2026-06-20"
featured: true
order: 6
tags:
  - "Pentaho PDI"
  - "Spoon"
  - "MySQL"
  - "Star Schema"
  - "ETL Pipeline"
  - "Surrogate Keys"
  - "Stream Lookup"
  - "Kitchen CLI"
githubUrl: "https://github.com/irfanwdtr/data_engineer/tree/main/pentaho/DW-project-PDI-MySQL"
architectureImage: "/images/projects/project-pentaho-orchestrator.png"
gallery:
  - image: "/images/projects/project-pentaho-orchestrator.png"
    title: "Orkestrasi Alur Job ETL (job_dw_pos_orchestrator.kjb)"
  - image: "/images/projects/project-pentaho-stream-lookup.png"
    title: "Transformasi Fact Sales & Multi Stream Lookup Surrogate Keys"
projectType: "Personal / Lab Project"
isPlaceholder: false
---

## Detail Proyek

Proyek ini merekayasa arsitektur **Mini Data Warehouse** sistem Point of Sale (POS) retail dari sumber data transaksional MySQL dan penyesuaian diskon CSV ke dalam model analitik **Star Schema** siap Business Intelligence (BI) menggunakan **Pentaho Data Integration (PDI / Spoon)**.

---

### Arsitektur Star Schema & Layering Data

Pipeline data dibangun menggunakan arsitektur 3 lapis untuk menjamin integritas data:

1. **Staging Layer (`stg_sales_enriched`)**:
   - Menyatukan data transaksi POS MySQL (`pos_sales`) dengan file penyesuaian promo (`promo_adjustments.csv`).
   - Melakukan kalkulasi metrik finansial: `gross_sales`, `discount_amount`, dan `net_sales`.
2. **Dimension Tables (Upsert & Surrogate Keys)**:
   - `dim_date`: Dimensi kalender dengan hierarki waktu (`full_date`, `day`, `month`, `quarter`, `year`) berformat `YYYYMMDD`.
   - `dim_customer`: Entitas pelanggan dengan integer surrogate key `customer_key`.
   - `dim_product`: Katalog produk retail dengan surrogate key `product_key`.
   - `dim_store`: Lokasi cabang toko fisik dengan surrogate key `store_key`.
3. **Fact Table (`fact_sales`)**:
   - Tabel fakta terpusat yang menghubungkan seluruh dimensi melalui Foreign Key surrogate keys.
   - Menyimpan metrik transaksi bisnis (`qty`, `price`, `discount_pct`, `gross_sales`, `discount_amount`, `net_sales`).

```
               dim_customer
                    |
               dim_product
                    |
dim_date ---- [ fact_sales ] ---- dim_store
```

---

### Alur Transformasi ETL (PDI Transformation Level)

Proses transformasi data dibagi ke dalam modul-modul modular:

- **01 - Staging Transformation**: Ekstraksi MySQL + CSV, penggabungan baris via Stream Lookup berdasarkan `trx_id`, perhitungan formula diskon, dan persistensi ke tabel staging.
- **02 s/d 05 - Build Dimensions (Upsert)**: Mengekstrak atribut distinct dari staging layer dan melakukan operasi `Insert / Update` (Upsert) ke tabel dimensi untuk mencegah duplikasi data.
- **06 - Build Fact Sales**:
  - Mengambil data tervalidasi dari staging.
  - Menjalankan rantai **Multi Stream Lookup** berturut-turut (`TI_CUST`, `TI_PROD`, `TI_STORE`, `TI_DATE`) untuk memetakan *natural key* menjadi *surrogate key*.
  - Menjalankan pra-eksekusi pembersihan (`Clear fact_sales`) dan memuat data final ke tabel fakta.

---

### Orkestrasi Job & Otomasi Eksekusi

Seluruh rantai transformasi dikontrol secara terpadu melalui satu alur orkestrator:

- **Master Job (`job_dw_pos_orchestrator.kjb`)**:
  - `Start` → `Run 01 - Staging` → `Run 02 - dim_date` → `Run 03 - dim_customer` → `Run 04 - dim_product` → `Run 05 - dim_store` → `Clear fact_sales` → `Run 06 - fact_sales` → `JOB SUCCESS`.
  - Mengelola *dependency* antar layer data secara otomatis dan membatalkan pipeline jika terjadi kegagalan di salah satu node.
- **Otomasi CLI (Kitchen)**:
  - Job dapat dieksekusi tanpa GUI menggunakan antarmuka command line Pentaho Kitchen:
    ```bash
    kitchen.bat /file:"path\to\job_dw_pos_orchestrator.kjb"
    ```
  - Siap diintegrasikan dengan penjadwal produksi seperti Windows Task Scheduler, Linux Cron, maupun Apache Airflow.

---

### Ringkasan Teknologi & Konsep Utama

- **Model Pemodelan**: Star Schema (Ralph Kimball Dimensional Modeling Methodology).
- **PDI Components**: *Table Input*, *CSV File Input*, *Stream Lookup*, *Calculator*, *Insert / Update*, *Table Output*.
- **Database Target**: MySQL Server dengan indexing surrogate key teroptimasi untuk kueri analitik BI.
