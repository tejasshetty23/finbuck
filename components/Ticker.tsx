import type { ReactNode } from 'react'

/**
 * A slow, looping strip of short facts — the kind of thing a betting board
 * scrolls along its edge. The items are rendered twice back to back and the
 * track slides by exactly one copy, so the loop is seamless. Pauses on hover.
 * Under prefers-reduced-motion the strip simply sits still (see .ticker in
 * globals.css).
 */
export default function Ticker({ items, className = '' }: { items: ReactNode[]; className?: string }) {
  const row = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-6 text-[12px] font-bold uppercase tracking-[0.22em] text-muted">
            {item}
          </span>
          <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
        </span>
      ))}
    </div>
  )
  return (
    <div className={`ticker relative overflow-hidden border-y border-white/[0.06] bg-ink-deep/60 py-3 ${className}`}>
      <div className="ticker-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
      {/* Fade the ends so items appear and leave softly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink to-transparent" />
    </div>
  )
}
