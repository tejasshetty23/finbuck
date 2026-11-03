'use client'

import { useEffect, useMemo, useState } from 'react'
import Roller from './Roller'
import type { Place } from './NumberRoller'

/**
 * The leaderboard roller's "By wager" mode: everyone in the current race at
 * or over a weighted-wager threshold goes into the pool with one equal entry,
 * and the giveaway reel draws one of them (the pick itself happens on the
 * server, in /api/roll).
 *
 * Standings come from /api/standings, the same feed as the place roller:
 * full usernames, weighted wager, refreshed once a minute while the page is
 * open. The server-rendered list is used until the first refresh lands.
 */

const DEFAULT_THRESHOLD = 100

const usd = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function WagerRoller({ places: placesProp }: { places: Place[] }) {
  const [places, setPlaces] = useState<Place[]>(placesProp)
  const [draft, setDraft] = useState(String(DEFAULT_THRESHOLD))
  const threshold = Math.max(0, Number(draft.replace(/[$,\s]/g, '')) || 0)

  useEffect(() => {
    let alive = true
    const refresh = async () => {
      try {
        const res = await fetch('/api/standings', { cache: 'no-store' })
        if (!res.ok) return
        const data = (await res.json()) as { places: Place[] }
        if (alive && Array.isArray(data.places)) setPlaces(data.places)
      } catch {
        /* keep what we have; the next tick retries */
      }
    }
    refresh()
    const iv = setInterval(refresh, 60_000)
    return () => {
      alive = false
      clearInterval(iv)
    }
  }, [])

  // Everyone at or over the threshold, one entry each.
  const qualified = useMemo(() => places.filter((p) => p.wagered >= threshold), [places, threshold])
  const names = useMemo(() => qualified.map((p) => p.name), [qualified])
  const details = useMemo(
    () => Object.fromEntries(qualified.map((p) => [p.name, `${usd(p.wagered)} weighted wager · #${p.position} on the board`])),
    [qualified],
  )

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block">
          <span className="block text-[11px] font-bold uppercase tracking-[0.3em] text-faint">Minimum weighted wager</span>
          <span className="mt-2 flex items-center gap-2">
            <span className="font-display text-[1.8rem] leading-none text-accent-bright">$</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              inputMode="decimal"
              aria-label="Minimum weighted wager in dollars"
              className="field !h-11 !w-40 font-display !text-[1.6rem] tabular-nums"
            />
          </span>
        </label>
        <p className="text-sm text-muted sm:text-right">
          <span className="font-display text-[1.8rem] leading-none text-white">{qualified.length}</span>{' '}
          {qualified.length === 1 ? 'player qualifies' : 'players qualify'}
          <span className="block text-xs text-faint">Equal chance each · this month&apos;s race</span>
        </p>
      </div>

      <div className="mt-6">
        <Roller items={names} winWord="Wager roll winner" presenceCheck={false} details={details} />
      </div>

      {qualified.length < 2 && (
        <p className="mt-3 text-center text-sm text-faint">
          {qualified.length === 0
            ? 'Nobody has reached this amount yet. Lower the minimum to widen the pool.'
            : 'Only one player qualifies. Lower the minimum so at least two are in the draw.'}
        </p>
      )}
    </div>
  )
}
