'use client'

import { useState } from 'react'

interface Entry {
  name: string
  delta: number
  points: number
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

  const visible = showAll ? entries : entries.slice(0, 7) // positions 4–10

  return (
    <div>
      <div className="rounded-2xl border border-purple-900/30 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0d0a1a] border-b border-purple-900/30">
              <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-6 py-4 w-16">Rank</th>
              <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-4">Name</th>
              <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest px-4 py-4">Watch Time</th>
              <th className="text-right text-xs font-bold text-gray-500 uppercase tracking-widest px-6 py-4">Points</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((entry, i) => (
              <tr key={entry.name} className="border-b border-purple-900/20 hover:bg-purple-900/10 transition-colors">
                <td className="px-6 py-4 text-gray-500 font-bold text-sm">#{i + 4}</td>
                <td className="px-4 py-4 text-white font-semibold text-sm">{entry.name}</td>
                <td className="px-4 py-4 text-[#00ff87] font-bold text-sm text-right">{formatWatchtime(entry.delta)}</td>
                <td className="px-6 py-4 text-purple-400 text-sm text-right">{entry.points.toLocaleString()}</td>
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
