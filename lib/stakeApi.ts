// Live wager standings from Stake's affiliate wager-stats API.
//
// Stake's affiliate manager supplied an API key but no documentation yet, so
// the request and response shapes below are best guesses, built to be fixed
// from the server's settings rather than code once the real docs arrive.
// Anything that goes wrong (no key, wrong address, unexpected data) returns
// null and the leaderboard falls back to the CSV, so a bad guess can never
// break the page.
//
// Server settings (.env.local on the VPS, never committed):
//
//   STAKE_API_KEY          the key from Stake. Turns this on; without it the
//                          CSV is used and nothing here runs.
//   STAKE_API_URL          the wager-stats endpoint. Defaults to a guess.
//   STAKE_API_FROM_PARAM   query parameter for the race start (default: from)
//   STAKE_API_TO_PARAM     query parameter for the race end   (default: to)
//   STAKE_API_DATE_FORMAT  iso | ms | s | date               (default: iso)
//   STAKE_API_KEY_PARAM    if the key goes in the URL rather than a header,
//                          the parameter name for it (e.g. key or apiKey)
//
// By default the key is sent in the common auth headers (Authorization:
// Bearer, x-api-key, x-access-token), so most APIs accept it without any
// extra setting.

import type { Competitor } from './leaderboard'

const DEFAULT_URL = 'https://stake.com/_api/affiliate/wagers' // a guess: replace via STAKE_API_URL
const TIMEOUT_MS = 8000
const CACHE_MS = 60_000

type Cached = { key: string; at: number; rows: Competitor[] | null }
let cache: Cached | null = null
let lastWarn = 0

/** True once a key is configured on the server. */
export function stakeApiEnabled() {
  return !!process.env.STAKE_API_KEY
}

function formatDate(ms: number) {
  switch ((process.env.STAKE_API_DATE_FORMAT || 'iso').toLowerCase()) {
    case 'ms':
      return String(ms)
    case 's':
      return String(Math.floor(ms / 1000))
    case 'date':
      return new Date(ms).toISOString().slice(0, 10)
    default:
      return new Date(ms).toISOString()
  }
}

function warn(message: string) {
  // At most once a minute, and never with the key or full URL in it.
  if (Date.now() - lastWarn < 60_000) return
  lastWarn = Date.now()
  console.warn(`[stake-api] ${message} — falling back to the CSV`)
}

// ── Reading whatever comes back ──

const NAME_KEYS = ['username', 'userName', 'user_name', 'name', 'nickname', 'displayName', 'player', 'playerName']
const WAGER_KEYS = [
  'wagered', 'wager', 'wagerAmount', 'wager_amount', 'wageredAmount', 'wagered_amount',
  'totalWagered', 'total_wagered', 'totalWager', 'weightedWagered', 'weighted_wagered',
  'volume', 'amount', 'value', 'usd',
]

function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string') {
    const n = Number(v.replace(/[$,\s]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function pickName(o: Record<string, unknown>): string | null {
  for (const k of NAME_KEYS) {
    const v = o[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  // Nested, e.g. { user: { name } }
  for (const k of ['user', 'player', 'account']) {
    const v = o[k]
    if (v && typeof v === 'object') {
      const n = pickName(v as Record<string, unknown>)
      if (n) return n
    }
  }
  return null
}

function pickWager(o: Record<string, unknown>): number | null {
  for (const k of WAGER_KEYS) {
    const n = toNumber(o[k])
    if (n !== null) return n
  }
  for (const k of ['stats', 'wagers', 'totals']) {
    const v = o[k]
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const n = pickWager(v as Record<string, unknown>)
      if (n !== null) return n
    }
  }
  return null
}

/** The first array in the response whose items look like players. */
function findRows(data: unknown, depth = 0): Record<string, unknown>[] | null {
  if (depth > 5 || !data) return null
  if (Array.isArray(data)) {
    const objs = data.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object')
    if (objs.length && objs.some((o) => pickName(o) && pickWager(o) !== null)) return objs
    for (const x of objs) {
      const found = findRows(x, depth + 1)
      if (found) return found
    }
    return null
  }
  if (typeof data === 'object') {
    for (const v of Object.values(data as Record<string, unknown>)) {
      const found = findRows(v, depth + 1)
      if (found) return found
    }
  }
  return null
}

export function parseStakeResponse(data: unknown): Competitor[] | null {
  const rows = findRows(data)
  if (!rows) return null
  // Merge duplicate names (some APIs return one row per day or per game).
  const totals = new Map<string, number>()
  for (const o of rows) {
    const name = pickName(o)
    const wager = pickWager(o)
    if (!name || wager === null) continue
    totals.set(name, (totals.get(name) ?? 0) + wager)
  }
  return Array.from(totals, ([name, wagered]) => ({ name, wagered }))
    .sort((a, b) => b.wagered - a.wagered)
    .map((r, i) => ({ position: i + 1, name: r.name, wagered: r.wagered }))
}

/**
 * Standings for the race window from Stake's API, or null to fall back to the
 * CSV. Cached for a minute so page loads and the roller's polling don't each
 * call Stake.
 */
export async function fetchStakeStandings(startsAt: number, endsAt: number): Promise<Competitor[] | null> {
  const key = process.env.STAKE_API_KEY
  if (!key) return null

  const cacheKey = `${startsAt}-${endsAt}`
  if (cache && cache.key === cacheKey && Date.now() - cache.at < CACHE_MS) return cache.rows

  const url = new URL(process.env.STAKE_API_URL || DEFAULT_URL)
  url.searchParams.set(process.env.STAKE_API_FROM_PARAM || 'from', formatDate(startsAt))
  url.searchParams.set(process.env.STAKE_API_TO_PARAM || 'to', formatDate(Math.min(endsAt, Date.now())))
  if (process.env.STAKE_API_KEY_PARAM) url.searchParams.set(process.env.STAKE_API_KEY_PARAM, key)

  const where = `${url.origin}${url.pathname}`
  let rows: Competitor[] | null = null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${key}`,
        'x-api-key': key,
        'x-access-token': key,
      },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok) {
      warn(`${where} returned HTTP ${res.status}`)
    } else {
      rows = parseStakeResponse(await res.json())
      if (!rows) warn(`${where} replied, but no player/wager list was found in the response`)
    }
  } catch (e) {
    warn(`${where} failed: ${e instanceof Error ? e.name : 'error'}`)
  } finally {
    clearTimeout(timer)
  }

  cache = { key: cacheKey, at: Date.now(), rows }
  return rows
}
