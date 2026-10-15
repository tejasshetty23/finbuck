import { PartnerMark } from './PartnerLogo'
import { maskName, usd, type Competitor } from '../lib/leaderboard'

// Top-three cards after benny.gg: 1st raised in the middle under a crown with a
// gold glow, 2nd and 3rd either side. Each card carries the partner mark in a
// ring of its metal, the (masked) player, what they've wagered, and the prize.

const TIER = {
  1: { label: '1st', color: '#FFC83D', ring: 'linear-gradient(140deg,#FFE7A0,#FFC83D 45%,#B9851A)', glow: 'rgba(255,200,61,0.28)' },
  2: { label: '2nd', color: '#D3DBE6', ring: 'linear-gradient(140deg,#FFFFFF,#C9D1DC 45%,#7A8494)', glow: 'rgba(211,219,230,0.16)' },
  3: { label: '3rd', color: '#E8935F', ring: 'linear-gradient(140deg,#FFD2B0,#E8935F 45%,#97502A)', glow: 'rgba(232,147,95,0.18)' },
} as const

type Place = 1 | 2 | 3

function Card({ place, entry, prize }: { place: Place; entry: Competitor | null; prize: number | null }) {
  const t = TIER[place]
  const first = place === 1

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border bg-ink-raised px-4 text-center ${
        first ? 'pb-8 pt-10 sm:pb-10 sm:pt-12 border-gold/40' : 'pb-7 pt-8 border-white/[0.07]'
      }`}
      style={{
        boxShadow: `0 0 ${first ? 60 : 36}px ${t.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        background: `linear-gradient(180deg, ${first ? 'rgba(255,200,61,0.07)' : 'rgba(255,255,255,0.025)'} 0%, transparent 55%), #131740`,
      }}
    >
      {first && (
        <svg viewBox="0 0 24 24" className="absolute -top-9 h-9 w-9 drop-shadow-[0_0_14px_rgba(255,200,61,0.6)]" fill="#FFC83D" aria-hidden>
          <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z" />
        </svg>
      )}

      {/* Avatar: partner mark in a ring of the place's metal, rank badge below */}
      <div className="relative">
        <div className={`rounded-full p-[3px] ${first ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-16 w-16 sm:h-20 sm:w-20'}`} style={{ background: t.ring }}>
          <div className="flex h-full w-full items-center justify-center rounded-full bg-ink-deep">
            <PartnerMark className="h-[55%]" />
          </div>
        </div>
        <span
          className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-deep"
          style={{ background: t.color }}
        >
          {t.label}
        </span>
      </div>

      <p className={`mt-6 font-bold text-white ${first ? 'text-lg' : 'text-base'}`}>
        {entry ? maskName(entry.name) : 'Open spot'}
      </p>

      <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-faint">Wagered</p>
      <p className="mt-0.5 text-sm font-semibold text-white/90 tabular-nums">{entry ? usd(entry.wagered, true) : '—'}</p>

      <div className="my-4 h-px w-16 bg-white/[0.08]" />

      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-faint">Prize</p>
      <p
        className={`mt-0.5 font-extrabold tabular-nums ${first ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}
        style={{ color: t.color, textShadow: `0 0 22px ${t.glow}` }}
      >
        {prize === null ? '—' : usd(prize)}
      </p>

      {/* Metal hairline along the bottom edge */}
      <div
        className="absolute bottom-0 left-1/2 h-[2px] w-1/2 -translate-x-1/2 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${t.color}, transparent)` }}
      />
    </div>
  )
}

export default function Podium({
  entries,
  prizes,
}: {
  /** Positions 1-3, in order; missing places render as open spots. */
  entries: (Competitor | null)[]
  prizes: (number | null)[]
}) {
  return (
    // Stacked 1st-2nd-3rd on phones; side by side from sm with 1st in the
    // middle, lifted, and the outer two settled on a shared baseline.
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3 sm:items-end sm:gap-5">
      <div className="sm:order-2 sm:-translate-y-4">
        <Card place={1} entry={entries[0] ?? null} prize={prizes[0] ?? null} />
      </div>
      <div className="sm:order-1">
        <Card place={2} entry={entries[1] ?? null} prize={prizes[1] ?? null} />
      </div>
      <div className="sm:order-3">
        <Card place={3} entry={entries[2] ?? null} prize={prizes[2] ?? null} />
      </div>
    </div>
  )
}
