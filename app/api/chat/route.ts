import WebSocket from 'ws'

// Relay for Kick chat, streamed to the giveaway picker as Server-Sent Events.
//
// Kick moved chat off Pusher onto its own realtime service (a Centrifugo
// server), and that server only accepts browser connections whose Origin is
// kick.com — a page on finbuck.bet is refused at the handshake. Servers send
// no browser Origin, so the connection is held here instead and the picker
// listens to this stream.
//
// The chat payloads themselves are unchanged from the Pusher days
// (App\Events\ChatMessageEvent, same sender/badges shape), so each one is
// forwarded as-is and the picker's parsing stays the same.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const TOKEN_URL = 'https://web.kick.com/api/v1/realtime/auth/connection'
const REALTIME_WS = 'wss://realtime.us-east-1.platform.kick.com/connection/websocket'

// Comment lines keep nginx's 60s proxy_read_timeout from cutting a quiet
// stream (a channel can go minutes without chat when offline).
const HEARTBEAT_MS = 15_000
// Refresh the guest token this long before Kick's TTL runs out (~45 min).
const REFRESH_LEAD_MS = 60_000
const RECONNECT_MIN_MS = 2_000
const RECONNECT_MAX_MS = 15_000

/** A guest token is just a random client id posted to Kick — no account. */
async function mintToken(): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'content-type': 'application/json', accept: 'application/json', 'x-app-platform': 'web' },
    body: JSON.stringify({ client_id: crypto.randomUUID() }),
  })
  if (!res.ok) throw new Error(`token request returned ${res.status}`)
  const token = ((await res.json()) as { data?: { token?: string } })?.data?.token
  if (!token) throw new Error('token missing from response')
  return token
}

export async function GET(req: Request) {
  const chatroom = new URL(req.url).searchParams.get('chatroom') ?? ''
  if (!/^\d{1,12}$/.test(chatroom)) {
    return new Response('chatroom must be a numeric id', { status: 400 })
  }

  const encoder = new TextEncoder()
  let finished = false
  let upstream: WebSocket | null = null
  let heartbeat: ReturnType<typeof setInterval> | null = null
  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let backoff = RECONNECT_MIN_MS
  // Assigned inside start(), which ReadableStream runs synchronously during
  // construction — so this has to be declared first, or the assignment hits
  // the temporal dead zone and throws on every request.
  let cleanup = () => {}

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        if (finished) return
        try {
          controller.enqueue(encoder.encode(chunk))
        } catch {
          finish()
        }
      }
      const emit = (event: string, data: string) => write(`event: ${event}\ndata: ${data}\n\n`)

      const finish = () => {
        if (finished) return
        finished = true
        if (heartbeat) clearInterval(heartbeat)
        if (refreshTimer) clearTimeout(refreshTimer)
        if (reconnectTimer) clearTimeout(reconnectTimer)
        try {
          upstream?.close()
        } catch {
          /* already closed */
        }
        upstream = null
        try {
          controller.close()
        } catch {
          /* already closed */
        }
      }
      cleanup = finish

      // Upstream drops are handled here rather than surfaced to the picker:
      // entries live in the browser, so reconnecting Kick-side is invisible
      // to it apart from a brief "reconnecting" status.
      const scheduleReconnect = () => {
        if (finished || reconnectTimer) return
        emit('status', 'reconnecting')
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null
          void open()
        }, backoff)
        backoff = Math.min(backoff * 2, RECONNECT_MAX_MS)
      }

      const open = async () => {
        if (finished) return
        let token: string
        try {
          token = await mintToken()
        } catch (err) {
          emit('upstream-error', JSON.stringify({ stage: 'token', detail: String(err) }))
          scheduleReconnect()
          return
        }
        if (finished) return

        const ws = new WebSocket(REALTIME_WS)
        upstream = ws
        let nextId = 3

        ws.on('open', () => {
          // Centrifugo takes newline-separated commands in one frame.
          ws.send(
            JSON.stringify({ connect: { token, name: 'js' }, id: 1 }) +
              '\n' +
              JSON.stringify({ subscribe: { channel: `chatrooms.${chatroom}.v2`, flag: 1 }, id: 2 })
          )
        })

        ws.on('message', (raw) => {
          for (const line of String(raw).split('\n')) {
            if (!line.trim()) continue
            let m: {
              id?: number
              error?: unknown
              connect?: { ttl?: number }
              push?: { pub?: { data?: { event?: string; data?: unknown } } }
            }
            try {
              m = JSON.parse(line)
            } catch {
              continue
            }

            // An empty object is Centrifugo's ping; it wants one back.
            if (Object.keys(m).length === 0) {
              ws.send('{}')
              continue
            }

            if (m.id === 1) {
              if (m.error) {
                emit('upstream-error', JSON.stringify({ stage: 'connect', detail: m.error }))
                ws.close()
                continue
              }
              // Swap in a fresh token before this one lapses, so a long
              // giveaway doesn't get dropped at the 45-minute mark.
              const ttl = m.connect?.ttl
              if (ttl) {
                if (refreshTimer) clearTimeout(refreshTimer)
                refreshTimer = setTimeout(async () => {
                  try {
                    const fresh = await mintToken()
                    if (ws.readyState === WebSocket.OPEN) {
                      ws.send(JSON.stringify({ refresh: { token: fresh }, id: nextId++ }))
                    }
                  } catch {
                    ws.close() // reconnect path mints a new token anyway
                  }
                }, Math.max(ttl * 1000 - REFRESH_LEAD_MS, 30_000))
              }
              continue
            }

            if (m.id === 2) {
              if (m.error) {
                emit('upstream-error', JSON.stringify({ stage: 'subscribe', detail: m.error }))
                ws.close()
              } else {
                backoff = RECONNECT_MIN_MS
                // Only now is chat actually flowing — the picker waits for
                // this before showing "Live".
                emit('ready', chatroom)
              }
              continue
            }

            const pub = m.push?.pub?.data
            if (pub?.event === 'App\\Events\\ChatMessageEvent') {
              emit('chat', typeof pub.data === 'string' ? pub.data : JSON.stringify(pub.data))
            }
          }
        })

        ws.on('close', () => {
          if (refreshTimer) clearTimeout(refreshTimer)
          if (upstream === ws) upstream = null
          scheduleReconnect()
        })
        // 'close' always follows 'error'; listening here just stops ws from
        // throwing an unhandled error event.
        ws.on('error', () => {})
      }

      heartbeat = setInterval(() => write(': ping\n\n'), HEARTBEAT_MS)
      req.signal.addEventListener('abort', finish)
      void open()
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      // Tells nginx not to buffer the stream, or messages arrive in clumps.
      'X-Accel-Buffering': 'no',
    },
  })
}
