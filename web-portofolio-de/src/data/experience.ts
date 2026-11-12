export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  type: string;
  period: string;
  isCurrent: boolean;
  summary: string;
  highlights: string[];
  technologies: string[];
  isPlaceholder?: boolean;
}

export const experiences: ExperienceItem[] = [
  {
    id: "exp-putra-wijayakusuma",
    role: "IT Engineer - Freelance (Web Developer)",
    company: "PT Putra Wijayakusuma Sakti",
    location: "Semarang",
    type: "Freelance / Kontrak",
    period: "Agu 2026 – Sekarang",
    isCurrent: true,
    isPlaceholder: false,
    summary: "Bertanggung jawab dalam perancangan, implementasi fitur antarmuka dan layanan server (full-stack), penanganan kendala teknis aplikasi, serta pemeliharaan integrasi manajemen basis data operasional bisnis.",
    highlights: [
      "Mengembangkan dan merawat fitur antarmuka pengguna (frontend) serta logika server (backend) aplikasi web operasional bisnis.",
      "Melakukan debugging intensif dan penanganan troubleshooting berkala untuk menjaga stabilitas serta keandalan performa sistem.",
      "Mengelola integrasi basis data relasional guna memastikan konsistensi dan kelancaran transaksi data harian."
    ],
    technologies: [
      "Pengembangan Web",
      "Frontend & Backend",
      "Full-Stack",
      "JavaScript / TypeScript",
      "SQL",
      "Integrasi Basis Data",
      "Debugging & Troubleshooting"
    ]
  },
  {
    id: "exp-importa",
    role: "ERP Data Engineer - Magang",
    company: "PT Importa Jaya Abadi",
    location: "Jogjakarta",
    type: "Magang (Internship)",
    period: "Apr 2026 – Jul 2026",
    isCurrent: false,
    isPlaceholder: false,
    summary: "Berperan dalam modernisasi arsitektur data ERP, standardisasi transformasi query Stored Procedure SQL, otomasi pipeline ETL, serta penyajian analitik data eksekutif berbasis Microsoft Fabric dan Power BI.",
    highlights: [
      "Memigrasikan arsitektur database staging dari MySQL ke Microsoft SQL Server (SSMS) dengan integritas data terjaga konsisten.",
      "Merancang Stored Procedure SQL terpusat untuk standardisasi ekstraksi, transformasi, dan pelaporan data operasional ERP.",
      "Mengotomatisasi jadwal alur kerja ETL dan refresh dataset dashboard menggunakan SQL Server Agent dan Microsoft Fabric.",
      "Mengembangkan dan memelihara dashboard Power BI interaktif untuk kebutuhan pelaporan bisnis eksekutif lintas divisi."
    ],
    technologies: [
      "Microsoft SQL Server",
      "SSMS",
      "MySQL",
      "Stored Procedures",
      "SQL Server Agent",
      "Microsoft Fabric",
      "Power BI",
      "Pipeline ETL / ELT"
    ]
  },
  {
    id: "exp-bps-jateng",
    role: "Staf IT - Magang",
    company: "Badan Pusat Statistik Provinsi Jawa Tengah",
    location: "Semarang",
    type: "Magang (Internship)",
    period: "Mar 2024 – Apr 2024",
    isCurrent: false,
    isPlaceholder: false,
    summary: "Mendukung operasional teknologi informasi dan administrasi data statistik internal BPS Provinsi Jawa Tengah, meliputi asistensi pembuatan website survei kepuasan pelanggan serta pemeliharaan infrastruktur IT.",
    highlights: [
      "Membantu perancangan dan pengembangan website survei kepuasan pelanggan internal untuk digitalisasi pengumpulan umpan balik.",
      "Melakukan pemeliharaan rutin dan troubleshooting perangkat keras serta lunak guna menjamin kelancaran operasional kantor.",
      "Mendukung proses pengolahan data statistik dan menyelesaikan administrasi teknis terkait kegiatan sensus dan survei resmi."
    ],
    technologies: [
      "Pengembangan Web",
      "Pengolahan Data Statistik",
      "Sistem Survei Digital",
      "Hardware & Software Support",
      "Troubleshooting IT",
      "Administrasi Data"
    ]
  }
];