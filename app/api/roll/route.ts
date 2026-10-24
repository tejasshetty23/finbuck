import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'

/**
 * Picks the giveaway winner from the entrants, uniformly at random. Every
 * entrant can win.
 */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { entrants?: unknown; exclude?: unknown }

    const entrants = Array.isArray(body.entrants)
      ? body.entrants.filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
      : []
    if (entrants.length < 2) {
      return NextResponse.json({ error: 'Not enough entrants.' }, { status: 400 })
    }

    let candidates = entrants

    // Skip the previous winner on a re-roll, unless they're the only one left.
    const exclude = typeof body.exclude === 'string' ? body.exclude.toLowerCase() : null
    if (exclude) {
      const filtered = candidates.filter((n) => n.trim().toLowerCase() !== exclude)
      if (filtered.length) candidates = filtered
    }

    // randomInt is uniform and free of modulo bias.
    return NextResponse.json({ winner: candidates[randomInt(candidates.length)] })
  } catch {
    return NextResponse.json({ error: 'Could not pick a winner.' }, { status: 500 })
  }
}
