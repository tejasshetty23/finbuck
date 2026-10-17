'use client'

import { useState, useRef, useEffect } from 'react'
import SlotReel, { slotImage, type Slot, type SlotReelHandle } from '../../components/SlotReel'
import Button from '../../components/Button'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import Reveal from '../../components/Reveal'
import SectionHeading from '../../components/SectionHeading'

// The two sides' colours: the site's green for the house, a soft violet
// for the challenger so the pair still reads as two without leaving the
// navy-and-green palette.
const HOUSE = '#00FF87'
const CHAT = '#B4A7FF'

const STEPS = [
  {
    title: 'Chat gets picked',
    desc: 'A viewer is pulled from chat — they become the challenger.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    title: 'Slots locked in',
    desc: 'A viewer and FinBuck get their slots picked randomly.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    title: 'Spin it out',
    desc: 'Both run live at the same bet. Highest multiplier takes it.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.306a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: 'Winner takes it',
    desc: 'If chat wins → the prize is paid out on stream.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
]

interface Fighter {
  role: string
  /** Cover art for the slot in the box, when it's a game from the catalogue. */
  slotImg?: string
  /** This side's colour: green for the house, violet for chat. */
  color: string
  img: string
  /** Scale applied to the avatar photo (>1 zooms in, <1 zooms out). */
  zoom?: number
  /** Nudge the photo inside its circle, in % of the circle (x, y). */
  nudge?: { x?: number; y?: number }
  setImg: (v: string) => void
  name: string
  setName: (v: string) => void
  slot: string
  setSlot: (v: string) => void
}

const smallCut = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'
const btnCut = 'polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px)'

function FighterCard({ f, winner, onWin }: { f: Fighter; winner: boolean | null; onWin: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const glow = winner === true
  const handle = (file?: File) => { if (file) f.setImg(URL.createObjectURL(file)) }

  return (
    <div
      className="w-full transition-all duration-300"
      style={{ filter: glow ? `drop-shadow(0 0 26px ${f.color}80)` : 'none', opacity: winner === false ? 0.6 : 1 }}
    >
      <Panel innerClassName="flex flex-col items-center p-6 text-center sm:p-7">
        {/* This side's colour, as a lit edge along the top */}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${f.color}, transparent)` }} />

        <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: f.color }}>{f.role}</p>

        {/* Avatar: click or drop to replace */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files?.[0]) }}
          className="mt-4 flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#080A20] sm:h-32 sm:w-32"
          style={{ boxShadow: `0 0 0 3px #0B0E2A, 0 0 0 5px ${f.color}` }}
          title="Click or drop an image"
        >
          {f.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f.img}
              alt=""
              className="h-full w-full object-cover"
              style={{ transform: `translate(${f.nudge?.x ?? 0}%, ${f.nudge?.y ?? 0}%) scale(${f.zoom ?? 1})` }}
            />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-faint">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files?.[0] ?? undefined)} />
        </div>

        {/* Name */}
        <input
          value={f.name}
          onChange={(e) => f.setName(e.target.value)}
          aria-label="Name"
          className="font-display mt-4 w-full truncate bg-transparent text-center text-[2rem] leading-none text-white focus:outline-none"
        />

        {/* Slot, with its cover art when it's a game from the catalogue */}
        <label className="mt-4 block w-full">
          <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-faint">Slot</span>
          <span className="mt-2 flex items-center gap-2">
            {f.slotImg && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slotImage(f.slotImg, 120, 160)} alt="" className="h-11 w-9 shrink-0 bg-[#131740] object-cover" style={{ clipPath: smallCut }} />
            )}
            <input
              value={f.slot}
              onChange={(e) => f.setSlot(e.target.value)}
              placeholder="—"
              className="field !h-11 min-w-0 flex-1 text-center text-sm font-bold"
            />
          </span>
        </label>

        {/* Declare this side the winner */}
        <button
          type="button"
          onClick={onWin}
          className="mt-5 flex h-11 w-full items-center justify-center text-sm font-bold uppercase tracking-[0.12em] transition-[transform,filter] hover:-translate-y-px active:translate-y-px"
          style={{
            clipPath: btnCut,
            background: winner === true ? f.color : `${f.color}1F`,
            color: winner === true ? '#0B0E2A' : f.color,
            boxShadow: winner === true ? `0 0 24px ${f.color}66` : 'none',
          }}
        >
          {winner === true ? 'Winner' : 'Declare winner'}
        </button>
      </Panel>
    </div>
  )
}

