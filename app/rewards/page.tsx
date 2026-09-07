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
  { src: '/gem.webp', top: '6%', left: '78%', w: 'w-12 sm:w-16', rot: '-14deg', dur: '6.4s', delay: '0s', op: 0.7, hide: false },
  { src: '/coin.webp', top: '19%', left: '8%', w: 'w-10 sm:w-14', rot: '12deg', dur: '7.1s', delay: '-2.2s', op: 0.65, hide: true },
  { src: '/coin.webp', top: '31%', left: '80%', w: 'w-11 sm:w-14', rot: '18deg', dur: '5.8s', delay: '-3.4s', op: 0.6, hide: false },
  { src: '/gem.webp', top: '44%', left: '7%', w: 'w-10 sm:w-14', rot: '-9deg', dur: '6.9s', delay: '-1.1s', op: 0.65, hide: true },
  { src: '/gem.webp', top: '69%', left: '9%', w: 'w-11 sm:w-14', rot: '22deg', dur: '8.2s', delay: '-4.6s', op: 0.6, hide: false },
  { src: '/coin.webp', top: '81%', left: '79%', w: 'w-10 sm:w-12', rot: '-20deg', dur: '7.6s', delay: '-5.3s', op: 0.6, hide: true },
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
          <path
            d="M22,50 C22,100 78,100 78,150 C78,200 22,200 22,250 C22,300 78,300 78,350 C78,400 22,400 22,450 C22,500 78,500 78,550 C78,600 22,600 22,650 C22,700 78,700 78,750"
            fill="none"
            stroke="url(#trail)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="10 12"
            vectorEffect="non-scaling-stroke"
            opacity={0.55}
          />
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
                className={`relative flex min-h-[190px] sm:min-h-[200px] items-center ${
                  right ? 'justify-end' : 'justify-start'
                }`}
              >
                <Reveal className="w-full sm:w-[54%]">
                  <div
                    className="relative rounded-2xl border bg-[#0d0a1a]/80 backdrop-blur-sm p-5 sm:p-6"
                    style={{
                      borderColor: `${accent}55`,
                      boxShadow: `0 0 26px ${accent}22`,
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Medallion — the X for the final stop, emoji otherwise */}
                      <div
                        className="shrink-0 grid place-items-center rounded-xl border w-12 h-12 sm:w-14 sm:h-14"
                        style={{
                          borderColor: `${accent}66`,
                          background: `linear-gradient(160deg, ${accent}1f 0%, #07050a 75%)`,
                        }}
                      >
                        {isEnd ? (
                          <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke={accent} strokeWidth={3.4} strokeLinecap="round">
                            <path d="M5 5l14 14M19 5L5 19" />
                          </svg>
                        ) : (
                          <span className="text-2xl sm:text-3xl leading-none">{s.icon}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        {(isStart || isEnd) && (
                          <span
                            className="block text-[10px] font-black uppercase tracking-[0.3em] mb-1"
                            style={{ color: accent }}
                          >
                            {isStart ? 'Start Here' : 'X Marks the Spot'}
                          </span>
                        )}
                        <h2
                          className={`font-black uppercase leading-tight ${
                            isStart || isEnd ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                          } text-white`}
                        >
                          {s.title}
                        </h2>
                        {s.desc && (
                          <p className="text-gray-400 text-sm leading-relaxed mt-1.5">{s.desc}</p>
                        )}

                        {s.href && s.cta && (
                          <a
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="mt-4 inline-flex items-center gap-2 font-black uppercase tracking-widest text-xs px-5 py-2.5 rounded-lg transition-transform hover:scale-105"
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
                    </div>
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
