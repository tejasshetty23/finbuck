import Image from 'next/image'
import Reveal from '../../components/Reveal'
import TiltCard from '../../components/TiltCard'

type Perk = {
  /** The hook, set large in the frame's gradient. Numbers mostly. */
  lead?: string
  title: string
  desc?: string
  href?: string
  cta?: string
}

// Sign-up is deliberately not in here — it gets its own full-width call to
// action at the bottom, since it's the one thing every other perk depends on.
const PERKS: Perk[] = [
  { lead: '15%', title: 'Affiliate Commission' },
  { lead: '50%', title: 'Rank Up Bonus Boost' },
  { lead: 'Stream', title: 'Exclusive Giveaways' },
  { lead: 'Code', title: 'Exclusive Drops' },
  { lead: 'Discord', title: 'Affiliate Access' },
  {
    lead: 'VIP',
    title: 'Gamba Rewards',
    desc: '10–20% lossback once losses exceed $1,000.',
    href: 'https://gamba.com/vip-program',
    cta: 'VIP Program',
  },
]

const GREEN = '/frame-green-neon.webp'
const PURPLE = '/frame-purple-neon.webp'

/**
 * A perk sitting inside one of the neon frames.
 *
 * The frame art is square with a black interior, so it doubles as the card's
 * own background — no separate panel needed. Content sits at a 16% inset, which
 * is the largest centred box that clears the frame's inward corner notches,
 * measured off the artwork rather than guessed.
 *
 * The layers are spread along Z so TiltCard's rotation parallaxes them against
 * each other: the frame stands proud of the wash behind it and the text sits
 * just off that wash, which is what lets you look around the border rather than
 * only at it. Depths are small — at a 1000px perspective, +26px is under 3%
 * of apparent size, enough to separate the planes without the frame visibly
 * outgrowing its square.
 */
function FramedCard({
  frame,
  accent,
  variant = 0,
  children,
  className = '',
}: {
  frame: string
  accent: string
  /** Swaps gem and chip between the corners, so adjacent cards differ. */
  variant?: number
  children: React.ReactNode
  className?: string
}) {
  // A piece in each of the two upper corners. Content occupies the middle
  // (16-84%), so the interior corners are the only free space, and the lower
  // pair read as crowding the text where the upper pair frame it.
  // Anchored to the corners of a box inset inside the frame's opening, so each
  // piece sits in its corner whatever size it renders at. Fixed percentages left
  // them short of the edge, since the offset ignored the piece's own width.
  // Widening that inset walks both inward along their diagonals at once.
  const decor =
    variant % 2 === 0
      ? [
          { src: '/gem.webp', at: 'top-0 left-0', rot: '-16deg' },
          { src: '/coin.webp', at: 'top-0 right-0', rot: '18deg' },
        ]
      : [
          { src: '/coin.webp', at: 'top-0 left-0', rot: '13deg' },
          { src: '/gem.webp', at: 'top-0 right-0', rot: '-19deg' },
        ]

  return (
    <TiltCard className={className}>
      <div className="relative aspect-square" style={{ transformStyle: 'preserve-3d' }}>
        {/* Faint wash in the frame's own colour, run out to 8% so its edge
            tucks under the frame border rather than stopping short of it — at
            12% three quarters of that edge sat in the open interior as a
            visible boundary. Square corners, so the opening fills all the way
            into them. Painted before the frame so the border sits on top, and
            pushed back along Z so the border stands off it. */}
        <div
          className="absolute inset-[8%]"
          style={{
            background: `radial-gradient(115% 115% at 50% 0%, ${accent}24 0%, ${accent}14 45%, ${accent}08 100%)`,
            transform: 'translateZ(-22px)',
          }}
        />

        <Image
          src={frame}
          alt=""
          fill
          sizes="(max-width: 640px) 90vw, 380px"
          className="pointer-events-none select-none object-fill"
          style={{ transform: 'translateZ(26px)' }}
        />

        {/* Furthest forward, so the pieces swing widest as the card turns. */}
        <div
          className="pointer-events-none select-none absolute inset-[14%]"
          style={{ transform: 'translateZ(46px)' }}
          aria-hidden
        >
          {decor.map((g, i) => (
            <Image
              key={i}
              src={g.src}
              alt=""
              width={320}
              height={320}
              className={`absolute w-7 sm:w-9 h-auto ${g.at}`}
              style={{ transform: `rotate(${g.rot})`, opacity: 0.85 }}
            />
          ))}
        </div>
        <div
          className="absolute inset-[16%] flex flex-col items-center justify-center text-center gap-2"
          style={{ ['--accent' as string]: accent, transform: 'translateZ(8px)' }}
        >
          {children}
        </div>
      </div>
    </TiltCard>
  )
}

