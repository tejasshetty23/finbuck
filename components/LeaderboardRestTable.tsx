'use client'

import { useState } from 'react'

interface Entry {
  name: string
  delta: number
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

export default function LeaderboardRestTable({ entries }: { entries: Entry[] }) {
  const [showAll, setShowAll] = useState(false)

  const base = showAll ? entries : entries.slice(0, 7)
  // Always show 7 rows minimum — pad with nulls as placeholders
  const rows: (Entry | null)[] = [...base]
  while (rows.length < 7) rows.push(null)

  return (
    <div>
      <div className="rounded-2xl border border-purple-900/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0d0a1a] border-b border-purple-900/30">
              <th className="text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider sm:tracking-widest px-3 sm:px-6 py-3 sm:py-4 w-10 sm:w-16">Rank</th>
              <th className="text-left text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider sm:tracking-widest px-2 sm:px-4 py-3 sm:py-4">Name</th>
              <th className="text-right text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider sm:tracking-widest px-2 sm:px-4 py-3 sm:py-4">Watch Time</th>
              <th className="text-right text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider sm:tracking-widest px-3 sm:px-6 py-3 sm:py-4">Reward</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry, i) => (
              <tr key={entry ? entry.name : `placeholder-${i}`} className="border-b border-purple-900/20 transition-all duration-200 hover:bg-[#00ff87]/5 hover:shadow-[inset_3px_0_0_#00ff87]">
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-500 font-bold text-xs sm:text-sm">#{i + 4}</td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm" style={{ opacity: entry ? 1 : 0.35 }}>
                  {entry
                    ? <span className="text-white font-semibold break-words">{entry.name}</span>
                    : <span className="inline-block h-3.5 w-20 sm:w-28 rounded-full bg-purple-900/40" />
                  }
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-right text-xs sm:text-sm whitespace-nowrap" style={{ opacity: entry ? 1 : 0.35 }}>
                  {entry
                    ? <span className="text-[#00ff87] font-bold">{formatWatchtime(entry.delta)}</span>
                    : <span className="inline-block h-3.5 w-12 rounded-full bg-purple-900/40" />
                  }
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                  {i < 7 && <span className="text-[#00ff87] font-black text-xs sm:text-sm">$10</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length > 7 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 border border-purple-500/40 hover:border-purple-400 text-purple-300 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm uppercase tracking-widest transition-all hover:bg-purple-500/10"
          >
            {showAll ? 'Show Less' : `Show More (${entries.length - 7} more)`}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
