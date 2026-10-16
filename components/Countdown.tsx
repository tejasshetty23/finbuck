'use client'

import { useEffect, useState } from 'react'

const CUT = 10
const chamfer = `polygon(${CUT}px 0, 100% 0, 100% calc(100% - ${CUT}px), calc(100% - ${CUT}px) 100%, 0 100%, 0 ${CUT}px)`

/**
 * Race clock. Renders dashes until mounted: the server and the browser would
 * compute different seconds, and a mismatch there is a React hydration error
 * rather than just a stale number.
 */
export default function Countdown({
  endsAt,
  label = 'Race ends in',
  endedLabel = 'Race finished',
}: {
  endsAt: number
  label?: string
  /** Shown once the clock hits zero, until the page next revalidates. */
  endedLabel?: string
}) {
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
      <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
        <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
        {ended ? endedLabel : label}
        <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
      </p>
      <div className="mt-4 flex items-start gap-2 sm:gap-3">
        {['Days', 'Hours', 'Mins', 'Secs'].map((unit, i) => (
          <div key={unit} className="flex flex-col items-center">
            {/* Cut-corner tile, lit along the top edge like the panels */}
            <span
              className="block p-px"
              style={{ clipPath: chamfer, background: 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05))' }}
            >
              <span
                className="font-display flex min-w-[64px] items-center justify-center px-2 py-1 text-[2.6rem] leading-none tabular-nums text-white sm:min-w-[80px] sm:text-[3.4rem]"
                style={{ clipPath: chamfer, background: 'linear-gradient(180deg, #181D4A, #0F1338)' }}
              >
                {parts ? String(parts[i]).padStart(2, '0') : '--'}
              </span>
            </span>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-faint">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
