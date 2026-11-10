export interface Profile {
  name: string;
  role: string;
  subtitle: string;
  bio: string;
  aboutStory: {
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  };
  location: string;
  email: string;
  github: string;
  linkedin: string;
  cvUrl: string;
  availability: string;
  metrics: {
    label: string;
    value: string;
    description: string;
  }[];
}

export const profile: Profile = {
  name: "Irfan Widiantoro",
  role: "Data Engineer",
  subtitle: "Merancang pipeline ETL/ELT yang tangguh, platform data scalable, dan infrastruktur cloud terotomatisasi.",
  bio: "Data Engineer yang berfokus pada pembangunan pipeline data yang andal, arsitektur data warehouse modern, dan orkestrasi alur kerja otomatis. Berpengalaman dalam mengubah data mentah dari berbagai sumber menjadi aset data bernilai tinggi dan siap dianalisis untuk kebutuhan bisnis modern.",
  aboutStory: {
    paragraph1: "Halo! Saya Irfan Widiantoro, seorang Data Engineer dan Web Developer yang berdedikasi membangun sistem data yang andal, scalable, dan mudah diobservasi. Fokus utama rekayasa saya adalah menghubungkan data mentah operasional dengan kecerdasan bisnis (business intelligence) melalui perancangan pipeline ETL/ELT mission-critical, transformasi data terdistribusi, dan otomasi alur kerja.",
    paragraph2: "Bagi saya, Data Engineering bukan hanya tentang memindahkan data dari satu tempat ke tempat lain, tetapi juga memastikan data dapat digunakan dengan baik, konsisten, dan mudah dikelola.",
    paragraph3: "Saat ini saya siap untuk berkontribusi dalam merancang arsitektur data batch maupun streaming berkecepatan tinggi, mengoptimalkan performa query, serta membantu organisasi mengambil keputusan berbasis data yang akurat."
  },
  location: "Indonesia (Terbuka untuk Remote & Hybrid)",
  email: "career.irfanwidiantoro@gmail.com",
  github: "https://github.com/irfanwdtr",
  linkedin: "https://www.linkedin.com/in/irfan-widiantoro-1925a324a/",
  cvUrl: "/documents/CV_Irfan_Widiantoro_Data_Engineer.pdf",
  availability: "Tersedia untuk Posisi & Kolaborasi Data Engineering",
  metrics: [
    {
      label: "Ingesti Data & Pipeline",
      value: "Siap Produksi",
      description: "Ingesti batch & event-driven menggunakan skrip Python dan DAG Airflow"
    },
    {
      label: "Pemodelan Data",
      value: "dbt & Star Schema",
      description: "Pemodelan Dimensional bersih, Medallion Architecture, dan 3NF"
    },
    {
      label: "Observabilitas Sistem",
      value: "99.9% Uptime",
      description: "Peringatan SLA otomatis, validasi skema, dan pengujian kualitas data"
    },
    {
      label: "Cloud & Data Warehouse",
      value: "AWS & SQL",
      description: "Penyimpanan cloud S3, data lake terpartisi, dan optimasi query SQL"
    }
  ]
};
