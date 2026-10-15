'use client'

import { useEffect, useState } from 'react'

/**
 * arj-style race clock. Renders dashes until mounted: the server and the
 * browser would compute different seconds, and a mismatch there is a React
 * hydration error rather than just a stale number.
 */
export default function Countdown({ endsAt, label = 'Race ends in' }: { endsAt: number; label?: string }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const left = now === null ? null : Math.max(0, endsAt - now)
  const ended = left === 0
  const parts =
    left === null
      ? null
      : [
          Math.floor(left / 86_400_000),
          Math.floor(left / 3_600_000) % 24,
          Math.floor(left / 60_000) % 60,
          Math.floor(left / 1000) % 60,
        ]

  return (
    <div className="flex flex-col items-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-mint">{ended ? 'Race finished' : label}</p>
      <div className="mt-3 flex items-start gap-2 sm:gap-3">
        {['Days', 'Hours', 'Mins', 'Secs'].map((unit, i) => (
          <div key={unit} className="flex flex-col items-center">
            <span className="min-w-[56px] sm:min-w-[68px] rounded-xl border border-white/[0.07] bg-ink-raised px-2 py-2.5 text-center text-2xl sm:text-3xl font-bold tabular-nums text-white">
              {parts ? String(parts[i]).padStart(2, '0') : '--'}
            </span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-faint">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
