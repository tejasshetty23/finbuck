'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

// Two-tone: site green + royal purple, alternating.
const COLORS = ['#00ff87', '#6d28d9']

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

// Shuffle, then push apart any identical neighbours (e.g. a subscriber's two
// Subluck entries) so the same name never sits back-to-back on the roller.
function shuffleSpread(arr: string[]): string[] {
  const a = shuffle(arr)
  for (let i = 1; i < a.length; i++) {
    if (a[i] !== a[i - 1]) continue
    for (let j = i + 1; j < a.length; j++) {
      const okHere = a[j] !== a[i - 1] && (i + 1 >= a.length || a[j] !== a[i + 1])
      const okThere = a[j - 1] !== a[i] && (j + 1 >= a.length || a[j + 1] !== a[i])
      if (okHere && okThere) {
        ;[a[i], a[j]] = [a[j], a[i]]
        break
      }
    }
  }
  return a
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
    img.src = '/finbuck-face.png'
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

  function roll(exclude?: string | null) {
    if (rolling || pool.length < 2) return

    const L = order.length
    // Pick a winner, optionally excluding the previous (absent) one.
    let candidates = order
    if (exclude) {
      const filtered = order.filter((n) => n.toLowerCase() !== exclude.toLowerCase())
      if (filtered.length) candidates = filtered
    }
    const winnerName = candidates[randInt(candidates.length)]
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

  const canRoll = pool.length >= 2 && !rolling

  return (
    <div className="flex flex-col items-center w-full">
      {/* Roller viewport */}
      <div className="relative w-full h-28 overflow-hidden rounded-2xl border border-purple-900/40 bg-[#07050f]">
        {/* Edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-[#07050f] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-[#07050f] to-transparent" />

        {/* Center marker */}
        <div
          className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-20 w-[3px] bg-[#00ff87]"
          style={{ boxShadow: '0 0 14px rgba(0,255,135,0.8)' }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))' }}>
          <svg width="18" height="11" viewBox="0 0 18 11"><path d="M0 0 L18 0 L9 11 Z" fill="#00ff87" /></svg>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-20" style={{ filter: 'drop-shadow(0 -1px 2px rgba(0,0,0,0.6))' }}>
          <svg width="18" height="11" viewBox="0 0 18 11"><path d="M0 11 L18 11 L9 0 Z" fill="#00ff87" /></svg>
        </div>

        {/* Strip */}
        <div ref={stripRef} className="absolute left-1/2 top-0 h-full flex" style={{ willChange: 'transform' }}>
          {strip.map((name, i) => {
            const c = COLORS[i % COLORS.length]
            const isGreen = i % 2 === 0
            return (
              <div key={i} className="h-full shrink-0 p-1.5" style={{ width: CARD_W }}>
                <div
                  className="h-full w-full rounded-xl flex items-center justify-center text-center px-2.5 font-black leading-tight break-words [overflow-wrap:anywhere]"
                  style={{
                    background: `linear-gradient(160deg, ${lighten(c, 0.18)}, ${darken(c, 0.72)})`,
                    color: isGreen ? '#06210f' : '#ffffff',
                    border: '1px solid rgba(255,255,255,0.08)',
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
      <button
        onClick={() => roll()}
        disabled={!canRoll}
        className="mt-6 text-black font-black py-3 px-10 rounded-xl uppercase tracking-widest text-sm transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
      >
        {rolling ? 'Rolling…' : 'Roll'}
      </button>

      {/* Win popup */}
      {showWin && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm" onClick={() => setShowWin(false)}>
          <div
            className="relative max-w-sm w-full overflow-hidden text-center rounded-2xl"
            style={{
              background:
                'linear-gradient(160deg, #0a1f12 0%, #06120a 55%, #000000 100%) padding-box, linear-gradient(135deg, #00ff87 0%, #00c96a 50%, #00ff87 100%) border-box',
              border: '2px solid transparent',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 24px 70px rgba(0,0,0,0.75), 0 0 60px rgba(0,255,135,0.22)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className="pointer-events-none absolute top-0 left-0 right-0 h-[3px] z-20" style={{ background: 'linear-gradient(90deg, transparent, #00ff87, #4ade80, #00ff87, transparent)' }} />
            <div className="px-7 pt-7 pb-7 relative">
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
                src="/finbuck-face.png"
                alt="Winner"
                className="relative max-h-36 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.55)) drop-shadow(0 0 14px rgba(0,255,135,0.4))' }}
              />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.35em] mb-1" style={{ color: '#00ff87' }}>{winWord}</p>
            <p className="text-3xl font-black mb-5 break-words text-white">{winner}</p>

            {/* Presence check — live chat from the winner for 30s */}
            <div className="text-left mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Presence check</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black" style={{ color: secondsLeft > 0 ? '#00ff87' : '#9ca3af' }}>
                  <span className={`w-1.5 h-1.5 rounded-full ${secondsLeft > 0 ? 'bg-[#00ff87] animate-pulse' : 'bg-gray-500'}`} />
                  {secondsLeft > 0 ? `${secondsLeft}s` : 'Ended'}
                </span>
              </div>
              <div className="h-20 overflow-y-auto rounded-lg border border-[#00ff87]/20 bg-black/40 p-2.5 space-y-1.5">
                {winnerMessages.length === 0 ? (
                  <p className="text-gray-600 text-xs">
                    {secondsLeft > 0
                      ? `Waiting for ${winner} to type in chat…`
                      : `${winner} didn't send any messages.`}
                  </p>
                ) : (
                  winnerMessages.map((m, i) => (
                    <p key={i} className="text-xs text-gray-200 break-words leading-snug text-left">
                      <span className="font-bold" style={{ color: '#00ff87' }}>{winner}:</span> {m.text}
                    </p>
                  ))
                )}
              </div>
              {winnerMessages.length > 0 && (
                <p className="text-[10px] text-[#00ff87] mt-2 font-bold uppercase tracking-widest">✓ Active in chat</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const absent = winner
                  setShowWin(false)
                  roll(absent)
                }}
                disabled={pool.length < 2}
                className="flex-1 border border-purple-500/50 text-purple-200 hover:text-white hover:bg-purple-500/15 font-black py-3 rounded-lg uppercase tracking-widest text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5.5 9A7 7 0 0118 7.5M18.5 15A7 7 0 016 16.5" />
                </svg>
                Re-roll
              </button>
              <button
                onClick={() => setShowWin(false)}
                className="flex-1 text-black font-black py-3 rounded-lg uppercase tracking-widest text-sm transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
              >
                Close
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
