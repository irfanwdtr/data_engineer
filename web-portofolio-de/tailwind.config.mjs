/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#090D16',
          card: '#0F172A',
          'card-hover': '#162032',
          border: '#1E293B',
          'border-highlight': '#334155',
          primary: '#38BDF8',
          secondary: '#818CF8',
          emerald: '#10B981',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pipeline-flow': 'pipelineFlow 2s linear infinite',
      },
      keyframes: {
        pipelineFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
};

