import { NextResponse } from 'next/server'

const BASE_URL = 'https://kicklogz.com/api/streamer/finbuck/subscriptions'
// Safety rails: never crawl forever if upstream reports a bad page count.
const MAX_PAGES = 20
const TIMEOUT_MS = 8000

interface KickLogzSubscriber {
  username?: string
}

interface KickLogzResponse {
  data?: KickLogzSubscriber[]
  totalPages?: number
}

// KickLogz tracks normal (self-paid) and gifted subscriptions separately, which
// is the one place the two can be told apart — Kick's chat badges are identical
// for both. Proxied through the app so the browser makes no cross-origin call.
async function fetchList(kind: 'normal' | 'gifted'): Promise<string[]> {
  const usernames = new Set<string>()
  let page = 1
  let totalPages = 1

  while (page <= totalPages && page <= MAX_PAGES) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const response = await fetch(`${BASE_URL}/${kind}?page=${page}&limit=100`, {
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`${kind} returned ${response.status}`)

      const payload = (await response.json()) as KickLogzResponse
      for (const { username } of payload.data ?? []) {
        if (username) usernames.add(username.toLowerCase())
      }
      totalPages = payload.totalPages ?? 1
      page += 1
    } finally {
      clearTimeout(timer)
    }
  }

  return Array.from(usernames)
}

export async function GET() {
  try {
    const [normal, gifted] = await Promise.all([fetchList('normal'), fetchList('gifted')])
    return NextResponse.json({ normal, gifted })
  } catch {
    return NextResponse.json({ error: 'Could not verify subscribers.' }, { status: 502 })
  }
}
