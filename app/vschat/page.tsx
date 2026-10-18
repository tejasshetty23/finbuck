'use client'

import { useState, useRef, useEffect } from 'react'
import SlotReel, { slotImage, type Slot, type SlotReelHandle } from '../../components/SlotReel'
import Button from '../../components/Button'
import Panel from '../../components/Panel'
import Reveal from '../../components/Reveal'

// The two sides' colours: the site's green for the house, a soft violet
// for the challenger so the pair still reads as two without leaving the
// navy-and-green palette.
const HOUSE = '#00FF87'
const CHAT = '#B4A7FF'

const STEPS = [
  {
    title: 'Chat gets picked',
    desc: 'A viewer is pulled from chat — they become the challenger.',
  },
  {
    title: 'Slots locked in',
    desc: 'A viewer and FinBuck get their slots picked randomly.',
  },
  {
    title: 'Spin it out',
    desc: 'Both run live at the same bet. Highest multiplier takes it.',
  },
  {
    title: 'Winner takes it',
    desc: 'If chat wins → the prize is paid out on stream.',
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

/**
 * A fighter's corner on the fight card. The slot's cover art fills the
 * whole card as a backdrop (a tinted wash of the side's colour until one is
 * picked), with the avatar, name and slot stacked over it. The card leans
 * toward the VS in the middle; `side` picks the lean and which edge the
 * stripe runs down. Winning lights the whole card in the side's colour and
 * stamps it; losing knocks it back, greyed and tilted away.
 */
function FighterCard({
  f,
  side,
  winner,
  onWin,
}: {
  f: Fighter
  side: 'left' | 'right'
  winner: boolean | null
  onWin: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const won = winner === true
  const lost = winner === false
  const handle = (file?: File) => { if (file) f.setImg(URL.createObjectURL(file)) }
  const lean = side === 'left' ? 'md:[transform:perspective(1200px)_rotateY(10deg)]' : 'md:[transform:perspective(1200px)_rotateY(-10deg)]'
  const cut = side === 'left'
    ? 'polygon(0 0, calc(100% - 26px) 0, 100% 26px, 100% 100%, 26px 100%, 0 calc(100% - 26px))'
    : 'polygon(26px 0, 100% 0, 100% calc(100% - 26px), calc(100% - 26px) 100%, 0 100%, 0 26px)'

  return (
    <div
      className={`fighter group relative w-full transition-[transform,filter,opacity] duration-500 ${lean} ${won ? 'fighter-win' : ''} ${
        lost ? 'fighter-lose' : ''
      }`}
      style={{ filter: won ? `drop-shadow(0 0 34px ${f.color}99)` : lost ? 'grayscale(0.8) brightness(0.55)' : 'none' }}
    >
      {/* Edge: a thick glow in the side's colour, fading to a hairline */}
      <div
        className="p-[2px]"
        style={{
          clipPath: cut,
          background: won
            ? f.color
            : `linear-gradient(${side === 'left' ? '160deg' : '200deg'}, ${f.color} 0%, ${f.color}55 40%, rgba(255,255,255,0.08) 100%)`,
        }}
      >
        <div className="relative overflow-hidden bg-[#0B0E2A]" style={{ clipPath: cut, minHeight: 440 }}>
          {/* Backdrop: the slot art, blown up and darkened, else a wash */}
          {f.slotImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slotImage(f.slotImg, 600, 800)}
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-[1.5px] transition-transform duration-700 group-hover:scale-[1.15]"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: `radial-gradient(80% 60% at 50% 0%, ${f.color}33, transparent 70%), linear-gradient(180deg, #272D6C, #1A1F4E)` }}
            />
          )}
          {/* Darken the lower half so the text reads over the art */}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-[#0B0E2A]/10 via-[#0B0E2A]/55 to-[#0B0E2A]/95" />
          {/* Diagonal stripes, like a ring canvas */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 10px, #fff 10px 11px)' }}
          />

          {/* Corner tag */}
          <span
            className="absolute top-0 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#0B0E2A]"
            style={{
              [side]: 0,
              background: f.color,
              clipPath: side === 'left' ? 'polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%)' : 'polygon(0 0,100% 0,100% 100%,10px 100%)',
            }}
          >
            {f.role}
          </span>

          <div className="relative flex flex-col items-center px-6 pb-6 pt-12 text-center">
            {/* Avatar in a ringed hex-ish frame */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handle(e.dataTransfer.files?.[0]) }}
              className="relative h-32 w-32 cursor-pointer sm:h-36 sm:w-36"
              title="Click or drop an image"
            >
              <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(from 200deg, ${f.color}, transparent 40%, ${f.color} 70%, transparent)` , filter: 'blur(6px)', opacity: 0.8 }} />
              <span aria-hidden className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 0 3px ${f.color}` }} />
              <span className="absolute inset-[6px] flex items-center justify-center overflow-hidden rounded-full bg-[#080A20]">
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
              </span>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handle(e.target.files?.[0] ?? undefined)} />
            </div>

            {/* Name, slanted like the wordmark */}
            <input
              value={f.name}
              onChange={(e) => f.setName(e.target.value)}
              aria-label="Name"
              className="font-display mt-5 w-full -skew-x-[8deg] truncate bg-transparent text-center text-[2.6rem] leading-none text-white focus:outline-none"
              style={{ textShadow: `0 4px 24px rgba(0,0,0,0.8), 0 0 24px ${f.color}55` }}
            />

            {/* Slot plate */}
            <label className="mt-4 block w-full">
              <span className="block text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: f.color }}>Playing</span>
              <span className="mt-2 flex items-center gap-2 bg-[#080A20]/85 p-1.5 backdrop-blur-sm" style={{ clipPath: smallCut }}>
                {f.slotImg && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slotImage(f.slotImg, 120, 160)} alt="" className="h-11 w-9 shrink-0 bg-[#131740] object-cover" style={{ clipPath: smallCut }} />
                )}
                <input
                  value={f.slot}
                  onChange={(e) => f.setSlot(e.target.value)}
                  placeholder="No slot yet"
                  className="h-11 min-w-0 flex-1 bg-transparent text-center text-sm font-bold text-white placeholder:text-faint focus:outline-none"
                />
              </span>
            </label>

            {/* Declare this side the winner */}
            <button
              type="button"
              onClick={onWin}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.14em] transition-[transform,filter] hover:-translate-y-px hover:brightness-110 active:translate-y-px"
              style={{
                clipPath: btnCut,
                background: won ? f.color : `${f.color}26`,
                color: won ? '#0B0E2A' : f.color,
                boxShadow: won ? `0 0 28px ${f.color}80` : `inset 0 0 0 1px ${f.color}66`,
              }}
            >
              {won ? '🏆 Winner' : 'Declare winner'}
            </button>
          </div>

          {/* Stamp on the result */}
          {(won || lost) && (
            <span
              aria-hidden
              className="stamp font-display pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 -rotate-12 whitespace-nowrap px-5 py-1 text-[3.2rem] leading-none"
              style={{
                color: won ? f.color : '#FF5C5C',
                border: `4px solid ${won ? f.color : '#FF5C5C'}`,
                textShadow: '0 0 24px rgba(0,0,0,0.9)',
                background: 'rgba(11,14,42,0.55)',
              }}
            >
              {won ? 'Winner' : 'K.O.'}
            </span>
          )}
        </div>
      </div>
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
      {/* ── Broadcast bar: title on the left, the running score as a scoreboard on the right ── */}
      <Reveal>
        <div className="mx-auto mt-6 max-w-5xl">
          <Panel innerClassName="flex flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                Live slot duel
              </p>
              <h1 className="font-display mt-2 -skew-x-[8deg] text-[clamp(2.8rem,8vw,4.5rem)] leading-[0.9]">
                Slot <span className="text-accent-bright">battles</span>
              </h1>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                A viewer takes on the house. Both spin a slot — highest multiplier wins. Beat FinBuck, take the prize.
              </p>
            </div>

            {/* Scoreboard, persisted in this browser only */}
            <div className="flex items-center gap-4 self-center sm:self-auto">
              <div className="flex items-stretch bg-[#080A20]" style={{ clipPath: smallCut }}>
                <div className="flex flex-col items-center px-5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: HOUSE }}>FinBuck</span>
                  <span className="font-display text-[3rem] leading-none tabular-nums text-white">{score.house}</span>
                </div>
                <span className="font-display self-center text-[1.4rem] text-faint">:</span>
                <div className="flex flex-col items-center px-5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: CHAT }}>Chat</span>
                  <span className="font-display text-[3rem] leading-none tabular-nums text-white">{score.chat}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={resetScore}
                title="Reset score to 0-0"
                className="flex h-9 w-9 items-center justify-center bg-white/[0.06] text-faint transition-colors hover:bg-white/[0.1] hover:text-red-300"
                style={{ clipPath: smallCut }}
                aria-label="Reset score"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </Panel>
        </div>
      </Reveal>

      {/* Arena: a fight card. The two corners lean in toward a lit VS, over
          a spotlit floor; the result bar below is the ring announcer. */}
      <Reveal>
        <div className="relative mx-auto mt-8 max-w-5xl">
          {/* Spotlight floor behind the cards */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-[120%] -translate-y-1/2"
            style={{
              background: `radial-gradient(50% 45% at 25% 50%, ${HOUSE}1A, transparent 70%), radial-gradient(50% 45% at 75% 50%, ${CHAT}1F, transparent 70%)`,
            }}
          />

          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-0">
            <div className="mx-auto w-full max-w-[380px] md:mr-[-14px]">
              <FighterCard f={house} side="left" winner={outcome ? outcome === 'house' : null} onWin={() => declareWinner('house')} />
            </div>

            {/* VS: a lit badge with rays, pulsing until a winner is declared */}
            <div className="relative z-10 mx-auto flex h-28 w-28 items-center justify-center md:h-36 md:w-36">
              <span
                aria-hidden
                className={`absolute inset-0 rounded-full ${outcome ? '' : 'vs-pulse'}`}
                style={{
                  background: `conic-gradient(from 0deg, ${HOUSE}66 0 12deg, transparent 12deg 30deg, ${CHAT}66 30deg 42deg, transparent 42deg 60deg)`,
                  WebkitMaskImage: 'radial-gradient(circle, transparent 36%, #000 40%, #000 60%, transparent 72%)',
                  maskImage: 'radial-gradient(circle, transparent 36%, #000 40%, #000 60%, transparent 72%)',
                }}
              />
              <span
                className="vs-float font-display relative flex h-20 w-20 -skew-x-[8deg] items-center justify-center bg-[#080A20] text-[2.6rem] leading-none text-white md:h-24 md:w-24 md:text-[3rem]"
                style={{
                  clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
                  boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.14), 0 20px 40px rgba(0,0,0,0.5)`,
                  textShadow: `-3px 0 ${HOUSE}, 3px 0 ${CHAT}, 0 0 20px rgba(255,255,255,0.4)`,
                }}
                aria-label="versus"
              >
                VS
              </span>
            </div>

            <div className="mx-auto w-full max-w-[380px] md:ml-[-14px]">
              <FighterCard f={chat} side="right" winner={outcome ? outcome === 'chat' : null} onWin={() => declareWinner('chat')} />
            </div>
          </div>

          {/* Announcer bar */}
          <div
            className="relative mt-6 flex flex-wrap items-center justify-center gap-4 px-6 py-4 text-center transition-all"
            style={{
              clipPath: smallCut,
              background: isWin ? `linear-gradient(90deg, ${winColor}0A, ${winColor}2E, ${winColor}0A)` : 'rgba(255,255,255,0.04)',
              boxShadow: isWin ? `inset 0 0 0 1px ${winColor}80, 0 0 34px ${winColor}33` : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {outcome === 'chat' && (
              <span className="font-display -skew-x-[8deg] text-[1.9rem] leading-none" style={{ color: winColor, textShadow: `0 0 18px ${winColor}80` }}>
                🏆 Cash money AP for {chatName}
              </span>
            )}
            {outcome === 'house' && (
              <span className="font-display -skew-x-[8deg] text-[1.9rem] leading-none" style={{ color: winColor, textShadow: `0 0 18px ${winColor}80` }}>
                🏆 More keno money for Fin!
              </span>
            )}
            {!outcome && (
              <span className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
                <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
                Tap a card to declare the winner
                <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
              </span>
            )}
          </div>
        </div>
      </Reveal>

      {/* ── Control dock + slot reel ──
          The dock holds the round controls; the reel sits in a drawer below
          it so the random pick lands right under the fight card. */}
      <Reveal>
        <div className="mx-auto mt-6 max-w-5xl">
          <Panel innerClassName="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="font-display text-[1.5rem] leading-none text-white">Random slot picker</span>
                <span className="hidden text-xs text-muted sm:inline">Roll a slot, then hand it to a corner.</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={outcome ? resetRound : randomize}
                  disabled={!outcome && rolling}
                  variant={outcome ? 'ghost' : 'primary'}
                  size="sm"
                  title={outcome ? 'Clear the board for the next battle — the score is kept' : undefined}
                  className="min-w-[130px]"
                >
                  {outcome ? 'Next round' : rolling ? 'Rolling…' : 'Randomize'}
                </Button>
                <Button
                  onClick={undoLastRound}
                  disabled={history.length === 0}
                  variant="ghost"
                  size="sm"
                  className="!bg-[#7B6CFF] !text-white hover:!bg-[#8D80FF] disabled:!opacity-50"
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
        </div>
      </Reveal>

      {/* ── How it works: one strip, four steps in a row ── */}
      <Reveal>
        <div className="mx-auto mt-16 max-w-5xl">
          <p className="mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="whitespace-nowrap">How it works</span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
          </p>
          <Panel className="mt-6" innerClassName="grid divide-y divide-white/[0.06] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-4 p-5">
                <span className="font-display shrink-0 text-[2.4rem] leading-none text-accent-bright">{String(i + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <h3 className="font-display text-[1.4rem] leading-none text-white">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </Reveal>
    </div>
  )
}
