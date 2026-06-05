import { Suspense } from 'react'
import fs from 'fs'
import path from 'path'
import baselineData from '@/data/baseline.json'
import LeaderboardRestTable from '@/components/LeaderboardRestTable'
import MonthSelector from '@/components/MonthSelector'

interface BotrixEntry {
  name: string
  watchtime: number
  points: number
  level: number
  followage?: { date: string }
}

interface BaselineEntry {
  name: string
  watchtime: number
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

async function getLeaderboard(preview = false, month?: string): Promise<DisplayEntry[]> {
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

  // Current month — live Botrix API
  try {
    const res = await fetch(
      'https://botrix.live/api/public/leaderboard?platform=kick&user=FinBuck',
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const live: BotrixEntry[] = await res.json()

    if (preview) {
      return live.map((e) => ({ name: e.name, delta: e.watchtime }))
    }

    const baselineMap = new Map<string, number>(
      (baselineData.viewers as BaselineEntry[]).map((v) => [v.name.toLowerCase(), v.watchtime])
    )

    return live
      .map((e) => ({
        name: e.name,
        delta: Math.max(0, e.watchtime - (baselineMap.get(e.name.toLowerCase()) ?? 0)),
      }))
      .filter((e) => e.delta > 0)
      .sort((a, b) => b.delta - a.delta)
  } catch {
    return []
  }
}

function LeaderboardTable({ data }: { data: DisplayEntry[] }) {
  const top3 = [data[0] ?? null, data[1] ?? null, data[2] ?? null]
  const rest = data.slice(3)

  const frameConfig: Record<number, {
    border: string; bg: string; accent: string
    shieldBg: string; shieldText: string; glow: string
  }> = {
    1: {
      border: '#FFD700',
      bg: '#000000',
      accent: '#FFD700',
      shieldBg: 'linear-gradient(180deg, #fff3a0, #c8920a)',
      shieldText: '#3d2a00',
      glow: 'rgba(255,215,0,0.5)',
    },
    2: {
      border: '#C0C0C0',
      bg: '#000000',
      accent: '#C8C8C8',
      shieldBg: 'linear-gradient(180deg, #ffffff, #707070)',
      shieldText: '#222222',
      glow: 'rgba(200,200,200,0.35)',
    },
    3: {
      border: '#CD7F32',
      bg: '#000000',
      accent: '#CD7F32',
      shieldBg: 'linear-gradient(180deg, #f0b070, #7a4010)',
      shieldText: '#3d1800',
      glow: 'rgba(205,127,50,0.4)',
    },
  }

  const podiumOrder = [top3[1], top3[0], top3[2]]
  const podiumRanks = [2, 1, 3]

  return (
    <div>
      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-10 items-end px-0 sm:px-2">
        {podiumOrder.map((entry, i) => {
          const rank = podiumRanks[i]
          const cfg = frameConfig[rank]
          const isFirst = rank === 1
          const cardH = isFirst ? 'clamp(230px, 58vw, 340px)' : 'clamp(210px, 53vw, 315px)'
          const isEmpty = !entry

          return (
            <div
              key={isEmpty ? `empty-${rank}` : entry!.name}
              className={`relative flex flex-col items-center ${rank === 1 ? 'podium-gold' : rank === 2 ? 'podium-silver' : 'podium-bronze'}`}
              style={{ marginTop: isFirst ? 0 : 'clamp(16px, 5vw, 30px)' }}
            >
              {/* Shield badge */}
              <div className="relative z-20 flex flex-col items-center" style={{ marginBottom: '-2px' }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 'clamp(38px, 11vw, 52px)', height: 'clamp(42px, 12vw, 58px)',
                    clipPath: 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 68%, 50% 100%, 0% 68%, 0% 12%)',
                    background: cfg.shieldBg,
                    boxShadow: `0 0 20px ${cfg.glow}`,
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 'clamp(29px, 8.5vw, 40px)', height: 'clamp(33px, 9.7vw, 46px)',
                      clipPath: 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 68%, 50% 100%, 0% 68%, 0% 12%)',
                      background: '#111',
                    }}
                  >
                    <span className="font-black text-base sm:text-xl" style={{ color: cfg.accent }}>{rank}</span>
                  </div>
                </div>
              </div>

              {/* Frame: outer border */}
              <div
                className="relative w-full"
                style={{
                  background: cfg.border,
                  clipPath: 'polygon(18px 0%, calc(100% - 18px) 0%, 100% 18px, 100% calc(100% - 22px), calc(100% - 14px) 100%, 14px 100%, 0% calc(100% - 22px), 0% 18px)',
                  padding: '6px',
                  height: cardH,
                }}
              >
                {/* Frame: inner black bg — absolutely positioned to reliably cover the border gradient */}
                <div
                  className="flex flex-col items-center justify-evenly px-1.5 sm:px-3 py-5 sm:py-8"
                  style={{
                    position: 'absolute',
                    top: '6px', left: '6px', right: '6px', bottom: '6px',
                    background: cfg.bg,
                    clipPath: 'polygon(15px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 19px), calc(100% - 11px) 100%, 11px 100%, 0% calc(100% - 19px), 0% 15px)',
                    ...(isEmpty ? { opacity: 0.45 } : {}),
                  }}
                >
                  {/* Corner marks */}
                  <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2" style={{ borderColor: cfg.accent }} />
                  <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2" style={{ borderColor: cfg.accent }} />
                  <div className="absolute bottom-5 left-2.5 sm:bottom-7 sm:left-4 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2" style={{ borderColor: cfg.accent }} />
                  <div className="absolute bottom-5 right-2.5 sm:bottom-7 sm:right-4 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2" style={{ borderColor: cfg.accent }} />

                  {/* Name */}
                  <div className="text-center w-full">
                    {isEmpty
                      ? <div className="h-4 sm:h-5 w-16 sm:w-24 rounded-full mx-auto" style={{ background: `${cfg.accent}30` }} />
                      : <p className="font-black text-white text-sm sm:text-xl leading-tight break-words">{entry!.name}</p>
                    }
                  </div>

                  {/* Watch time */}
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <span className="text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest" style={{ color: cfg.accent }}>watch time</span>
                    {isEmpty
                      ? <div className="h-6 sm:h-7 w-12 sm:w-16 rounded-full mt-1" style={{ background: `${cfg.accent}25` }} />
                      : <span className="font-black text-base sm:text-2xl text-center leading-tight" style={{ color: '#00ff87', textShadow: '0 0 10px rgba(0,255,135,0.5)' }}>{formatWatchtime(entry!.delta)}</span>
                    }
                  </div>

                  {/* Reward */}
                  <div
                    className="flex flex-col items-center gap-0.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl"
                    style={{ background: cfg.glow.replace('0.5', '0.15').replace('0.35', '0.15').replace('0.4', '0.15'), border: `1px solid ${cfg.accent}` }}
                  >
                    <span className="text-lg sm:text-2xl font-black" style={{ color: cfg.accent }}>
                      {rank === 1 ? '$100' : rank === 2 ? '$50' : '$25'}
                    </span>
                    <span className="text-[8px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest" style={{ color: cfg.accent, opacity: 0.7 }}>reward</span>
                  </div>
                </div>
              </div>

              {/* Bottom arrow */}
              <div style={{
                width: 0, height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: `10px solid ${cfg.accent}`,
                marginTop: '-1px',
                opacity: 0.9,
              }} />
            </div>
          )
        })}
      </div>

