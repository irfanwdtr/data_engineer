---
title: "Stock Intelligence Platform: Otomasi Data Saham dengan Apache Airflow"
description: "Platform otomatisasi pipeline ETL Apache Airflow dan PostgreSQL 16 untuk mengambil, membersihkan, memvalidasi, dan menyimpan data historis 20 kode saham Indonesia (IHSG) dari Yahoo Finance dalam container Docker Compose."
category: "Data Pipeline & Orchestration"
date: "2026-03-10"
featured: true
order: 2
tags:
  - "Python"
  - "Apache Airflow"
  - "PostgreSQL 16"
  - "Docker Compose"
  - "yfinance"
  - "SQL"
  - "ETL Pipeline"
githubUrl: "https://github.com/irfanwdtr/data_engineer/tree/main/airflow/stock-intelligence-platform"
architectureImage: "/images/projects/project-stock-airflow.jpg"
gallery:
  - image: "/images/projects/project-stock-airflow.jpg"
    title: "1. Diagram Arsitektur Sistem & Alur Proses ETL"
  - image: "/images/projects/project-stock-monitoring.png"
    title: "2. Dashboard Pipeline Monitoring (Status Apache Airflow & Task Execution)"
  - image: "/images/projects/project-stock-prediction.png"
    title: "3. Dashboard Prediksi Arah Saham (Model Machine Learning & Evaluasi)"
isPlaceholder: false
---

## Detail Proyek

Platform data otomatis untuk mengekstrak, membersihkan, memvalidasi, dan menyimpan data historis pasar saham Indonesia (IHSG) menggunakan Apache Airflow, PostgreSQL 16, dan Docker Compose.

---

### Alur Proses ETL (`market_ingestion`)

- **1. Extract (Pengambilan Data)**: Mengambil data historis OHLCV untuk 20 kode saham Indonesia dari Yahoo Finance menggunakan library `yfinance`.
- **2. Transform (Pembersihan Data)**: Menghapus record transaksi yang memiliki nilai `Close` kosong (*null*) dan menyelaraskan tipe data.
- **3. Validate (Validasi Kualitas)**: Memeriksa kualitas data untuk memastikan record memiliki nilai harga penutupan yang valid dan wajar sebelum dimuat.
- **4. Load (Penyimpanan Data)**: Menyimpan 480 record bersih ke database PostgreSQL 16 pada tabel `market_data`.
- **Output**: Dataset pasar saham terstruktur dan siap digunakan untuk analisis lanjutan, *feature engineering*, dan model Machine Learning.

---

### Konfigurasi Orkestrasi Apache Airflow

- **DAG ID**: `market_ingestion`
- **Task ID**: `run_market_ingestion`
- **Executor**: `LocalExecutor` (`catchup=False`)
- **Jadwal Eksekusi**: Setiap hari kerja (**Senin – Jumat**) pukul **17.30 WIB** (pasca penutupan perdagangan bursa efek).

---

### Infrastruktur & Hasil Pengujian

- **Docker Compose**: Mengemas Airflow Webserver, Scheduler, LocalExecutor, dan PostgreSQL 16 dalam container terisolasi.
- **Tingkat Keberhasilan**: 100% (20 dari 20 kode saham sukses diproses).
- **Volume Data**: 24 record per saham, total **480 record** per jadwal eksekusi.
- **Durasi Eksekusi**: Sangat cepat, selesai dalam waktu **~9 detik**.

---
