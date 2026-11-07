import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0D14",
        foreground: "#F8FAFC",
        card: {
          DEFAULT: "#121727",
          foreground: "#F8FAFC",
          muted: "#182035",
        },
        sidebar: {
          DEFAULT: "#0D111D",
          foreground: "#F8FAFC",
          border: "#1E2742",
        },
        border: "#1F2844",
        input: "#182036",
        primary: {
          DEFAULT: "#6366F1",
          foreground: "#FFFFFF",
          hover: "#4F46E5",
          accent: "#7C3AED",
        },
        success: {
          DEFAULT: "#10B981",
          foreground: "#FFFFFF",
          bg: "rgba(16, 185, 129, 0.12)",
        },
        danger: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
          bg: "rgba(239, 68, 68, 0.12)",
        },
        muted: {
          DEFAULT: "#64748B",
          foreground: "#94A3B8",
        },
      },
    },
  },
  plugins: [],
};

export default config;

