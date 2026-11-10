---
title: "Platform Analisis Sentimen Komentar YouTube & Pipeline Data NLP"
description: "Pipeline pengolahan data end-to-end dan platform analitik sentimen berbasis NLP untuk mengekstrak, membersihkan, mengklasifikasikan ribuan komentar YouTube secara real-time via FastAPI dan visualisasi interaktif Next.js."
category: "Data Pipeline & NLP Analytics"
date: "2026-08-10"
featured: true
order: 3
tags:
  - "Python"
  - "FastAPI"
  - "YouTube Data API v3"
  - "Hugging Face"
  - "IndoBERT"
  - "Next.js"
  - "TypeScript"
  - "Tailwind CSS"
  - "Recharts"
  - "Data Cleaning"
githubUrl: "https://github.com/irfanwdtr/data_engineer/tree/main/youtube-comment-sentiment-analysis"
architectureImage: "/images/projects/youtube-sentiment-architecture.jpg"
gallery:
  - image: "/images/projects/youtube-sentiment-architecture.jpg"
    title: "Diagram Alur Sistem & Arsitektur Pipeline Data (End-to-End)"
  - image: "/images/projects/youtube-sentiment-overview.png"
    title: "Ringkasan Analitik, Distribusi & Tren Sentimen (Overview Dashboard)"
  - image: "/images/projects/youtube-sentiment-deepdive.png"
    title: "Sentiment Deep-Dive, Net Sentiment Score & Komparasi Kreator"
  - image: "/images/projects/youtube-sentiment-explorer.png"
    title: "Data Explorer Komentar Terindeks, Filter Sentimen & Ekspor CSV"
  - image: "/images/projects/youtube-sentiment-search.jpg"
    title: "Pencarian Video YouTube & Modul Ingesti Data Otomatis"
projectType: "Personal / Lab Project"
isPlaceholder: false
---

## Detail Proyek

Platform analitik sentimen publik berskala modern yang mengintegrasikan alur kerja **Data Engineering** dan **Natural Language Processing (NLP)**. Sistem ini mengekstrak opini publik dari video YouTube melalui kata kunci tertentu, membersihkan noise teks, menjalankan inferensi model klasifikasi bahasa Indonesia, dan menyajikan metrik analitik mendalam secara interaktif.

---

### Alur Arsitektur Data Pipeline

Pipeline dibangun secara terstruktur mencakup 5 tahapan utama pemrosesan data:

```
[ Input Keyword ] 
       ↓
[ Ingestion API ] ──> YouTube Data API v3 (Search Video & Extract Public Comments)
       ↓
[ Raw Storage ]   ──> JSON Buffer & Raw Metadata Store
       ↓
[ Data Cleaning ] ──> Regex Text Preprocessing, Slang Normalization, Emoji Handling
       ↓
[ NLP Inference ] ──> Hugging Face Transformer (taufiqdp/indonesian-sentiment)
       ↓
[ Aggregation ]   ──> Net Sentiment Score (NSS), Topic Frequency & Resonance Analysis
       ↓
[ Serving Layer ] ──> RESTful API (Python FastAPI & Pydantic)
       ↓
[ Visualization ] ──> Interactive Web Dashboard (Next.js, TypeScript & Recharts)
```

---

### Fitur & Antarmuka Dashboard

1. **Overview Dashboard & Analytics KPI**:
   - Menampilkan metrik total video teranalisis, volume komentar terhimpun, dan ringkasan distribusi sentimen (Positif, Negatif, Netral).
   - Visualisasi Donut Chart untuk sebaran proporsi opini serta Line Chart tren fluktuasi sentimen dari waktu ke waktu.
   - Peringkat kata kunci teratas (*Top Keywords*) dan rangkuman sentimen per video kreator.

2. **Sentiment Deep-Dive & Resonance Matrix**:
   - **Net Sentiment Score (NSS)**: Pengukuran indeks kesehatan opini publik dengan skala komparasi -100 hingga +100.
   - **Resonansi Dukungan Netizen**: Mengukur bobot dukungan melalui perbandingan total *likes* pada komentar apresiasi vs kritik.
   - **Cross-Video Sentiment Benchmark**: Komparasi head-to-head respons penonton pada masing-masing kreator YouTube untuk topik yang sama.

3. **Pencarian Video & Ingesti Fleksibel**:
   - Mengambil data komentar video publik terbaru langsung dari YouTube Data API v3 berdasarkan query penelusuran.
   - Dilengkapi opsi filter tanggal publikasi, batas sampel video, dan parameter relevansi.

4. **Data Explorer & Ekspor Dataset**:
   - Eksplorasi dataset granular: ID komentar, nama kreator/penulis, tanggal terbit, jumlah like, hingga label sentimen.
   - Mendukung pencarian teks cepat, filter kategori sentimen, serta fitur ekspor langsung ke format CSV untuk analisis lanjutan.

---

### Model Machine Learning & NLP

- **Model Pre-trained**: Menggunakan arsitektur Transformer bahasa Indonesia [`taufiqdp/indonesian-sentiment`](https://huggingface.co/taufiqdp/indonesian-sentiment) dari Hugging Face Hub.
- **Kategori Klasifikasi**:
  - **Positif**: Opini yang mengandung kepuasan, rekomendasi, dan apresiasi.
  - **Negatif**: Keluhan, isu teknis, kritik harga/performa, atau kekecewaan pengguna.
  - **Netral**: Pernyataan informatif, pertanyaan murni, atau teks tanpa polaritas emosi eksplisit.
- **Efisiensi Inferensi**: Pemrosesan *batch inference* terisolasi pada backend Python untuk menjaga responsivitas API tetap tinggi.

---

### Struktur Repositori & Teknologi

```
youtube-comment-sentiment-analysis/
├── backend/
│   ├── app/
│   │   ├── api/v1/youtube.py    # Endpoint ekstraksi & query analitik
│   │   ├── services/
│   │   │   ├── cleaning.py      # Pembersihan teks & normalisasi string
│   │   │   ├── sentiment.py     # Inferensi model IndoBERT NLP
│   │   │   └── storage.py       # Manajemen data raw & processed
│   │   └── main.py              # Entry point FastAPI
│   └── requirements.txt
└── src/
    ├── app/                     # Next.js App Router (Dashboard & Explorer)
    ├── components/              # Komponen visualisasi Recharts & UI Tailwind
    └── lib/                     # Client API fetcher & data transformer
```

- **Backend & Pemrosesan Data**: Python 3.10+, FastAPI, Uvicorn, Hugging Face Transformers, PyTorch.
- **Frontend & Visualisasi**: Next.js 14, TypeScript, Tailwind CSS, Recharts.
- **Integrasi Eksternal**: Google YouTube Data API v3.
