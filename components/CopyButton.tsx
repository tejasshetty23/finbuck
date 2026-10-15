'use client'

import { useEffect, useState } from 'react'

/**
 * Copies a code, then shows a tick for a moment so the click visibly did
 * something — without that, nothing on screen confirmed the copy.
 */
export default function CopyButton({ code, tone = 'accent' }: { code: string; tone?: 'accent' | 'onAccent' }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard?.writeText(code)
      setCopied(true)
    } catch {
      /* clipboard blocked (e.g. insecure context) — leave the icon as is */
    }
  }

  const cls =
    tone === 'onAccent'
      ? 'border-white/30 text-white/80 hover:text-white hover:border-white'
      : 'border-accent/30 text-accent-bright/70 hover:text-accent-bright hover:border-accent'

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center justify-center rounded-lg border p-2 transition-colors ${cls}`}
      aria-label={copied ? 'Copied' : `Copy code ${code}`}
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}