      {/* Positions 4+ */}
      <LeaderboardRestTable entries={rest.map(e => ({ name: e.name, delta: e.delta }))} />
    </div>
  )
}

async function LeaderboardData({ preview, month }: { preview: boolean; month?: string }) {
  const data = await getLeaderboard(preview, month)
  return <LeaderboardTable data={data} />
}

export default function LeaderboardPage({ searchParams }: { searchParams: Record<string, string> }) {
  const preview = searchParams?.preview === 'true'
  const selectedMonth = searchParams?.month ?? ''
  const currentKey = getCurrentMonthKey()
  const allMonths = generateMonthList()

  const activeMonthObj = selectedMonth
    ? allMonths.find((m) => m.key === selectedMonth)
    : allMonths[0]

  const activeLabel = activeMonthObj?.label ?? allMonths[0]?.label ?? ''
  const isCurrentMonth = !selectedMonth || selectedMonth === currentKey
  const isPastMonthNoData = !isCurrentMonth && activeMonthObj && !activeMonthObj.hasData

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative">
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-purple-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">{activeLabel}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-4">
          Watch Time<br />
          <span className="animated-gradient-text">Leaderboard</span>
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
          Top viewers ranked by total watch time.<br />
          {isCurrentMonth
            ? <span className="text-gray-600 text-sm">Updated daily</span>
            : <span className="text-purple-400 text-sm">Viewing past results</span>
          }
        </p>

        {/* Month / Year dropdown */}
        <MonthSelector months={allMonths} selected={selectedMonth || currentKey} />
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto">
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
            <LeaderboardData preview={preview} month={selectedMonth || undefined} />
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
    </div>
  )
}
