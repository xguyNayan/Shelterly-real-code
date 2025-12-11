/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'turquoise': {
          DEFAULT: '#40E0D0',
          '50': '#E6FBFA',
          '100': '#C5F5F2',
          '200': '#94ECE6',
          '300': '#63E3DA',
          '400': '#40E0D0',
          '500': '#25C9B9',
          '600': '#1D9E91',
          '700': '#167369',
          '800': '#0F4941',
          '900': '#071F1C',
        },
        'teal': {
          DEFAULT: '#008080',
          '50': '#E6FFFF',
          '100': '#B3FFFF',
          '200': '#66FFFF',
          '300': '#19FFFF',
          '400': '#00CCCC',
          '500': '#008080',
          '600': '#006666',
          '700': '#004D4D',
          '800': '#003333',
          '900': '#001A1A',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'dm-sans': ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
