'use client'

import { useRef, useState, useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import Roller from './Roller'

// Public Kick Pusher app key (same one Kick's own site uses for live chat).
const PUSHER_WS = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false'

// Fixed to FinBuck's channel.
const CHANNEL = 'finbuck'

// Accounts that may enter but can never win are configured server-side via the
// NEVER_PICK_USERS env var and applied in /api/roll, so the list never reaches
// the browser or the repo.

type Status = 'idle' | 'connecting' | 'connected' | 'error'

interface ChatBadge {
  type: string
  text?: string
  count?: number
}

export default function LiveSubscriberWheel({ prizeWheel, numberPicker }: { prizeWheel?: ReactNode; numberPicker?: ReactNode }) {
  const [keyword, setKeyword] = useState('buck')
  const [subsOnly, setSubsOnly] = useState(false)
  // Subluck: when subs-only is off, subscribers get 2x entries on the roller.
  const [subLuck, setSubLuck] = useState(false)

  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  // Shown when the paid-vs-gifted lookup fails, so a silent fallback is visible.
  const [verifyWarning, setVerifyWarning] = useState('')
  const [entriesRaw, setEntriesRaw] = useState('')
  // Newline list of entrant usernames who are subscribers (for Subluck weighting).
  const [subsRaw, setSubsRaw] = useState('')
  const [showEntrants, setShowEntrants] = useState(false)

  // Live chat from the picked winner, shown in the roller's 30s presence check.
  const [winnerMessages, setWinnerMessages] = useState<{ text: string; at: number }[]>([])

  const wsRef = useRef<WebSocket | null>(null)
  const seenRef = useRef<Set<string>>(new Set())
  // KickLogz lists normal (self-paid) and gifted subscriptions separately —
  // the only way to tell them apart, since Kick's chat badges are identical.
  const normalSubscriberRef = useRef<Set<string>>(new Set())
  const giftedSubscriberRef = useRef<Set<string>>(new Set())
  // False until the paid/gifted lists load. Without them a sub can't be proven
  // non-gifted, so subs-only must admit nobody rather than risk letting one in.
  const verifiedRef = useRef(false)
  // Ref so the (stale) WS onmessage closure always reads the current winner.
  const watchedWinnerRef = useRef<string | null>(null)

  // Called by the roller: start/stop watching a winner's chat messages.
  function watchWinner(name: string | null) {
    watchedWinnerRef.current = name
    if (name) setWinnerMessages([])
  }

  const entries = entriesRaw.split('\n').map((e) => e.trim()).filter(Boolean)

  // Set of entrant usernames (lowercased) who are subscribers.
  const subSet = new Set(subsRaw.split('\n').map((s) => s.trim().toLowerCase()).filter(Boolean))

  // Pool sent to the roller: with Subluck on (and subs-only off), subscribers
  // get 2 entries.
  const rollerItems = !subsOnly && subLuck
    ? entries.flatMap((n) => (subSet.has(n.toLowerCase()) ? [n, n] : [n]))
    : entries

  useEffect(() => {
    return () => {
      wsRef.current?.close()
    }
  }, [])

  function addEntry(name: string, isSub: boolean) {
    const key = name.toLowerCase()
    if (seenRef.current.has(key)) return
    seenRef.current.add(key)
    setEntriesRaw((prev) => (prev ? `${prev}\n${name}` : name))
    if (isSub) setSubsRaw((prev) => (prev ? `${prev}\n${name}` : name))
  }

  function handleChatMessage(payload: unknown) {
    try {
      const msg = payload as { content?: string; sender?: { username?: string; identity?: { badges?: ChatBadge[] } } }
      const content = (msg.content ?? '').trim()
      const username = msg.sender?.username
      if (!username || !content) return

      // Presence check: capture any message from the watched winner.
      const watched = watchedWinnerRef.current
      if (watched && username.toLowerCase() === watched.toLowerCase()) {
        setWinnerMessages((prev) => [...prev, { text: content, at: Date.now() }].slice(-50))
      }

      // Keyword filter (empty keyword = any message counts)
      if (keyword.trim() && content.toLowerCase() !== keyword.trim().toLowerCase()) return

      // Two independent checks, because neither source is sufficient alone:
      //  1. The 'subscriber' chat badge proves the sub is CURRENTLY ACTIVE
      //     ('founder'/'og' persist after expiry, so they must not count).
      //  2. KickLogz proves it wasn't a GIFT — Kick's badges can't show that.
      // A past gift recipient who later buys their own sub appears in the
      // normal list too, so that overrides the gifted blocklist.
      const badges = msg.sender?.identity?.badges ?? []
      const hasActiveSub = badges.some((b) => b.type === 'subscriber')
      const key = username.toLowerCase()
      const isGiftedOnly =
        giftedSubscriberRef.current.has(key) && !normalSubscriberRef.current.has(key)
      // Fails closed: if the lists never loaded we can't prove a sub isn't
      // gifted, so nobody qualifies as a subscriber.
      const isEligibleSubscriber = hasActiveSub && verifiedRef.current && !isGiftedOnly

      if (subsOnly && !isEligibleSubscriber) return

      addEntry(username, isEligibleSubscriber)
    } catch {
      /* ignore malformed messages */
    }
  }

  async function connect() {
    setError('')
    setVerifyWarning('')
    setStatus('connecting')

    // Fresh start each connection: previously-collected (and previously-picked)
    // viewers are cleared, so everyone must re-type the keyword to enter.
    seenRef.current = new Set()
    normalSubscriberRef.current = new Set()
    giftedSubscriberRef.current = new Set()
    verifiedRef.current = false
    setEntriesRaw('')
    setSubsRaw('')

    let chatroomId: number | null = null
    try {
      const res = await fetch(`https://kick.com/api/v2/channels/${CHANNEL}`)
      if (!res.ok) throw new Error(`Kick returned ${res.status}`)
      const data = await res.json()
      chatroomId = data?.chatroom?.id ?? null
    } catch {
      setStatus('error')
      setError('Could not reach Kick to resolve the channel — it may be blocking the request. Try reconnecting.')
      return
    }

    if (!chatroomId) {
      setStatus('error')
      setError('Channel found but no chatroom id — try reconnecting.')
      return
    }

    // Load the paid/gifted lists BEFORE the socket opens, so the very first
    // chat messages are judged with the lists in place. (Awaiting it also stops
    // an early entrant being recorded as a non-sub and losing Subluck weight.)
    try {
      const res = await fetch('/api/subscribers', { cache: 'no-store' })
      if (!res.ok) throw new Error(`verify returned ${res.status}`)
      const data = (await res.json()) as { normal?: string[]; gifted?: string[] }
      normalSubscriberRef.current = new Set((data.normal ?? []).map((u) => u.toLowerCase()))
      giftedSubscriberRef.current = new Set((data.gifted ?? []).map((u) => u.toLowerCase()))
      verifiedRef.current = true
    } catch {
      // Chat still connects, but nobody counts as a subscriber — better an
      // empty subs-only roller than a gifted sub sneaking into it.
      setVerifyWarning('Could not verify paid vs gifted subs — subscriber entries are blocked. Reconnect to retry.')
    }

    try {
      const ws = new WebSocket(PUSHER_WS)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { auth: '', channel: `chatrooms.${chatroomId}.v2` } }))
        setStatus('connected')
      }

      ws.onmessage = (ev) => {
        try {
          const frame = JSON.parse(ev.data)
          if (frame.event === 'App\\Events\\ChatMessageEvent') {
            const chat = typeof frame.data === 'string' ? JSON.parse(frame.data) : frame.data
            handleChatMessage(chat)
          }
        } catch {
          /* ignore */
        }
      }

      ws.onerror = () => {
        setStatus('error')
        setError('Chat connection error — try reconnecting.')
      }

      ws.onclose = () => {
        setStatus((s) => (s === 'connected' ? 'idle' : s))
      }
    } catch {
      setStatus('error')
      setError('Could not open the chat connection.')
    }
  }

  function disconnect() {
    wsRef.current?.close()
    wsRef.current = null
    setStatus('idle')
  }

  function clearEntries() {
    seenRef.current = new Set()
    setEntriesRaw('')
    setSubsRaw('')
  }

  // Remove a picked winner from the pool so they can't be selected again this
  // connection. They stay in seenRef, so they can't re-enter until a reconnect.
  function removeEntrant(name: string) {
    const low = name.toLowerCase()
    const drop = (raw: string) => raw.split('\n').filter((e) => e.trim().toLowerCase() !== low).join('\n')
    setEntriesRaw((prev) => drop(prev))
    setSubsRaw((prev) => drop(prev))
  }

  const isConnected = status === 'connected'

  // Green checkbox (green outline → fills green when checked) instead of the
  // browser's default white box.
  // Which picker is on screen, chosen by the header dropdown via the query
  // string: /wheelspin?picker=prize etc.
  //
  // This deliberately does NOT use the URL hash. next/link navigates with
  // history.pushState, and pushState does not fire a hashchange event — so a
  // hash listener never runs when switching between two entries on this same
  // page. useSearchParams re-renders on client navigation, which is what makes
  // switching work.
  //
  // All three pickers stay mounted (the inactive ones are display:none rather
  // than unmounted), so switching away and back cannot reset a roller
  // mid-giveaway or lose a winner that was just drawn.
  type PickerId = 'giveaway' | 'prize' | 'number'
  const PICKER_IDS: PickerId[] = ['giveaway', 'prize', 'number']
  const searchParams = useSearchParams()
  const requested = searchParams.get('picker') as PickerId | null
  const view: PickerId = requested && PICKER_IDS.includes(requested) ? requested : 'giveaway'

  const checkboxClass =
    'appearance-none w-4 h-4 rounded-[3px] border-2 border-[#00ff87] bg-transparent checked:bg-[#00ff87] cursor-pointer transition-colors disabled:opacity-50 shrink-0'

  return (
    <div>

      {/* Active picker's title, at the same scale as other pages' headings */}
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight leading-tight">
          {view === 'prize' ? (
            <span className="animated-gradient-text-purple">Prize Picker</span>
          ) : view === 'number' ? (
            <span className="animated-gradient-text">Number Roller</span>
          ) : (
            <span className="animated-gradient-text">Giveaway Picker</span>
          )}
        </h1>
      </div>

      {/* Chat controls belong to the giveaway picker only — the prize wheel and
          number roller draw from nothing chat-related. Hidden rather than
          unmounted so the typed keyword survives switching away and back. */}
      <div className={`w-full max-w-md mx-auto mb-8 ${view === 'giveaway' ? '' : 'hidden'}`}>
        {/* Keyword input */}
        <div className="text-left">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Keyword</label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={isConnected}
            placeholder="buck"
            className="w-full h-12 bg-[#0d0a1a] border border-purple-700/50 rounded-lg px-4 text-base text-white focus:outline-none focus:border-[#00ff87] disabled:opacity-50"
          />
        </div>

        {/* Connect on the left, checkboxes stacked on the right */}
        <div className="flex items-center justify-center gap-6 mt-4">
          {!isConnected ? (
            <button
              onClick={connect}
              disabled={status === 'connecting'}
              className="h-12 text-black font-black px-6 rounded-lg uppercase tracking-widest text-sm transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
            >
              {status === 'connecting' ? 'Connecting…' : 'Connect to Chat'}
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="h-12 border border-red-500/40 text-red-300 hover:bg-red-500/10 font-bold px-6 rounded-lg uppercase tracking-widest text-sm transition-all"
            >
              Disconnect
            </button>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-sm text-[#00ff87] font-semibold cursor-pointer">
              <input type="checkbox" checked={subsOnly} onChange={(e) => setSubsOnly(e.target.checked)} disabled={isConnected} className={checkboxClass} />
              Subscribers only
            </label>

            {/* Subluck — only when subs-only is off: active subscribers get 2x entries */}
            {!subsOnly && (
              <label className="flex items-center gap-2 text-sm text-[#00ff87] font-semibold cursor-pointer" title="Subscribers get double entries on the roller">
                <input type="checkbox" checked={subLuck} onChange={(e) => setSubLuck(e.target.checked)} className={checkboxClass} />
                <span><span className="font-black">2×</span> Subluck</span>
              </label>
            )}
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="inline-flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00ff87] animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-gray-600'}`} />
            <span className="text-gray-400">
              {isConnected ? `Live · ${entries.length} entered` : status === 'connecting' ? 'Connecting…' : status === 'error' ? 'Not connected' : 'Idle'}
            </span>
          </span>

          {entries.length > 0 && (
            <button
              onClick={clearEntries}
              className="inline-flex items-center gap-1.5 text-red-300 hover:text-red-200 font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Clear
            </button>
          )}
        </div>

        {error && <p className="text-red-400/80 text-xs leading-relaxed text-center mt-2">{error}</p>}
        {verifyWarning && <p className="text-amber-400/90 text-xs leading-relaxed text-center mt-2">⚠ {verifyWarning}</p>}
      </div>

      {/* All three stay mounted; only the selected one is shown */}
      <div className="flex flex-col gap-8">
        {/* Giveaway wheel */}
        <div className={`relative rounded-2xl border border-purple-900/40 bg-[#0d0a1a]/40 p-6 pt-16 ${view === 'giveaway' ? '' : 'hidden'}`}>
          {/* Status — top-left corner */}
          <div className="absolute top-5 left-5 z-20 inline-flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00ff87] animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-gray-600'}`} />
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              {isConnected ? 'Live' : status === 'connecting' ? 'Connecting' : status === 'error' ? 'Not connected' : 'Inactive'}
            </span>
          </div>
          {/* View entrants — top-right corner */}
          <button
            onClick={() => setShowEntrants(true)}
            className="absolute top-5 right-5 z-20 inline-flex items-center gap-1.5 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 hover:bg-purple-500/10 font-bold py-1.5 px-3 rounded-lg uppercase tracking-widest text-[10px] transition-all"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            View Entrants ({entries.length})
          </button>
          <div className="w-full flex items-center justify-center">
            <Roller items={rollerItems} winWord="Congrats!" onWatch={watchWinner} winnerMessages={winnerMessages} onPick={removeEntrant} />
          </div>
        </div>

        {/* Prize wheel and number roller come from the page */}
        <div className={view === 'prize' ? '' : 'hidden'}>{prizeWheel}</div>
        <div className={view === 'number' ? '' : 'hidden'}>{numberPicker}</div>
      </div>

      {/* Entrants popup */}
      {showEntrants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm" onClick={() => setShowEntrants(false)}>
          <div
            className="relative max-w-md w-full rounded-2xl border border-purple-700/40 bg-[#0d0a1a] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-black uppercase tracking-widest text-sm">Entrants ({entries.length})</h4>
              <button onClick={() => setShowEntrants(false)} className="text-gray-500 hover:text-white transition-colors" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {entries.length === 0 ? (
              <p className="text-gray-600 text-sm">No entries yet — subscribers type the keyword in chat to join.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
                {entries.map((name, i) => (
                  <span key={i} className="text-xs text-gray-300 bg-[#07050f] border border-purple-900/40 rounded-full px-2.5 py-1 break-all">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
