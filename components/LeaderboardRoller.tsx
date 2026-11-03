'use client'

import { useState } from 'react'
import NumberRoller, { type Place } from './NumberRoller'
import WagerRoller from './WagerRoller'

/**
 * The leaderboard roller, with two modes:
 *   By place: roll a place number and show who holds it (the original roller).
 *   By wager: draw one player, at equal odds, from everyone at or over a
 *             weighted-wager threshold.
 * Both stay mounted while switching, so a mode's state (range, threshold,
 * last result) survives flipping back and forth.
 */
export default function LeaderboardRoller({ places, paidPlaces }: { places: Place[]; paidPlaces: number }) {
  const [mode, setMode] = useState<'place' | 'wager'>('place')

  const options = [
    { id: 'place' as const, label: 'By place' },
    { id: 'wager' as const, label: 'By wager' },
  ]

  return (
    <div>
      <div className="mb-7 flex justify-center">
        <div role="radiogroup" aria-label="Roller mode" className="relative grid grid-cols-2 rounded-full bg-[#080A20] p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]">
          <span
            aria-hidden
            className="absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-full bg-accent shadow-[0_0_20px_rgba(0,255,135,0.4)] transition-[left] duration-300 ease-out"
            style={{ left: mode === 'place' ? 6 : 'calc(50%)' }}
          />
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={mode === o.id}
              onClick={() => setMode(o.id)}
              className={`relative z-10 min-w-[130px] rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-300 ${
                mode === o.id ? 'text-[#0B0E2A]' : 'text-muted hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className={mode === 'place' ? '' : 'hidden'}>
        <NumberRoller min={1} max={paidPlaces} places={places} paidPlaces={paidPlaces} />
      </div>
      <div className={mode === 'wager' ? '' : 'hidden'}>
        <WagerRoller places={places} />
      </div>
    </div>
  )
}
