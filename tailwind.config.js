/** @type {import('tailwindcss').Config} */
const { light, dark } = require('./colors');

module.exports = {
  content: [
    "./index.html",
    "./js/**/*.js",
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ...light,
        ...dark,
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'lg': '8px',
      },
    },
  },
  plugins: [],
}
