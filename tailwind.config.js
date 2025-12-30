/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ableton: {
          bg: '#1a1a1a',
          'bg-light': '#232323',
          surface: '#2d2d2d',
          'surface-light': '#3a3a3a',
          border: '#3d3d3d',
          'border-light': '#4a4a4a',
          text: '#e0e0e0',
          'text-dim': '#8a8a8a',
          'text-muted': '#666666',
          accent: '#ff764d',
          'accent-hover': '#ff8a66',
          'accent-dim': '#cc5e3d',
          green: '#1db954',
          'green-dim': '#1a9e48',
          yellow: '#f5c542',
          red: '#e24444',
          'key-white': '#f0f0f0',
          'key-white-hover': '#e8e8e8',
          'key-black': '#1a1a1a',
          'key-black-hover': '#2a2a2a',
        },
      },
      fontFamily: {
        mono: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      boxShadow: {
        'key-active': '0 0 15px rgba(255, 118, 77, 0.6)',
        'knob': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'module': '0 4px 12px rgba(0, 0, 0, 0.3)',
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
