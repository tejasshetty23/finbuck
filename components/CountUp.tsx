'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * A dollar amount that counts up from zero the first time it scrolls into view.
 *
 * The final string is rendered on the server and shown until the element is
 * seen, so there is nothing to hydrate wrong and nothing jumps if JS is slow.
 * Under prefers-reduced-motion the count is skipped and the value just shows.
 *
 * Formatting happens in here rather than via a passed-in function: this is a
 * client component rendered from server pages, and a function prop can't
 * cross that boundary (Next throws "Functions cannot be passed directly to
 * Client Components").
 */
const fmt = (cents: boolean) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })

export default function CountUp({
  value,
  cents = false,
  duration = 1400,
  className = '',
}: {
  value: number
  cents?: boolean
  duration?: number
  className?: string
}) {
  const format = fmt(cents).format
  const ref = useRef<HTMLSpanElement | null>(null)
  const [shown, setShown] = useState<number>(value)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || started.current) return
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || started.current) return
        started.current = true
        io.disconnect()
        const t0 = performance.now()
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / duration)
          // Ease-out quart: fast start, long settle, like a slot reel.
          const eased = 1 - Math.pow(1 - p, 4)
          setShown(value * eased)
          if (p < 1) requestAnimationFrame(tick)
          else setShown(value)
        }
        setShown(0)
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {format(shown)}
    </span>
  )
}
