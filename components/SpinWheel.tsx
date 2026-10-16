'use client'

import { useState, useId, useEffect } from 'react'
import Button from './Button'
import Modal from './Modal'

// Green and the cards' raised navy, alternating; a second pair a shade off so
// four slices in a row still read as four.
const COLORS = ['#00FF87', '#2A2F6E', '#00D974', '#3B4190']

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToCartesian(cx, cy, r, end)
  const e = polarToCartesian(cx, cy, r, start)
  const large = end - start <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y} Z`
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

interface SpinWheelProps {
  defaultItems?: string[]
  editLabel?: string
  itemsLabel?: string
  emptyHint: string
  winWord: string
  // When provided, the wheel uses these items and hides its own editor
  // (used by the live chat wheel, which manages its own entry list).
  controlledItems?: string[]
  // When true, the edit toggle is absolutely positioned in the top-right
  // corner of the nearest positioned ancestor (the Step box).
  editCorner?: boolean
  // Number of blank green/purple slices to show as a placeholder when the
  // (controlled) pool has fewer than 2 entries — e.g. before chat connects.
  placeholderSegments?: number
}

export default function SpinWheel({ defaultItems = [], editLabel = 'Edit', itemsLabel = 'Items', emptyHint, winWord, controlledItems, editCorner = false, placeholderSegments }: SpinWheelProps) {
  const rawId = useId().replace(/[:]/g, '')
  const [raw, setRaw] = useState(defaultItems.join('\n'))
  const [editing, setEditing] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [showWin, setShowWin] = useState(false)

  const controlled = controlledItems !== undefined

  // Full pool — every entrant is eligible to win (can be thousands).
  const pool = controlled
    ? controlledItems
    : raw.split('\n').map((p) => p.trim()).filter(Boolean)

  // Segments actually drawn on the wheel (a sample when the pool is large).
  const [display, setDisplay] = useState<string[]>([])

  // Keep the wheel's segments synced to the pool while idle.
  const poolKey = pool.join('')
  useEffect(() => {
    if (spinning) return
    if (pool.length < 2 && placeholderSegments) {
      setDisplay(Array(placeholderSegments).fill(''))
    } else {
      setDisplay(pool)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolKey, spinning, placeholderSegments])

  const n = display.length
  const seg = n > 0 ? 360 / n : 360

  function spin() {
    if (spinning || pool.length < 2) return

    // The whole pool is on the wheel — pick a random segment to land on.
    const segs = pool
    const winSeg = Math.floor(Math.random() * segs.length)
    const winnerName = segs[winSeg]
    setDisplay(segs)

    const segCount = segs.length
    const segAngle = 360 / segCount
    const winCenter = winSeg * segAngle + segAngle / 2
    const current = ((rotation % 360) + 360) % 360
    // Land the winning segment under the pointer at 90° (right side).
    const delta = (90 - winCenter - current + 720) % 360
    const newRotation = rotation + 5 * 360 + delta
    setRotation(newRotation)
    setSpinning(true)
    setWinner(winnerName)
    setShowWin(false)
    setTimeout(() => {
      setSpinning(false)
      setShowWin(true)
    }, 4700)
  }

  return (
    <div className="flex flex-col items-center">
      {/* Edit toggle (hidden when items are controlled externally) */}
      {!controlled && (
        <div className={editCorner ? 'absolute right-5 top-4 z-20 sm:right-6' : 'mb-3 flex w-full justify-end'}>
          <Button onClick={() => setEditing((e) => !e)} variant="ghost" size="xs">
            {editing ? 'Done' : editLabel}
          </Button>
        </div>
      )}

      {/* Wheel */}
      <div className="relative mx-auto w-full max-w-[440px]" style={{ aspectRatio: '1 / 1' }}>
        {/* Pointer — right side, pointing left toward the winner */}
        <div className="absolute top-1/2 z-20 -translate-y-1/2" style={{ right: '-12px' }}>
          <svg width="38" height="30" viewBox="0 0 38 30" style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.6))' }}>
            <path d="M0 15 L24 2 A13 13 0 1 1 24 28 Z" fill="#00FF87" />
            <circle cx="24" cy="15" r="4.5" fill="#0B0E2A" />
          </svg>
        </div>

        {/* Outer glow ring (static) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 50px rgba(0,255,135,0.18), inset 0 0 0 1px rgba(255,255,255,0.08)' }}
        />

        <svg
          viewBox="0 0 300 300"
          className="relative h-full w-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4.6s cubic-bezier(0.16, 0.84, 0.20, 1)' : 'none',
          }}
        >
          <defs>
            <radialGradient id={`${rawId}-rim`} cx="50%" cy="50%" r="50%">
              <stop offset="92%" stopColor="#1A1F4E" />
              <stop offset="100%" stopColor="#00FF87" />
            </radialGradient>
            {display.map((_, i) => {
              const c = COLORS[i % COLORS.length]
              return (
                <linearGradient key={i} id={`${rawId}-seg-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={lighten(c, 0.18)} />
                  <stop offset="100%" stopColor={darken(c, 0.8)} />
                </linearGradient>
              )
            })}
          </defs>

          {/* Rim */}
          <circle cx="150" cy="150" r="148" fill="#080A20" stroke={`url(#${rawId}-rim)`} strokeWidth="4" />

          {/* Segments */}
          {n >= 2 &&
            display.map((p, i) => {
              const start = i * seg
              const end = (i + 1) * seg
              const mid = start + seg / 2
              // Sunburst: each label reads outward along its spoke, centered
              // midway between the hub and the rim (same for every slice).
              const labelPos = polarToCartesian(150, 150, 90, mid)
              const rot = mid - 90
              const onGreen = i % 2 === 0
              return (
                <g key={i}>
                  <path
                    d={slicePath(150, 150, 140, start, end)}
                    fill={`url(#${rawId}-seg-${i})`}
                    stroke="#080A20"
                    strokeWidth="2"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill={onGreen ? '#0B0E2A' : '#FFFFFF'}
                    fontFamily="Inter, system-ui, sans-serif"
                    fontSize="11"
                    fontWeight="700"
                    letterSpacing="0.2"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${rot} ${labelPos.x} ${labelPos.y})`}
                  >
                    {p.length > 16 ? p.slice(0, 15) + '…' : p}
                  </text>
                </g>
              )
            })}
        </svg>

        {/* Center SPIN button (static) */}
        <button
          type="button"
          onClick={spin}
          disabled={spinning || pool.length < 2}
          className="font-display absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[1.3rem] leading-none text-[#0B0E2A] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          style={{
            width: '23%',
            aspectRatio: '1 / 1',
            background: 'radial-gradient(circle at 35% 30%, #6DFFB0, #00FF87 55%, #00C96A)',
            boxShadow: '0 0 0 6px #080A20, 0 0 0 8px rgba(255,255,255,0.12), 0 0 22px rgba(0,255,135,0.55)',
          }}
        >
          {spinning ? '…' : 'Spin'}
        </button>
      </div>

      {n < 2 && emptyHint && <p className="mt-4 text-sm text-muted">{emptyHint}</p>}

      {/* Editor popup */}
      {!controlled && editing && (
        <Modal onClose={() => setEditing(false)} title={editLabel}>
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.3em] text-faint">{itemsLabel}</label>
          <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={8} autoFocus className="field text-sm" />
          <Button onClick={() => setEditing(false)} className="mt-4 w-full">
            Done
          </Button>
        </Modal>
      )}

      {/* Win popup */}
      {showWin && winner && (
        <Modal onClose={() => setShowWin(false)} tone="accent" size="sm" innerClassName="p-8 text-center">
          <div className="mb-3 text-6xl">🎉</div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">{winWord}</p>
          <p className="font-display mt-2 break-words text-[2.8rem] leading-none text-white">{winner}</p>
          <Button onClick={() => setShowWin(false)} className="mt-7 w-full">
            Close
          </Button>
        </Modal>
      )}
    </div>
  )
}
