/* eslint-disable @next/next/no-img-element */
import { MILESTONES } from '../lib/site'

// The wager milestone cards: target wager, reward, and a coin in the corner
// for the tier (bronze, silver, gold). Used on the Milestones page.

const TIER = {
  bronze: { coin: '/coin-bronze.webp', reward: 'text-white', edge: 'rgba(255,255,255,0.10)', glow: 'none' },
  silver: { coin: '/coin-silver.webp', reward: 'text-[#B4A7FF]', edge: 'rgba(180,167,255,0.35)', glow: 'none' },
  gold: { coin: '/coin-gold.webp', reward: 'text-accent-bright', edge: 'rgba(0,255,135,0.55)', glow: '0 0 28px rgba(0,255,135,0.18)' },
} as const

/** 10000 -> "10K", 2500000 -> "2.5M" */
export function shortWager(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}K`
  return String(n)
}

const usd = (n: number) => '$' + n.toLocaleString('en-US')

export default function MilestoneGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {MILESTONES.map((m) => {
        const t = TIER[m.tier]
        return (
          <div key={m.wager} className="relative pt-3">
            <img
              src={t.coin}
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-2 -top-1 z-10 w-10 select-none drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)] sm:w-12"
            />
            <div
              className="flex flex-col items-center rounded-2xl bg-[#131740]/80 px-3 py-5 text-center backdrop-blur-sm sm:py-6"
              style={{ boxShadow: `inset 0 0 0 1px ${t.edge}, ${t.glow}` }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-faint">Wager</span>
              <span className="font-display mt-1 text-[clamp(2.2rem,6vw,3rem)] leading-none text-white">{shortWager(m.wager)}</span>
              <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-faint">You get</span>
              <span className={`font-display mt-1 text-[clamp(2rem,5.5vw,2.8rem)] leading-none ${t.reward}`}>{usd(m.reward)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
