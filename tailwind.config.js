/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#d9e5ff',
          500: '#4f7cff',
          600: '#3b63e6',
          700: '#2f4fc0',
        },
      },
    },
  },
  plugins: [],
};
