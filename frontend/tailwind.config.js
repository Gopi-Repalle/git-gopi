/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff1f0',
          100: '#ffe4e1',
          200: '#ffc9c4',
          300: '#ff9e96',
          400: '#ff6b5e',
          500: '#ff3d2e',
          600: '#e8200f',
          700: '#c0160a',
          800: '#9e150c',
          900: '#831710',
        },
        spice: {
          red: '#C0392B',
          dark: '#922B21',
          orange: '#E67E22',
          cream: '#FFF8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
