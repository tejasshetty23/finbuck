'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Fades and lifts its children into view once they scroll into the viewport.
 *
 * The hidden state lives in CSS (see .reveal in globals.css) rather than being
 * applied from JS, so the element never paints visible and then snaps away —
 * it renders hidden server-side and this only adds the class that releases it.
 * globals.css wraps that hidden state in a prefers-reduced-motion query, and
 * layout.tsx carries a <noscript> override, so neither a reduced-motion setting
 * nor a JS failure can leave the page blank.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  /** Stagger, in ms, for revealing siblings one after another. */
  delay?: number
  className?: string
  as?: 'div' | 'section'
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // No observer support, or the visitor asked for less motion: show it now.
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.classList.add('reveal-in')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          el.classList.add('reveal-in')
          // One-shot: re-animating on every scroll past is distracting.
          io.unobserve(el)
        }
      },
      // Fire a little before the element is fully on screen so the motion
      // finishes about when it settles into view.
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
