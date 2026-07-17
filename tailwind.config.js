/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        miami: {
          pink: '#ED145A',
          'pink-soft': '#F090C0',
          'blue-light': '#18D8F0',
          'blue-beach': '#22ABC7',
          'blue-bright': '#18C0F0',
        },
        dark: {
          DEFAULT: '#0A0D1A',
          900: '#12152A',
          800: '#1E2233',
          700: '#2A2F45',
        },
        muted: {
          DEFAULT: '#8891A5',
          light: '#C5CBD9',
          lighter: '#E2E6EF',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        'glow-pink': '0 0 30px rgba(237,20,90,0.25)',
        'glow-blue': '0 0 30px rgba(24,216,240,0.25)',
        'glow-green': '0 0 30px rgba(16,185,129,0.25)',
      },
    },
  },
  plugins: [],
};
