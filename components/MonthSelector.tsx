'use client'

import { useRouter } from 'next/navigation'

interface MonthOption {
  key: string
  label: string
  isCurrent: boolean
  hasData: boolean
}

interface Props {
  months: MonthOption[]
  selected: string
}

export default function MonthSelector({ months, selected }: Props) {
  const router = useRouter()

  // Group by year
  const byYear: Record<string, MonthOption[]> = {}
  for (const m of months) {
    const year = m.key.split('-')[0]
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(m)
  }
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="inline-flex items-center gap-3">
      <span className="text-gray-500 text-sm uppercase tracking-widest">View month:</span>
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => {
            const val = e.target.value
            const isCurrentKey = months.find((m) => m.isCurrent)?.key
            if (val === isCurrentKey) router.push('/leaderboard')
            else router.push(`/leaderboard?month=${val}`)
          }}
          className="appearance-none bg-purple-950/60 border border-purple-700/50 text-white text-sm font-semibold px-4 py-2 pr-9 rounded-xl cursor-pointer hover:border-purple-500 focus:outline-none focus:border-purple-400 transition-colors"
        >
          {years.map((year) => (
            <optgroup key={year} label={`── ${year} ──`} style={{ color: '#a855f7', background: '#0d0a1a' }}>
              {byYear[year].map((m) => (
                <option key={m.key} value={m.key} style={{ background: '#0d0a1a', color: '#fff' }}>
                  {m.isCurrent ? `${m.label} (Current)` : m.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
