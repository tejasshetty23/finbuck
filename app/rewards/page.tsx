import Image from 'next/image'
import FloatingDecor from '../../components/FloatingDecor'
import Reveal from '../../components/Reveal'

type Stop = {
  /** Emoji marker shown in the node's medallion. */
  icon: string
  title: string
  desc?: string
  href?: string
  cta?: string
  /** 'start' and 'end' get the trail's head and X-marks-the-spot treatment. */
  kind?: 'start' | 'end'
}

// Reads top to bottom down the trail. Sign-up sits last rather than where it
// appeared in the source list, so the X marks the destination — the whole point
// of the treasure-map framing is that the trail ends somewhere.
const STOPS: Stop[] = [
  {
    kind: 'start',
    icon: '🏆',
    title: '$10,000 Monthly Leaderboard',
    desc: 'The headline prize. Wager under code FINBUCK and climb the board.',
    href: 'https://gamba.com/promotions/exclusive-leaderboards/18090',
    cta: 'View Leaderboard',
  },
  { icon: '💎', title: '15% Affiliate Commission' },
  { icon: '💰', title: '50% Rank Up Bonus Boost' },
  { icon: '🎁', title: 'Exclusive Stream Giveaways' },
  { icon: '💸', title: 'Exclusive Code Drops' },
  { icon: '🔐', title: 'Exclusive Affiliate Discord Access' },
  {
    icon: '🏦',
    title: 'Standard Gamba VIP Rewards',
    desc: 'Includes a 10–20% lossback for qualifying players, as long as losses exceed $1,000+.',
    href: 'https://gamba.com/vip-program',
    cta: 'VIP Program',
  },
  {
    kind: 'end',
    icon: '',
    title: 'Sign Up Here!!',
    desc: 'Join under code FINBUCK to unlock everything on the trail.',
    href: 'https://gamba.com/?c=finbuck',
    cta: 'Sign Up Now',
  },
]

// Gems and chips scattered along the trail. The stops alternate sides, so the
// clear column alternates with them: even rows put their card on the left and
// leave the right free, odd rows the reverse. Each piece is placed on its row's
// free side — rows are 1/8th of the container each, so row i is centred at
// (i + 0.5) / 8. Getting this wrong parks a gem on top of a card.
//
// Below sm the cards go full width and nothing is clear, so the pieces sit
// behind them as faint texture; the smaller ones drop out entirely.
const TRAIL_DECOR = [
  // Row 0 — card left, so the right column is free
  { src: '/gem.webp', top: '4%', left: '60%', w: 'w-12 sm:w-16', rot: '-14deg', dur: '6.4s', delay: '0s', op: 0.7, hide: false },
  { src: '/coin.webp', top: '9%', left: '86%', w: 'w-9 sm:w-12', rot: '9deg', dur: '7.8s', delay: '-3.1s', op: 0.5, hide: true },
  // Row 1 — card right
  { src: '/coin.webp', top: '16%', left: '6%', w: 'w-10 sm:w-14', rot: '12deg', dur: '7.1s', delay: '-2.2s', op: 0.65, hide: false },
  { src: '/gem.webp', top: '22%', left: '30%', w: 'w-8 sm:w-11', rot: '-24deg', dur: '8.6s', delay: '-5.9s', op: 0.5, hide: true },
  // Row 2 — card left
  { src: '/coin.webp', top: '29%', left: '80%', w: 'w-11 sm:w-14', rot: '18deg', dur: '5.8s', delay: '-3.4s', op: 0.6, hide: false },
  { src: '/gem.webp', top: '34%', left: '58%', w: 'w-8 sm:w-10', rot: '-7deg', dur: '9.1s', delay: '-1.7s', op: 0.45, hide: true },
  // Row 3 — card right
  { src: '/gem.webp', top: '41%', left: '5%', w: 'w-10 sm:w-14', rot: '-9deg', dur: '6.9s', delay: '-1.1s', op: 0.65, hide: false },
  { src: '/coin.webp', top: '47%', left: '28%', w: 'w-8 sm:w-11', rot: '26deg', dur: '8.0s', delay: '-4.3s', op: 0.5, hide: true },
  // Row 4 — card left
  { src: '/gem.webp', top: '54%', left: '82%', w: 'w-11 sm:w-14', rot: '15deg', dur: '6.2s', delay: '-2.8s', op: 0.6, hide: false },
  { src: '/coin.webp', top: '59%', left: '60%', w: 'w-8 sm:w-10', rot: '-18deg', dur: '9.4s', delay: '-6.2s', op: 0.45, hide: true },
  // Row 5 — card right
  { src: '/coin.webp', top: '66%', left: '8%', w: 'w-11 sm:w-14', rot: '22deg', dur: '8.2s', delay: '-4.6s', op: 0.6, hide: false },
  { src: '/gem.webp', top: '72%', left: '31%', w: 'w-8 sm:w-11', rot: '-12deg', dur: '7.3s', delay: '-0.6s', op: 0.5, hide: true },
  // Row 6 — card left
  { src: '/gem.webp', top: '79%', left: '79%', w: 'w-10 sm:w-13', rot: '-20deg', dur: '7.6s', delay: '-5.3s', op: 0.6, hide: false },
  { src: '/coin.webp', top: '84%', left: '59%', w: 'w-8 sm:w-10', rot: '11deg', dur: '8.9s', delay: '-2.4s', op: 0.45, hide: true },
  // Row 7 — card right
  { src: '/coin.webp', top: '91%', left: '7%', w: 'w-10 sm:w-13', rot: '17deg', dur: '6.7s', delay: '-3.8s', op: 0.6, hide: false },
  { src: '/gem.webp', top: '96%', left: '29%', w: 'w-8 sm:w-11', rot: '-26deg', dur: '9.7s', delay: '-7.1s', op: 0.5, hide: true },
]

