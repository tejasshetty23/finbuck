import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          gem: '#00ff87',
          dark: '#00c96a',
        },
        purple: {
          deep: '#1a0a2e',
          mid: '#6b21a8',
          bright: '#a855f7',
        },
        bg: {
          dark: '#07050f',
          card: '#100d1f',
          card2: '#16112a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Impact', 'Arial Black', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { textShadow: '0 0 10px #00ff87, 0 0 20px #00ff87' },
          '100%': { textShadow: '0 0 20px #00ff87, 0 0 40px #00ff87, 0 0 60px #00ff87' },
        },
      },
      dropShadow: {
        green: '0 0 20px rgba(0,255,135,0.5)',
        purple: '0 0 20px rgba(168,85,247,0.5)',
      },
    },
  },
  plugins: [],
}

export default config
