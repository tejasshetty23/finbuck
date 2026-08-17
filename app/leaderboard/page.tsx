import { Suspense } from 'react'
import fs from 'fs'
import path from 'path'
import LeaderboardRestTable from '../../components/LeaderboardRestTable'
import MonthSelector from '../../components/MonthSelector'

interface BotrixEntry {
  name: string
  watchtime: number
  points: number
  level: number
  followage?: { date: string }
}

interface DisplayEntry {
  name: string
  delta: number
}

interface MonthOption {
  key: string
  label: string
  isCurrent: boolean
  hasData: boolean
}

function formatWatchtime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const d = Math.floor(minutes / 1440)
  const h = Math.floor((minutes % 1440) / 60)
  const m = minutes % 60
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  return parts.join(' ')
}

// Shrink the podium name font as the name gets longer so it fits the rectangle.
function podiumNameFont(name: string): string {
  const len = name.length
  if (len <= 9) return 'clamp(11px, 2.5vw, 21px)'
  if (len <= 12) return 'clamp(10px, 2.2vw, 18px)'
  if (len <= 16) return 'clamp(9px, 1.9vw, 15px)'
  if (len <= 20) return 'clamp(8px, 1.6vw, 13px)'
  return 'clamp(7px, 1.4vw, 11px)'
}

function getCurrentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function generateMonthList(): MonthOption[] {
  const months: MonthOption[] = []
  const start = new Date(2026, 5, 1) // June 2026
  const now = new Date()
  const currentKey = getCurrentMonthKey()
  const historyDir = path.join(process.cwd(), 'data', 'history')

  let d = new Date(now.getFullYear(), now.getMonth(), 1)
  while (d >= start) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const isCurrent = key === currentKey
    const hasData = isCurrent || (
      fs.existsSync(path.join(historyDir, `${key}.json`))
    )
    months.push({ key, label, isCurrent, hasData })
    d = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  }
  return months
}

interface PreviousWinners {
  label: string
  top3: DisplayEntry[]
}

// Find the most recent completed month (any history file that isn't the current
// month) and return its top 3 finishers.
function getPreviousWinners(): PreviousWinners | null {
  const historyDir = path.join(process.cwd(), 'data', 'history')
  if (!fs.existsSync(historyDir)) return null
  const currentKey = getCurrentMonthKey()

  const keys = fs
    .readdirSync(historyDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .filter((k) => k !== currentKey)
    .sort((a, b) => b.localeCompare(a))

  if (!keys.length) return null

  try {
    const raw = JSON.parse(fs.readFileSync(path.join(historyDir, `${keys[0]}.json`), 'utf8'))
    const entries = (raw.entries ?? []) as DisplayEntry[]
    if (!entries.length) return null
    return { label: raw.month ?? keys[0], top3: entries.slice(0, 3) }
  } catch {
    return null
  }
}

async function getLeaderboard(month?: string): Promise<DisplayEntry[]> {
  const currentKey = getCurrentMonthKey()
  const isCurrentMonth = !month || month === currentKey

  // Past month — load from history file
  if (!isCurrentMonth && month) {
    const filePath = path.join(process.cwd(), 'data', 'history', `${month}.json`)
    if (!fs.existsSync(filePath)) return []
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      return (raw.entries ?? []) as DisplayEntry[]
    } catch {
      return []
    }
  }

  // Current month — live Botrix API.
  // Botrix Premium is set to a monthly leaderboard interval, so `watchtime` is
  // already this month's total (resets automatically each month on Botrix's side).
  // We just mirror it directly — no baseline/delta math needed.
  try {
    const res = await fetch(
      'https://botrix.live/api/public/leaderboard?platform=kick&user=FinBuck',
      { next: { revalidate: 900 } }
    )
    if (!res.ok) return []
    const live: BotrixEntry[] = await res.json()

    return live
      .map((e) => ({ name: e.name, delta: e.watchtime }))
      .filter((e) => e.delta > 0)
      .sort((a, b) => b.delta - a.delta)
  } catch {
    return []
  }
}

