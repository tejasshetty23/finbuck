/* eslint-disable @next/next/no-img-element */

// The bronze, silver and gold coins from public/lecoins.png (split into
// coin-bronze/-silver/-gold.webp), scattered across the fixed background
// layer on every page.
//
// Alongside them, the three gift boxes from public/dorkuniteslotgifts.png
// (split into gift-blue/-orange/-teal.webp), placed in the gaps between
// the coins.
//
// They're kept mostly to the outer edges so they sit beside content rather
// than behind it, held well back (low opacity, some blurred) so they read
// as background, and drift on the shared .gem-float animation — which also
// means they stand still for anyone who has asked for reduced motion.

type Coin = {
  /** Image in /public, e.g. coin-gold.webp or gift-teal.webp. */
  src: string
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
  { src: 'coin-gold.webp', top: '14%', left: '2%', w: 'w-14 md:w-20', rot: '-14deg', dur: '9s', delay: '0s', op: 0.55 },
  { src: 'coin-silver.webp', top: '38%', right: '2.5%', w: 'w-12 md:w-16', rot: '12deg', dur: '10.5s', delay: '-3s', op: 0.5 },
  { src: 'coin-bronze.webp', top: '70%', left: '4%', w: 'w-12 md:w-16', rot: '18deg', dur: '8.6s', delay: '-5s', op: 0.5 },
  { src: 'coin-gold.webp', top: '84%', right: '5%', w: 'w-16 md:w-24', rot: '-8deg', dur: '11s', delay: '-2s', op: 0.5 },
  { src: 'coin-bronze.webp', top: '8%', right: '9%', w: 'w-10', rot: '24deg', dur: '9.8s', delay: '-6s', op: 0.4, blur: 2, wide: true },
  { src: 'coin-silver.webp', top: '56%', left: '11%', w: 'w-9', rot: '-20deg', dur: '12s', delay: '-4s', op: 0.3, blur: 3, wide: true },
  { src: 'coin-gold.webp', top: '28%', left: '15%', w: 'w-8', rot: '10deg', dur: '13s', delay: '-7s', op: 0.25, blur: 3, wide: true },
  { src: 'coin-silver.webp', top: '64%', right: '13%', w: 'w-10', rot: '-16deg', dur: '10s', delay: '-1s', op: 0.3, blur: 2, wide: true },

  // Gifts
  { src: 'gift-teal.webp', top: '40%', left: '2.5%', w: 'w-14 md:w-20', rot: '-10deg', dur: '10s', delay: '-2.5s', op: 0.5 },
  { src: 'gift-orange.webp', top: '20%', right: '3%', w: 'w-12 md:w-[4.5rem]', rot: '12deg', dur: '11.5s', delay: '-6.5s', op: 0.5 },
  { src: 'gift-blue.webp', top: '90%', left: '9%', w: 'w-12 md:w-16', rot: '8deg', dur: '9.4s', delay: '-4.2s', op: 0.45 },
  { src: 'gift-blue.webp', top: '50%', right: '8%', w: 'w-10', rot: '-14deg', dur: '12.5s', delay: '-8s', op: 0.3, blur: 2, wide: true },
  { src: 'gift-orange.webp', top: '78%', left: '14%', w: 'w-9', rot: '16deg', dur: '13s', delay: '-3.5s', op: 0.25, blur: 3, wide: true },
]

export default function BackgroundCoins() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {COINS.map((c, i) => (
        <img
          key={i}
          src={`/${c.src}`}
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
