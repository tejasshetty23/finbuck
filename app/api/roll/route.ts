import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'

/**
 * Picks the giveaway winner on the server so the never-pick list never reaches
 * the browser. Set NEVER_PICK_USERS in the server's .env (newline or comma
 * separated usernames, case-insensitive) — it is never committed.
 */
function neverPickSet(): Set<string> {
  return new Set(
    (process.env.NEVER_PICK_USERS ?? '')
      .split(/[\n,]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  )
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { entrants?: unknown; exclude?: unknown }

    const entrants = Array.isArray(body.entrants)
      ? body.entrants.filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
      : []
    if (entrants.length < 2) {
      return NextResponse.json({ error: 'Not enough entrants.' }, { status: 400 })
    }

    const blocked = neverPickSet()
    let candidates = blocked.size
      ? entrants.filter((n) => !blocked.has(n.trim().toLowerCase()))
      : entrants

    // Fail closed: never fall back to a name on the list.
    if (!candidates.length) {
      return NextResponse.json({ error: 'No eligible entrants.' }, { status: 409 })
    }

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
