import { promises as fs } from 'fs'
import path from 'path'
import { RACE } from './site'
import { fetchStakeStandings } from './stakeApi'

// Standings for FinBuck's monthly Stake race.
//
// When STAKE_API_KEY is set on the server, standings come live from Stake's
// affiliate leaderboard API (see lib/stakeApi.ts). Otherwise, or whenever
// that call fails, they come from FinBuck's affiliate dashboard as a CSV:
//
//   data/leaderboard.csv            the real file — lives on the server only
//   data/leaderboard.sample.csv     placeholder names, used until it exists
//
// The real file is gitignored on purpose. It holds full usernames and wagers,
// the repo is public, and names are only masked at render time — committing
// it would publish them unmasked.
//
// Format: one player per line, `username,wagered`. A header row is optional,
// rows can be in any order (they're ranked by wager), and the amount may be
// written as 41635.18, $41,635.18 or "41,635.18".

export type Competitor = { position: number; name: string; wagered: number }
export type Prize = { position: number; amount: number }

export type Standings = {
  prizePool: number
  prizes: Prize[]
  competitors: Competitor[]
  /** Current race window, epoch ms UTC. */
  startsAt: number
  endsAt: number
  /** True before the first race has begun. */
  upcoming: boolean
  /** When the standings were last refreshed (API fetch, or CSV replaced), epoch ms. */
  updatedAt: number | null
  /** Placeholder data is showing — no API data and no real CSV. */
  isSample: boolean
  /** Where the standings came from. */
  source: 'api' | 'csv' | 'sample'
}

const DATA_DIR = path.join(process.cwd(), 'data')
const REAL = path.join(DATA_DIR, 'leaderboard.csv')
const SAMPLE = path.join(DATA_DIR, 'leaderboard.sample.csv')

export const PRIZES: Prize[] = RACE.prizes.map((amount, i) => ({ position: i + 1, amount }))

/** The race running at `now`: the 25th to the 25th, never before the first one. */
export function raceWindow(now = Date.now()) {
  if (now < RACE.firstStart) {
    const s = new Date(RACE.firstStart)
    return { startsAt: RACE.firstStart, endsAt: Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + 1, RACE.dayOfMonth), upcoming: true }
  }
  const d = new Date(now)
  const y = d.getUTCFullYear()
  let m = d.getUTCMonth()
  if (d.getUTCDate() < RACE.dayOfMonth) m -= 1 // still in the race that began last month
  const startsAt = Date.UTC(y, m, RACE.dayOfMonth)
  const endsAt = Date.UTC(y, m + 1, RACE.dayOfMonth)
  return { startsAt, endsAt, upcoming: false }
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

export function parseCsv(text: string): Competitor[] {
  const rows: { name: string; wagered: number }[] = []
  for (const raw of text.replace(/^﻿/, '').split(/\r?\n/)) {
    if (!raw.trim()) continue
    const [name, amount] = splitCsvLine(raw)
    const wagered = Number((amount ?? '').replace(/[$,\s]/g, ''))
    // Header rows and anything malformed fall out here rather than becoming
    // a player with a NaN wager.
    if (!name || !Number.isFinite(wagered)) continue
    rows.push({ name, wagered })
  }
  return rows
    .sort((a, b) => b.wagered - a.wagered)
    .map((r, i) => ({ position: i + 1, name: r.name, wagered: r.wagered }))
}

export async function getStandings(): Promise<Standings> {
  const race = raceWindow()

  // Live from Stake when the API is configured and answers; before the first
  // race starts there's nothing to fetch yet.
  if (!race.upcoming) {
    const live = await fetchStakeStandings(race.startsAt, race.endsAt)
    if (live) {
      return { prizePool: RACE.prizePool, prizes: PRIZES, competitors: live, updatedAt: Date.now(), isSample: false, source: 'api', ...race }
    }
  }

  let competitors: Competitor[] = []
  let updatedAt: number | null = null
  let isSample = false

  for (const [file, sample] of [
    [REAL, false],
    [SAMPLE, true],
  ] as const) {
    try {
      const [text, stat] = await Promise.all([fs.readFile(file, 'utf8'), fs.stat(file)])
      competitors = parseCsv(text)
      updatedAt = stat.mtimeMs
      isSample = sample
      break
    } catch {
      /* not there — try the next one */
    }
  }

  return { prizePool: RACE.prizePool, prizes: PRIZES, competitors, updatedAt, isSample, source: isSample ? 'sample' : 'csv', ...race }
}

/**
 * Benny-style masking: the first three letters, then a star per remaining
 * character, so a name is recognisable to its owner without being spelled out
 * to everyone.
 */
export function maskName(name: string) {
  if (!name) return 'Hidden'
  const shown = name.length <= 3 ? 1 : 3
  return name.slice(0, shown) + '*'.repeat(Math.max(name.length - shown, 3))
}

/** 1st, 2nd, 3rd, 4th ... 11th, 12th, 13th ... 21st, 22nd, 23rd. */
export function ordinal(n: number) {
  const teen = n % 100 >= 11 && n % 100 <= 13
  const suffix = teen ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th'
  return `${n}${suffix}`
}

export function prizeFor(prizes: Prize[], position: number) {
  return prizes.find((p) => p.position === position)?.amount ?? null
}

export function usd(n: number, cents = false) {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  })
}
