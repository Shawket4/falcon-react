/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1976d2',
          light: '#63a4ff',
          dark: '#004ba0',
        },
        secondary: {
          DEFAULT: '#424242',
        },
        warning: {
          DEFAULT: '#d32f2f',
        },
        success: {
          DEFAULT: '#388e3c',
        },
      },
      fontFamily: {
        sans: ['Axios Pro', 'sans-serif'],
      },
      boxShadow: {
        'custom': '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        'card': '8px',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'pulse': 'pulse 2s infinite',
      }
    },
  },
  plugins: [],
}