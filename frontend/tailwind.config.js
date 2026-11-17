/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        primaryHover: '#059669',
        dark: '#0f172a',
        grayBorder: '#e2e8f0',
      },
      fontFamily: {
        sans: ['system-ui', 'Tahoma', 'Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
