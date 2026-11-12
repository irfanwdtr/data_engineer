---
title: "BankFlow: Platform Data Perbankan End-to-End & Medallion Lakehouse"
description: "Platform data perbankan modern berbasis Medallion Architecture (Bronze, Silver, Gold): orkestrasi Apache Airflow, Data Lake SeaweedFS S3-compatible, validasi kualitas data otomatis, PostgreSQL Data Warehouse, REST API FastAPI, dan dashboard analitik Next.js."
category: "Fintech & Data Lakehouse"
date: "2026-10-15"
featured: true
order: 8
tags:
  - "Apache Airflow"
  - "PostgreSQL"
  - "SeaweedFS (S3)"
  - "Medallion Architecture"
  - "Data Quality"
  - "FastAPI"
  - "Next.js"
  - "TypeScript"
  - "Docker Compose"
  - "Python"
githubUrl: "https://github.com/irfanwdtr/data_engineer"
architectureImage: "/images/projects/bankflow-architecture.jpg"
gallery:
  - image: "/images/projects/bankflow-architecture.jpg"
    title: "Diagram Arsitektur Sistem & Alur Medallion Data Lakehouse"
  - image: "/images/projects/bankflow-overview.jpg"
    title: "Overview Dashboard Analitik Perbankan & Telemetri Pipeline"
  - image: "/images/projects/bankflow-analytics.jpg"
    title: "Analitik Transaksi, Tren Turnover Finansial & Success Rate"
projectType: "Personal / Lab Project"
isPlaceholder: false
---

## Detail Proyek

**BankFlow** adalah platform rekayasa data perbankan terpusat yang mengintegrasikan alur kerja data lakehouse end-to-end. Sistem ini mensimulasikan pemrosesan **100.000 transaksi perbankan** bernilai **Rp 1,02 Triliun**, mengimplementasikan arsitektur berjenjang **Medallion Architecture**, pengujian kualitas data otomatis (*Data Quality Checks*), hingga penyajian visualisasi analitik interaktif.

---

### Alur Arsitektur Medallion & Pipeline Data

Seluruh infrastruktur dikontainerisasi menggunakan **Docker Compose** dan diorkestrasi secara terpadu melalui **Apache Airflow**:

```
[ Sumber Data Mentah ] (customer.csv, account.csv, transaction.csv)
          │
          ▼  (Python Ingestion)
┌─────────────────────────────────────────────────────────────┐
│ Data Lake (SeaweedFS / S3 Compatible)                       │
│                                                             │
│  [ Bronze Layer ]   ──> Ingesti data mentah tanpa perubahan │
│         │                                                   │
│         ▼                                                   │
│  [ Silver Layer ]   ──> Standardisasi skema, casting tipe   │
│         │               data, & pembersihan inkonsistensi   │
│         │                                                   │
│         ▼                                                   │
│  [ Data Quality ]   ──> Validasi kelengkapan, uniqueness,   │
│         │               & aturan integritas perbankan       │
│         ▼                                                   │
│  [ Gold Layer ]     ──> Agregasi analitik & mart perbankan  │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
[ PostgreSQL Data Warehouse ] ──> Penyimpanan analitik teroptimasi
          │
          ▼
[ FastAPI (REST API Backend) ]──> Serving endpoint performa tinggi
          │
          ▼
[ Next.js Dashboard ]         ──> Visualisasi KPI & monitoring real-time
```

---

### Fitur Utama & Keunggulan Rekayasa

1. **Orkestrasi ETL Terpadu (Apache Airflow)**:
   - Mengelola eksekusi dependensi antar layer (Bronze → Silver → Data Quality Check → Gold → Warehouse).
   - Memastikan proses berjalan idempoten dan toleran terhadap kegagalan.

2. **Data Lake Kompatibel S3 (SeaweedFS)**:
   - Penyimpanan terdistribusi lokal berkinerja tinggi yang kompatibel dengan protokol AWS S3 API.
   - Mengisolasi data mentah perbankan dengan aman dan berbiaya efisien.

3. **Mekanisme Data Quality Checks Otomatis**:
   - Pengecekan otomatis integritas data: validasi *nullability*, duplikasi ID nasabah & rekening, serta konsistensi nominal saldo.
   - Mencegah data anomali masuk ke layer analitik Data Warehouse.

4. **Data Serving & Visualisasi Interaktif**:
   - **Backend FastAPI**: Menyediakan REST API cepat dan terdokumentasi untuk konsumsi data dashboard.
   - **Frontend Next.js & Tailwind CSS**: Menyajikan laporan KPI eksekutif mencakup volume sukses (91.93%), monitoring perputaran dana harian (*Daily Settled Turnover*), dan sebaran status transaksi.

---

### Stack Teknologi & Infrastruktur

- **Orkestrasi**: Apache Airflow 2.10
- **Data Lake & Storage**: SeaweedFS (S3 Object Storage), PostgreSQL 16 Data Warehouse
- **Pemrosesan & Kualitas**: Python 3.10+, Pandas, Custom Data Quality Checks
- **Serving Layer**: FastAPI, Pydantic, Uvicorn
- **Dashboard Frontend**: Next.js 14, TypeScript, Tailwind CSS, Chart UI
- **Infrastruktur**: Docker & Docker Compose
