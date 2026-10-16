'use client'

import { useState, useEffect } from 'react'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import Reveal from '../../components/Reveal'

type Slot = string | null
type Rounds = Slot[][]

function nextPow2(n: number): number {
  let p = 1
  while (p < n) p *= 2
  return p
}

function buildRounds(entrants: string[]): Rounds {
  const n = entrants.length
  const size = Math.max(2, nextPow2(n))
  const r0: Slot[] = Array.from({ length: size }, (_, i) => (i < n ? entrants[i] : null))
  const rounds: Rounds = [r0]
  let len = size
  while (len > 1) {
    len = len / 2
    rounds.push(Array.from({ length: len }, () => null))
  }
  return rounds
}

const clone = (r: Rounds): Rounds => r.map((round) => [...round])

// Shrink the font when a name is longer than the box can fit (14px base).
function autoFontSize(text: string, maxChars: number): string | undefined {
  const len = text.length
  if (len <= maxChars) return undefined
  return `${Math.max(9, Math.round(14 * (maxChars / len)))}px`
}

function roundLabel(i: number, finalIdx: number): string {
  if (i === finalIdx) return 'Champion'
  if (i === finalIdx - 1) return 'Final'
  if (i === finalIdx - 2) return 'Semifinals'
  if (i === finalIdx - 3) return 'Quarterfinals'
  return `Round ${i + 1}`
}

const smallCut = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'

