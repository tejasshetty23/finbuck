import Image from 'next/image'

// The hero's floating chips and gems, after benny.gg's 3D dice and coins.
// Depth comes from three layers: big sharp pieces in front (some cut off by
// the viewport edge, which sells the scale), mid pieces, and small soft-focus
// ones behind at low opacity. The drift is the existing .gem-float animation,
// so it already stops for anyone who has asked for reduced motion.

type Piece = {
  src: string
  style: React.CSSProperties
  w: string
  rot: string
  dur: string
  delay: string
  /** Soft-focus background piece. */
  far?: boolean
  /** Hidden below md, where it would crowd the headline. */
  wide?: boolean
}

const PIECES: Piece[] = [
  // Front
  { src: '/chip-green.webp', style: { top: '6%', right: '-3%' }, w: 'w-32 md:w-56', rot: '18deg', dur: '7.2s', delay: '0s' },
  { src: '/chip-gold.webp', style: { top: '64%', left: '3%' }, w: 'w-28 md:w-48', rot: '-14deg', dur: '6.6s', delay: '-2.1s', wide: true },
  { src: '/gem-green.webp', style: { top: '11%', left: '8%' }, w: 'w-20 md:w-28', rot: '-10deg', dur: '6.1s', delay: '-1.2s' },
  { src: '/chip-gold.webp', style: { top: '54%', right: '11%' }, w: 'w-24 md:w-32', rot: '22deg', dur: '7.8s', delay: '-3.6s', wide: true },
  // Middle
  { src: '/gem-green.webp', style: { top: '74%', right: '27%' }, w: 'w-14 md:w-16', rot: '14deg', dur: '6.9s', delay: '-4.4s', wide: true },
  { src: '/chip-green.webp', style: { top: '36%', left: '-4%' }, w: 'w-28 md:w-40', rot: '-24deg', dur: '8.4s', delay: '-0.7s', wide: true },
  // Far, soft focus
  { src: '/chip-green.webp', style: { top: '28%', left: '20%' }, w: 'w-14', rot: '10deg', dur: '9.5s', delay: '-5.2s', far: true, wide: true },
  { src: '/chip-gold.webp', style: { top: '18%', right: '24%' }, w: 'w-12', rot: '-16deg', dur: '10.2s', delay: '-2.8s', far: true, wide: true },
  { src: '/gem-green.webp', style: { top: '82%', left: '30%' }, w: 'w-12', rot: '-8deg', dur: '9.1s', delay: '-6.3s', far: true, wide: true },
]

export default function HeroDecor() {
  return (
    <div className="pointer-events-none select-none absolute inset-0 overflow-hidden" aria-hidden>
      {PIECES.map((p, i) => (
        <Image
          key={i}
          src={p.src}
          alt=""
          width={320}
          height={300}
          priority={!p.far && !p.wide}
          className={`gem-float absolute h-auto ${p.w} ${p.wide ? 'hidden md:block' : ''}`}
          style={{
            ...p.style,
            opacity: p.far ? 0.35 : 1,
            filter: p.far ? 'blur(3px)' : 'drop-shadow(0 18px 30px rgba(0,0,0,0.45))',
            animationDelay: p.delay,
            ['--gem-rot' as string]: p.rot,
            ['--gem-dur' as string]: p.dur,
          }}
        />
      ))}
    </div>
  )
}