function LeaderboardTable({ data }: { data: DisplayEntry[] }) {
  const top3 = [data[0] ?? null, data[1] ?? null, data[2] ?? null]
  const rest = data.slice(3)

  // Gold / silver / bronze frames of the same design. One shared aspect ratio
  // keeps all three identical in size; the badge sits at a slightly different
  // height in each artwork, so that one position is per-rank. Other overlay
  // positions are percentages of the frame box.
  const FRAME_AR = 0.685
  const POS = { center: { x: 50, y: 50 }, rect: { w: 66, h: 42 }, rewardPos: { x: 50, y: 81 } }
  const frameMeta: Record<number, {
    src: string; badge: { x: number; y: number }
    accent: string; glow: string; reward: string; crown: boolean; gradient: string
  }> = {
    1: { src: '/frame-2.png', badge: { x: 50.1, y: 11.6 }, accent: '#FFD700', glow: 'rgba(255,215,0,0.18)', reward: '$100', crown: true, gradient: 'linear-gradient(180deg, #fff3a0 0%, #ffd700 45%, #c8920a 100%)' },
    2: { src: '/frame-silver.png', badge: { x: 50.1, y: 10.7 }, accent: '#C8C8C8', glow: 'rgba(200,200,200,0.16)', reward: '$50', crown: false, gradient: 'linear-gradient(180deg, #ffffff 0%, #c8c8c8 45%, #7a7a7a 100%)' },
    3: { src: '/frame-bronze.png', badge: { x: 49.4, y: 10.8 }, accent: '#CD7F32', glow: 'rgba(205,127,50,0.16)', reward: '$25', crown: false, gradient: 'linear-gradient(180deg, #f0b070 0%, #cd7f32 45%, #7a4010 100%)' },
  }

  // Info panel border matches each rank's metal.
  const rectBorder: Record<number, string> = {
    1: 'linear-gradient(140deg, #fff1a8 0%, #e6b325 40%, #9c7414 65%, #ffe58a 100%)',
    2: 'linear-gradient(140deg, #ffffff 0%, #cfcfcf 40%, #6f6f6f 65%, #f2f2f2 100%)',
    3: 'linear-gradient(140deg, #f7cfa6 0%, #cd7f32 40%, #7a4010 65%, #f0b070 100%)',
  }
  const rectStyleFor = (r: number) => ({
    background: `linear-gradient(160deg, #14110c, #050505) padding-box, ${rectBorder[r]} border-box`,
    border: '3px solid transparent',
    boxShadow: `inset 0 0 18px rgba(0,0,0,0.6), 0 0 14px ${frameMeta[r].glow}`,
  })

  const podiumOrder = [top3[1], top3[0], top3[2]]
  const podiumRanks = [2, 1, 3]

  return (
    <div>
      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-2 sm:gap-5 mb-10 items-end px-0 sm:px-2">
        {podiumOrder.map((entry, i) => {
          const rank = podiumRanks[i]
          const m = frameMeta[rank]
          const isEmpty = !entry

          return (
            <div key={rank} className="flex flex-col items-center">
              {/* Frame image with overlaid content */}
              <div className="relative w-full" style={{ aspectRatio: `${FRAME_AR}` }}>
                {/* Crown overlay for 1st place */}
                {m.crown && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src="/crown.png"
                    alt=""
                    className="absolute left-1/2 -translate-x-1/2 select-none pointer-events-none"
                    style={{ top: '-13%', width: '43%', opacity: isEmpty ? 0.5 : 1 }}
                  />
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.src}
                  alt={`${rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'} place frame`}
                  className="absolute inset-0 w-full h-full select-none pointer-events-none"
                  style={{ opacity: isEmpty ? 0.5 : 1 }}
                />

                {/* Rectangle panel covering the gold circle */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl"
                  style={{ left: `${POS.center.x}%`, top: `${POS.center.y}%`, width: `${POS.rect.w}%`, height: `${POS.rect.h}%`, opacity: isEmpty ? 0.5 : 1, ...rectStyleFor(rank) }}
                />

                {/* Rank number in the top badge circle */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{ left: `${m.badge.x}%`, top: `${m.badge.y}%` }}
                >
                  <span className="font-black leading-none" style={{ color: m.accent, fontSize: 'clamp(13px, 3.4vw, 24px)', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>{rank}</span>
                </div>

                {/* Name + watch time inside the rectangle */}
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center flex flex-col items-center justify-center gap-0.5 sm:gap-1"
                  style={{ left: `${POS.center.x}%`, top: `${POS.center.y}%`, width: `${POS.rect.w - 10}%` }}
                >
                  {isEmpty ? (
                    <>
                      <div className="h-3 sm:h-4 w-3/4 rounded-full" style={{ background: `${m.accent}30` }} />
                      <div className="h-4 sm:h-6 w-1/2 rounded-full mt-1" style={{ background: `${m.accent}25` }} />
                    </>
                  ) : (
                    <>
                      <p className="font-black text-white leading-tight break-words [overflow-wrap:anywhere]" style={{ fontSize: podiumNameFont(entry!.name), textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{entry!.name}</p>
                      <p className="font-black leading-tight" style={{ color: '#00ff87', fontSize: 'clamp(11px, 2.5vw, 22px)', textShadow: '0 0 10px rgba(0,255,135,0.5), 0 1px 3px rgba(0,0,0,0.8)' }}>{formatWatchtime(entry!.delta)}</p>
                    </>
                  )}
                </div>

                {/* Reward in the frame's bottom band */}
                {!isEmpty && (
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5 whitespace-nowrap"
                    style={{ left: `${POS.rewardPos.x}%`, top: `${POS.rewardPos.y}%` }}
                  >
                    <span
                      className="font-black leading-none"
                      style={{
                        fontSize: 'clamp(16px, 3.2vw, 30px)',
                        background: m.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: `drop-shadow(0 0 10px ${m.glow})`,
                      }}
                    >{m.reward}</span>
                    <span className="uppercase tracking-wider font-bold leading-none" style={{ color: m.accent, opacity: 0.75, fontSize: 'clamp(9px, 1.7vw, 13px)' }}>reward</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Positions 4+ */}
      <LeaderboardRestTable entries={rest.map(e => ({ name: e.name, delta: e.delta }))} />
    </div>
  )
}

async function LeaderboardData({ month }: { month?: string }) {
  const data = await getLeaderboard(month)
  return <LeaderboardTable data={data} />
}

export default function LeaderboardPage({ searchParams }: { searchParams: Record<string, string> }) {
  const selectedMonth = searchParams?.month ?? ''
  const currentKey = getCurrentMonthKey()
  const allMonths = generateMonthList()

  const activeMonthObj = selectedMonth
    ? allMonths.find((m) => m.key === selectedMonth)
    : allMonths[0]

  const activeLabel = activeMonthObj?.label ?? allMonths[0]?.label ?? ''
  const isCurrentMonth = !selectedMonth || selectedMonth === currentKey
  const isPastMonthNoData = !isCurrentMonth && activeMonthObj && !activeMonthObj.hasData
  const previousWinners = getPreviousWinners()

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative">
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-4">
          Watchtime<br />
          <span className="animated-gradient-text">Leaderboard</span>
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
          Top viewers ranked by watch time this month.<br />
          {isCurrentMonth
            ? <span className="text-gray-600 text-sm">Updated live</span>
            : <span className="text-purple-400 text-sm">Viewing past results</span>
          }
        </p>

        {/* Month / Year dropdown */}
        <MonthSelector months={allMonths} selected={selectedMonth || currentKey} />
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto mt-20">
        {isPastMonthNoData ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-bold text-white">No data for {activeLabel}.</p>
            <p className="text-sm mt-2">Results are saved at the end of each month.</p>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-2 border-[#00ff87] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500">Loading leaderboard...</p>
              </div>
            }
          >
            <LeaderboardData month={selectedMonth || undefined} />
          </Suspense>
        )}
      </div>

      {/* Join stream */}
      <div className="max-w-4xl mx-auto mt-12">
        <a
          href="https://kick.com/finbuck"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-[#00ff87]/20 bg-[#00ff87]/5 hover:bg-[#00ff87]/10 transition-colors group"
        >
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kick-logo.png" alt="Kick" className="w-10 h-9 object-contain" />
            <div>
              <p className="text-white font-bold text-sm">Join the Stream</p>
              <p className="text-gray-500 text-xs">Watch FinBuck live on Kick</p>
            </div>
          </div>
          <span className="text-[#00ff87] text-sm font-bold uppercase tracking-widest group-hover:underline">
            Watch Live →
          </span>
        </a>
      </div>

      {/* Previous month's winners */}
      {previousWinners && (
        <div className="max-w-4xl mx-auto mt-12">
          <div className="text-center mb-6">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Previous Month&apos;s Winners
            </h3>
            <p className="text-purple-400 text-xs sm:text-sm uppercase tracking-widest mt-1">{previousWinners.label}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { rank: 1, accent: '#FFD700', glow: 'rgba(255,215,0,0.4)', medal: '🥇' },
              { rank: 2, accent: '#C8C8C8', glow: 'rgba(200,200,200,0.3)', medal: '🥈' },
              { rank: 3, accent: '#CD7F32', glow: 'rgba(205,127,50,0.35)', medal: '🥉' },
            ].map(({ rank, accent, glow, medal }) => {
              const winner = previousWinners.top3[rank - 1]
              return (
                <div
                  key={rank}
                  className="flex flex-col items-center text-center gap-2 rounded-2xl border p-4 sm:p-5"
                  style={{
                    borderColor: `${accent}55`,
                    background: '#000000',
                    boxShadow: `0 0 18px ${glow}`,
                  }}
                >
                  <span className="text-2xl sm:text-3xl leading-none">{medal}</span>
                  {winner ? (
                    <>
                      <p className="font-black text-white text-xs sm:text-base leading-tight break-words">{winner.name}</p>
                      <p className="font-black text-sm sm:text-lg" style={{ color: '#00ff87' }}>{formatWatchtime(winner.delta)}</p>
                    </>
                  ) : (
                    <p className="text-gray-600 text-xs">—</p>
                  )}
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-bold" style={{ color: accent }}>
                    {rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
