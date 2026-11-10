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
    summary: "Bertanggung jawab sebagai Web Developer dalam membangun dan memelihara aplikasi web sesuai spesifikasi kebutuhan bisnis, mengimplementasikan fitur frontend dan backend, melakukan penanganan bug dan troubleshooting aplikasi, serta integrasi manajemen basis data.",
    highlights: [
      "Mengembangkan dan memelihara aplikasi web fungsional sesuai dengan spesifikasi dan kebutuhan operasional bisnis.",
      "Mengimplementasikan serta merawat fitur antarmuka pengguna (frontend) dan logika layanan server (backend).",
      "Melakukan proses debugging dan troubleshooting secara intensif untuk menyelesaikan kendala performa maupun error aplikasi.",
      "Membantu integrasi basis data relasional serta pengelolaan data sistem agar alur transaksi berjalan stabil."
    ],
    technologies: [
      "Pengembangan Web",
      "Frontend & Backend",
      "Full-Stack",
      "Integrasi Basis Data",
      "Debugging & Troubleshooting",
      "JavaScript / TypeScript",
      "SQL"
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
    summary: "Bertanggung jawab dalam migrasi arsitektur database staging, standardisasi transformasi data menggunakan Stored Procedure SQL, otomatisasi alur kerja ETL menggunakan SQL Server Agent, serta integrasi pelaporan analitik berbasis Microsoft Fabric dan Power BI.",
    highlights: [
      "Melakukan migrasi database staging dari MySQL ke Microsoft SQL Server (SSMS) dengan integritas data terjaga konsisten.",
      "Merancang dan mengimplementasikan Stored Procedure SQL terpusat untuk standardisasi ekstraksi, transformasi, dan pelaporan data ERP.",
      "Mengotomatisasi pekerjaan pipeline ETL dan jadwal refresh dataset dashboard menggunakan SQL Server Agent dan Microsoft Fabric.",
      "Mengelola dan memelihara dashboard Power BI untuk kebutuhan pelaporan bisnis eksekutif lintas divisi.",
      "Menangani serta memproses permintaan data operasional untuk pengguna bisnis lintas departemen."
    ],
    technologies: [
      "Microsoft SQL Server",
      "SSMS",
      "MySQL",
      "Stored Procedures",
      "SQL Server Agent",
      "Microsoft Fabric",
      "Power BI",
      "On-Premises Data Gateway",
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
    summary: "Mendukung operasional teknologi informasi dan administrasi data statistik di lingkungan BPS Provinsi Jawa Tengah, meliputi asistensi pengembangan situs survei kepuasan pelanggan internal, penanganan teknis perangkat keras dan lunak, serta pengolahan data statistik.",
    highlights: [
      "Membantu perancangan dan pengembangan website survei kepuasan pelanggan internal untuk memfasilitasi pengumpulan data umpan balik masyarakat.",
      "Melakukan pemeliharaan dan troubleshooting perangkat keras (hardware) serta perangkat lunak (software) guna menjamin kelancaran operasional kantor.",
      "Mendukung proses pengolahan data statistik dan menyelesaikan tugas-tugas administratif teknis terkait kegiatan sensus dan survei resmi."
    ],
    technologies: [
      "Pengembangan Web",
      "Pengolahan Data Statistik",
      "Troubleshooting IT",
      "Sistem Survei Digital",
      "Hardware & Software Support",
      "Administrasi Data"
    ]
  }
];