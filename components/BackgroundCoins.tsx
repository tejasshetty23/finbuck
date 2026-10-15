/* eslint-disable @next/next/no-img-element */

// The bronze, silver and gold coins from public/lecoins.png (split into
// coin-bronze/-silver/-gold.webp), scattered across the fixed background
// layer on every page.
//
// They're kept mostly to the outer edges so they sit beside content rather
// than behind it, held well back (low opacity, some blurred) so they read
// as background, and drift on the shared .gem-float animation — which also
// means they stand still for anyone who has asked for reduced motion.

type Coin = {
  metal: 'bronze' | 'silver' | 'gold'
  top: string
  left?: string
  right?: string
  w: string
  rot: string
  dur: string
  delay: string
  op: number
  blur?: number
  /** Desktop only — on a phone there is no spare margin to put it in. */
  wide?: boolean
}

const COINS: Coin[] = [
  { metal: 'gold', top: '14%', left: '2%', w: 'w-14 md:w-20', rot: '-14deg', dur: '9s', delay: '0s', op: 0.55 },
  { metal: 'silver', top: '38%', right: '2.5%', w: 'w-12 md:w-16', rot: '12deg', dur: '10.5s', delay: '-3s', op: 0.5 },
  { metal: 'bronze', top: '70%', left: '4%', w: 'w-12 md:w-16', rot: '18deg', dur: '8.6s', delay: '-5s', op: 0.5 },
  { metal: 'gold', top: '84%', right: '5%', w: 'w-16 md:w-24', rot: '-8deg', dur: '11s', delay: '-2s', op: 0.5 },
  { metal: 'bronze', top: '8%', right: '9%', w: 'w-10', rot: '24deg', dur: '9.8s', delay: '-6s', op: 0.4, blur: 2, wide: true },
  { metal: 'silver', top: '56%', left: '11%', w: 'w-9', rot: '-20deg', dur: '12s', delay: '-4s', op: 0.3, blur: 3, wide: true },
  { metal: 'gold', top: '28%', left: '15%', w: 'w-8', rot: '10deg', dur: '13s', delay: '-7s', op: 0.25, blur: 3, wide: true },
  { metal: 'silver', top: '64%', right: '13%', w: 'w-10', rot: '-16deg', dur: '10s', delay: '-1s', op: 0.3, blur: 2, wide: true },
]

export default function BackgroundCoins() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {COINS.map((c, i) => (
        <img
          key={i}
          src={`/coin-${c.metal}.webp`}
          alt=""
          draggable={false}
          className={`gem-float absolute h-auto select-none ${c.w} ${c.wide ? 'hidden md:block' : ''}`}
          style={{
            top: c.top,
            left: c.left,
            right: c.right,
            opacity: c.op,
            filter: c.blur ? `blur(${c.blur}px)` : undefined,
            animationDelay: c.delay,
            ['--gem-rot' as string]: c.rot,
            ['--gem-dur' as string]: c.dur,
          }}
        />
      ))}
    </div>
  )
}
