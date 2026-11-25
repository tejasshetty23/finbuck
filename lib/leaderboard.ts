import { promises as fs } from 'fs'
import path from 'path'
import { RACE } from './site'
import { fetchStakeStandings, stakeApiEnabled } from './stakeApi'

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
  /** When the standings were last refreshed (API fetch, or CSV replaced), epoch ms. */
  updatedAt: number | null
  /** Placeholder data is showing — no API data and no real CSV. */
  isSample: boolean
  /** Where the standings came from. */
  source: 'api' | 'csv' | 'sample' | 'archive'
  /** A finished race being looked back on, not the one running now. */
  isPast?: boolean
}

const DATA_DIR = path.join(process.cwd(), 'data')
const REAL = path.join(DATA_DIR, 'leaderboard.csv')
const SAMPLE = path.join(DATA_DIR, 'leaderboard.sample.csv')

export const PRIZES: Prize[] = RACE.prizes.map((amount, i) => ({ position: i + 1, amount }))

const SWITCH_MS = RACE.switchHourUtc * 3600_000

/**
 * The race shown at `now`: the 25th to the 25th, 00:00 UTC. The site switches
 * to a new race at switchHourUtc on the 25th rather than midnight, so the race
 * that just ended stays up until Stake's final update has landed.
 */
export function raceWindow(now = Date.now()) {
  const d = new Date(now - SWITCH_MS)
  const y = d.getUTCFullYear()
  let m = d.getUTCMonth()
  if (d.getUTCDate() < RACE.dayOfMonth) m -= 1 // still in the race that began last month
  const startsAt = Date.UTC(y, m, RACE.dayOfMonth)
  const endsAt = Date.UTC(y, m + 1, RACE.dayOfMonth)
  return { startsAt, endsAt }
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

  // Save the race before this one for the archive, in the background. Cheap
  // once it's final: the saved file is read and nothing is fetched.
  if (stakeApiEnabled()) void archiveRace(previousWindow(race.startsAt)).catch(() => {})

  // Live from Stake when the API is configured and answers.
  const live = await fetchStakeStandings(race.startsAt, race.endsAt)
  if (live) {
    return { prizePool: RACE.prizePool, prizes: PRIZES, competitors: live, updatedAt: Date.now(), isSample: false, source: 'api', ...race }
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

// ── Past races ──
//
// Each finished race is saved to data/races/<start date>.json (gitignored: it
// holds full usernames) the first time it's needed after it ends: either a
// visit to the leaderboard (the race before the current one is archived in the
// background) or someone opening it from the race picker. For 48 hours after
// the switch the snapshot is refreshed from Stake, to catch late corrections;
// after that it's frozen and served from the file. Delete a file to rebuild it.

const RACES_DIR = path.join(DATA_DIR, 'races')
const FREEZE_AFTER_MS = 48 * 3600_000
const ARCHIVE_ROWS = 100

type Snapshot = { startsAt: number; endsAt: number; prizes: Prize[]; competitors: Competitor[]; savedAt: number }

/** "2026-10-25" for the race starting on that day. */
export const raceKey = (startsAt: number) => new Date(startsAt).toISOString().slice(0, 10)

/** The race that started on `key` (YYYY-MM-DD on the race day), or null. */
export function windowFromKey(key: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])]
  if (d !== RACE.dayOfMonth) return null
  return { startsAt: Date.UTC(y, mo, d), endsAt: Date.UTC(y, mo + 1, d) }
}

export function previousWindow(startsAt: number) {
  const s = new Date(startsAt)
  return { startsAt: Date.UTC(s.getUTCFullYear(), s.getUTCMonth() - 1, RACE.dayOfMonth), endsAt: startsAt }
}

/** Finished and past the switch hour, so its standings are final. */
const isFinished = (w: { endsAt: number }, now = Date.now()) => now >= w.endsAt + SWITCH_MS

async function readSnapshot(key: string): Promise<Snapshot | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(RACES_DIR, `${key}.json`), 'utf8')) as Snapshot
  } catch {
    return null
  }
}

/** Saves (or refreshes) a finished race's final standings; returns the snapshot. */
async function archiveRace(w: { startsAt: number; endsAt: number }): Promise<Snapshot | null> {
  if (!isFinished(w)) return null
  const key = raceKey(w.startsAt)
  const existing = await readSnapshot(key)
  if (existing && existing.savedAt >= w.endsAt + FREEZE_AFTER_MS) return existing

  const rows = await fetchStakeStandings(w.startsAt, w.endsAt)
  if (!rows) return existing
  const snapshot: Snapshot = {
    startsAt: w.startsAt,
    endsAt: w.endsAt,
    prizes: existing?.prizes ?? PRIZES,
    competitors: rows.slice(0, ARCHIVE_ROWS),
    savedAt: Date.now(),
  }
  try {
    await fs.mkdir(RACES_DIR, { recursive: true })
    const file = path.join(RACES_DIR, `${key}.json`)
    await fs.writeFile(`${file}.tmp`, JSON.stringify(snapshot))
    await fs.rename(`${file}.tmp`, file)
  } catch {
    /* can't write (read-only host): still return the fresh standings */
  }
  return snapshot
}

/** Standings for a finished race, from the archive (or Stake, then saved). */
export async function getPastStandings(key: string): Promise<Standings | null> {
  const w = windowFromKey(key)
  if (!w || !isFinished(w)) return null
  const snap = stakeApiEnabled() ? await archiveRace(w) : await readSnapshot(key)
  const prizes = snap?.prizes ?? PRIZES
  return {
    prizePool: prizes.reduce((a, p) => a + p.amount, 0),
    prizes,
    competitors: snap?.competitors ?? [],
    startsAt: w.startsAt,
    endsAt: w.endsAt,
    updatedAt: snap?.savedAt ?? null,
    isSample: false,
    source: 'archive',
    isPast: true,
  }
}

/** Finished races that can be looked back on, newest first. */
export async function listPastRaces(now = Date.now()): Promise<{ key: string; startsAt: number; endsAt: number }[]> {
  const keys = new Set<string>()
  try {
    for (const f of await fs.readdir(RACES_DIR)) if (/^\d{4}-\d{2}-\d{2}\.json$/.test(f)) keys.add(f.slice(0, 10))
  } catch {
    /* no archive yet */
  }
  // The race just before the current one, even before it's been saved: with
  // Stake connected it's fetched and saved on first view.
  if (stakeApiEnabled()) keys.add(raceKey(previousWindow(raceWindow(now).startsAt).startsAt))
  return Array.from(keys)
    .map((key) => ({ key, ...windowFromKey(key)! }))
    .filter((r) => r.startsAt && isFinished(r, now))
    .sort((a, b) => b.startsAt - a.startsAt)
}
