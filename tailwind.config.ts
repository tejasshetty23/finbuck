import type { Config } from 'tailwindcss'

// Slate-navy ground sampled from arjhatescash.com; accent is Stake's brand
// blue, as used on benny.gg (also a Stake affiliate). Gold/silver/bronze are
// kept for leaderboard ranks only.
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
          DEFAULT: '#1B1D29', // page
          deep: '#15171F', // header bar, footer
          raised: '#202433', // cards
          high: '#272B3D', // hovered / nested cards
        },
        accent: {
          DEFAULT: '#1475E1', // Stake blue — buttons, fills, borders
          // Lifted for text and small marks: #1475E1 on the slate ground only
          // reaches ~3.7:1 contrast, too low for 11px labels.
          bright: '#4D96F0',
          deep: '#0E5DBE',
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
        accent: '0 0 24px rgba(20,117,225,0.40)',
        'accent-lg': '0 0 44px rgba(20,117,225,0.55)',
      },
    },
  },
  plugins: [],
}

export default config
