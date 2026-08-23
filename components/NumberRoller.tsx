'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Slot-machine style picker for a whole number in [min, max].
 *
 * The reel flickers through random values and decelerates into the result. The
 * winner is drawn up front and the animation just plays toward it, so what the
 * reel shows on the way is decoration — the landed value can't drift with the
 * timing.
 */

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

export default function NumberRoller({ min = 1, max = 20 }: { min?: number; max?: number }) {
  const span = Math.max(1, max - min + 1)

  const [display, setDisplay] = useState(min)
  const [landed, setLanded] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function roll() {
    if (rolling) return

    const winner = min + randInt(span)

    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDisplay(winner)
      setLanded(winner)
      return
    }

    setRolling(true)
    setLanded(null)

    // 26 steps easing out: i*i makes each tick longer than the last, so it
    // slows into the result rather than stopping dead. Totals ~2.6s.
    const steps = 26
    let i = 0
    const tick = () => {
      // Never show the winner mid-flight, or the reel appears to land early and
      // then keep spinning.
      let shown = min + randInt(span)
      if (span > 1) {
        while (shown === winner) shown = min + randInt(span)
      }
      setDisplay(shown)
      i += 1
      if (i < steps) {
        timerRef.current = setTimeout(tick, 34 + i * i * 0.7)
      } else {
        setDisplay(winner)
        setLanded(winner)
        setRolling(false)
      }
    }
    tick()
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Reel window */}
      <div
        className="relative w-full max-w-[240px] overflow-hidden rounded-2xl p-[2px]"
        style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a, #00ff87)' }}
      >
        <div className="rounded-[14px] bg-[#050409] px-6 py-8 text-center">
          <span
            className="block font-black leading-none tabular-nums transition-transform"
            style={{
              fontSize: 'clamp(52px, 12vw, 84px)',
              color: landed !== null ? '#00ff87' : '#e6ffe9',
              textShadow:
                landed !== null
                  ? '0 0 22px rgba(0,255,135,0.85), 0 0 55px rgba(0,255,135,0.35)'
                  : '0 0 14px rgba(255,255,255,0.28)',
              // A touch of scale on the landed value so the stop reads as an
              // event rather than the flicker simply ceasing.
              transform: landed !== null ? 'scale(1.06)' : 'none',
            }}
          >
            {display}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-xs uppercase tracking-[0.25em] font-bold">
        {rolling ? 'Rolling…' : landed !== null ? 'Locked in' : `${min}–${max}`}
      </p>

      <button
        onClick={roll}
        disabled={rolling}
        className="text-black font-black py-3 px-8 rounded-xl uppercase tracking-widest text-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
      >
        {rolling ? 'Rolling…' : landed !== null ? 'Roll again' : 'Roll'}
      </button>
    </div>
  )
}
