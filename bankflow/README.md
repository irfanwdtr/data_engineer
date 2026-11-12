# BankFlow – Platform Intelijen Data Perbankan

**Platform Data Engineering End-to-End untuk Pengolahan dan Analisis Data Perbankan**

BankFlow adalah proyek Data Engineering yang mensimulasikan platform pengolahan data perbankan secara end-to-end. Platform ini dirancang untuk menunjukkan bagaimana data mentah perbankan dapat dikumpulkan, diproses, divalidasi, ditransformasikan, dan disimpan ke dalam Data Warehouse untuk mendukung kebutuhan analisis dan pelaporan bisnis.

Proyek ini mengimplementasikan arsitektur Medallion (Bronze, Silver, dan Gold), otomatisasi pipeline menggunakan Apache Airflow, pemantauan kualitas data, serta dashboard interaktif untuk visualisasi hasil pengolahan data.

## Gambaran Umum Proyek

BankFlow membangun alur pengolahan data dari awal hingga akhir, meliputi:

- Pengambilan data dari dataset perbankan sintetis.
- Penyimpanan data menggunakan object storage yang kompatibel dengan S3.
- Pengolahan dan transformasi data menggunakan Python dan Pandas.
- Validasi dan pemantauan kualitas data.
- Agregasi data pada Gold Layer untuk kebutuhan analitik.
- Penyimpanan hasil pengolahan ke PostgreSQL Data Warehouse.
- Otomatisasi pipeline menggunakan Apache Airflow.
- Penyediaan REST API menggunakan FastAPI.
- Visualisasi data melalui dashboard berbasis Next.js.

## Arsitektur Sistem

```text
                 DATA PERBANKAN SINTETIS
                           |
                           v
                     DATA INGESTION
                           |
                           v
                SEAWEEDFS OBJECT STORAGE
                           |
                           v
                     BRONZE LAYER
                    Data Mentah
                           |
                           v
                     SILVER LAYER
              Pembersihan & Transformasi
                           |
                           v
                 DATA QUALITY CHECKS
                  Validasi Kualitas Data
                           |
                           v
                      GOLD LAYER
                 Agregasi Data Bisnis
                           |
                           v
               POSTGRESQL DATA WAREHOUSE
                           |
                           v
                       FASTAPI
                           |
                           v
                  NEXT.JS DASHBOARD

                  APACHE AIRFLOW
               Orkestrasi Pipeline Data
```

## Teknologi yang Digunakan

| Kategori | Teknologi |
|---|---|
| Bahasa Pemrograman | Python |
| Pengolahan Data | Pandas |
| Data Lake Storage | SeaweedFS (S3-compatible) |
| Data Warehouse | PostgreSQL 16 |
| Orkestrasi Pipeline | Apache Airflow 2.10.5 |
| Backend API | FastAPI |
| Frontend | Next.js 14 |
| Styling | Tailwind CSS |
| Visualisasi Data | Recharts |
| Containerization | Docker & Docker Compose |

## Arsitektur Pengolahan Data

BankFlow menggunakan pendekatan Medallion Architecture yang terdiri dari tiga lapisan:

### 1. Bronze Layer – Data Mentah

Menyimpan data hasil ingestion dalam bentuk aslinya sebelum dilakukan proses transformasi.

### 2. Silver Layer – Data Terolah

Melakukan pembersihan, standardisasi, dan transformasi data untuk meningkatkan konsistensi serta kualitas data.

### 3. Gold Layer – Data Siap Analisis

Menghasilkan data yang telah diagregasi dan disiapkan untuk kebutuhan analisis bisnis serta pelaporan.

## Pemantauan Kualitas Data

BankFlow dilengkapi proses validasi otomatis untuk memastikan integritas, konsistensi, dan kualitas data selama pipeline berjalan.

**Hasil pengujian pipeline terakhir:**

- Total pemeriksaan: 28
- Pemeriksaan berhasil: 28
- Pemeriksaan gagal: 0
- Tingkat keberhasilan: 100%

## Data Warehouse

