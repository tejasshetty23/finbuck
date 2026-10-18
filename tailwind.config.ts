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
          raised: '#22285F', // cards
          high: '#2B3275', // hovered / nested cards
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
        faint: '#A39DC8', // >=4.5:1 on the lighter cards as well as the page: it carries the small labels
        gold: '#FFC83D',
        silver: '#D3DBE6',
        bronze: '#E8935F',
      },
      fontFamily: {
        // Inter for reading; Big Shoulders Display for headlines and numbers.
        // Both self-hosted from public/fonts via @font-face in globals.css.
        sans: ['var(--font-site)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Arial Narrow', 'Impact', 'sans-serif'],
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
