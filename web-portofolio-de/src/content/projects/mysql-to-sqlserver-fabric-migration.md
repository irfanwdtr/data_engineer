---
title: "Migrasi Database Staging MySQL ke SQL Server & Otomasi Microsoft Fabric"
description: "Migrasi database staging dari MySQL ke Microsoft SQL Server (SSMS) on-premises via RDP, pembuatan Stored Procedure untuk ekstraksi data, otomasi penjadwalan SQL Server Agent, dan integrasi hybrid ke Microsoft Fabric & Power BI melalui Data Gateway."
category: "Data Migration & Hybrid Pipeline"
date: "2026-07-15"
featured: true
order: 1
tags:
  - "Microsoft SQL Server"
  - "SSMS"
  - "MySQL"
  - "Stored Procedures"
  - "SQL Server Agent"
  - "Microsoft Fabric"
  - "Power BI"
  - "On-Premises Data Gateway"
  - "RDP"
githubUrl: "https://github.com/irfanwdtr"
architectureImage: "/images/projects/project-fabric-migration.png"
company: "PT Importa Jaya Abadi"
role: "ERP Data Engineer Intern"
projectType: "Enterprise / Production Project"
isPlaceholder: false
---

## Detail Proyek

Proyek ini diimplementasikan di **PT Importa Jaya Abadi** (selama menjabat sebagai ERP Data Engineer Intern) untuk merekayasa migrasi database staging dari MySQL ke Microsoft SQL Server (SSMS) on-premises via RDP, otomasi logika ekstraksi dengan Stored Procedure dan SQL Server Agent, serta integrasi hybrid ke Microsoft Fabric dan Power BI.

---

### Komponen & Alur Arsitektur

- **MySQL Staging DB (Source)**: Sumber data staging awal yang menampung transaksi mentah ERP.
- **SQL Server / SSMS (Target)**: Database staging baru pada server on-premises yang dikelola melalui remote desktop (RDP).
- **SQL Stored Procedures**: Logika terpusat untuk mengekstrak, membersihkan, dan mengonsolidasi data transaksi ERP.
- **SQL Server Agent**: Menjalankan eksekusi Stored Procedure secara otomatis sesuai jadwal tanpa campur tangan manual.
- **On-Premises Data Gateway**: Terowongan hybrid aman terenkripsi yang menghubungkan server lokal ke cloud tanpa membuka port firewall publik.
- **Microsoft Fabric (Cloud Lakehouse)**: Pipeline cloud terjadwal untuk menarik data dari SQL Server lokal melalui gateway.
- **Dashboard Power BI**: Refresh dataset otomatis untuk menyajikan laporan bisnis eksekutif secara real-time.

---

### Hasil & Pencapaian Utama

- **100% Otomatisasi ETL**: Mengeliminasi seluruh proses penarikan data manual dengan penjadwalan terpadu SQL Server Agent dan Microsoft Fabric.
- **Integritas Data Terjaga**: Migrasi skema dan tipe data dari MySQL ke SQL Server tervalidasi 100% konsisten.
- **Koneksi Hybrid Aman**: Alur data on-premises ke cloud berjalan melalui On-Premises Data Gateway resmi bersertifikat SSL.
- **Laporan Bisnis Tepat Waktu**: Dashboard Power BI ter-refresh otomatis setiap hari untuk mendukung keputusan manajemen.
