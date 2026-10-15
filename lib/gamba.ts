import { GAMBA_RACE_ID } from './site'

// Live standings for FinBuck's monthly Gamba race.
//
// Gamba's own leaderboard page reads this from a public GraphQL endpoint using
// a persisted query (the sha256 below names the query; Gamba's server holds its
// text). No login or cookies are needed — the only thing it checks is that the
// Referer is a gamba.com page; without one it answers "Error 403 - #5".
//
// The hash is Gamba's internal detail and can change when they redeploy. If it
// does the fetch fails, getRace() returns null, and every caller falls back to
// FALLBACK_PRIZES rather than breaking — the leaderboard just loses its names.

const ENDPOINT = 'https://gamba.com/_api/@'
const QUERY_HASH = 'fce626ac48edaaf1714f52415711e5dae485413957763c994722e034350e8e29'

/** Re-fetch at most once a minute, however many people load the page. */
const REVALIDATE_SECONDS = 60

export type Competitor = {
  position: number
  name: string
  wagered: number
  avatar: string | null
}

export type Prize = { position: number; amount: number }

export type Race = {
  name: string
  prizePool: number
  /** Epoch ms. Gamba's dates are UTC — checked against its own countdown. */
  startsAt: number
  endsAt: number
  prizes: Prize[]
  competitors: Competitor[]
}

/**
 * The payout split as last seen live (30% / 15% / 10% ... of a ~$10,000 pool).
 * Only used when Gamba can't be reached, so the prizes still show.
 */
export const FALLBACK_PRIZES: Prize[] = [
  3000, 1500, 1000, 550, 500, 450, 400, 350, 325, 300,
  275, 250, 225, 200, 175, 150, 125, 100, 75, 50,
].map((amount, i) => ({ position: i + 1, amount }))

export const FALLBACK_POOL = 10000

type RawRace = {
  race_name?: string
  prize_pool?: number
  start_date?: string
  end_date?: string
  prize_distribution?: { position: number; amount: number }[]
  competitors?: { position: number; display_name: string; total_wagered: number; avatar?: string | null }[]
}

/** "2026-10-22 23:59:59" as UTC epoch ms. */
function utc(s: string | undefined) {
  return s ? Date.parse(s.replace(' ', 'T') + 'Z') : NaN
}

export async function getRace(): Promise<Race | null> {
  const params = new URLSearchParams({
    operationName: 'getRaceById',
    variables: JSON.stringify({ raceId: GAMBA_RACE_ID }),
    extensions: JSON.stringify({ persistedQuery: { version: 1, sha256Hash: QUERY_HASH } }),
  })

  // AbortController + setTimeout rather than AbortSignal.timeout(), which only
  // exists from Node 17.3 — on older Node it would throw inside the try and the
  // leaderboard would quietly never load.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(`${ENDPOINT}?${params}`, {
      headers: {
        referer: `https://gamba.com/promotions/exclusive-leaderboards/${GAMBA_RACE_ID}`,
        accept: 'application/json',
      },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
    })
    if (!res.ok) return null

    const raw = ((await res.json()) as { data?: { getRaceById?: RawRace } })?.data?.getRaceById
    if (!raw?.competitors) return null

    const startsAt = utc(raw.start_date)
    const endsAt = utc(raw.end_date)

    return {
      name: raw.race_name ?? 'Monthly Leaderboard',
      prizePool: raw.prize_pool ?? FALLBACK_POOL,
      startsAt,
      endsAt,
      prizes: (raw.prize_distribution ?? []).map((p) => ({ position: p.position, amount: p.amount })),
      competitors: raw.competitors
        .map((c) => ({
          position: c.position,
          name: c.display_name,
          wagered: c.total_wagered,
          avatar: c.avatar ?? null,
        }))
        .sort((a, b) => a.position - b.position),
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Benny-style masking: the first three letters, then a star per remaining
 * character, so a name is recognisable to its owner without being spelled out
 * to everyone. Gamba's own "Hidden" placeholder is passed through as-is.
 */
export function maskName(name: string) {
  if (!name || name === 'Hidden') return 'Hidden'
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
