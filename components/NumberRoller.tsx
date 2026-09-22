'use client'

import { useEffect, useRef, useState } from 'react'

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
const CELL_H = 64
const VISIBLE = 3

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

export default function NumberRoller({
  min: minProp = 1,
  max: maxProp = 20,
}: {
  min?: number
  max?: number
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

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-full flex justify-end">
        <button
          onClick={openEditor}
          disabled={rolling}
          className="border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-500/10 font-semibold py-1.5 px-3 rounded-lg uppercase tracking-widest text-[10px] transition-all disabled:opacity-40"
        >
          Set Range
        </button>
      </div>

      {/* Reel window */}
      <div
        className="relative w-full max-w-[180px] overflow-hidden rounded-xl p-[2px]"
        style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a, #00ff87)' }}
      >
        <div className="relative overflow-hidden rounded-[10px] bg-[#050409]" style={{ height: CELL_H * VISIBLE }}>
          <div ref={stripRef} className="will-change-transform">
            {strip.map((n, i) => (
              <div
                key={i}
                className="flex items-center justify-center font-black tabular-nums"
                style={{
                  height: CELL_H,
                  // Only the middle row is fully lit; the rows either side are
                  // dimmed so the eye is pulled to where the result lands.
                  fontSize: 'clamp(28px, 6vw, 40px)',
                  color: '#e6ffe9',
                }}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Shade the outer rows and mark the middle one. Sits above the strip
              and ignores pointer events so it never blocks the reel. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,4,9,0.92) 0%, rgba(5,4,9,0.45) 22%, rgba(5,4,9,0) 40%, rgba(5,4,9,0) 60%, rgba(5,4,9,0.45) 78%, rgba(5,4,9,0.92) 100%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0"
            style={{
              top: CELL_H,
              height: CELL_H,
              borderTop: '1px solid rgba(0,255,135,0.35)',
              borderBottom: '1px solid rgba(0,255,135,0.35)',
              background: landed !== null ? 'rgba(0,255,135,0.10)' : 'rgba(0,255,135,0.04)',
              boxShadow:
                landed !== null
                  ? 'inset 0 0 26px rgba(0,255,135,0.35), 0 0 22px rgba(0,255,135,0.25)'
                  : 'inset 0 0 18px rgba(0,255,135,0.10)',
              transition: 'background 220ms ease, box-shadow 220ms ease',
            }}
          />
        </div>
      </div>

      <p className="text-gray-600 text-[10px] uppercase tracking-[0.25em] font-bold">
        {rolling ? 'Rolling…' : landed !== null ? 'Locked in' : `${min}–${max}`}
      </p>

      <button
        onClick={roll}
        disabled={rolling}
        className="text-black font-black py-2 px-6 rounded-lg uppercase tracking-widest text-xs transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
      >
        {rolling ? 'Rolling…' : landed !== null ? 'Roll again' : 'Roll'}
      </button>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm"
          onClick={() => setEditing(false)}
        >
          <div
            className="relative max-w-sm w-full rounded-2xl border border-purple-700/40 bg-[#0d0a1a] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-black uppercase tracking-widest text-sm">Set Range</h4>
              <button
                onClick={() => setEditing(false)}
                className="text-gray-500 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-end gap-3">
              <label className="flex-1">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">From</span>
                <input
                  type="number"
                  value={draft.min}
                  autoFocus
                  onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && saveRange()}
                  className="w-full bg-[#07050f] border border-purple-700/50 rounded-lg px-3 py-2 text-sm text-white tabular-nums focus:outline-none focus:border-[#00ff87]"
                />
              </label>
              <span className="pb-2 text-gray-600 font-black">–</span>
              <label className="flex-1">
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">To</span>
                <input
                  type="number"
                  value={draft.max}
                  onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && saveRange()}
                  className="w-full bg-[#07050f] border border-purple-700/50 rounded-lg px-3 py-2 text-sm text-white tabular-nums focus:outline-none focus:border-[#00ff87]"
                />
              </label>
            </div>

            {rangeError && <p className="mt-3 text-[11px] text-red-400">{rangeError}</p>}

            <button
              onClick={saveRange}
              className="w-full mt-4 text-black font-black py-2.5 rounded-lg uppercase tracking-widest text-xs"
              style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
