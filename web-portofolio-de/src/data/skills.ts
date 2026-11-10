export interface SkillItem {
  name: string;
  category: string;
  proficiencyLevel?: 'Lanjutan' | 'Menengah' | 'Mahir';
  iconName?: string;
  description: string;
}

export interface SkillCategory {
  title: string;
  categoryKey: string;
  description?: string;
  accentColor: 'sky' | 'amber' | 'emerald' | 'indigo' | 'teal' | 'violet';
  skills: SkillItem[];
}

export const skillCategories: SkillCategory[] = [
  {
    title: "Rekayasa Data & Pipeline",
    categoryKey: "data_engineering",
    accentColor: "sky",
    skills: [
      {
        name: "ETL Automation",
        category: "data_engineering",
        description: "Perancangan dan penjadwalan pipeline ETL otomatis dari sumber data mentah hingga reporting."
      },
      {
        name: "SQL Stored Procedures",
        category: "data_engineering",
        description: "Logika ekstraksi, transformasi, dan pemuatan data terpusat menggunakan Stored Procedure SQL."
      },
      {
        name: "Databricks",
        category: "data_engineering",
        description: "Lakehouse platform, Unity Catalog Volumes, Delta Tables, dan Databricks Jobs scheduling."
      },
      {
        name: "Microsoft Fabric",
        category: "data_engineering",
        description: "Cloud data lakehouse, Medallion Architecture (Bronze-Silver), dan Fabric Data Pipeline."
      },
      {
        name: "Apache Spark (Basic)",
        category: "data_engineering",
        description: "Pemrosesan data skala besar, transformasi DataFrame PySpark, dan optimasi komputasi terdistribusi."
      },
      {
        name: "Pentaho (Basic)",
        category: "data_engineering",
        description: "Visual ETL PDI/Spoon, multi-stream lookup surrogate keys, dimension upsert, dan Kitchen CLI."
      },
      {
        name: "Apache Airflow - Basic",
        category: "data_engineering",
        description: "Pembuatan DAG, custom operators, pemantauan sensor dependensi task, dan penjadwalan berkala."
      },

    ]
  },
  {
    title: "Manajemen Basis Data",
    categoryKey: "databases",
    accentColor: "emerald",
    skills: [
      {
        name: "MySQL",
        category: "databases",
        description: "Desain skema OLTP relasional, optimasi index B-Tree, manipulasi data transaksional, dan staging."
      },
      {
        name: "SQL Server (SSMS)",
        category: "databases",
        description: "Manajemen database enterprise, SSMS via RDP, SQL Server Agent automation, dan T-SQL scripting."
      },
      {
        name: "PostgreSQL",
        category: "databases",
        description: "Query analitik performa tinggi, partisi tabel waktu, tipe data JSONB, dan indexing teroptimasi."
      },
      {
        name: "Star Schema Modeling",
        category: "databases",
        description: "Perancangan Fact & Dimension Tables, surrogate key lookups, dan optimasi skema data warehouse."
      }
    ]
  },
  {
    title: "Bahasa Pemrograman",
    categoryKey: "languages",
    accentColor: "amber",
    skills: [
      {
        name: "Python",
        category: "languages",
        description: "Bahasa utama untuk data pipeline, skrip ETL otomatisasi, ekstraksi API, dan pemrosesan data."
      },
      {
        name: "PHP",
        category: "languages",
        description: "Pengembangan aplikasi web backend, integrasi REST API, dan manipulasi data dinamis."
      },
      {
        name: "JavaScript",
        category: "languages",
        description: "Pengembangan web interaktif, logika asynchronous, dan visualisasi frontend modern."
      },
      {
        name: "TypeScript",
        category: "languages",
        description: "Tooling web modern bertipe data statis, keamanan kode berskala enterprise, dan integrasi Next.js."
      },
      {
        name: "SQL",
        category: "languages",
        description: "Window functions, Common Table Expressions (CTE), Stored Procedures, dan optimasi kueri kompleks."
      }
    ]
  },
  {
    title: "Pengembangan Web (Web Developer)",
    categoryKey: "web_development",
    accentColor: "teal",
    skills: [
      {
        name: "Web Development",
        category: "web_development",
        description: "Pengembangan dan pemeliharaan aplikasi web fungsional sesuai dengan kebutuhan operasional bisnis."
      },
      {
        name: "Next.js",
        category: "web_development",
        description: "Framework full-stack React modern dengan App Router, server-side rendering, dan routing dinamis."
      },
      {
        name: "FastAPI",
        category: "web_development",
        description: "Framework Python modern berperforma tinggi untuk pembangunan RESTful API dan data serving layer."
      },
      {
        name: "Tailwind CSS",
        category: "web_development",
        description: "Styling antarmuka modern berbasis utility-first CSS yang responsif, rapi, dan cepat."
      },
      {
        name: "Filament",
        category: "web_development",
        description: "Desain, integrasi, dan konsumsi endpoint RESTful API untuk menghubungkan frontend dan data backend."
      },
            {
        name: "Laravel",
        category: "web_development",
        description: "Framework"
      }
    ]
  },
  {
    title: "Analisis Data & Business Intelligence",
    categoryKey: "business_intelligence",
    accentColor: "violet",
    skills: [
      {
        name: "Power BI",
        category: "business_intelligence",
        description: "Pemodelan data relasional, kalkulasi formula DAX kompleks, laporan KPI interaktif, dan automated refresh."
      },
      {
        name: "Looker Studio",
        category: "business_intelligence",
        description: "Penyusunan dashboard pelaporan visual berbasis cloud yang mudah dibagikan kepada stakeholder."
      },
      {
        name: "Tableau (Basic)",
        category: "business_intelligence",
        description: "Visualisasi data analitik, eksplorasi pola visual, dan pembuatan grafik interaktif bisnis."
      },
      {
        name: "Microsoft Excel",
        category: "business_intelligence",
        description: "Analisis data tabular, Pivot Table, VLOOKUP/XLOOKUP, dan pemodelan kalkulasi dasar operasional."
      },
      {
        name: "Pandas",
        category: "business_intelligence",
        description: "Manipulasi dataframe, pembersihan data mentah, agregasi statistik, dan analisis tren dalam Python."
      }
    ]
  },
  {
    title: "Cloud Platforms & Development Tools",
    categoryKey: "cloud_devops",
    accentColor: "indigo",
    skills: [
      {
        name: "AWS Basic (Glue, EMR, EC2, Redshift)",
        category: "cloud_devops",
        description: "Layanan cloud AWS: Glue ETL & Data Catalog, EMR cluster, EC2 compute instances, dan Redshift warehouse."
      },
      {
        name: "Docker",
        category: "cloud_devops",
        description: "Kontainerisasi aplikasi, manajemen multi-service via Docker Compose, dan isolasi runtime dependensi."
      },
      {
        name: "Git",
        category: "cloud_devops",
        description: "Sistem version control terdistribusi untuk pelacakan kode, branch management, dan kolaborasi tim."
      },
      {
        name: "GitLab",
        category: "cloud_devops",
        description: "Manajemen repositori proyek enterprise, CI/CD automated pipeline, dan issue tracking."
      },
      {
        name: "Sourcetree",
        category: "cloud_devops",
        description: "Antarmuka visual Git GUI untuk visualisasi branching, commit history, dan manajemen repository yang rapi."
      },

    ]
  }
];
