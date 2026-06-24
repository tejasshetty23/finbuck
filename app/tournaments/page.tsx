'use client'

import { useState } from 'react'

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

export default function TournamentsPage() {
  const [count, setCount] = useState(8)
  const [rounds, setRounds] = useState<Rounds | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [history, setHistory] = useState<Rounds[]>([])
  const [champion, setChampion] = useState<string | null>(null)
  const [showWin, setShowWin] = useState(false)

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

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-purple-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
          </svg>
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Bracket</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-4">
          <span className="animated-gradient-text">Tournaments</span>
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          Build a single-elimination bracket and crown a champion.
        </p>
      </div>

      {/* Setup screen */}
      {!rounds && (
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border border-purple-900/40 bg-[#0d0a1a]/70 backdrop-blur-sm p-8">
            <label className="block text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Number of Entrants
            </label>

            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={() => setCount((c) => Math.max(2, c - 1))}
                className="w-10 h-10 rounded-lg border border-purple-700/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition-colors text-xl font-bold"
              >
                −
              </button>
              <input
                type="number"
                min={2}
                max={32}
                value={count}
                onChange={(e) => setCount(Math.min(32, Number(e.target.value)))}
                className="w-24 text-center bg-[#07050f] border border-purple-700/50 rounded-lg px-3 py-2 text-2xl font-black text-white focus:outline-none focus:border-[#00ff87]"
              />
              <button
                onClick={() => setCount((c) => Math.min(32, c + 1))}
                className="w-10 h-10 rounded-lg border border-purple-700/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition-colors text-xl font-bold"
              >
                +
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-8">
              {[4, 8, 16, 32].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${
                    count === n
                      ? 'border-[#00ff87] text-[#00ff87] bg-[#00ff87]/10'
                      : 'border-purple-900/40 text-gray-400 hover:border-purple-500'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={createBracket}
              className="w-full text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)] hover:shadow-[0_0_40px_rgba(0,255,135,0.5)]"
              style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
            >
              Create Bracket
            </button>
            <p className="text-gray-600 text-xs text-center mt-3">
              2–32 players · byes are added automatically
            </p>
          </div>
        </div>
      )}

      {/* Bracket */}
      {rounds && (
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
            <button
              onClick={undo}
              disabled={!history.length}
              className="inline-flex items-center gap-2 border border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-500/10 font-semibold px-5 py-2.5 rounded-xl text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Undo
            </button>
            <button
              onClick={newBracket}
              className="inline-flex items-center gap-2 border border-[#00ff87]/30 text-[#00ff87] hover:bg-[#00ff87]/10 font-semibold px-5 py-2.5 rounded-xl text-sm uppercase tracking-widest transition-all"
            >
              New Bracket
            </button>
            {champion && (
              <button
                onClick={() => setShowWin(true)}
                className="inline-flex items-center gap-2 border border-yellow-400/40 text-yellow-300 hover:bg-yellow-400/10 font-semibold px-5 py-2.5 rounded-xl text-sm uppercase tracking-widest transition-all"
              >
                🏆 {champion}
              </button>
            )}
          </div>

          {/* Bracket grid */}
          <div className="overflow-x-auto pb-4">
            <div className="relative min-h-[480px] px-2">
              {/* Bracket rounds — centered as the core */}
              <div className="relative flex gap-10 items-stretch min-h-[480px] w-max mx-auto translate-x-12">
              {/* Slot label column — hidden when more than 8 players */}
              {slots.length <= 8 && (
                <div className="absolute right-full top-0 bottom-0 mr-6 flex flex-col z-10" style={{ width: '190px' }}>
                  <div className="text-center text-[10px] font-bold uppercase tracking-widest mb-3 text-purple-400">Slot</div>
                  <div className="flex flex-col flex-1">
                    {rounds[0].map((_, i) => (
                      <div key={i} className="flex-1 flex items-center">
                        <input
                          value={slots[i] ?? ''}
                          onChange={(e) => editSlot(i, e.target.value)}
                          placeholder={`Slot ${i + 1}`}
                          className="w-full rounded-lg border border-purple-900/30 bg-black px-2 py-2 text-center text-sm font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/60"
                          style={{ minHeight: '44px', fontSize: autoFontSize(slots[i] ?? '', 20) }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rounds.map((round, r) => (
                <div key={r} className="bk-round">
                  <div className="text-center text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: r === finalIdx ? '#FFD700' : '#a855f7' }}>
                    {roundLabel(r, finalIdx)}
                  </div>
                  <div className="flex flex-col flex-1">
                    {round.map((slot, i) => {
                      const isChampionBox = r === finalIdx
                      const canAdvance = r < finalIdx && !!slot
                      const isBye = slot === null
                      return (
                        <div key={i} className="bk-match">
                          {r > 0 && <span className="bk-in" />}
                          <div
                            className="relative w-full rounded-lg border flex items-center"
                            style={{
                              background: isChampionBox ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.04))' : '#000000',
                              borderColor: isChampionBox ? 'rgba(255,215,0,0.6)' : isBye ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.4)',
                              boxShadow: isChampionBox && slot ? '0 0 18px rgba(255,215,0,0.35)' : 'none',
                              minHeight: '44px',
                            }}
                          >
                            {r === 0 ? (
                              isBye ? (
                                <span className="px-3 py-2 text-sm text-gray-600 italic">BYE</span>
                              ) : (
                                <input
                                  value={slot ?? ''}
                                  onChange={(e) => editName(i, e.target.value)}
                                  placeholder={`Bucker ${i + 1}`}
                                  className="w-full min-w-0 bg-transparent px-3 py-2 text-sm text-white font-semibold placeholder-gray-600 focus:outline-none"
                                  style={{ fontSize: autoFontSize(slot ?? '', 16) }}
                                />
                              )
                            ) : (
                              <span
                                style={{ fontSize: autoFontSize(slot ?? '', 14) }}
                                className={`flex-1 px-3 py-2 text-sm font-bold truncate ${
                                  slot ? (isChampionBox ? 'text-yellow-300' : 'text-white') : 'text-gray-700'
                                }`}
                              >
                                {slot ?? '—'}
                              </span>
                            )}

                            {canAdvance && (
                              <button
                                onClick={() => advance(r, i)}
                                title="Advance winner"
                                className="shrink-0 mr-1 w-7 h-7 flex items-center justify-center rounded-md text-[#00ff87] hover:bg-[#00ff87]/15 transition-colors"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
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

          <p className="text-center text-gray-600 text-xs mt-4">
            Tap the <span className="text-[#00ff87]">›</span> arrow next to a player to advance them to the next round.
          </p>
        </div>
      )}

      {/* Champion popup */}
      {showWin && champion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm" onClick={() => setShowWin(false)}>
          <div
            className="relative max-w-sm w-full rounded-3xl border p-8 text-center"
            style={{
              background: 'linear-gradient(160deg, #1c1500 0%, #0a0700 60%, #000000 100%)',
              borderColor: 'rgba(255,215,0,0.6)',
              boxShadow: '0 0 60px rgba(255,215,0,0.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#FFD700' }}>
              Champion
            </p>
            <p className="text-3xl font-black text-white mb-6 break-words">{champion}</p>
            <button
              onClick={() => setShowWin(false)}
              className="w-full text-black font-black py-3 rounded-xl uppercase tracking-widest text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #fff3a0, #ffd700, #c8920a)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
