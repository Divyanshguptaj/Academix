/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'], 
  theme: {
    extend: {
      boxShadow: {
        '4xl': '25px 25px 0px white,5px 5px 25px cyan',
      },
      fontFamily: {
        vietnam: ['"Be Vietnam Pro"', 'sans-serif'],
        edu: ['"Edu SA Beginner"', 'cursive'],
      },
      colors: {
        richblack: {
          5:   "#F9F9F9",
          25:  "#F2F2F2",
          50:  "#E8E8E8",
          100: "#CFCFCF",
          200: "#f0f0f0",
          300: "#f6f6f6",
          400: "#9E9E9E",
          500: "#6E6E6E",
          600: "#3A3A3A",
          700: "#262626",
          800: "#1d1d1d",
          900: "#121220",
        },
      },
    },
  },
  plugins: [],
};
