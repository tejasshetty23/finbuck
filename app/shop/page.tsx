'use client'

import { useState } from 'react'
import Reveal from '../../components/Reveal'

interface ShopItem {
  name: string
  desc: string
  points: number
  /** Chat command a viewer pastes to redeem this item. */
  command: string
  /** Optional artwork in /public/shop — falls back to the icon tile. */
  img?: string
  icon: string
}

// Locale-independent thousands separators. toLocaleString() would format via
// the runtime's locale, which differs between server and browser (e.g. Indian
// "10,00,000" vs "1,000,000") and breaks hydration.
function formatPoints(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const ITEMS: ShopItem[] = [
  {
    name: '$20 Bonus Buy',
    desc: 'Redeem a $20 bonus buy of your choice',
    points: 5000,
    command: '!BonusBuy',
    img: '/shop/bonus-20.webp',
    icon: '💸',
  },
  {
    name: 'Spin the Wheel',
    desc: 'Guaranteed spin of the sub wheel',
    points: 15000,
    command: '!shop buy SpinWheel',
    img: '/shop/spin-wheel.webp',
    icon: '🎡',
  },
  {
    name: '$50 Bonus Buy',
    desc: 'Redeem a $50 bonus buy of your choice',
    points: 20000,
    command: '!SuperBonusBuy',
    img: '/shop/bonus-50.webp',
    icon: '💰',
  },
  {
    name: 'Naked Timmy Stream',
    desc: "Na3's wet dream",
    points: 1000000,
    command: '!TimmyStream',
    img: '/shop/naked-timmy.webp',
    icon: '👀',
  },
]

const EARN_METHODS = [
  {
    title: 'Watch Streams',
    desc: 'Earn points passively while watching',
    color: '#00ff87',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
  },
  {
    title: 'Chat Activity',
    desc: 'Be active in chat for bonus points',
    color: '#60a5fa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    title: 'Bets',
    desc: 'Win bets for big point boosts',
    color: '#fbbf24',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Subscribe',
    desc: 'Earn 2x points as a sub',
    color: '#a855f7',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
]

export default function ShopPage() {
  const [selected, setSelected] = useState<ShopItem | null>(null)
  const [copied, setCopied] = useState(false)

  function openItem(item: ShopItem) {
    setSelected(item)
    setCopied(false)
  }

  async function copyCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the command is on screen to copy manually */
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>

      {/* Header */}
      <Reveal>
      <div className="max-w-4xl mx-auto mt-6 mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-purple-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12A1.125 1.125 0 0119.75 21.75H4.25a1.125 1.125 0 01-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
          </svg>
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Points Shop</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
          The <span className="animated-gradient-text">Shop</span>
        </h1>
      </div>
      </Reveal>

      {/* How to check points */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="rounded-2xl border border-[#00ff87]/60 bg-[#00ff87]/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-[#00ff87] bg-[#00ff87]/10 border border-[#00ff87]/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm uppercase tracking-wide mb-1">Check your balance</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Type <span className="font-black text-[#00ff87] bg-[#07050f] border border-[#00ff87]/30 rounded px-1.5 py-0.5">!points</span> in chat to see how many points you have.
            </p>
          </div>
        </div>
      </div>

      {/* How to earn points */}
      <Reveal>
      <div className="max-w-6xl mx-auto mb-10">
        <div className="flex items-center justify-center gap-2 mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 text-[#00ff87]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <h2 className="text-white font-black uppercase tracking-widest text-sm">How to earn points</h2>
        </div>

        <div className="rounded-2xl border border-purple-500/60 bg-[#0d0a1a]/60 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EARN_METHODS.map((m) => (
              <div key={m.title} className="flex flex-col items-center text-center gap-2">
                <div className="shrink-0" style={{ color: m.color }}>{m.icon}</div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm mb-1">{m.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </Reveal>

      {/* Items */}
      <Reveal>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {ITEMS.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-purple-900/40 bg-[#0d0a1a]/60 p-5 flex flex-col items-center text-center transition-colors hover:border-purple-600/60"
          >
            {/* Artwork */}
            <div className="w-32 h-32 rounded-xl overflow-hidden border border-purple-800/40 bg-[#07050f] flex items-center justify-center mb-4 shrink-0">
              {item.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.img} alt={item.name} className="w-full h-full object-contain p-1.5" />
              ) : (
                <span className="text-5xl">{item.icon}</span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white mb-3 leading-tight">{item.name}</h3>

            <div className="w-full flex-1 rounded-xl border border-purple-900/40 bg-[#07050f]/60 px-4 py-3 mb-4 flex items-center justify-center">
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>

            <p className="font-black text-lg mb-4" style={{ color: '#00ff87' }}>
              {formatPoints(item.points)} points
            </p>

            <button
              onClick={() => openItem(item)}
              className="w-full text-black font-black py-3 rounded-xl uppercase tracking-widest text-sm transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
            >
              Buy
            </button>
          </div>
        ))}
      </div>
      </Reveal>

      {/* Buy popup */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-md w-full rounded-2xl border border-purple-800/50 bg-[#161320] overflow-hidden"
            style={{ boxShadow: '0 24px 70px rgba(0,0,0,0.75)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40">
              <h4 className="text-white font-black text-xl">Buy item</h4>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Artwork + description */}
              <div className="flex items-center gap-5 mb-6">
                <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-purple-800/40 bg-[#07050f] flex items-center justify-center">
                  {selected.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.img} alt={selected.name} className="w-full h-full object-contain p-1.5" />
                  ) : (
                    <span className="text-4xl">{selected.icon}</span>
                  )}
                </div>
                <p className="text-gray-300 text-base leading-relaxed text-center flex-1">{selected.desc}</p>
              </div>

              <p className="text-gray-300 text-base leading-relaxed mb-5">
                To buy this item, just <span className="font-black text-white">paste this command</span> in the streamer&apos;s{' '}
                <span className="font-black text-white">chat</span>.
              </p>

              <button
                onClick={() => copyCommand(selected.command)}
                title="Click to copy"
                className="w-full text-black font-black py-3.5 rounded-xl text-lg transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)' }}
              >
                {copied ? 'Copied!' : selected.command}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
