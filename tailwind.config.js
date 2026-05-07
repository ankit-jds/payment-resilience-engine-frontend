/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: '#27272A',
        secondary: '#3B82F6',
        neutral: '#797676',
        background: '#09090b',
        surface: '#18181b',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        recovery: '#06b6d4'
      }
    },
  },
  plugins: [],
}
