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

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
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
}

export default function Roller({ items, winWord = 'Winner', placeholderCount = 10 }: RollerProps) {
  const pool = items

  const [strip, setStrip] = useState<string[]>([])
  const [rolling, setRolling] = useState(false)
  const [rollSeq, setRollSeq] = useState(0)
  const [winner, setWinner] = useState<string | null>(null)
  const [showWin, setShowWin] = useState(false)

  const stripRef = useRef<HTMLDivElement>(null)
  const startRef = useRef(0)
  const targetRef = useRef(0)

  // A single randomized ordering of the pool, reshuffled only when the pool
  // changes. The same order repeats across blocks on the strip.
  const poolKey = pool.join('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const order = useMemo(() => shuffle(pool), [poolKey])

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

  function roll() {
    if (rolling || pool.length < 2) return

    const L = order.length
    const idx = Math.floor(Math.random() * L)
    const winnerName = order[idx]

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
        onClick={roll}
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
            className="relative max-w-sm w-full rounded-3xl border p-8 text-center"
            style={{
              background: 'linear-gradient(160deg, #0a1f12 0%, #06120a 60%, #000000 100%)',
              borderColor: 'rgba(0,255,135,0.5)',
              boxShadow: '0 0 60px rgba(0,255,135,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#00ff87' }}>{winWord}</p>
            <p className="text-3xl font-black mb-6 break-words" style={{ color: '#00ff87' }}>{winner}</p>
            <button
              onClick={() => setShowWin(false)}
              className="w-full text-black font-black py-3 rounded-xl uppercase tracking-widest text-sm"
              style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
