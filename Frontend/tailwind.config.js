/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dce3ff',
          200: '#b9c7ff',
          300: '#8da5ff',
          400: '#6180ff',
          500: '#4361ee',
          600: '#3a4fd4',
          700: '#2f3fb0',
          800: '#27338d',
          900: '#1e2870',
        },
        accent: {
          400: '#f72585',
          500: '#e5166f',
        },
        success: {
          400: '#10b981',
          500: '#059669',
        },
        warning: {
          400: '#f59e0b',
          500: '#d97706',
        },
        danger: {
          400: '#ef4444',
          500: '#dc2626',
        },
        dark: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#23233a',
          500: '#2d2d4a',
          400: '#3a3a5c',
          300: '#5a5a7e',
          200: '#8888a8',
          100: '#b3b3cc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
