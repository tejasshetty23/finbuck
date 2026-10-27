'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Panel from './Panel'

/**
 * The site's popup: a dimmed, blurred backdrop with a Panel in the middle.
 * Click outside or press Escape to close. Every popup on the tool pages (buy
 * an item, edit prizes, set a range, the winner reveal) goes through here so
 * they all share one shape.
 *
 * Rendered into <body> through a portal, not where it's used. The pickers
 * sit inside cut-corner Panels, and a clip-path (or the scroll-reveal's
 * transform) on any ancestor clips even a position: fixed child, which cut
 * the winner popup off at the card's edges. The overlay also scrolls, so a
 * popup taller than a short screen can still be read top to bottom.
 */
export default function Modal({
  onClose,
  title,
  tone = 'default',
  size = 'md',
  children,
  innerClassName = 'p-6 sm:p-7',
}: {
  onClose: () => void
  /** Optional header row with the title and a close button. */
  title?: ReactNode
  tone?: 'default' | 'accent' | 'gold'
  size?: 'sm' | 'md'
  children: ReactNode
  innerClassName?: string
}) {
  // document.body only exists in the browser; render nothing until mounted.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    // Stop the page behind from scrolling while the popup is open.
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-[#05061A]/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-5">
        <div className={`w-full ${size === 'sm' ? 'max-w-sm' : 'max-w-md'}`} onClick={(e) => e.stopPropagation()}>
          <Panel tone={tone} className="shadow-[0_30px_80px_rgba(0,0,0,0.6)]" innerClassName={innerClassName}>
            {title !== undefined && (
              <div className="mb-5 flex items-center justify-between gap-4">
                <h4 className="font-display text-[1.6rem] leading-none text-white">{title}</h4>
                <button
                  type="button"
                  onClick={onClose}
                  className="-mr-1 flex h-8 w-8 items-center justify-center text-faint transition-colors hover:text-white"
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {children}
          </Panel>
        </div>
      </div>
    </div>,
    document.body,
  )
}
