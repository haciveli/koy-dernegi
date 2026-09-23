/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        koy: {
          50: '#f2f7f4',
          100: '#dcebe1',
          200: '#bcd7c6',
          300: '#91b9a2',
          400: '#63977c',
          500: '#427a5f',
          600: '#2f6149',
          700: '#27503d',
          800: '#214233',
          900: '#1c372b',
          950: '#0f231b',
        },
        vurgu: {
          50: '#fdf8ee',
          100: '#f9edcf',
          200: '#f2d99c',
          300: '#e8bf63',
          400: '#dda63c',
          500: '#c98a24',
          600: '#a86a1b',
          700: '#854e19',
          800: '#6e3f1b',
          900: '#5e361a',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 16px -6px rgba(16, 24, 40, 0.10)',
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 12px 32px -12px rgba(16, 24, 40, 0.16)',
        lift: '0 2px 4px rgba(16, 24, 40, 0.06), 0 24px 48px -16px rgba(16, 24, 40, 0.24)',
        glow: '0 12px 32px -10px rgba(47, 97, 73, 0.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
