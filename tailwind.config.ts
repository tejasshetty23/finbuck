import type { Config } from 'tailwindcss'

// Deep blue-violet navy ground with FinBuck's own neon green as the accent (the
// green the live site has always used). Gold/silver/bronze are kept for
// leaderboard ranks only.
//
// The accent is named for its role, not its colour, so a future partner
// change is a two-value edit here rather than a sweep through every page.
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
          DEFAULT: '#0B0E2A', // page — deep blue-violet navy
          deep: '#080A20', // header bar, footer
          raised: '#131740', // cards
          high: '#1A1F4E', // hovered / nested cards
        },
        accent: {
          DEFAULT: '#00FF87', // FinBuck neon — buttons, fills, borders
          // Same green: unlike the earlier blue it's bright enough to read as
          // small text on the dark ground, so no lifted variant is needed.
          bright: '#00FF87',
          deep: '#00C96A',
        },
        // Greys tinted toward the violet ground so they don't read as cold.
        muted: '#B3AED0',
        faint: '#908AB8', // >=4.5:1 on cards as well as the page: it carries the small labels
        gold: '#FFC83D',
        silver: '#D3DBE6',
        bronze: '#E8935F',
      },
      fontFamily: {
        // One face for headings and text alike: --font-site in globals.css,
        // loaded by the <link> in app/layout.tsx.
        sans: ['var(--font-site)', 'system-ui', 'sans-serif'],
        display: ['var(--font-site)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        accent: '0 0 24px rgba(0,255,135,0.30)',
        'accent-lg': '0 0 44px rgba(0,255,135,0.45)',
      },
    },
  },
  plugins: [],
}

export default config
