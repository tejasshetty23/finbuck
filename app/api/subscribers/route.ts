import { NextResponse } from 'next/server'

const KICKLOGZ_URL = 'https://kicklogz.com/api/streamer/finbuck/subscriptions/normal'

interface KickLogzSubscriber {
  username?: string
}

interface KickLogzResponse {
  data?: KickLogzSubscriber[]
  totalPages?: number
}

// KickLogz's public streamer page exposes normal subscriptions separately from
// gifts. Proxy it through the app so the browser has no cross-origin request.
export async function GET() {
  try {
    const usernames = new Set<string>()
    let page = 1
    let totalPages = 1

    while (page <= totalPages) {
      const response = await fetch(`${KICKLOGZ_URL}?page=${page}&limit=100`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'Could not verify subscribers.' }, { status: 502 })
      }

      const payload = await response.json() as KickLogzResponse
      const subscribers = payload.data ?? []
      subscribers.forEach(({ username }) => {
        if (username) usernames.add(username.toLowerCase())
      })
      totalPages = payload.totalPages ?? 1
      page += 1
    }

    return NextResponse.json({ usernames: Array.from(usernames) })
  } catch {
    return NextResponse.json({ error: 'Could not verify subscribers.' }, { status: 502 })
  }
}
