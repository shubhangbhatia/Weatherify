/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B18',
          900: '#0B132B',
          850: '#111D3E',
          800: '#1C2541',
          700: '#2A365F',
          600: '#3A4A7A'
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          accent: '#00F0FF'
        },
        electric: {
          500: '#3B82F6',
          400: '#60A5FA',
          accent: '#2563EB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
