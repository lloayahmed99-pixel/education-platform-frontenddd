/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#f59e0b',
        'primary-dark': '#d97706',
        background: '#0f172a',
        card: '#1e293b',
        sidebar: '#1e293b',
        border: '#334155',
        muted: '#94a3b8',
        accent: '#f59e0b',
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
