'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * A two-position switch between Stake.com and Stake.us, with a sliding
 * thumb, and the content for whichever is selected below it.
 *
 * Both sets of content are rendered on the server and handed in as props;
 * this only chooses which to show. The choice lives in the URL as ?site=us,
 * so a link straight to the Stake.us rewards can be shared.
 */

type Site = 'com' | 'us'

export default function PlatformSwitch({ com, us }: { com: ReactNode; us: ReactNode }) {
  const [site, setSite] = useState<Site>('com')

  // Read ?site= once on mount. Done after hydration, not during render, so
  // the server and the first client render agree.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('site') === 'us') setSite('us')
  }, [])

  function choose(next: Site) {
    setSite(next)
    const url = new URL(window.location.href)
    if (next === 'us') url.searchParams.set('site', 'us')
    else url.searchParams.delete('site')
    window.history.replaceState(null, '', url)
  }

  const options: { id: Site; label: string; dot: string }[] = [
    { id: 'com', label: 'Stake.com', dot: '#00FF87' },
    { id: 'us', label: 'Stake.us', dot: '#FFC83D' },
  ]

  return (
    <>
      <div className="mt-8 flex justify-center">
        <div
          role="radiogroup"
          aria-label="Which Stake"
          className="relative grid grid-cols-2 rounded-full bg-[#080A20] p-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10),0_14px_34px_rgba(0,0,0,0.35)]"
        >
          {/* The sliding thumb */}
          <span
            aria-hidden
            className="absolute bottom-1.5 top-1.5 w-[calc(50%-6px)] rounded-full transition-[left,background-color,box-shadow] duration-300 ease-out"
            style={{
              left: site === 'com' ? 6 : 'calc(50%)',
              background: site === 'com' ? '#00FF87' : '#FFC83D',
              boxShadow: site === 'com' ? '0 0 22px rgba(0,255,135,0.45)' : '0 0 22px rgba(255,200,61,0.45)',
            }}
          />
          {options.map((o) => {
            const on = site === o.id
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => choose(o.id)}
                className={`relative z-10 flex min-w-[150px] items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-bold transition-colors duration-300 sm:min-w-[180px] ${
                  on ? 'text-[#0B0E2A]' : 'text-muted hover:text-white'
                }`}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full transition-colors"
                  style={{ background: on ? '#0B0E2A' : o.dot }}
                />
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      <div key={site}>{site === 'com' ? com : us}</div>
    </>
  )
}
