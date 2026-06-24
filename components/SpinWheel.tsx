'use client'

import { useState, useId, useEffect } from 'react'

const COLORS = ['#00ff87', '#9542e0', '#22c55e', '#6d2fd4', '#4ade80', '#7e26cf', '#16a34a', '#a96ef0']

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
        <div className={editCorner ? 'absolute top-5 right-5 z-20' : 'w-full flex justify-end mb-3'}>
          <button
            onClick={() => setEditing((e) => !e)}
            className="border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-500/10 font-semibold py-1.5 px-3 rounded-lg uppercase tracking-widest text-[10px] transition-all"
          >
            {editing ? 'Done' : editLabel}
          </button>
        </div>
      )}

      {/* Wheel */}
      <div className="relative w-full max-w-[440px] mx-auto" style={{ aspectRatio: '1 / 1' }}>
        {/* Pointer — right side, pointing left toward the winner */}
        <div className="absolute top-1/2 -translate-y-1/2 z-20" style={{ right: '-12px' }}>
          <svg width="38" height="30" viewBox="0 0 38 30" style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.6))' }}>
            <path d="M0 15 L24 2 A13 13 0 1 1 24 28 Z" fill="#00ff87" />
            <circle cx="24" cy="15" r="4.5" fill="#07050f" />
          </svg>
        </div>

        {/* Outer glow ring (static) */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 50px rgba(168,85,247,0.25), inset 0 0 0 1px rgba(168,85,247,0.2)' }}
        />

        <svg
          viewBox="0 0 300 300"
          className="w-full h-full relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 4.6s cubic-bezier(0.16, 0.84, 0.20, 1)' : 'none',
          }}
        >
          <defs>
            <radialGradient id={`${rawId}-rim`} cx="50%" cy="50%" r="50%">
              <stop offset="92%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#00ff87" />
            </radialGradient>
            {display.map((_, i) => {
              const c = COLORS[i % COLORS.length]
              return (
                <linearGradient key={i} id={`${rawId}-seg-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={lighten(c, 0.22)} />
                  <stop offset="100%" stopColor={darken(c, 0.78)} />
                </linearGradient>
              )
            })}
          </defs>

          {/* Rim */}
          <circle cx="150" cy="150" r="148" fill="#07050f" stroke={`url(#${rawId}-rim)`} strokeWidth="4" />

          {/* Segments */}
          {n >= 2 &&
            display.map((p, i) => {
              const start = i * seg
              const end = (i + 1) * seg
              const mid = start + seg / 2
              // Place the label along the slice's spoke (radial), centered at
              // radius 95. Flip it on the left half so it stays upright.
              const labelPos = polarToCartesian(150, 150, 95, mid)
              const norm = ((mid % 360) + 360) % 360
              const rot = norm > 90 && norm < 270 ? mid + 90 : mid - 90
              return (
                <g key={i}>
                  <path
                    d={slicePath(150, 150, 140, start, end)}
                    fill={`url(#${rawId}-seg-${i})`}
                    stroke="#07050f"
                    strokeWidth="2"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    fill="#07050f"
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
          onClick={spin}
          disabled={spinning || pool.length < 2}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 rounded-full flex items-center justify-center font-black uppercase tracking-widest text-[13px] transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          style={{
            width: '23%',
            aspectRatio: '1 / 1',
            color: '#06210f',
            background: 'radial-gradient(circle at 35% 30%, #6dffb0, #00ff87 55%, #00b865)',
            boxShadow: '0 0 0 6px #07050f, 0 0 0 8px rgba(168,85,247,0.4), 0 0 22px rgba(0,255,135,0.55)',
          }}
        >
          {spinning ? '…' : 'Spin'}
        </button>
      </div>

      {n < 2 && emptyHint && <p className="text-gray-500 text-sm mt-4">{emptyHint}</p>}

      {/* Editor popup */}
      {!controlled && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm" onClick={() => setEditing(false)}>
          <div
            className="relative max-w-md w-full rounded-2xl border border-purple-700/40 bg-[#0d0a1a] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-black uppercase tracking-widest text-sm">{editLabel}</h4>
              <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-white transition-colors" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{itemsLabel}</label>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              rows={8}
              autoFocus
              className="w-full bg-[#07050f] border border-purple-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00ff87] resize-none"
            />
            <button
              onClick={() => setEditing(false)}
              className="w-full mt-4 text-black font-black py-2.5 rounded-lg uppercase tracking-widest text-xs"
              style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

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
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#00ff87' }}>
              {winWord}
            </p>
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
