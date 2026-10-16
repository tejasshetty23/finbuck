'use client'

import { useState } from 'react'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
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
    points: 7500,
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
    title: 'Watch streams',
    desc: 'Earn points passively while watching',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
  },
  {
    title: 'Chat activity',
    desc: 'Be active in chat for bonus points',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    title: 'Bets',
    desc: 'Win bets for big point boosts',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Subscribe',
    desc: 'Earn 2× points as a sub',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
]

const smallCut = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'

function Artwork({ item, className }: { item: ShopItem; className: string }) {
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden bg-[#0B0E2A] ${className}`} style={{ clipPath: smallCut }}>
      {item.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.img} alt={item.name} className="h-full w-full object-contain p-2" />
      ) : (
        <span className="text-5xl">{item.icon}</span>
      )}
    </div>
  )
}

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
    <div className="px-6 pb-24 pt-[72px]">
      <PageHeader eyebrow="Points shop" title={<>The <span className="text-accent-bright">shop</span></>}>
        Spend the points you earn on stream. Type a command in chat and a mod sorts the rest.
      </PageHeader>

      {/* How to check your balance */}
      <Reveal>
        <div className="mx-auto mt-12 max-w-2xl">
          <Panel tone="accent" innerClassName="flex items-center gap-5 p-5 sm:p-6">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#0B0E2A] text-accent-bright" style={{ clipPath: smallCut }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="font-display text-[1.5rem] leading-none text-white">Check your balance</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Type{' '}
                <code className="rounded bg-[#0B0E2A] px-1.5 py-0.5 font-sans text-[13px] font-bold text-accent-bright">!points</code>{' '}
                in chat to see how many points you have.
              </p>
            </div>
          </Panel>
        </div>
      </Reveal>

      {/* How to earn */}
      <Reveal>
        <div className="mx-auto mt-14 max-w-6xl">
          <p className="mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="whitespace-nowrap">How to earn points</span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EARN_METHODS.map((m) => (
              <Panel key={m.title} innerClassName="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#0B0E2A] text-accent-bright" style={{ clipPath: smallCut }}>
                  {m.icon}
                </span>
                <span className="min-w-0">
                  <span className="font-display block text-[1.4rem] leading-none text-white">{m.title}</span>
                  <span className="mt-1 block text-xs leading-snug text-muted">{m.desc}</span>
                </span>
              </Panel>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Items */}
      <div className="mx-auto mt-14 max-w-6xl">
        <Reveal>
          <p className="mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="whitespace-nowrap">On the shelf</span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
          </p>
        </Reveal>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <Reveal key={item.name} delay={(i % 4) * 70} className="h-full">
              <Panel className="h-full" innerClassName="flex h-full flex-col items-center p-6 text-center">
                <Artwork item={item} className="h-32 w-32" />
                <h3 className="font-display mt-5 text-[1.8rem] leading-none text-white">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
                <p className="mt-auto pt-5">
                  <span className="font-display text-[1.9rem] leading-none text-accent-bright">{formatPoints(item.points)}</span>
                  <span className="ml-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-faint">points</span>
                </p>
                <Button onClick={() => openItem(item)} className="mt-4 w-full">
                  Buy
                </Button>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Buy popup */}
      {selected && (
        <Modal onClose={() => setSelected(null)} title="Buy item">
          <div className="flex items-center gap-5">
            <Artwork item={selected} className="h-24 w-24" />
            <div className="min-w-0">
              <p className="font-display text-[1.6rem] leading-none text-white">{selected.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{selected.desc}</p>
              <p className="mt-2 text-sm font-bold text-accent-bright">{formatPoints(selected.points)} points</p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted">
            To buy this item, paste this command in the stream chat:
          </p>

          <Button onClick={() => copyCommand(selected.command)} title="Click to copy" className="mt-3 w-full text-base">
            {copied ? 'Copied!' : selected.command}
          </Button>
        </Modal>
      )}
    </div>
  )
}
