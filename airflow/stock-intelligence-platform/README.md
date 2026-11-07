# Stock Intelligence Platform 📈🇮🇩

Platform intelijen pasar saham profesional untuk analisis saham Indonesia (IDX) berbasis data engineering, orkestrasi Apache Airflow, PostgreSQL, FastAPI, dan antarmuka finansial modern Next.js.

---

## 🏛️ Arsitektur Sistem

- **Database**: PostgreSQL 16
  - `stock_intelligence`: Tabel `stock_prices` (9.500 baris OHLCV), `stock_features` (RSI, SMA, Volatilitas, Momentum), `stock_labels`, dan `model_evaluations`.
  - `airflow_metadata`: Metadata DAG run dan task instance dari Apache Airflow.
- **Data Engineering & Orchestration**: Apache Airflow 2.10.5
  - DAG: `market_ingestion`
  - Tasks: `ingest_market_data` ➔ `run_feature_engineering` ➔ `validate_data_quality`
- **Machine Learning Baseline**:
  - Model: `LogisticRegression(max_iter=1000, class_weight="balanced")`
  - Pipeline: `SimpleImputer(strategy="median")` + `StandardScaler()`
  - Input Features: `daily_return`, `price_to_sma_5`, `price_to_sma_10`, `price_to_sma_20`, `momentum_5`, `momentum_10`, `rsi_14`, `volatility_20`, `volume_ratio_20`
  - Target: `target_up_5d` (Prediksi arah kenaikan harga 5 hari bursa ke depan)
- **Backend API**: FastAPI (Python 3.12)
  - Port `8000` (Docker container: `stock-platform-backend`)
  - Endpoints RESTful untuk dashboard, katalog saham, detail teknikal, prediksi real-time, dan status pipeline.
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts, Lucide React
  - Port `3000`
  - Tema dark navy finansial elegan dengan aksen ungu & indikator tren hijau/merah.

---

## 🚀 Cara Menjalankan Platform

### 1. Prasyarat
- Docker & Docker Compose
- Node.js 18+ (di WSL / host)

### 2. Konfigurasi Lingkungan
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

### 3. Menjalankan Backend & Layanan Data (Docker Compose)
Jalankan PostgreSQL, Apache Airflow, dan FastAPI backend:
```bash
docker compose up -d
```
Verifikasi kontainer aktif:
```bash
docker ps
```
Layanan yang aktif:
- `stock-platform-backend`: http://localhost:8000 (Swagger docs di http://localhost:8000/docs)
- `stock-platform-airflow-webserver`: http://localhost:8080
- `stock-platform-postgres`: port 5432

### 4. Menjalankan Frontend (Next.js)
Masuk ke direktori `frontend`:
```bash
cd frontend
node server.js
```
Buka browser di: **http://localhost:3000**

---

## 📡 API Endpoints (FastAPI)

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/health` | Health check & verifikasi koneksi PostgreSQL |
| `GET` | `/api/dashboard/summary` | Agregasi pasar, KPI, pergerakan indeks, top gainers/losers |
| `GET` | `/api/stocks` | Katalog 20 saham dengan pencarian, filter sektor, & sorting |
| `GET` | `/api/stocks/{ticker}` | Detail quote & ringkasan fundamental satu saham |
| `GET` | `/api/stocks/{ticker}/history` | Riwayat OHLCV saham (timeframe: 1D, 5D, 1M, 3M, 6M, 1Y, ALL) |
| `GET` | `/api/stocks/{ticker}/features` | Indikator teknikal (RSI 14, SMA 5/10/20, Volatilitas, Momentum) |
| `GET` | `/api/predictions/{ticker}` | Inferensi Logistic Regression (Naik/Turun + Probabilitas + Metrik Baseline) |
| `GET` | `/api/pipeline/status` | Status live pipeline Airflow, durasi eksekusi, & status task |
| `GET` | `/api/pipeline/runs` | Riwayat eksekusi DAG `market_ingestion` |

---

## 📊 Halaman Website

1. **Dashboard** (`/`):
   - Total saham dipantau (20), Rata-rata Return (5D), Saham Naik & Turun.
   - Grafik interaktif tren Indeks Pasar Agregat.
   - Tabel interaktif Top Movers (Tab Top Gainers & Top Losers).
   - Sidebar dengan indikator kesehatan pipeline secara live.
2. **Stock Explorer** (`/stocks`):
   - Katalog 20 saham IDX.
   - Filter sektor cepat: *Semua (20)*, *Keuangan*, *Telekomunikasi*, *Konsumer*, *Energi*, *Lainnya*.
   - Live search berdasarkan ticker atau nama perusahaan.
   - Pengurutan dinamis berdasarkan Harga, Perubahan (%), Volume, dan Ticker.
3. **Stock Detail** (`/stocks/[ticker]`):
   - Header ringkasan harga, perubahan harian, open, high, low, volume.
   - Grafik harga & volume dengan rentang waktu dinamis (`1D`, `5D`, `1M`, `3M`, `6M`, `1Y`, `ALL`).
   - Panel Indikator Teknikal (RSI 14 hari dengan status Neutral/Oversold/Overbought, perbandingan SMA, Volatilitas, Rasio Volume).
   - Ringkasan fundamental (Sektor, Market Cap, P/E Ratio, PBV).
   - Tab Data Historis & Tab Fitur Terkalkulasi.
4. **Prediction** (`/prediction`):
   - Pemilihan saham dan horizon prediksi (5 Hari Bursa T+5).
   - Inferensi langsung dari model Logistic Regression baseline.
   - Sinyal prediksi: **Naik** (hijau) atau **Turun** (merah) beserta gauge persentase probabilitas.
   - Tabel fitur terkini sebagai input model dan kartu metrik evaluasi model (Accuracy: 54.63%, F1: 43.70%, ROC-AUC: 53.14%).
5. **Pipeline Monitoring** (`/pipeline`):
   - Banner status kesehatan data engineering (*Pipeline Healthy*).
   - Breakdown task Apache Airflow: `ingest_market_data`, `run_feature_engineering`, `validate_data_quality`.
   - Durasi eksekusi dan riwayat run DAG Airflow langsung dari metadata database.

