# Irfan Widiantoro — Data Engineer Portfolio

A modern, high-performance, and lightweight personal portfolio website for **Irfan Widiantoro**, Data Engineer. Built with **Astro (SSG)**, **TypeScript**, and **Tailwind CSS**.

Designed with a **Modern Dark Tech** aesthetic inspired by data engineering platforms and distributed infrastructure dashboards.

---

## ⚡ Tech Stack & Architecture

- **Core Framework**: [Astro 5](https://astro.build) (Static Site Generation / SSG)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with custom Dark Tech color palette
- **Content Management**: Astro Content Collections with Markdown (`src/content/projects/`)
- **Diagrams**: [Mermaid.js](https://mermaid.js.org/) for system architecture & data flow diagrams
- **Fonts**: Inter & JetBrains Mono (Google Fonts)
- **Deployment**: [Vercel](https://vercel.com) & GitHub integration

---

## 🚀 Key Features

- **Data Engineering Brand**: Communicates expertise in ETL/ELT pipelines, dimensional modeling, Airflow orchestration, and cloud infrastructure.
- **Interactive System Architecture**: Project detail pages render dynamic Mermaid architecture and data flow diagrams.
- **Editable Content Collections**: Reusable Markdown schemas for project case studies with business problem, objectives, star schema, and engineering challenges.
- **Structured Data Layer**:
  - `src/data/profile.ts`: Bio, contact details, social links, and metrics.
  - `src/data/skills.ts`: Categorized skills matrix (Languages, Data Engineering, Databases, Cloud/Infra, Analytics).
  - `src/data/experience.ts`: Professional career timeline with clearly marked editable placeholders.
- **Zero Backend / Zero Database**: 100% static HTML generation for sub-second load times and high Lighthouse performance.

---

## 📁 Project Structure

```
├── public/
│   ├── documents/
│   │   └── CV_Irfan_Widiantoro_Data_Engineer.pdf
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── About.astro
│   │   ├── Contact.astro
│   │   ├── Experience.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── Navbar.astro
│   │   ├── ProjectCard.astro
│   │   └── Skills.astro
│   ├── content/
│   │   ├── config.ts
│   │   └── projects/
│   │       ├── airflow-data-orchestration-platform.md
│   │       ├── cloud-data-warehouse-implementation.md
│   │       ├── end-to-end-enterprise-etl-pipeline.md
│   │       └── stock-market-intelligence-pipeline.md
│   ├── data/
│   │   ├── experience.ts
│   │   ├── profile.ts
│   │   └── skills.ts
│   ├── layouts/
│   │   └── MainLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   └── projects/
│   │       └── [slug].astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── vercel.json
```

---

## 🛠️ Local Development & Build

### Prerequisites
- Node.js `v18+` or `v20+` or `v24+`
- npm `v9+` or `v10+` or `v11+`

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open `http://localhost:4321` in your browser.

### Production Static Build
```bash
npm run build
```
Static artifacts will be compiled into the `dist/` directory.

---

## 🚢 Vercel Deployment

This project is pre-configured for instant zero-configuration deployment to Vercel:

1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your `portofolio-de` GitHub repository.
4. Framework Preset: **Astro** (auto-detected).
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.

