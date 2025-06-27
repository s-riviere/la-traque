/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'custom-green': '#19e119',
        'custom-red': '#e11919',
        'custom-orange': '#fa6400',
        'custom-blue': '#1e90ff',
        'custom-grey': '#808080',
        'custom-light-blue': '#80b3ff'
      }
    }
  },
  mode: 'jit',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  fontFamily: {
    sans: ["Inter", "sans-serif"],
    serif: ["Merriweather", "serif"],
  },
  plugins: [],
};
