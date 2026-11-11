import { NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { addWinner, clearCooldown, COOLDOWN_ROLLS, readCooldown, sameName } from '../../../lib/cooldown'

/**
 * Picks a winner from the entrants, uniformly at random.
 *
 * With `cooldown: true` (the giveaway picker), anyone who won one of the last
 * COOLDOWN_ROLLS giveaway rolls is left out of the draw, and the new winner
 * is added to that list. The list lives on the server (lib/cooldown.ts), so
 * a page refresh doesn't reset it.
 *
 * GET returns the current cooldown list; DELETE clears it.
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ recent: await readCooldown(), rolls: COOLDOWN_ROLLS })
}

export async function DELETE() {
  await clearCooldown()
  return NextResponse.json({ recent: [], rolls: COOLDOWN_ROLLS })
}

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
      return NextResponse.json(
        {
          error: `Everyone in the pool won one of the last ${COOLDOWN_ROLLS} rolls, so nobody can be drawn. Wait for more entrants or clear the cooldown.`,
          recent,
        },
        { status: 409 },
      )
    }

    // Skip the previous winner on a re-roll, unless they're the only one left.
    const exclude = typeof body.exclude === 'string' ? body.exclude : null
    if (exclude) {
      const filtered = candidates.filter((n) => !sameName(n, exclude))
      if (filtered.length) candidates = filtered
    }

    // randomInt is uniform and free of modulo bias.
    const winner = candidates[randomInt(candidates.length)]
    const nowRecent = useCooldown ? await addWinner(winner) : recent
    return NextResponse.json({ winner, recent: nowRecent })
  } catch {
    return NextResponse.json({ error: 'Could not pick a winner.' }, { status: 500 })
  }
}
