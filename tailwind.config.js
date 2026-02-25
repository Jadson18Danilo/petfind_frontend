/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'brand-warm': {
          50: '#fff7f1',
          100: '#fff1e6',
          200: '#ffe6d6',
          300: '#ffc9aa',
          400: '#ffb28b',
          500: '#ffa98f',
          600: '#ff8566',
        },
        'bg-warm': '#fffaeb',
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
        },
      },
      boxShadow: {
        soft: '0 12px 30px -20px rgba(15, 23, 42, 0.35)',
        'elev-md': '0 10px 30px rgba(2,6,23,0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
      },
      },
    },
  },
  plugins: [],
};
