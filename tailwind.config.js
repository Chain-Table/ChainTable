/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Lilita One'", 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', '-apple-system', "'Segoe UI'", 'Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
};