export default function TournamentsPage() {
  const [count, setCount] = useState(8)
  const [rounds, setRounds] = useState<Rounds | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [history, setHistory] = useState<Rounds[]>([])
  const [champion, setChampion] = useState<string | null>(null)
  const [showWin, setShowWin] = useState(false)

  // Preload the champion-popup image so it shows instantly on a win.
  useEffect(() => {
    const img = new window.Image()
    img.src = '/finbuck-update.webp'
  }, [])

  function createBracket() {
    const clamped = Math.min(32, Math.max(2, Math.floor(count) || 2))
    // Empty entrants/slots so the inputs show numbered placeholders instead.
    const entrants = Array.from({ length: clamped }, () => '')
    setRounds(buildRounds(entrants))
    setSlots(Array.from({ length: clamped }, () => ''))
    setHistory([])
    setChampion(null)
    setShowWin(false)
  }

  function editSlot(i: number, value: string) {
    setSlots((prev) => {
      const next = prev.slice()
      next[i] = value
      return next
    })
  }

  function editName(i: number, value: string) {
    if (!rounds) return
    const next = clone(rounds)
    next[0][i] = value
    setRounds(next)
  }

  function advance(r: number, i: number) {
    if (!rounds) return
    const name = rounds[r][i]
    if (!name) return
    setHistory((h) => [...h, clone(rounds)])
    const next = clone(rounds)
    next[r + 1][Math.floor(i / 2)] = name
    setRounds(next)
    const finalIdx = next.length - 1
    if (r + 1 === finalIdx && next[finalIdx][0]) {
      setChampion(next[finalIdx][0])
      setShowWin(true)
    }
  }

  function undo() {
    setHistory((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      setRounds(prev)
      const finalIdx = prev.length - 1
      setChampion(prev[finalIdx][0] ?? null)
      setShowWin(false)
      return h.slice(0, -1)
    })
  }

  function newBracket() {
    setRounds(null)
    setHistory([])
    setChampion(null)
    setShowWin(false)
  }

  const finalIdx = rounds ? rounds.length - 1 : 0

  // Slot the champion started with (the slot next to their round-1 name).
  const championIndex = rounds && champion ? rounds[0].findIndex((n) => n === champion) : -1
  const championSlot = championIndex >= 0 ? (slots[championIndex]?.trim() || `Slot ${championIndex + 1}`) : ''

  const stepBtn =
    'flex h-11 w-11 items-center justify-center bg-white/[0.07] text-xl font-bold text-white transition-colors hover:bg-white/[0.12]'

  return (
    <div className="px-6 pb-24 pt-[72px]">
      <PageHeader eyebrow="Bracket" title="Tournaments">
        Build a single-elimination bracket and crown a champion.
      </PageHeader>

      {/* Setup */}
      {!rounds && (
        <Reveal>
          <div className="mx-auto mt-12 max-w-md">
            <Panel tone="accent" innerClassName="p-7 text-center sm:p-9">
              <label className="block text-[11px] font-bold uppercase tracking-[0.3em] text-faint">Number of entrants</label>

              <div className="mt-5 flex items-center justify-center gap-3">
                <button type="button" onClick={() => setCount((c) => Math.max(2, c - 1))} className={stepBtn} style={{ clipPath: smallCut }} aria-label="Fewer">
                  −
                </button>
                <input
                  type="number"
                  min={2}
                  max={32}
                  value={count}
                  onChange={(e) => setCount(Math.min(32, Number(e.target.value)))}
                  className="field font-display !h-14 !w-28 text-center !text-[2.4rem] leading-none"
                />
                <button type="button" onClick={() => setCount((c) => Math.min(32, c + 1))} className={stepBtn} style={{ clipPath: smallCut }} aria-label="More">
                  +
                </button>
              </div>

              <div className="mt-5 flex items-center justify-center gap-2">
                {[4, 8, 16, 32].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCount(n)}
                    className={`h-9 w-14 text-sm font-bold transition-colors ${
                      count === n ? 'bg-accent text-[#0B0E2A]' : 'bg-white/[0.07] text-muted hover:bg-white/[0.12] hover:text-white'
                    }`}
                    style={{ clipPath: smallCut }}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <Button onClick={createBracket} className="mt-8 w-full">
                Create bracket
              </Button>
              <p className="mt-3 text-xs text-faint">2–32 players · byes are added automatically</p>
            </Panel>
          </div>
        </Reveal>
      )}

      {/* Bracket */}
      {rounds && (
        <Reveal>
          <div className="mx-auto mt-10 max-w-7xl">
            {/* Controls */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={undo} disabled={!history.length} variant="ghost" size="sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
                Undo
              </Button>
              <Button onClick={newBracket} variant="outline" size="sm">
                New bracket
              </Button>
              {champion && (
                <Button onClick={() => setShowWin(true)} variant="gold" size="sm">
                  🏆 {champion}
                </Button>
              )}
            </div>

            {/* Bracket grid */}
            <div className="overflow-x-auto pb-4">
              <div className="relative min-h-[480px] px-2">
                <div className="relative mx-auto flex min-h-[480px] w-max translate-x-12 items-stretch gap-10">
                  {/* Slot label column — hidden when more than 8 players */}
                  {slots.length <= 8 && (
                    <div className="absolute bottom-0 right-full top-0 z-10 mr-6 flex flex-col" style={{ width: '190px' }}>
                      <div className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-faint">Slot</div>
                      <div className="flex flex-1 flex-col">
                        {rounds[0].map((_, i) => (
                          <div key={i} className="flex flex-1 items-center">
                            <input
                              value={slots[i] ?? ''}
                              onChange={(e) => editSlot(i, e.target.value)}
                              placeholder={`Slot ${i + 1}`}
                              className="field !h-11 text-center text-sm font-semibold"
                              style={{ fontSize: autoFontSize(slots[i] ?? '', 20) }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rounds.map((round, r) => (
                    <div key={r} className="bk-round">
                      <div
                        className={`mb-3 text-center text-[10px] font-bold uppercase tracking-[0.3em] ${
                          r === finalIdx ? 'text-gold' : 'text-accent-bright'
                        }`}
                      >
                        {roundLabel(r, finalIdx)}
                      </div>
                      <div className="flex flex-1 flex-col">
                        {round.map((slot, i) => {
                          const isChampionBox = r === finalIdx
                          const canAdvance = r < finalIdx && !!slot
                          const isBye = slot === null
                          return (
                            <div key={i} className="bk-match">
                              {r > 0 && <span className="bk-in" />}
                              <div
                                className="relative flex min-h-[44px] w-full items-center rounded-lg border"
                                style={{
                                  background: isChampionBox
                                    ? 'linear-gradient(135deg, rgba(255,200,61,0.16), rgba(255,200,61,0.04))'
                                    : '#080A20',
                                  borderColor: isChampionBox
                                    ? 'rgba(255,200,61,0.6)'
                                    : isBye
                                      ? 'rgba(255,255,255,0.05)'
                                      : 'rgba(255,255,255,0.12)',
                                  boxShadow: isChampionBox && slot ? '0 0 18px rgba(255,200,61,0.35)' : 'none',
                                }}
                              >
                                {r === 0 ? (
                                  isBye ? (
                                    <span className="px-3 py-2 text-sm italic text-faint">BYE</span>
                                  ) : (
                                    <input
                                      value={slot ?? ''}
                                      onChange={(e) => editName(i, e.target.value)}
                                      placeholder={`Bucker ${i + 1}`}
                                      className="w-full min-w-0 bg-transparent px-3 py-2 text-sm font-semibold text-white placeholder:text-faint focus:outline-none"
                                      style={{ fontSize: autoFontSize(slot ?? '', 16) }}
                                    />
                                  )
                                ) : (
                                  <span
                                    style={{ fontSize: autoFontSize(slot ?? '', 14) }}
                                    className={`flex-1 truncate px-3 py-2 text-sm font-bold ${
                                      slot ? (isChampionBox ? 'text-gold' : 'text-white') : 'text-white/20'
                                    }`}
                                  >
                                    {slot ?? '—'}
                                  </span>
                                )}

                                {canAdvance && (
                                  <button
                                    type="button"
                                    onClick={() => advance(r, i)}
                                    title="Advance winner"
                                    className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-accent-bright transition-colors hover:bg-accent/15"
                                  >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-faint">
              Tap the <span className="text-accent-bright">›</span> arrow next to a player to advance them to the next round.
            </p>
          </div>
        </Reveal>
      )}

      {/* Champion popup */}
      {showWin && champion && (
        <Modal onClose={() => setShowWin(false)} tone="gold" size="sm" innerClassName="p-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/finbuck-update.webp"
            alt="Champion"
            className="mx-auto mb-4 max-h-40 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.55)) drop-shadow(0 0 22px rgba(255,200,61,0.35))' }}
          />
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Bracket champion</p>
          <p className="font-display mt-2 break-words text-[3rem] leading-none text-white">{champion}</p>
          <p className="mt-4 leading-relaxed">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-faint">Won with the slot</span>
            <br />
            <span className="font-display break-words text-[1.8rem] leading-none text-gold">{championSlot}</span>
          </p>
          <Button onClick={() => setShowWin(false)} variant="gold" className="mt-7 w-full">
            Let&apos;s go 🎉
          </Button>
        </Modal>
      )}
    </div>
  )
}
