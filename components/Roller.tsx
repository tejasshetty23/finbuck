'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Button from './Button'
import Modal from './Modal'

// Two-tone: the site's green and a bright violet, alternating.
const COLORS = ['#00FF87', '#7B6CFF']

// Cut corners, same as the buttons.
const CARD_CUT = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'

// Stride of one card (includes its padding gap).
const CARD_W = 166

// Shrink the font for longer names so they fit inside a card.
function fontForName(name: string) {
  const len = name.length
  if (len > 20) return 11
  if (len > 16) return 12
  if (len > 12) return 13
  return 15
}

// Cryptographically-seeded random int in [0, max) — stronger/less streaky than
// Math.random for picking winners.
function randInt(max: number): number {
  if (max <= 0) return 0
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Rejection sampling to avoid modulo bias.
    const limit = Math.floor(0xffffffff / max) * max
    const u = new Uint32Array(1)
    do {
      crypto.getRandomValues(u)
    } while (u[0] >= limit)
    return u[0] % max
  }
  return Math.floor(Math.random() * max)
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// The strip repeats the order end-to-end, so the last card sits next to the
// first one — the wrap-around pair counts as adjacent too.
function hasAdjacentDupe(a: string[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] === a[(i + 1) % a.length]) return true
  }
  return false
}

// Scramble the pool so no name lands next to another copy of itself (a
// subscriber holds two entries under Subluck, and those two arrive adjacent).
function shuffleSpread(arr: string[]): string[] {
  const n = arr.length
  if (n < 3) return shuffle(arr)

  const counts = new Map<string, number>()
  for (const s of arr) counts.set(s, (counts.get(s) ?? 0) + 1)
  let maxCount = 0
  const names: string[] = []
  counts.forEach((c, nm) => {
    names.push(nm)
    if (c > maxCount) maxCount = c
  })

  // More copies than gaps to put between them — no arrangement can separate
  // them all, so shuffle and accept it rather than retry forever.
  if (maxCount > Math.floor(n / 2)) return shuffle(arr)

  // Reshuffle until the draw happens to be clean. Rejection sampling like this
  // is uniform over valid orders, so the strip stays genuinely random instead
  // of falling into the repeating pattern a repair pass would leave behind.
  for (let attempt = 0; attempt < 200; attempt++) {
    const a = shuffle(arr)
    if (!hasAdjacentDupe(a)) return a
  }

  // Fallback for pools too tightly packed to land a clean shuffle by chance:
  // deal the most-repeated names into even slots, then odd, which spaces every
  // copy at least two apart by construction.
  const byCount = shuffle(names)
  byCount.sort((x, y) => counts.get(y)! - counts.get(x)!)
  const flat: string[] = []
  for (const nm of byCount) {
    for (let k = 0; k < counts.get(nm)!; k++) flat.push(nm)
  }
  const out = new Array<string>(n)
  let pos = 0
  for (const nm of flat) {
    out[pos] = nm
    pos += 2
    if (pos >= n) pos = 1
  }
  return out
}

// Repeat the list in its given order `blocks` times: every name appears once
// per block, then the same list repeats again.
function repeatList(arr: string[], blocks: number) {
  const out: string[] = []
  for (let k = 0; k < blocks; k++) out.push(...arr)
  return out
}

function lighten(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lr = Math.round(r + (255 - r) * amount)
  const lg = Math.round(g + (255 - g) * amount)
  const lb = Math.round(b + (255 - b) * amount)
  return `rgb(${lr}, ${lg}, ${lb})`
}

function darken(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * factor)
  const g = Math.round(((n >> 8) & 255) * factor)
  const b = Math.round((n & 255) * factor)
  return `rgb(${r}, ${g}, ${b})`
}

interface RollerProps {
  items: string[]
  winWord?: string
  // Number of blank placeholder cards shown before there are 2+ entries.
  placeholderCount?: number
  // Presence check: called with the winner's name to start watching their chat,
  // and null to stop. winnerMessages streams their live messages back in.
  onWatch?: (name: string | null) => void
  winnerMessages?: { text: string; at: number }[]
  // Called when a winner is revealed so the parent can remove them from the pool.
  onPick?: (name: string) => void
}

// Seconds the winner-presence chat window stays open.
const WATCH_SECONDS = 30