export default function RewardsPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>

      {/* Header */}
      <Reveal>
      <div className="relative max-w-4xl mx-auto mb-20 text-center">
        <FloatingDecor height="h-[280px] sm:h-[340px]" className="!top-[44%]" />
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-purple-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Partner Perks</span>
        </div>

        <h1 className="relative z-10 text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white">
          Rewards <span className="animated-gradient-text">Trail</span>
        </h1>
        <p className="relative z-10 text-gray-500 text-base max-w-md mx-auto mt-4">
          Follow the trail — every stop is a perk you unlock under code FINBUCK.
        </p>
      </div>
      </Reveal>

      {/* ── The trail ── */}
      <div className="relative max-w-4xl mx-auto">
        {/* Dashed path behind the stops. preserveAspectRatio="none" lets it
            stretch to whatever height the stops end up occupying, and
            non-scaling-stroke keeps the dashes even once it does. */}
        <svg
          aria-hidden
          viewBox="0 0 100 800"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00ff87" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#00ff87" />
            </linearGradient>
          </defs>
          {/* One segment per gap rather than a single path, so the trail breaks
              at every stop instead of running behind the heading. Each row is
              100 viewBox units; a segment spans from 32 units below one stop's
              centre to 22 above the next — the clear space between them. */}
          {STOPS.slice(0, -1).map((_, i) => {
            const last = i === STOPS.length - 2
            // The trail leaves the first stop from under its centred button and
            // arrives back at centre for the X, rather than starting and ending
            // out at an edge with nothing above or below it. Everything between
            // alternates as before.
            const x0 = i === 0 ? 50 : i % 2 === 0 ? 22 : 78
            const x1 = last ? 50 : i % 2 === 0 ? 78 : 22
            // The first stop carries an eyebrow, description and button, so it
            // runs taller than the rest and needs more clearance beneath it.
            const y0 = 50 + i * 100 + (i === 0 ? 34 : 22)
            const y1 = 50 + (i + 1) * 100 - 22
            // Overshooting half the span pulls the curve into a fuller S; at
            // exactly half it reads as a straight diagonal.
            const dy = (y1 - y0) * 0.62
            return (
              <path
                key={i}
                d={`M${x0},${y0} C${x0},${y0 + dy} ${x1},${y1 - dy} ${x1},${y1}`}
                fill="none"
                stroke="url(#trail)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="10 12"
                vectorEffect="non-scaling-stroke"
                opacity={0.55}
              />
            )
          })}
        </svg>

        {/* Gems and chips along the way */}
        <div className="pointer-events-none select-none absolute inset-0" aria-hidden>
          {TRAIL_DECOR.map((g, i) => (
            <Image
              key={i}
              src={g.src}
              alt=""
              width={320}
              height={320}
              className={`gem-float absolute h-auto ${g.w} ${g.hide ? 'hidden sm:block' : ''}`}
              style={{
                top: g.top,
                left: g.left,
                opacity: g.op,
                animationDelay: g.delay,
                ['--gem-rot' as string]: g.rot,
                ['--gem-dur' as string]: g.dur,
              }}
            />
          ))}
        </div>

        {/* Stops. Equal-height rows so the eight path segments line up with the
            eight nodes as the SVG stretches. */}
        <div className="relative">
          {STOPS.map((s, i) => {
            const right = i % 2 === 1
            const isEnd = s.kind === 'end'
            const isStart = s.kind === 'start'
            const accent = isEnd ? '#ff4d6d' : right ? '#a855f7' : '#00ff87'

            return (
              <div
                key={s.title}
                className="relative flex min-h-[300px] sm:min-h-[400px] items-center justify-center"
              >
                {/* Centred on the page. The trail sways out around it and
                    breaks either side, so nothing is pushed aside for it. */}
                <Reveal className="w-full max-w-lg">
                  <div className="flex flex-col items-center text-center gap-2.5">
                    {/* Marker — the X for the final stop, emoji otherwise. No
                        container: the stops float on the background. */}
                    {isEnd ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="w-11 h-11 sm:w-12 sm:h-12"
                        fill="none"
                        stroke={accent}
                        strokeWidth={3.4}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 12px ${accent})` }}
                      >
                        <path d="M5 5l14 14M19 5L5 19" />
                      </svg>
                    ) : (
                      <span
                        className="text-4xl sm:text-5xl leading-none"
                        style={{ filter: `drop-shadow(0 0 14px ${accent}aa)` }}
                      >
                        {s.icon}
                      </span>
                    )}

                    {(isStart || isEnd) && (
                      <span
                        className="block text-[10px] font-black uppercase tracking-[0.3em]"
                        style={{ color: accent, textShadow: `0 0 14px ${accent}88` }}
                      >
                        {isStart ? 'Start Here' : 'X Marks the Spot'}
                      </span>
                    )}

                    <h2
                      className={`font-black uppercase leading-tight text-white ${
                        isStart || isEnd ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                      }`}
                      style={{ textShadow: '0 2px 18px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.8)' }}
                    >
                      {s.title}
                    </h2>

                    {s.desc && (
                      <p
                        className="text-gray-400 text-sm leading-relaxed"
                        style={{ textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
                      >
                        {s.desc}
                      </p>
                    )}

                    {s.href && s.cta && (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="mt-2 inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs px-5 py-2.5 rounded-lg transition-transform hover:scale-105"
                        style={{
                          background: isEnd
                            ? 'linear-gradient(135deg, #ff8fa3, #ff4d6d, #d92044)'
                            : 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)',
                          color: '#07050a',
                        }}
                      >
                        {s.cta}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    )}
                  </div>
                </Reveal>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer note */}
      <Reveal>
        <p className="text-center text-gray-600 text-xs mt-16 max-w-md mx-auto leading-relaxed">
          Rewards are provided by Gamba and subject to their terms. 18+ · Gamble responsibly.
        </p>
      </Reveal>
    </div>
  )
}
