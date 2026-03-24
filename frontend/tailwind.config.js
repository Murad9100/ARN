/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: '#0b0f14', 1: '#0d1117', 2: '#111827', 3: '#161d2a', 4: '#1a2235' },
        border: { DEFAULT: '#1a2030', 2: '#232d42' },
        text: { 1: '#e2e8f0', 2: '#64748b', 3: '#334155' },
      },
      animation: {
        'price-up': 'priceUp 1.5s ease forwards',
        'price-down': 'priceDown 1.5s ease forwards',
        'shimmer': 'shimmer 1.4s infinite',
        'pulse-dot': 'pulseDot 1.5s infinite',
      },
      keyframes: {
        priceUp: { '0%': { color: '#4ade80' }, '100%': { color: '#e2e8f0' } },
        priceDown: { '0%': { color: '#f87171' }, '100%': { color: '#e2e8f0' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        pulseDot: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.2 } },
      },
    },
  },
  plugins: [],
}
