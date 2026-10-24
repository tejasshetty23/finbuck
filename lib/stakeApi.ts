// Live standings from Stake's affiliate leaderboard API.
//
// Docs: https://docs.stake.com/#tag/Affiliate/operation/LeaderboardCsv
//
//   GET https://api.stake.com/affiliate/leaderboard
//       ?timePeriod=customRange&startDate=<epoch ms>&endDate=<epoch ms>
//       &isStakeExclusive=false&limit=<rows>&offset=0
//   x-access-token: <Affiliate API Token>
//   Accept: text/csv
//
// The reply is a CSV:
//   rank,user_name,campaign_code,total_wagered_amount (USD),total_weighted_amount (USD)
//
// startDate and endDate are both inclusive, so the race window (25th 00:00
// UTC to the next 25th, end exclusive) is sent as start .. end - 1 ms.
//
// Server settings (.env.local on the VPS, never committed):
//
//   STAKE_API_KEY            the Affiliate API Token (Affiliate Program → API).
//                            Turns this on; without it the CSV file is used.
//   STAKE_LEADERBOARD_AMOUNT weighted | wagered   (default: weighted, which is
//                            what the leaderboard labels as "weighted wager")
//   STAKE_CAMPAIGN_IDS       optional, comma-separated campaign ids to limit
//                            the board to (default: all of FinBuck's campaigns)
//   STAKE_API_URL            optional override of the endpoint above
//
// If anything goes wrong (no key, network, Stake error, unexpected CSV) this
// returns null and the leaderboard falls back to data/leaderboard.csv, so a
// problem here can never break the page.

import type { Competitor } from './leaderboard'

const DEFAULT_URL = 'https://api.stake.com/affiliate/leaderboard'
const ROWS = 100 // the board shows every competitor; the top 10 are paid
const TIMEOUT_MS = 10_000
const CACHE_MS = 60_000

type Cached = { key: string; at: number; rows: Competitor[] | null }
let cache: Cached | null = null
let lastWarn = 0

/** True once a token is configured on the server. */
export function stakeApiEnabled() {
  return !!process.env.STAKE_API_KEY
}

function warn(message: string) {
  // At most once a minute, and never with the token in it.
  if (Date.now() - lastWarn < 60_000) return
  lastWarn = Date.now()
  console.warn(`[stake-api] ${message} — falling back to the CSV file`)
}

/** Splits one CSV line, honouring "quoted, fields". */
function splitCsvLine(line: string) {
  const out: string[] = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"'
        i++
      } else quoted = !quoted
    } else if (ch === ',' && !quoted) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

/**
 * Reads Stake's leaderboard CSV. Columns are found by header name, so a
 * reordered or extended CSV still reads correctly. Returns null if the
 * header isn't recognisable.
 */
export function parseStakeLeaderboardCsv(text: string, amount: 'weighted' | 'wagered' = 'weighted'): Competitor[] | null {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return null
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase())
  const nameCol = header.findIndex((h) => h === 'user_name' || h === 'username' || h === 'user')
  const weightedCol = header.findIndex((h) => h.startsWith('total_weighted'))
  const wageredCol = header.findIndex((h) => h.startsWith('total_wagered'))
  const amountCol = amount === 'wagered' ? (wageredCol >= 0 ? wageredCol : weightedCol) : weightedCol >= 0 ? weightedCol : wageredCol
  if (nameCol < 0 || amountCol < 0) return null

  // Merge any repeated names (e.g. one row per campaign).
  const totals = new Map<string, number>()
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line)
    const name = cells[nameCol]
    const value = Number((cells[amountCol] ?? '').replace(/[$,\s]/g, ''))
    if (!name || !Number.isFinite(value)) continue
    totals.set(name, (totals.get(name) ?? 0) + value)
  }
  return Array.from(totals, ([name, wagered]) => ({ name, wagered }))
    .sort((a, b) => b.wagered - a.wagered)
    .map((r, i) => ({ position: i + 1, name: r.name, wagered: r.wagered }))
}

/**
 * Standings for the race window from Stake, or null to fall back to the CSV
 * file. Cached for a minute so page loads and the roller's polling don't
 * each call Stake.
 */
export async function fetchStakeStandings(startsAt: number, endsAt: number): Promise<Competitor[] | null> {
  const token = process.env.STAKE_API_KEY
  if (!token) return null

  const amount = process.env.STAKE_LEADERBOARD_AMOUNT === 'wagered' ? 'wagered' : 'weighted'
  const end = Math.min(endsAt - 1, Date.now())
  if (end < startsAt) return null // the race hasn't started yet
  const cacheKey = `${startsAt}-${endsAt}-${amount}`
  if (cache && cache.key === cacheKey && Date.now() - cache.at < CACHE_MS) return cache.rows

  const url = new URL(process.env.STAKE_API_URL || DEFAULT_URL)
  url.searchParams.set('timePeriod', 'customRange')
  url.searchParams.set('startDate', String(startsAt))
  url.searchParams.set('endDate', String(end))
  url.searchParams.set('isStakeExclusive', 'false')
  url.searchParams.set('limit', String(ROWS))
  url.searchParams.set('offset', '0')
  if (process.env.STAKE_CAMPAIGN_IDS) url.searchParams.set('campaignIds', process.env.STAKE_CAMPAIGN_IDS)

  let rows: Competitor[] | null = null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      headers: { 'x-access-token': token, accept: 'text/csv' },
      cache: 'no-store',
      signal: ctrl.signal,
    })
    if (!res.ok) {
      warn(`Stake returned HTTP ${res.status}${res.status === 401 || res.status === 403 ? ' (check STAKE_API_KEY)' : ''}`)
    } else {
      rows = parseStakeLeaderboardCsv(await res.text(), amount)
      if (!rows) warn('Stake replied, but the CSV had no user_name / amount columns')
    }
  } catch (e) {
    warn(`couldn't reach Stake (${e instanceof Error ? e.name : 'error'})`)
  } finally {
    clearTimeout(timer)
  }

  cache = { key: cacheKey, at: Date.now(), rows }
  return rows
}
