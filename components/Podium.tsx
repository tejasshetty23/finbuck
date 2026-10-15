import { maskName, usd, type Competitor } from '../lib/leaderboard'

// Top-three cards. 1st sits raised in the middle, 2nd and 3rd either side.
//
// Each card is a panel with its top-left and bottom-right corners cut at 45°,
// edged in its metal fading toward the bottom, with a trophy tab on the top
// edge, the partner icon tinted in the metal inside a double ring, then the
// (masked) player, their weighted wager and the prize. Colours are sampled
// from the reference design.

const TIER = {
  1: { label: '1st', color: '#FFC44D', rgb: '255,196,77' },
  2: { label: '2nd', color: '#C9D4E4', rgb: '201,212,228' },
  3: { label: '3rd', color: '#E08544', rgb: '224,133,68' },
} as const

type Place = 1 | 2 | 3

/** Size of the 45° corner cuts. */
const CUT = 22
/** Border thickness. */
const B = 1.5

/** Top-left and bottom-right corners cut at 45°. */
const chamfer = (c: number) =>
  `polygon(${c}px 0, 100% 0, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, 0 100%, 0 ${c}px)`

const trophy = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
    <path d="M7 3h10v2h3v3a4 4 0 01-4 4h-.35A5 5 0 0113 14.9V17h3v4H8v-4h3v-2.1A5 5 0 018.35 12H8a4 4 0 01-4-4V5h3V3zm0 4H6v1a2 2 0 001 1.73V7zm10 0v2.73A2 2 0 0018 8V7h-1z" />
  </svg>
)

function Card({ place, entry, prize }: { place: Place; entry: Competitor | null; prize: number | null }) {
  const t = TIER[place]
  const first = place === 1
  const wager = entry ? usd(entry.wagered, true) : null

  return (
    // Room above for the tab, which sits outside the clipped panel so the
    // cut corners don't slice it.
    <div className="relative pt-3.5">
      <span
        className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-md px-5 py-1 text-sm font-extrabold uppercase tracking-wide text-[#0B0E2A]"
        style={{ background: t.color, boxShadow: `0 4px 18px rgba(${t.rgb},0.35)` }}
      >
        {trophy}
        {t.label}
      </span>

      {/* Border: an outer panel in the metal, fading down the card. The inner
          panel's cut is smaller by (2 - √2)·B, so the 45° edge comes out the
          same thickness as the straight edges rather than ~1.4× thicker. */}
      <div
        style={{
          clipPath: chamfer(CUT),
          padding: B,
          background: `linear-gradient(180deg, rgba(${t.rgb},0.95) 0%, rgba(${t.rgb},0.55) 40%, rgba(84,75,93,0.55) 100%)`,
        }}
      >
        <div
          className={`flex flex-col items-center px-5 text-center ${first ? 'pb-9 pt-10 sm:pt-11' : 'pb-8 pt-9'}`}
          style={{
            clipPath: chamfer(CUT - (2 - Math.SQRT2) * B),
            background: `radial-gradient(70% 45% at 50% 22%, rgba(${t.rgb},0.10), transparent 70%), linear-gradient(180deg, #191E52 0%, #12163F 50%, #0D1032 100%)`,
          }}
        >
          {/* Avatar: soft glow, thick dark ring, thin metal ring, tinted icon */}
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-full blur-2xl"
              style={{ background: `rgba(${t.rgb},${first ? 0.35 : 0.22})` }}
            />
            <div
              className={`relative rounded-full bg-[#0B0D26] p-2 ${first ? 'h-32 w-32 sm:h-36 sm:w-36' : 'h-28 w-28 sm:h-32 sm:w-32'}`}
              style={{ boxShadow: `0 0 ${first ? 34 : 26}px rgba(${t.rgb},${first ? 0.45 : 0.32})` }}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-full border-2 bg-[#121843]"
                style={{ borderColor: t.color }}
              >
                {/* The partner icon recoloured to the metal: a CSS mask of
                    the SVG filled with the tier colour. */}
                <span
                  aria-hidden
                  className="block h-1/2 w-1/2"
                  style={{
                    background: t.color,
                    WebkitMask: 'url(/stake-icon.svg) center / contain no-repeat',
                    mask: 'url(/stake-icon.svg) center / contain no-repeat',
                    filter: `drop-shadow(0 0 10px rgba(${t.rgb},0.45))`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className={`mt-5 font-extrabold text-white ${first ? 'text-3xl' : 'text-2xl sm:text-[1.7rem]'}`}>
            {entry ? maskName(entry.name) : 'Open spot'}
          </p>

          <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#9AA0C8]">Weighted wager</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums text-white">
            {wager ? (
              <>
                <span className="text-[#9AA0C8]">$</span>
                {wager.slice(1)}
              </>
            ) : (
              '—'
            )}
          </p>

          <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9AA0C8]">Prize</p>
          <p
            className={`mt-0.5 font-extrabold tabular-nums ${first ? 'text-5xl' : 'text-4xl'}`}
            style={{ color: t.color, textShadow: `0 0 24px rgba(${t.rgb},0.45)` }}
          >
            {prize === null ? '—' : usd(prize)}
          </p>
        </div>
      </div>
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
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 sm:items-end sm:gap-4">
      <div className="sm:order-2 sm:-translate-y-6">
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
