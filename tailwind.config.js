/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gr: {
          bg:      '#0f172a',
          surface: '#1e293b',
          border:  '#334155',
          accent:  '#3b82f6',
          text:    '#e2e8f0',
          muted:   '#94a3b8',
        },
      },
    },
  },
  plugins: [],
};