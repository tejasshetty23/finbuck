'use client'

import { useState } from 'react'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import Reveal from '../../components/Reveal'

/**
 * The points shop, with no photographs: each item is a drawn "ticket" in the
 * display face, so the shelf reads as one set rather than four unrelated
 * pictures. The art is the big lead (a dollar figure, a wheel, an eye) on a
 * tinted ground with a perforated edge, like a token you'd tear off.
 */

interface ShopItem {
  name: string
  desc: string
  points: number
  /** Chat command a viewer pastes to redeem this item. */
  command: string
  /** What's drawn on the ticket. */
  lead: string
  /** Small line under the lead. */
  sub: string
  /** Tint for the ticket and the price. */
  tone: 'green' | 'gold' | 'violet' | 'red'
  /** Shown as a corner flag. */
  flag?: string
}

// Locale-independent thousands separators. toLocaleString() would format via
// the runtime's locale, which differs between server and browser (e.g. Indian
// "10,00,000" vs "1,000,000") and breaks hydration.
function formatPoints(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const ITEMS: ShopItem[] = [
  { name: '$20 Bonus Buy', desc: 'Redeem a $20 bonus buy of your choice', points: 7500, command: '!BonusBuy', lead: '$20', sub: 'Bonus buy', tone: 'green' },
  { name: 'Spin the Wheel', desc: 'Guaranteed spin of the sub wheel', points: 15000, command: '!shop buy SpinWheel', lead: 'Spin', sub: 'Sub wheel', tone: 'violet', flag: 'Fan favourite' },
  { name: '$50 Bonus Buy', desc: 'Redeem a $50 bonus buy of your choice', points: 20000, command: '!SuperBonusBuy', lead: '$50', sub: 'Super bonus buy', tone: 'gold' },
  { name: 'Naked Timmy Stream', desc: "Na3's wet dream", points: 1000000, command: '!TimmyStream', lead: '👀', sub: 'If you dare', tone: 'red', flag: 'Legendary' },
]

const TONE = {
  green: { hex: '#00FF87', text: 'text-accent-bright' },
  gold: { hex: '#FFC83D', text: 'text-gold' },
  violet: { hex: '#B4A7FF', text: 'text-[#B4A7FF]' },
  red: { hex: '#FF6B6B', text: 'text-[#FF6B6B]' },
} as const

const EARN = [
  { title: 'Watch streams', desc: 'Points tick up while you watch.', rate: 'Passive' },
  { title: 'Chat activity', desc: 'Be active in chat for bonus points.', rate: 'Bonus' },
  { title: 'Win bets', desc: 'Call it right for big point boosts.', rate: 'Boost' },
  { title: 'Subscribe', desc: 'Subs earn points at twice the rate.', rate: '2×' },
]

const smallCut = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'

/** The drawn ticket that stands in for a product photo. */
function Ticket({ item, compact = false }: { item: ShopItem; compact?: boolean }) {
  const t = TONE[item.tone]
  return (
    <div
      className={`relative overflow-hidden ${compact ? 'h-24 w-24 shrink-0' : 'w-full aspect-[4/3]'}`}
      style={{
        clipPath: smallCut,
        background: `radial-gradient(90% 70% at 50% 0%, ${t.hex}33, transparent 70%), linear-gradient(180deg, #0B0E2A, #080A20)`,
      }}
    >
      {/* Perforated edge down the left, like a tear-off stub */}
      {!compact && (
        <span
          aria-hidden
          className="absolute inset-y-3 left-3 w-px"
          style={{ backgroundImage: `repeating-linear-gradient(180deg, ${t.hex}66 0 4px, transparent 4px 9px)` }}
        />
      )}
      {/* Faint diagonal hatch */}
      <span aria-hidden className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 9px, #fff 9px 10px)' }} />
      <div className="relative flex h-full flex-col items-center justify-center text-center">
        <span
          className={`font-display leading-none ${t.text} ${compact ? 'text-[2.2rem]' : 'text-[clamp(3.4rem,6vw,4.6rem)]'}`}
          style={{ textShadow: `0 0 28px ${t.hex}66` }}
        >
          {item.lead}
        </span>
        {!compact && <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-faint">{item.sub}</span>}
      </div>
      {item.flag && !compact && (
        <span
          className="absolute right-0 top-0 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#0B0E2A]"
          style={{ background: t.hex, clipPath: 'polygon(8px 0,100% 0,100% 100%,0 100%)' }}
        >
          {item.flag}
        </span>
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
        Spend the points you earn on stream. Pick an item, paste its command in chat, and a mod sorts the rest.
      </PageHeader>

      {/* ── The shelf ── */}
      <div className="mx-auto mt-12 max-w-6xl">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => {
            const t = TONE[item.tone]
            return (
              <Reveal key={item.name} delay={(i % 4) * 70} className="h-full">
                <Panel className="h-full" innerClassName="flex h-full flex-col p-4">
                  <Ticket item={item} />
                  <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                    <h3 className="font-display text-[1.75rem] leading-none text-white">{item.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{item.desc}</p>
                    <div className="mt-auto pt-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-faint">Price</p>
                      <p className={`font-display mt-0.5 text-[1.9rem] leading-none ${t.text}`}>
                        {formatPoints(item.points)}
                        <span className="ml-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-faint">points</span>
                      </p>
                    </div>
                    <Button onClick={() => openItem(item)} className="mt-4 w-full">
                      Buy
                    </Button>
                  </div>
                </Panel>
              </Reveal>
            )
          })}
        </div>
      </div>

      {/* ── Balance + how to earn, as one strip ── */}
      <Reveal>
        <div className="mx-auto mt-14 max-w-6xl">
          <Panel innerClassName="grid lg:grid-cols-[1.1fr_2fr]">
            <div className="flex flex-col justify-center border-b border-white/[0.06] p-7 lg:border-b-0 lg:border-r">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">Your balance</p>
              <h2 className="font-display mt-2 text-[2.4rem] leading-none text-white">Check it in chat</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">Type this in the stream chat and the bot replies with your points.</p>
              <div className="mt-5 flex items-center justify-between gap-3 bg-[#0B0E2A] px-4 py-3" style={{ clipPath: smallCut }}>
                <code className="font-display text-[1.8rem] leading-none text-accent-bright">!points</code>
                <Button onClick={() => copyCommand('!points')} variant="outline" size="xs">
                  {copied && !selected ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
            <div className="grid divide-y divide-white/[0.06] sm:grid-cols-2 sm:divide-y-0">
              {EARN.map((e, i) => (
                <div key={e.title} className={`flex gap-4 p-6 ${i < 2 ? 'sm:border-b sm:border-white/[0.06]' : ''} ${i % 2 === 0 ? 'sm:border-r sm:border-white/[0.06]' : ''}`}>
                  <span className="font-display shrink-0 text-[1.8rem] leading-none text-accent-bright">{e.rate}</span>
                  <div>
                    <h3 className="font-display text-[1.3rem] leading-none text-white">{e.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </Reveal>

      {/* Buy popup */}
      {selected && (
        <Modal onClose={() => setSelected(null)} title="Buy item">
          <div className="flex items-center gap-5">
            <Ticket item={selected} compact />
            <div className="min-w-0">
              <p className="font-display text-[1.6rem] leading-none text-white">{selected.name}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{selected.desc}</p>
              <p className={`mt-2 text-sm font-bold ${TONE[selected.tone].text}`}>{formatPoints(selected.points)} points</p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-muted">To buy this item, paste this command in the stream chat:</p>

          <Button onClick={() => copyCommand(selected.command)} title="Click to copy" className="mt-3 w-full text-base">
            {copied ? 'Copied!' : selected.command}
          </Button>
        </Modal>
      )}
    </div>
  )
}
