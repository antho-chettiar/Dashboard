/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:   "#1A3A5C",
          orange: "#F97316",
          blue:   "#2563EB",
          teal:   "#0D9488",
          green:  "#15803D",
          red:    "#DC2626",
          purple: "#7C3AED",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}