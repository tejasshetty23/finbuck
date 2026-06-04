import { Suspense } from 'react'
import baselineData from '@/data/baseline.json'
import LeaderboardRestTable from '@/components/LeaderboardRestTable'


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

function getRankStyle(rank: number) {
  if (rank === 1) return { border: 'border-yellow-400/50', bg: 'from-yellow-500/10 to-transparent', text: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]' }
  if (rank === 2) return { border: 'border-gray-300/40', bg: 'from-gray-300/10 to-transparent', text: 'text-gray-300', glow: '' }
  if (rank === 3) return { border: 'border-orange-400/40', bg: 'from-orange-400/10 to-transparent', text: 'text-orange-400', glow: '' }
  return { border: 'border-purple-900/30', bg: 'from-transparent to-transparent', text: 'text-gray-500', glow: '' }
}

function getRankEmoji(rank: number) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return null
}

async function getLeaderboard(preview = false): Promise<(BotrixEntry & { delta: number })[]> {
  try {
    const res = await fetch(
      'https://botrix.live/api/public/leaderboard?platform=kick&user=FinBuck',
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const live: BotrixEntry[] = await res.json()

    if (preview) {
      return live.map((entry) => ({ ...entry, delta: entry.watchtime }))
    }

    const baselineMap = new Map<string, number>(
      (baselineData.viewers as BaselineEntry[]).map((v) => [v.name.toLowerCase(), v.watchtime])
    )

    return live
      .map((entry) => ({
        ...entry,
        delta: Math.max(0, entry.watchtime - (baselineMap.get(entry.name.toLowerCase()) ?? 0)),
      }))
      .filter((e) => e.delta > 0)
      .sort((a, b) => b.delta - a.delta)
  } catch {
    return []
  }
}

function LeaderboardTable({ data }: { data: (BotrixEntry & { delta: number })[] }) {
  if (!data.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-lg font-bold text-white">No watch time recorded yet this month.</p>
        <p className="text-sm mt-2">The leaderboard will populate as viewers watch the stream.</p>
      </div>
    )
  }

  const top3 = data.slice(0, 3)
  const rest = data.slice(3)

  const frameConfig: Record<number, { border: string; bg: string; accent: string; shieldBg: string; shieldText: string; glow: string }> = {
    1: {
      border: 'linear-gradient(180deg, #fff3a0 0%, #f0c000 30%, #c8920a 60%, #f0c000 100%)',
      bg: 'linear-gradient(160deg, #1c1500 0%, #0d0a00 60%, #000000 100%)',
      accent: '#FFD700',
      shieldBg: 'linear-gradient(180deg, #fff3a0, #c8920a)',
      shieldText: '#3d2a00',
      glow: 'rgba(255,215,0,0.5)',
    },
    2: {
      border: 'linear-gradient(180deg, #ffffff 0%, #c8c8c8 30%, #707070 60%, #c8c8c8 100%)',
      bg: 'linear-gradient(160deg, #141414 0%, #0a0a0a 60%, #000000 100%)',
      accent: '#C8C8C8',
      shieldBg: 'linear-gradient(180deg, #ffffff, #707070)',
      shieldText: '#222222',
      glow: 'rgba(200,200,200,0.35)',
    },
    3: {
      border: 'linear-gradient(180deg, #f0b070 0%, #c07830 30%, #7a4010 60%, #c07830 100%)',
      bg: 'linear-gradient(160deg, #180c00 0%, #0e0700 60%, #000000 100%)',
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
      <div className="grid grid-cols-3 gap-4 mb-10 items-end px-2">
        {podiumOrder.map((entry, i) => {
          const rank = podiumRanks[i]
          if (!entry) return <div key={i} />
          const cfg = frameConfig[rank]
          const isFirst = rank === 1
          const cardH = isFirst ? 280 : 230

          return (
            <div key={entry.name} className={`relative flex flex-col items-center ${rank === 1 ? 'podium-gold' : rank === 2 ? 'podium-silver' : 'podium-bronze'}`} style={{ marginTop: isFirst ? 0 : '30px' }}>

              {/* Shield badge */}
              <div className="relative z-20 flex flex-col items-center" style={{ marginBottom: '-2px' }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '52px',
                    height: '58px',
                    clipPath: 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 68%, 50% 100%, 0% 68%, 0% 12%)',
                    background: cfg.shieldBg,
                    boxShadow: `0 0 20px ${cfg.glow}`,
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: '40px',
                      height: '46px',
                      clipPath: 'polygon(12% 0%, 88% 0%, 100% 12%, 100% 68%, 50% 100%, 0% 68%, 0% 12%)',
                      background: '#111',
                    }}
                  >
                    <span className="font-black text-xl" style={{ color: cfg.accent }}>{rank}</span>
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
                  height: `${cardH}px`,
                  boxShadow: `0 0 40px ${cfg.glow}, 0 0 80px ${cfg.glow.replace('0.', '0.0')}`,
                  filter: `drop-shadow(0 0 12px ${cfg.glow})`,
                }}
              >
                {/* Frame: inner dark bg */}
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-4 px-3 pb-6"
                  style={{
                    background: cfg.bg,
                    clipPath: 'polygon(15px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 19px), calc(100% - 11px) 100%, 11px 100%, 0% calc(100% - 19px), 0% 15px)',
                  }}
                >
                  {/* Corner marks */}
                  <div className="absolute top-5 left-5 w-4 h-4 border-t-2 border-l-2 rounded-tl" style={{ borderColor: cfg.accent }} />
                  <div className="absolute top-5 right-5 w-4 h-4 border-t-2 border-r-2 rounded-tr" style={{ borderColor: cfg.accent }} />
                  <div className="absolute bottom-8 left-5 w-4 h-4 border-b-2 border-l-2 rounded-bl" style={{ borderColor: cfg.accent }} />
                  <div className="absolute bottom-8 right-5 w-4 h-4 border-b-2 border-r-2 rounded-br" style={{ borderColor: cfg.accent }} />

                  {/* Content */}
                  <div className="text-center">
                    <p className="font-black text-white text-xl leading-tight break-all">{entry.name}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs uppercase tracking-widest" style={{ color: cfg.accent }}>watch time</span>
                    <span className="font-black text-2xl" style={{ color: '#00ff87', textShadow: '0 0 10px rgba(0,255,135,0.5)' }}>
                      {formatWatchtime(entry.delta)}
                    </span>
                  </div>
                  <div className="text-xs font-bold" style={{ color: cfg.accent, opacity: 0.8 }}>
                    {entry.points.toLocaleString()} pts
                  </div>
                </div>
              </div>

              {/* Bottom downward arrow */}
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

      {/* Rest of the table */}
      {rest.length > 0 && (
        <LeaderboardRestTable entries={rest.map(e => ({ name: e.name, delta: e.delta, points: e.points }))} />
      )}
    </div>
  )
}

async function LeaderboardData({ preview }: { preview: boolean }) {
  const data = await getLeaderboard(preview)
  return <LeaderboardTable data={data} />
}


export default function LeaderboardPage({ searchParams }: { searchParams: Record<string, string> }) {
  const preview = searchParams?.preview === 'true'
  const now = new Date()
  const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 relative">
      <div className="fixed inset-0 -z-10">
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-purple-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">{monthName}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-4">
          Watch Time<br />
          <span className="animated-gradient-text">Leaderboard</span>
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          Top viewers ranked by total watch time this month.<br />
          <span className="text-gray-600 text-sm">Updated daily</span>
        </p>
      </div>

      {/* Table */}
      <div className="max-w-4xl mx-auto">
        <Suspense
          fallback={
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-2 border-[#00ff87] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Loading leaderboard...</p>
            </div>
          }
        >
          <LeaderboardData preview={preview} />
        </Suspense>
      </div>

      {/* Sponsor nudge */}
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
