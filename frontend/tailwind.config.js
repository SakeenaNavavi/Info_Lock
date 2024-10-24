/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // You can add custom colors here
        primary: {
          900: '#1a1f2c',  // Dark blue
          800: '#1e3a8a',  // Medium blue
        }
      }
    },
  },
  plugins: [],
}