/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9f3', 100: '#d6f1e3', 200: '#aee3c9', 300: '#7fce9f',
          400: '#4eb578', 500: '#2a9b5e', 600: '#1c7d49', 700: '#16633b',
          800: '#134f31', 900: '#0f3e27',
        },
        accent: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcd9ff', 300: '#8ec0ff',
          400: '#599cff', 500: '#3377f6', 600: '#1f59db', 700: '#1a47b0',
          800: '#1b3e8c', 900: '#1b376e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