export default function VsChatPage() {
  // Fighters
  const [houseImg, setHouseImg] = useState('/finbuck-avatar.webp')
  const [houseName, setHouseName] = useState('FinBuck')
  const [houseSlot, setHouseSlot] = useState('')

  const [chatImg, setChatImg] = useState('/deer.webp')
  const [chatName, setChatName] = useState('Chat')
  const [chatSlot, setChatSlot] = useState('')


  // Set while a round has a declared winner, and cleared by Reset. The board is
  // deliberately left standing in between — both slots and the winning card stay
  // visible until Reset, which is also what turns Randomize back from Reset.
  const [outcome, setOutcome] = useState<'chat' | 'house' | null>(null)

  // Running score, persisted so it survives a refresh. Starts at 0-0 on the
  // server/first paint, then loads whatever was saved once the page mounts —
  // that one-time swap avoids a server/client hydration mismatch.
  const SCORE_KEY = 'vschat-score'
  const [score, setScore] = useState({ house: 0, chat: 0 })
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCORE_KEY)
      if (saved) setScore(JSON.parse(saved))
    } catch {
      /* localStorage unavailable — score just won't persist */
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(score))
    } catch {
      /* ignore */
    }
  }, [score])

  // Declared rounds, newest last, so Undo can put a point back and restore the
  // slots that were in play. Stored under its own key rather than folded into
  // the score, so scores saved by an earlier version still load. Persisted for
  // the same reason the score is: a refresh mid-stream shouldn't cost you the
  // ability to correct a misclick.
  const HISTORY_KEY = 'vschat-history'
  const HISTORY_MAX = 50
  type Round = { side: 'house' | 'chat'; houseSlot: string; chatSlot: string }
  const [history, setHistory] = useState<Round[]>([])
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) setHistory(JSON.parse(saved))
    } catch {
      /* ignore */
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    } catch {
      /* ignore */
    }
  }, [history])

  // Declaring scores the point and immediately clears the board for the next
  // battle. The winner banner is left showing until the next roll, so you can
  // still see who took the round after the slots have gone.
  function declareWinner(side: 'house' | 'chat') {
    // Already declared for this side — pressing again must not score twice.
    // Reset ends the round before the next point can be awarded.
    if (outcome === side) return

    if (outcome) {
      // Switching sides before Reset reads as correcting a misclick, so move
      // the point across rather than awarding a second one. The last history
      // entry is rewritten in place so Undo still walks back a single round.
      const prev = outcome
      setScore((s) => ({ ...s, [prev]: Math.max(0, s[prev] - 1), [side]: s[side] + 1 }))
      setHistory((h) => (h.length ? [...h.slice(0, -1), { ...h[h.length - 1], side }] : h))
      setOutcome(side)
      return
    }

    setScore((s) => ({ ...s, [side]: s[side] + 1 }))
    setHistory((h) => [...h, { side, houseSlot, chatSlot }].slice(-HISTORY_MAX))
    setOutcome(side)
  }

  // Clears the board for the next battle. The running score is untouched — only
  // Undo takes a point back.
  function resetRound() {
    reelRef.current?.clear()
    setRolling(false)
    setLanded(null)
    setOutcome(null)
    setHouseSlot('')
    setChatSlot('')
  }

  // Walks back the last declaration: takes the point off, restores that round's
  // two slots, and clears the banner.
  function undoLastRound() {
    const last = history[history.length - 1]
    if (!last) return
    reelRef.current?.clear()
    setRolling(false)
    setLanded(null)
    setScore((s) => ({ ...s, [last.side]: Math.max(0, s[last.side] - 1) }))
    setHouseSlot(last.houseSlot)
    setChatSlot(last.chatSlot)
    setHistory((h) => h.slice(0, -1))
    setOutcome(null)
  }

  function resetScore() {
    setScore({ house: 0, chat: 0 })
    setHistory([])
    setOutcome(null)
  }


  // ── Random slot picker ──
  // The reel (components/SlotReel) draws from Stake's catalogue and runs the
  // animation; this page only keeps what landed and drives it from its own
  // Randomize / Reset buttons through the ref.
  const reelRef = useRef<SlotReelHandle | null>(null)
  const [landed, setLanded] = useState<Slot | null>(null)
  const [rolling, setRolling] = useState(false)
  // Catalogue by lower-cased name, so a typed or landed slot can show its art.
  const artRef = useRef<Map<string, string>>(new Map())
  function artFor(name: string) {
    return artRef.current.get(name.trim().toLowerCase())
  }

  function randomize() {
    reelRef.current?.spin()
  }

  const house: Fighter = { role: 'The house', color: HOUSE, slotImg: artFor(houseSlot), img: houseImg, setImg: setHouseImg, name: houseName, setName: setHouseName, slot: houseSlot, setSlot: setHouseSlot }
  const chat: Fighter = { role: 'Challenger · from chat', color: CHAT, slotImg: artFor(chatSlot), img: chatImg, setImg: setChatImg, name: chatName, setName: setChatName, slot: chatSlot, setSlot: setChatSlot }

  const isWin = outcome === 'chat' || outcome === 'house'
  const winColor = outcome === 'house' ? HOUSE : CHAT

  return (
    <div className="px-6 pb-24 pt-[72px]">
      <PageHeader eyebrow="Live slot duel" live title={<>Slot <span className="text-accent-bright">battles</span></>}>
        A viewer takes on the house. Both spin a slot — highest multiplier wins. Beat FinBuck, take the prize.
      </PageHeader>

      {/* Running score — persisted in this browser only, survives a refresh */}
      <Reveal>
        <div className="mt-8 flex justify-center">
          <Panel innerClassName="flex items-center gap-6 px-7 py-4">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: HOUSE }}>FinBuck</p>
              <p className="font-display text-[2.6rem] leading-none tabular-nums" style={{ color: HOUSE }}>{score.house}</p>
            </div>
            <span className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: CHAT }}>Chat</p>
              <p className="font-display text-[2.6rem] leading-none tabular-nums" style={{ color: CHAT }}>{score.chat}</p>
            </div>
            <button
              type="button"
              onClick={resetScore}
              title="Reset score to 0-0"
              className="ml-1 text-faint transition-colors hover:text-red-300"
              aria-label="Reset score"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          </Panel>
        </div>
      </Reveal>

      {/* Random slot picker */}
      <Reveal>
        <div className="mx-auto mt-14 max-w-4xl">
          <p className="mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="whitespace-nowrap">Random slot picker</span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
          </p>

          <Panel className="mt-6" innerClassName="overflow-hidden">
            <SlotReel
              ref={reelRef}
              onSpinStart={() => {
                setRolling(true)
                setLanded(null)
                // Clear the previous round's winner banner as the next roll starts.
                setOutcome(null)
              }}
              onLand={(slot) => {
                setRolling(false)
                setLanded(slot)
              }}
              onCatalogue={(slots) => {
                artRef.current = new Map(slots.map((g) => [g.name.toLowerCase(), g.img]))
              }}
              actions={
                landed && (
                  <>
                    <Button onClick={() => setHouseSlot(landed.name)} variant="outline" size="sm">→ FinBuck</Button>
                    <button
                      type="button"
                      onClick={() => setChatSlot(landed.name)}
                      className="inline-flex h-10 items-center justify-center px-4 text-sm font-bold transition-[transform,background-color] hover:-translate-y-px"
                      style={{ clipPath: btnCut, background: `${CHAT}1F`, color: CHAT }}
                    >
                      → Chat
                    </button>
                  </>
                )
              }
            />
          </Panel>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={outcome ? resetRound : randomize}
              disabled={!outcome && rolling}
              variant={outcome ? 'ghost' : 'primary'}
              title={outcome ? 'Clear the board for the next battle — the score is kept' : undefined}
              className="min-w-[150px]"
            >
              {outcome ? 'Reset' : rolling ? 'Rolling…' : 'Randomize'}
            </Button>
            <Button
              onClick={undoLastRound}
              disabled={history.length === 0}
              variant="ghost"
              title={
                history.length
                  ? 'Undo the last declared winner — takes the point back and restores that round’s slots'
                  : 'Nothing to undo yet'
              }
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14L4 9l5-5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h11a5 5 0 010 10h-3" />
              </svg>
              Undo
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Arena */}
      <Reveal>
        <div className="mx-auto mt-14 max-w-4xl">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:items-stretch md:gap-6">
            <div className="w-full max-w-[340px] md:flex-1">
              <FighterCard f={house} winner={outcome ? outcome === 'house' : null} onWin={() => declareWinner('house')} />
            </div>

            {/* VS emblem — floats gently */}
            <div className="relative z-10 -my-2 flex shrink-0 items-center justify-center md:my-0">
              <span
                className="vs-float font-display flex h-20 w-20 items-center justify-center bg-[#080A20] text-[2.4rem] leading-none text-white shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
                style={{ clipPath: smallCut, textShadow: `0 0 18px ${HOUSE}66` }}
                aria-label="versus"
              >
                VS
              </span>
            </div>

            <div className="w-full max-w-[340px] md:flex-1">
              <FighterCard f={chat} winner={outcome ? outcome === 'chat' : null} onWin={() => declareWinner('chat')} />
            </div>
          </div>

          {/* Outcome banner — in the winner's own colour */}
          <div
            className="mt-5 flex flex-wrap items-center justify-center gap-4 px-6 py-4 text-center transition-all"
            style={{
              clipPath: smallCut,
              background: isWin ? `${winColor}14` : 'rgba(255,255,255,0.04)',
              boxShadow: isWin ? `inset 0 0 0 1px ${winColor}66, 0 0 28px ${winColor}33` : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {outcome === 'chat' && (
              <span className="font-display text-[1.6rem] leading-none" style={{ color: winColor, textShadow: `0 0 16px ${winColor}66` }}>
                🏆 Cash money AP for {chatName}
              </span>
            )}
            {outcome === 'house' && (
              <span className="font-display text-[1.6rem] leading-none" style={{ color: winColor, textShadow: `0 0 16px ${winColor}66` }}>
                🏆 More keno money for Fin!
              </span>
            )}
            {!outcome && (
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
                Tap a card to declare the winner
              </span>
            )}
          </div>
        </div>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <div className="mx-auto mt-24 max-w-5xl">
          <SectionHeading eyebrow="How it works" title={<>Four steps to a <span className="text-accent-bright">battle</span></>} className="mb-10" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Panel key={i} innerClassName="flex h-full flex-col p-6">
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center bg-[#0B0E2A] text-accent-bright" style={{ clipPath: smallCut }}>
                    {s.icon}
                  </span>
                  <span className="font-display text-[1.4rem] leading-none text-faint">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="font-display mt-5 text-[1.6rem] leading-none text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
              </Panel>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}
