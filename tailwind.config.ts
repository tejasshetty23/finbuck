import type { Config } from 'tailwindcss'

// Palette taken from the references: slate-navy ground and mint accent sampled
// from arjhatescash.com, gold/silver/bronze kept only for leaderboard ranks.
// Gamba's own logo mint (#05F9A1) sits a shade greener than `mint`, so the
// partner lockup reads as the same family rather than a clash.
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B1D29', // page
          deep: '#15171F', // header bar, footer
          raised: '#202433', // cards
          high: '#272B3D', // hovered / nested cards
        },
        mint: {
          DEFAULT: '#5CFFC1',
          deep: '#2FD99B',
          soft: '#A6FFE0',
        },
        muted: '#8A90A6',
        faint: '#5B6178',
        gold: '#FFC83D',
        silver: '#D3DBE6',
        bronze: '#E8935F',
      },
      fontFamily: {
        // Oxanium, as on arj — squared-off and legible down to body sizes, so
        // one face covers headings and text alike. Loaded in app/layout.tsx.
        sans: ['var(--font-oxanium)', 'system-ui', 'sans-serif'],
        display: ['var(--font-oxanium)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        mint: '0 0 24px rgba(92,255,193,0.35)',
        'mint-lg': '0 0 44px rgba(92,255,193,0.45)',
      },
    },
  },
  plugins: [],
}

export default config
