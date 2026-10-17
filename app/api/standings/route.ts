import { NextResponse } from 'next/server'
import { getStandings, prizeFor } from '../../../lib/leaderboard'

// Current leaderboard places for the number roller, which polls this while
// the giveaways page is open so a long stream shows live ranks without a
// reload. Full usernames on purpose: the roller is a stream tool and the
// drawn place's holder is read out on air.
export const dynamic = 'force-dynamic'

export async function GET() {
  const race = await getStandings()
  return NextResponse.json(
    {
      updatedAt: race.updatedAt ?? null,
      paidPlaces: race.prizes.length,
      places: race.competitors.map((c) => ({
        position: c.position,
        name: c.name,
        wagered: c.wagered,
        prize: prizeFor(race.prizes, c.position),
      })),
    },
    { headers: { 'cache-control': 'no-store' } },
  )
}