export default function Roller({ items, winWord = 'Winner', placeholderCount = 10, onWatch, winnerMessages = [], onPick }: RollerProps) {
  const pool = items

  const [strip, setStrip] = useState<string[]>([])
  const [rolling, setRolling] = useState(false)
  const [rollSeq, setRollSeq] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [showWin, setShowWin] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS)

  const [pickError, setPickError] = useState('')
  const busyRef = useRef(false)
  const stripRef = useRef<HTMLDivElement>(null)
  const startRef = useRef(0)
  const targetRef = useRef(0)

  // A single randomized ordering of the pool, reshuffled only when the pool
  // changes. The same order repeats across blocks on the strip.
  const poolKey = pool.join('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const order = useMemo(() => shuffleSpread(pool), [poolKey])

  // Preload the winner-popup face image on mount so it shows instantly on a win.
  useEffect(() => {
    const img = new window.Image()
    img.src = '/finbuck-face.webp'
  }, [])

  // Build the idle strip whenever the order changes (and we're not rolling).
  useEffect(() => {
    if (rolling) return
    if (order.length < 2) {
      setStrip(Array(Math.max(placeholderCount, 6)).fill(''))
    } else {
      const blocks = Math.max(2, Math.ceil(24 / order.length))
      setStrip(repeatList(order, blocks))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKey, rolling, placeholderCount])

  // Center the middle card while idle (no animation).
  useEffect(() => {
    if (rolling) return
    const el = stripRef.current
    if (!el || strip.length === 0) return
    const mid = Math.floor(strip.length / 2)
    el.style.transition = 'none'
    el.style.transform = `translateX(${-(mid * CARD_W + CARD_W / 2)}px)`
  }, [strip, rolling])

  // Run the roll animation after the new strip has rendered.
  useEffect(() => {
    if (!rolling) return
    const el = stripRef.current
    if (!el) return

    el.style.transition = 'none'
    el.style.transform = `translateX(${startRef.current}px)`
    // Force reflow so the jump applies before the animated transform.
    void el.offsetWidth

    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transition = 'transform 6s cubic-bezier(0.10, 0.82, 0.16, 1)'
        el.style.transform = `translateX(${targetRef.current}px)`
      })
    )

    const t = setTimeout(() => {
      setRolling(false)
      setShowWin(true)
    }, 6100)

    return () => {
      cancelAnimationFrame(id)
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollSeq])

  // When the winner popup opens, start watching their chat for WATCH_SECONDS.
  useEffect(() => {
    if (!showWin || !winner) return
    onWatch?.(winner)
    onPick?.(winner)
    setSecondsLeft(WATCH_SECONDS)
    const iv = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(iv)
          onWatch?.(null)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      clearInterval(iv)
      onWatch?.(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWin, winner])

  async function roll(exclude?: string | null) {
    if (rolling || busyRef.current || pool.length < 2) return

    // The winner is drawn on the server, so the never-pick list stays off the
    // client entirely. Ineligible names still ride the strip, they just can't
    // be selected.
    busyRef.current = true
    setPickError('')
    let winnerName: string
    try {
      const res = await fetch('/api/roll', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entrants: order, exclude: exclude ?? null }),
      })
      const data = (await res.json()) as { winner?: string; error?: string }
      if (!res.ok || !data.winner) throw new Error(data.error ?? 'pick failed')
      winnerName = data.winner
    } catch {
      busyRef.current = false
      setPickError('Could not pick a winner — check the connection and try again.')
      return
    }
    busyRef.current = false

    const L = order.length
    const idx = order.indexOf(winnerName)

    // Repeat the randomized list enough times to give a long roll, then land on
    // the winner's real occurrence in a late block (one full block trails it).
    const before = Math.max(1, Math.round(45 / L))
    const blocks = before + 2
    const s = repeatList(order, blocks)
    const winnerIndex = before * L + idx

    // Small jitter so it doesn't always stop dead-center (stays on the card).
    const jitter = (Math.random() - 0.5) * CARD_W * 0.5
    startRef.current = -(2 * CARD_W + CARD_W / 2)
    targetRef.current = -(winnerIndex * CARD_W + CARD_W / 2 + jitter)

    setWinner(winnerName)
    setShowWin(false)
    setStrip(s)
    setRolling(true)
    setRollSeq((x) => x + 1)
  }

  // At least one entrant must be eligible to win, or there's nothing to roll for.
  const canRoll = pool.length >= 2 && !rolling

  return (
    <div className="flex w-full flex-col items-center">
      {/* Roller viewport: a sunken well in the panel */}
      <div className="relative h-28 w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#080A20]">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#080A20] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#080A20] to-transparent" />

        {/* Center marker */}
        <div
          className="absolute bottom-0 left-1/2 top-0 z-20 w-[3px] -translate-x-1/2 bg-accent"
          style={{ boxShadow: '0 0 14px rgba(0,255,135,0.8)' }}
        />
        <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}>
          <svg width="18" height="11" viewBox="0 0 18 11"><path d="M0 0 L18 0 L9 11 Z" fill="#00FF87" /></svg>
        </div>
        <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2" style={{ filter: 'drop-shadow(0 -1px 2px rgba(0,0,0,0.6))' }}>
          <svg width="18" height="11" viewBox="0 0 18 11"><path d="M0 11 L18 11 L9 0 Z" fill="#00FF87" /></svg>
        </div>

        {/* Strip */}
        <div ref={stripRef} className="absolute left-1/2 top-0 flex h-full" style={{ willChange: 'transform' }}>
          {strip.map((name, i) => {
            const c = COLORS[i % COLORS.length]
            const isGreen = i % 2 === 0
            return (
              <div key={i} className="h-full shrink-0 p-1.5" style={{ width: CARD_W }}>
                <div
                  className="flex h-full w-full items-center justify-center break-words px-2.5 text-center font-bold leading-tight [overflow-wrap:anywhere]"
                  style={{
                    clipPath: CARD_CUT,
                    background: `linear-gradient(180deg, ${lighten(c, 0.16)}, ${darken(c, 0.78)})`,
                    color: isGreen ? '#0B0E2A' : '#ffffff',
                    fontSize: name ? fontForName(name) : undefined,
                  }}
                >
                  {name && (name.length > 28 ? name.slice(0, 27) + '…' : name)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Roll button */}
      <Button onClick={() => roll()} disabled={!canRoll} className="mt-6 min-w-[160px]">
        {rolling ? 'Rolling…' : 'Roll'}
      </Button>

      {pickError && <p className="mt-3 text-center text-xs text-red-300">{pickError}</p>}

      {/* Win popup */}
      {showWin && winner && (
        <Modal onClose={() => setShowWin(false)} tone="accent" size="sm" innerClassName="p-7 text-center">
          {/* FinBuck as a god — halo + radiating rays behind the cutout */}
          <div className="relative mx-auto mb-3 w-fit">
            {/* Rotating god-rays */}
            <div
              className="godray pointer-events-none absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: 230,
                height: 230,
                background: 'repeating-conic-gradient(from 0deg, rgba(0,255,135,0.34) 0deg 5deg, transparent 5deg 16deg)',
                WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,0.95) 16%, rgba(0,0,0,0.5) 40%, transparent 70%)',
                maskImage: 'radial-gradient(circle, rgba(0,0,0,0.95) 16%, rgba(0,0,0,0.5) 40%, transparent 70%)',
              }}
            />
            {/* Oval halo glow */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 150,
                height: 195,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse at center, rgba(0,255,135,0.6), rgba(0,255,135,0.18) 55%, transparent 72%)',
                filter: 'blur(7px)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/finbuck-face.webp"
              alt="Winner"
              className="relative max-h-36 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.55)) drop-shadow(0 0 14px rgba(0,255,135,0.4))' }}
            />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-accent-bright">{winWord}</p>
          <p className="font-display mt-1 break-words text-[2.8rem] leading-none text-white">{winner}</p>

          {/* Presence check — live chat from the winner for 30s */}
          <div className="mt-5 text-left">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-faint">Presence check</span>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${secondsLeft > 0 ? 'text-accent-bright' : 'text-faint'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${secondsLeft > 0 ? 'animate-pulse bg-accent' : 'bg-faint'}`} />
                {secondsLeft > 0 ? `${secondsLeft}s` : 'Ended'}
              </span>
            </div>
            <div className="h-20 space-y-1.5 overflow-y-auto rounded-lg border border-white/[0.08] bg-[#080A20] p-2.5">
              {winnerMessages.length === 0 ? (
                <p className="text-xs text-faint">
                  {secondsLeft > 0
                    ? `Waiting for ${winner} to type in chat…`
                    : `${winner} didn't send any messages.`}
                </p>
              ) : (
                winnerMessages.map((m, i) => (
                  <p key={i} className="break-words text-left text-xs leading-snug text-white">
                    <span className="font-bold text-accent-bright">{winner}:</span> {m.text}
                  </p>
                ))
              )}
            </div>
            {winnerMessages.length > 0 && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-bright">✓ Active in chat</p>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <Button
              onClick={() => {
                const absent = winner
                setShowWin(false)
                roll(absent)
              }}
              disabled={pool.length < 2}
              variant="outline"
              className="flex-1"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5.5 9A7 7 0 0118 7.5M18.5 15A7 7 0 016 16.5" />
              </svg>
              Re-roll
            </Button>
            <Button onClick={() => setShowWin(false)} className="flex-1">
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
