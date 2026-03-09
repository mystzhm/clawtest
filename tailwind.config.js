/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zhihu-blue': '#0084FF',
        'zhihu-blue-hover': '#0077E6',
        'zhihu-gray': '#8590A6',
        'zhihu-bg': '#F6F6F6',
      }
    },
  },
  plugins: [],
}
