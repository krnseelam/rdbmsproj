/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07090E',
          900: '#0C101A',
          850: '#111726',
          800: '#161F33',
          700: '#1F2C47',
          600: '#2D3E61',
        },
        brand: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
