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
        brand: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
        },
        ink: { 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px -12px rgb(15 23 42 / 0.12)',
        card: '0 1px 3px rgb(15 23 42 / 0.05), 0 12px 32px -16px rgb(15 23 42 / 0.15)',
        glow: '0 8px 24px -8px rgb(16 185 129 / 0.55)',
      },
      borderRadius: { '4xl': '2rem' },
      animation: {
        'fade-in': 'fadeIn .35s ease both',
        'slide-up': 'slideUp .4s cubic-bezier(.21,1.02,.55,1.01) both',
        'scale-in': 'scaleIn .25s ease both',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(.96) translateY(8px)' }, to: { opacity: '1', transform: 'scale(1) translateY(0)' } },
      },
    },
  },
  plugins: [],
};
