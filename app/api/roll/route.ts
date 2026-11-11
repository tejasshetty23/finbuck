import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { addWinner, readCooldown, sameName } from '../../../lib/cooldown'

/**
 * Picks a winner from the entrants, uniformly at random.
 *
 * With `cooldown: true` (the giveaway picker), anyone who won one of the last
 * few giveaway rolls (lib/cooldown.ts) is quietly left out, and the new
 * winner is added to that list. The list lives on the server so a refresh
 * doesn't reset it. Nothing about it is exposed: the response is just the
 * winner, and there's no endpoint to read or change the list. To reset it,
 * delete data/giveaway-cooldown.json on the server.
 */

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { entrants?: unknown; exclude?: unknown; cooldown?: unknown }

    const entrants = Array.isArray(body.entrants)
      ? body.entrants.filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
      : []
    if (entrants.length < 2) {
      return NextResponse.json({ error: 'Not enough entrants.' }, { status: 400 })
    }

    const useCooldown = body.cooldown === true
    const recent = useCooldown ? await readCooldown() : []
    let candidates = recent.length ? entrants.filter((n) => !recent.some((r) => sameName(r, n))) : entrants

    if (!candidates.length) {
      // Deliberately vague: the cooldown isn't mentioned anywhere.
      return NextResponse.json({ error: 'Not enough eligible entrants to roll yet. Wait for more people to enter.' }, { status: 409 })
    }

    // Skip the previous winner on a re-roll, unless they're the only one left.
    const exclude = typeof body.exclude === 'string' ? body.exclude : null
    if (exclude) {
      const filtered = candidates.filter((n) => !sameName(n, exclude))
      if (filtered.length) candidates = filtered
    }

    // randomInt is uniform and free of modulo bias.
    const winner = candidates[randomInt(candidates.length)]
    if (useCooldown) await addWinner(winner)
    return NextResponse.json({ winner })
  } catch {
    return NextResponse.json({ error: 'Could not pick a winner.' }, { status: 500 })
  }
}
