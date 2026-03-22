/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090E17',
        surface: '#0F172A',
        'surface-hover': '#1E293B',
        primary: {
          DEFAULT: '#00DF9A',
          hover: '#00C88A',
        },
        secondary: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
        },
        tertiary: '#4DB6AC',
        text: {
          DEFAULT: '#E2E8F0',
          muted: '#8892B0',
          heading: '#FFFFFF',
        },
        border: '#1E293B',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 15px rgba(0, 223, 154, 0.15)',
      }
    },
  },
  plugins: [],
}