Data hasil transformasi disimpan ke dalam PostgreSQL Data Warehouse dengan tabel-tabel analitik berikut:

| Tabel | Jumlah Record |
|---|---:|
| gold_transaction_summary | 15 |
| gold_customer_summary | 7.800 |
| gold_branch_summary | 20 |
| gold_channel_summary | 4 |
| gold_daily_summary | 364 |
| gold_account_summary | 14.978 |

Dataset yang digunakan merupakan data perbankan sintetis yang dibuat khusus untuk kebutuhan pengembangan dan demonstrasi proyek.

## Dashboard Analitik

BankFlow menyediakan empat modul utama untuk pemantauan dan analisis data:

1. **Overview Dashboard** – Menampilkan indikator utama dan ringkasan performa data perbankan.
2. **Pipeline Monitoring** – Memantau status dan eksekusi pipeline data.
3. **Data Quality Monitoring** – Menampilkan hasil pemeriksaan dan metrik kualitas data.
4. **Data Explorer & Transaction Analytics** – Memungkinkan eksplorasi data dan analisis transaksi.

## Otomatisasi Pipeline

Apache Airflow digunakan untuk mengorkestrasi keseluruhan proses pengolahan data melalui lima tahapan:

1. `ingestion_to_bronze` – Mengambil dan menyimpan data ke Bronze Layer.
2. `bronze_to_silver` – Membersihkan dan mentransformasikan data.
3. `data_quality_checks` – Menjalankan validasi kualitas data.
4. `silver_to_gold` – Menghasilkan data agregasi pada Gold Layer.
5. `load_gold_to_postgres` – Memuat data Gold ke PostgreSQL Data Warehouse.

Kelima tahapan tersebut telah berhasil dijalankan dalam satu eksekusi pipeline end-to-end.

## Menjalankan Proyek Secara Lokal

### Persyaratan

- Docker Desktop atau Docker Engine
- Docker Compose
- Git

### 1. Clone Repository

```bash
git clone https://github.com/irfanwdtr/data_engineer.git
cd data_engineer/bankflow
```

### 2. Konfigurasi Environment

Buat file `.env` berdasarkan template `.env.example`.

```bash
cp .env.example .env
```

Sesuaikan konfigurasi environment untuk menjalankan seluruh layanan.

### 3. Jalankan Platform

```bash
docker compose up -d --build
```

### 4. Akses Layanan

| Layanan | URL Lokal |
|---|---|
| Dashboard | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Dokumentasi API | http://localhost:8000/docs |
| Apache Airflow | http://localhost:8080 |
| SeaweedFS | http://localhost:8333 |

## Struktur Direktori

```text
bankflow/
├── airflow/
│   └── dags/
├── backend/
│   └── app/
│       ├── routers/
│       ├── schemas/
│       └── services/
├── data/
│   ├── generated/
│   └── source/
├── data_quality/
│   └── reports/
├── database/
│   └── init/
├── docs/
├── frontend/
│   ├── app/
│   ├── components/
│   └── lib/
├── ingestion/
├── processing/
├── scripts/
├── warehouse/
├── docker-compose.yml
└── README.md
```

## Tujuan dan Implementasi Proyek

Melalui proyek ini, beberapa konsep Data Engineering diimplementasikan secara langsung:

- Membangun pipeline ETL end-to-end.
- Mengimplementasikan Medallion Architecture.
- Mengelola penyimpanan data pada Data Lake dan Data Warehouse.
- Mengotomatisasi alur kerja menggunakan Apache Airflow.
- Menerapkan validasi dan pemantauan kualitas data.
- Mengembangkan REST API untuk mengakses data analitik.
- Membangun dashboard untuk data observability dan analisis bisnis.
- Mengintegrasikan berbagai layanan menggunakan Docker Compose.

## Disclaimer

BankFlow merupakan proyek pembelajaran dan portofolio Data Engineering. Seluruh dataset perbankan yang digunakan merupakan data sintetis dan tidak merepresentasikan nasabah, institusi keuangan, maupun transaksi perbankan nyata.

---

**Dikembangkan sebagai Proyek Portofolio Data Engineering.**
