'use client'

import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import Modal from './Modal'

/**
 * Slot-machine picker for a whole number in [min, max].
 *
 * The reel is a real scrolling strip rather than a flicker, driven by the same
 * long ease-out the giveaway roller uses, so it tears away fast and then crawls
 * the last few cells. That crawl is where the suspense lives: the strip counts
 * up to the winner, so the final second is spent watching the number you're
 * about to get slide into place.
 *
 * The winner is drawn before the animation starts and the strip is built around
 * it, so what scrolls past is decoration — the landed value can't drift with
 * the timing, and a dropped frame can't change the result.
 *
 * Under prefers-reduced-motion it still rolls, just a much shorter one — see
 * REDUCED_MS.
 */

// One cell's height, and how many the window shows. Odd count so there's a true
// middle row for the result to land in, with its neighbours peeking in above
// and below to sell the reel.
const CELL_H = 72

// Cut corners for the holder card.
const HOLDER_CUT = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'

const ordinalSuffix = (n: number) => {
  const v = Math.abs(n) % 100
  if (v >= 11 && v <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][Math.abs(n) % 10] ?? 'th'
}
const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

// Cut corners for the reel window, outer edge and inner fill.
const REEL_CUT = 'polygon(10px 0,100% 0,100% calc(100% - 10px),calc(100% - 10px) 100%,0 100%,0 10px)'
const REEL_CUT_INNER = 'polygon(9.5px 0,100% 0,100% calc(100% - 9.5px),calc(100% - 9.5px) 100%,0 100%,0 9.5px)'
const VISIBLE = 5

// Fixed strip length, independent of the range: the cells hold a consecutive
// run ending on the winner, so a 1-10 range and a 1-10,000 range cost the same
// number of nodes. The winner sits a few cells short of the end so the row
// below it is still filled when the reel stops.
const STRIP_LEN = 60
const WIN_INDEX = STRIP_LEN - 4
const START_INDEX = 2

// Matches the giveaway roller exactly — same duration, same curve.
const SPIN_MS = 6000
const SPIN_EASING = 'cubic-bezier(0.10, 0.82, 0.16, 1)'

// The reduced-motion roll: the same reel, just much less of it — 10 cells of
// travel instead of 54, over 2.2s instead of 6, on a plain ease-out rather than
// the dramatic curve.
//
// This used to snap straight to the result, which deleted the only thing the
// component does and made it the odd one out beside the giveaway roller and the
// prize wheel, neither of which gates on the setting at all. `reduce` asks for
// less motion, not for a user-invoked reveal to be skipped, so it still rolls.
const REDUCED_MS = 2200
const REDUCED_EASING = 'cubic-bezier(0.22, 0.61, 0.36, 1)'
const REDUCED_START_INDEX = WIN_INDEX - 10

// Cryptographically-seeded random int in [0, max) — same approach as the
// giveaway roller, so both draws are unbiased rather than Math.random-streaky.
function randInt(max: number): number {
  if (max <= 0) return 0
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Rejection sampling, so the modulo can't favour the low end.
    const limit = Math.floor(0xffffffff / max) * max
    const u = new Uint32Array(1)
    do {
      crypto.getRandomValues(u)
    } while (u[0] >= limit)
    return u[0] % max
  }
  return Math.floor(Math.random() * max)
}

/** Translate that puts strip cell `i` in the window's middle row. */
function offsetFor(i: number) {
  return -(i - Math.floor(VISIBLE / 2)) * CELL_H
}

/**
 * A consecutive run of `STRIP_LEN` values landing on `winner` at WIN_INDEX,
 * wrapping around the range so it reads like a reel's fixed symbol order
 * however short the range is.
 */
function buildStrip(winner: number, lo: number, span: number) {
  const out: number[] = []
  for (let i = 0; i < STRIP_LEN; i++) {
    const stepsBack = WIN_INDEX - i
    // Positive modulo, so cells before the winner wrap to the top of the range
    // rather than going negative.
    out.push(lo + ((((winner - lo - stepsBack) % span) + span) % span))
  }
  return out
}

