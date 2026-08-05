/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ableton: {
          bg: '#171713',
          'bg-light': '#201f1a',
          surface: '#292821',
          'surface-light': '#343229',
          border: '#555043',
          'border-light': '#6e6757',
          text: '#eee6d2',
          'text-dim': '#b6ad98',
          'text-muted': '#777061',
          'text-secondary': '#b6ad98',
          accent: '#d78a37',
          'accent-hover': '#edaa57',
          'accent-dim': '#a8662d',
          orange: '#d78a37',
          green: '#9bad80',
          'green-dim': '#71805f',
          yellow: '#c9a84f',
          red: '#ad5c4d',
          'key-white': '#e8dfca',
          'key-white-hover': '#f4ecd9',
          'key-black': '#191915',
          'key-black-hover': '#2b2a24',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        sans: [
          'Avenir Next',
          'Geist',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'key-active': '0 3px 0 #9e5e23, inset 0 1px 0 rgba(255,255,255,0.28)',
        'knob': '0 5px 9px rgba(8,8,6,0.46), inset 0 1px 0 rgba(255,255,255,0.12)',
        'module': '0 18px 42px rgba(8,8,6,0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 118, 77, 0.3)' },
          '50%': { boxShadow: '0 0 15px rgba(255, 118, 77, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
