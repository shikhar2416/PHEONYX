import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        base: {
          900: '#0B1020',
          800: '#0F1525',
          700: '#161D33',
          600: '#1E2745',
        },
        accent: {
          emerald: '#34D399',
          cyan: '#22D3EE',
        },
        danger: {
          DEFAULT: '#F43F5E',
          soft: '#FB7185',
        },
        caution: {
          DEFAULT: '#FBBF24',
          soft: '#FCD34D',
        },
        ok: {
          DEFAULT: '#34D399',
          soft: '#6EE7B7',
        },
      },
      animation: {
        'shake-in': 'shakeIn 0.6s cubic-bezier(.36,.07,.19,.97) both',
        'pulse-border': 'pulseBorder 2s ease-in-out infinite',
        'aurora': 'aurora 18s ease infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'count-up': 'countUp 0.3s ease-out',
      },
      keyframes: {
        shakeIn: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        pulseBorder: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(244, 63, 94, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(244, 63, 94, 0)' },
        },
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
