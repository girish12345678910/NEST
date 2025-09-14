/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          black: '#000000',
          'dark-gray': '#1a1a1a',
          'medium-gray': '#2d2d2d',
          silver: '#C0C0C0',
          'shiny-silver': '#E5E5E5',
          'light-silver': '#F5F5F5'
        }
      },
    },
  },
  plugins: [],
}
