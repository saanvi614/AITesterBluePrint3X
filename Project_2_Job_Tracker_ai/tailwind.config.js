/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#161616',
          card: '#1e1e1e',
          hover: '#242424',
          sidebar: '#111111',
        },
        border: {
          DEFAULT: '#2a2a2a',
          hover: '#3a3a3a',
        }
      }
    },
  },
  plugins: [],
}