export type Place = { position: number; name: string; wagered: number; prize: number | null }

export default function NumberRoller({
  min: minProp = 1,
  max: maxProp = 20,
  places,
  paidPlaces = 0,
}: {
  min?: number
  max?: number
  /** Leaderboard standings, masked. When given, the drawn number is read as a place and its holder is shown. */
  places?: Place[]
  /** How many places are paid, so the holder card can say whether the spot is in the money. */
  paidPlaces?: number
}) {
  // The props are the starting range; the picker owns it after that so it can
  // be changed from the UI.
  const [min, setMin] = useState(minProp)
  const [max, setMax] = useState(maxProp)
  const span = Math.max(1, max - min + 1)

  const [strip, setStrip] = useState<number[]>(() => buildStrip(minProp, minProp, Math.max(1, maxProp - minProp + 1)))
  const [landed, setLanded] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ min: String(minProp), max: String(maxProp) })
  const [rangeError, setRangeError] = useState('')

  const stripRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Picked fresh on each roll, since the preference can be toggled mid-session.
  const motionRef = useRef({ start: START_INDEX, ms: SPIN_MS, easing: SPIN_EASING })
  // Bumped per roll so the animation effect re-runs even on the same winner.
  const [rollSeq, setRollSeq] = useState(0)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  // Park the reel on the result (or the bottom of the range before the first
  // roll) whenever it isn't spinning.
  useEffect(() => {
    if (rolling) return
    const el = stripRef.current
    if (!el) return
    el.style.transition = 'none'
    el.style.transform = `translateY(${offsetFor(WIN_INDEX)}px)`
  }, [strip, rolling])

  // Run the scroll once the new strip has rendered.
  useEffect(() => {
    if (!rolling) return
    const el = stripRef.current
    if (!el) return

    const { start, ms, easing } = motionRef.current

    el.style.transition = 'none'
    el.style.transform = `translateY(${offsetFor(start)}px)`
    // Force reflow so the jump lands before the animated transform, or the
    // browser coalesces the two and nothing moves.
    void el.offsetHeight

    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transition = `transform ${ms}ms ${easing}`
        el.style.transform = `translateY(${offsetFor(WIN_INDEX)}px)`
      })
    )

    timerRef.current = setTimeout(() => {
      setRolling(false)
      setLanded(strip[WIN_INDEX])
    }, ms + 100)

    return () => {
      cancelAnimationFrame(raf)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollSeq])

  function roll() {
    if (rolling) return

    const winner = min + randInt(span)
    const next = buildStrip(winner, min, span)

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    motionRef.current = reduced
      ? { start: REDUCED_START_INDEX, ms: REDUCED_MS, easing: REDUCED_EASING }
      : { start: START_INDEX, ms: SPIN_MS, easing: SPIN_EASING }

    setLanded(null)
    setStrip(next)
    setRolling(true)
    setRollSeq((n) => n + 1)
  }

  function saveRange() {
    const lo = Math.trunc(Number(draft.min))
    const hi = Math.trunc(Number(draft.max))

    if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
      setRangeError('Both values need to be whole numbers.')
      return
    }
    if (hi < lo) {
      setRangeError('The high number has to be at least the low one.')
      return
    }

    setMin(lo)
    setMax(hi)
    setRangeError('')
    setEditing(false)
    // Reset rather than leave a result from the old range on screen.
    setLanded(null)
    setStrip(buildStrip(lo, lo, Math.max(1, hi - lo + 1)))
  }

  function openEditor() {
    setDraft({ min: String(min), max: String(max) })
    setRangeError('')
    setEditing(true)
  }

  // The leaderboard holder of the drawn place, when standings were given.
  const holder = landed !== null && places ? places.find((pl) => pl.position === landed) ?? null : null
  const linked = !!places

  // Where the result sits in the range, for the gauge under the big number.
  const pos = landed === null ? null : span <= 1 ? 50 : ((landed - min) / (max - min)) * 100

  return (
    <div className="grid items-center gap-8 sm:grid-cols-[240px_1fr] sm:gap-10">
      {/* ── The drum ── */}
      <div className="mx-auto w-full max-w-[240px]">
        <div
          className={`relative overflow-hidden p-[2px] ${landed !== null ? 'reel-landed' : ''}`}
          style={{
            clipPath: REEL_CUT,
            background: 'linear-gradient(180deg, rgba(0,255,135,0.9), rgba(0,255,135,0.3) 40%, rgba(255,255,255,0.08) 60%, rgba(0,255,135,0.3))',
          }}
        >
          <div className="relative overflow-hidden bg-[#06081C]" style={{ height: CELL_H * VISIBLE, clipPath: REEL_CUT_INNER }}>
            {/* Hairlines between rows, so the drum reads as segmented */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: `repeating-linear-gradient(180deg, rgba(255,255,255,0.05) 0 1px, transparent 1px ${CELL_H}px)` }}
            />

            <div
              ref={stripRef}
              className="will-change-transform"
              style={{ filter: rolling ? 'blur(0.7px)' : 'none', transition: 'filter 300ms ease' }}
            >
              {strip.map((n, i) => (
                <div
                  key={i}
                  className={`font-display flex items-center justify-center tabular-nums transition-colors duration-300 ${
                    landed !== null && i === WIN_INDEX ? 'text-accent-bright [text-shadow:0_0_24px_rgba(0,255,135,0.55)]' : 'text-white'
                  }`}
                  style={{ height: CELL_H, fontSize: 'clamp(40px, 8vw, 54px)' }}
                >
                  {n}
                </div>
              ))}
            </div>

            {/* Cylinder shading: the rows curve away above and below the window */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(6,8,28,0.96) 0%, rgba(6,8,28,0.6) 18%, rgba(6,8,28,0.15) 36%, rgba(6,8,28,0) 42%, rgba(6,8,28,0) 58%, rgba(6,8,28,0.15) 64%, rgba(6,8,28,0.6) 82%, rgba(6,8,28,0.96) 100%)',
              }}
            />
            {/* Glass gloss across the top half */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.0))' }}
            />

            {/* The payline window */}
            <div
              className="reel-window pointer-events-none absolute inset-x-0"
              style={{
                top: CELL_H * Math.floor(VISIBLE / 2),
                height: CELL_H,
                borderTop: '1px solid rgba(0,255,135,0.45)',
                borderBottom: '1px solid rgba(0,255,135,0.45)',
                background: landed !== null ? 'rgba(0,255,135,0.10)' : 'rgba(0,255,135,0.04)',
                boxShadow:
                  landed !== null
                    ? 'inset 0 0 30px rgba(0,255,135,0.35), 0 0 26px rgba(0,255,135,0.25)'
                    : 'inset 0 0 18px rgba(0,255,135,0.10)',
                transition: 'background 220ms ease, box-shadow 220ms ease',
              }}
            >
              {/* Side pointers into the window */}
              <svg className="absolute left-0 top-1/2 -translate-y-1/2" width="10" height="16" viewBox="0 0 10 16" aria-hidden>
                <path d="M0 0 L10 8 L0 16 Z" fill="#00FF87" />
              </svg>
              <svg className="absolute right-0 top-1/2 -translate-y-1/2" width="10" height="16" viewBox="0 0 10 16" aria-hidden>
                <path d="M10 0 L0 8 L10 16 Z" fill="#00FF87" />
              </svg>
            </div>
          </div>
        </div>

        {/* Range bookends under the drum */}
        <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-faint">
          <span>Min <span className="font-display ml-1 text-[1rem] tracking-normal text-white">{min}</span></span>
          <span className="h-px flex-1 mx-3 bg-white/10" />
          <span><span className="font-display mr-1 text-[1rem] tracking-normal text-white">{max}</span> Max</span>
        </div>
      </div>

      {/* ── The result ── */}
      <div className="flex flex-col text-center sm:text-left">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
            <span className={`h-1.5 w-1.5 rotate-45 bg-accent ${rolling ? 'animate-pulse' : ''}`} />
            {rolling ? 'Rolling' : landed !== null ? (linked ? 'Leaderboard place' : 'Locked in') : linked ? 'Pick a place' : 'Ready'}
          </p>
          <Button onClick={openEditor} disabled={rolling} variant="ghost" size="xs">
            Set range
          </Button>
        </div>

        {/* The number, huge; a dash until the reel stops */}
        <p
          key={landed ?? 'none'}
          className={`font-display mt-3 leading-none tabular-nums ${landed !== null ? 'pop-in text-accent-bright [text-shadow:0_0_40px_rgba(0,255,135,0.35)]' : 'text-white/20'}`}
          style={{ fontSize: 'clamp(5rem, 16vw, 8rem)' }}
          aria-live="polite"
        >
          {landed !== null ? (
            <>
              {landed}
              {linked && <span className="text-[0.4em] text-white/60">{ordinalSuffix(landed)}</span>}
            </>
          ) : rolling ? '···' : '—'}
        </p>
        <p className="mt-1 text-sm text-muted">
          {landed !== null ? (
            <>
              Drawn from <span className="font-bold text-white">{min}–{max}</span>
            </>
          ) : linked ? (
            <>
              Draws a place from <span className="font-bold text-white">{min}–{max}</span> on the monthly leaderboard
            </>
          ) : (
            <>
              A whole number from <span className="font-bold text-white">{min}–{max}</span>
            </>
          )}
        </p>

        {/* Who holds that place on the board */}
        {linked && landed !== null && (
          <div className="pop-in mt-4 flex items-center gap-4 bg-[#0B0E2A] px-4 py-3 text-left" style={{ clipPath: HOLDER_CUT }}>
            <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center bg-accent/[0.12] text-[1.4rem] leading-none text-accent-bright" style={{ clipPath: HOLDER_CUT }}>
              {holder ? holder.name[0]?.toUpperCase() : '·'}
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-display block truncate text-[1.5rem] leading-none text-white">
                {holder ? holder.name : 'Open spot'}
              </span>
              <span className="mt-1 block text-xs text-muted">
                {holder
                  ? `${usd(holder.wagered)} wagered${holder.prize !== null ? ` · ${usd(holder.prize)} prize` : ''}`
                  : landed <= paidPlaces
                    ? 'Nobody holds this place yet'
                    : 'Outside the paid places'}
              </span>
            </span>
            <a href="/leaderboard" className="shrink-0 text-xs font-bold text-accent-bright hover:text-white">
              Board →
            </a>
          </div>
        )}

        {/* Range gauge: where the draw fell */}
        <div className="relative mt-5 h-5">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/[0.08]" />
          {pos !== null && (
            <>
              <div
                className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent/50 transition-[width] duration-500 ease-out"
                style={{ width: `${pos}%` }}
              />
              <div
                className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-accent shadow-[0_0_14px_rgba(0,255,135,0.8)] transition-[left] duration-500 ease-out"
                style={{ left: `${pos}%` }}
              />
            </>
          )}
        </div>

        <Button onClick={roll} disabled={rolling} className="mt-5 w-full sm:w-auto sm:min-w-[200px] sm:self-start">
          {rolling ? 'Rolling…' : landed !== null ? 'Roll again' : 'Roll'}
        </Button>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(false)} title="Set range" size="sm">
          <div className="flex items-end gap-3">
            <label className="flex-1">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-faint">From</span>
              <input
                type="number"
                value={draft.min}
                autoFocus
                onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && saveRange()}
                className="field tabular-nums"
              />
            </label>
            <span className="pb-3 font-bold text-faint">–</span>
            <label className="flex-1">
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-faint">To</span>
              <input
                type="number"
                value={draft.max}
                onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && saveRange()}
                className="field tabular-nums"
              />
            </label>
          </div>

          {rangeError && <p className="mt-3 text-[11px] text-red-300">{rangeError}</p>}

          <Button onClick={saveRange} className="mt-5 w-full">
            Done
          </Button>
        </Modal>
      )}
    </div>
  )
}