export default function RewardsPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>

      {/* The two calls to action share a row: sign-up on the left, the
          headline prize on the right. They were bookending the perk grid, one
          at each end of the page. */}
      <Reveal>
        <div className="max-w-5xl mx-auto mb-14 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left half. Ordered under the frame on mobile, where a single
              column makes the frame the better thing to lead with. */}
          <div className="order-2 md:order-1 text-center">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
              Ready to <span className="animated-gradient-text">Start</span>?
            </h2>
            <p className="text-gray-500 text-sm mt-3">
              Sign up under code <span className="text-[#00ff87] font-bold">FINBUCK</span> to unlock all of it.
            </p>
            <a
              href="https://gamba.com/?c=finbuck"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-6 inline-flex items-center gap-2 font-black uppercase tracking-widest text-sm px-8 py-3.5 rounded-xl transition-transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)', color: '#07050a' }}
            >
              Sign Up on Gamba
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>

          {/* Right half. Capped so the square does not grow past the frame art
              on a wide screen. */}
          <div className="order-1 md:order-2 w-full max-w-md mx-auto">
            <FramedCard frame={GREEN} accent="#00ff87">
              <span className="font-display text-[9px] font-bold uppercase tracking-[0.24em] text-[#00ff87]">
                Headline Prize
              </span>
              <span
                className="font-display block font-black leading-none tracking-tight animated-gradient-text"
                style={{ fontSize: 'clamp(32px, 6.4vw, 50px)' }}
              >
                $10,000
              </span>
              <span
                className="block w-12 h-px my-0.5"
                style={{ background: 'linear-gradient(90deg, transparent, #00ff87, transparent)' }}
              />
              <h2
                className="font-display text-[11px] sm:text-xs font-bold uppercase leading-snug text-white/90 tracking-[0.14em]"
                style={{ textShadow: '0 0 12px #00ff8744' }}
              >
                Monthly Leaderboard
              </h2>
              <p
                className="text-gray-300 text-xs sm:text-sm leading-relaxed"
                style={{ textShadow: '0 1px 12px rgba(0,0,0,0.95), 0 0 22px rgba(0,0,0,0.75)' }}
              >
                Wager under code FINBUCK and climb the board.
              </p>
              <a
                href="https://gamba.com/promotions/exclusive-leaderboards/18090"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-1 inline-flex items-center gap-2 font-black uppercase tracking-widest text-[11px] px-4 py-2 rounded-lg transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a)', color: '#07050a' }}
              >
                View Leaderboard
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            </FramedCard>
          </div>
        </div>
      </Reveal>

      {/* The rest, alternating frames */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {PERKS.map((p, i) => {
          const green = i % 2 === 0
          const accent = green ? '#00ff87' : '#c084fc'
          return (
            <Reveal key={p.title} delay={(i % 3) * 80}>
              <FramedCard frame={green ? GREEN : PURPLE} accent={accent} variant={i}>
                {p.lead && (
                  <span
                    className={`font-display block font-black leading-none tracking-tight ${
                      green ? 'animated-gradient-text' : 'animated-gradient-text-purple'
                    }`}
                    style={{ fontSize: 'clamp(26px, 4.6vw, 40px)' }}
                  >
                    {p.lead}
                  </span>
                )}
                {/* Hairline in the frame's colour, tying the two halves together */}
                <span
                  className="block w-8 h-px my-0.5"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
                />
                <h3
                  className="font-display text-[10px] sm:text-[11px] font-bold uppercase leading-snug text-white/90 px-1 tracking-[0.12em]"
                  style={{ textShadow: `0 0 10px ${accent}44` }}
                >
                  {p.title}
                </h3>
                {p.desc && (
                  <p
                    className="text-gray-300 text-[11px] leading-relaxed px-1"
                    style={{ textShadow: '0 1px 12px rgba(0,0,0,0.95), 0 0 22px rgba(0,0,0,0.75)' }}
                  >
                    {p.desc}
                  </p>
                )}
                {p.href && p.cta && (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="mt-1 inline-flex items-center gap-1.5 font-black uppercase tracking-widest text-[10px] px-3 py-1.5 rounded-md border transition-colors"
                    style={{ borderColor: `${accent}66`, color: accent }}
                  >
                    {p.cta}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-2.5 h-2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </FramedCard>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}
