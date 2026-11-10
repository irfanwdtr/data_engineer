# 📊 YouTube Comment Sentiment Analysis Dashboard

> **Data Engineering & Analytics Portfolio Project**: Platform dashboard interaktif untuk pencarian video YouTube, ekstraksi komentar publik, pemodelan sentimen NLP (Positive, Negative, Neutral), ekstraksi topik (TF-IDF / Topic Modeling), serta eksplorasi keluhan konsumen (Customer Pain Points).

![Project Preview](/banner.png)

---

## 🎯 Fitur Utama

1. **Analytics Overview (BI Dashboard)**
   - 5 KPI Metric Cards: Videos Analyzed, Comments Collected, Positive Sentiment, Negative Sentiment, Neutral Sentiment dengan trend delta.
   - Donut Chart Sentiment Distribution interaktif dengan ringkasan sentral.
   - Time Series Area Chart "Sentiment Trend Over Time" dengan multi-layer spline.
   - Horizontal Bar Chart "Top Keywords" dengan statistik frekuensi kata kunci.
   - Tabel "Recent Analysis History" dengan segmented sentiment bar.

2. **YouTube Search**
   - Pencarian video berdasarkan keyword (contoh: *"Review iPhone 17"*).
   - Filter tanggal publikasi, batas jumlah video, dan opsi urutan (Relevansi, Views, Komentar).
   - Video card lengkap dengan thumbnail, channel, durasi, view count, comment count, dan tombol *"Analyze Video Comments"*.

3. **Sentiment Analysis**
   - Rincian sentimen makro dan confidence score rata-rata model NLP.
   - Tab filter sentimen interaktif (Semua, Positive, Negative, Neutral).
   - Feed komentar dengan detail author, tanggal, jumlah likes, sentimen badge, dan tag kata kunci.

4. **Topic Analysis & Customer Pain Points**
   - Word Cloud interaktif (TF-IDF) dengan indikator sentimen hijau/merah/abu-abu.
   - Frekuensi kata kunci spesifik dan rasio kepuasan konsumen.
   - Analisis mendalam *Customer Pain Points* dengan tingkat keparahan (*High*, *Medium*, *Low* impact) dan kutipan komentar nyata berbahasa Indonesia.

5. **Data Explorer**
   - Tabel eksplorasi data lengkap dengan kolom `Comment ID`, `Video Title`, `Author`, `Comment`, `Published`, `Likes`, `Sentiment`, dan `Confidence Score`.
   - Pencarian teks instan di seluruh baris.
   - Filter sentimen dan pengaturan jumlah baris per halaman (*pagination*).
   - **Fitur Export CSV** riil yang mengunduh dataset dalam format file `.csv`.
   - Modal popup detail komentar saat baris diklik.

6. **Analysis History**
   - Riwayat eksekusi sesi pencarian dan analisis sebelumnya.
   - Fitur *"Buka Hasil"* untuk memuat dataset sesi masa lalu langsung ke active state dashboard.

---

## 🛠️ Tech Stack Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts / Visualizations**: Recharts
- **Icons**: Lucide React
- **Design System**: SaaS Analytics Theme (Dark Navy `#0b1329`, White cards `#ffffff`, Accent Blue, Emerald `#10b981`, Rose `#ef4444`)

---

## 🚀 Menjalankan Proyek

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Server Development
```bash
npm run dev
```

Buka browser di `http://localhost:3000`.

### 3. Build untuk Production
```bash
npm run build
npm run start
```

---

## 🔌 Kesiapan Integrasi Backend (Phase 2 - FastAPI)

Proyek ini telah dilengkapi arsitektur pemisah *Service Layer* di `src/lib/api.ts`.
Saat backend FastAPI selesai dibuat:
1. Atur `NEXT_PUBLIC_API_URL=http://localhost:8000` di file `.env.local`.
2. Endpoint REST FastAPI yang didukung:
   - `GET /api/v1/youtube/search?q={keyword}`
   - `GET /api/v1/analytics/overview?q={keyword}`
   - `GET /api/v1/comments?keyword={keyword}&sentiment={sentiment}`
   - `GET /api/v1/analytics/topics?q={keyword}`
   - `GET /api/v1/analytics/history`

---

## 👤 Author
**Data Engineer Portfolio Project**  
YouTube Comment Sentiment Analysis Dashboard

