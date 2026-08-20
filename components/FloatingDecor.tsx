import Image from 'next/image'

/**
 * Gems and chips drifting on an ellipse around a heading.
 *
 * Positions sit on a ring rather than at the corners of a box, so the pieces
 * read as surrounding the text instead of scattered across the section. Angles
 * skip straight up and straight down, where multi-line headings put their
 * second line.
 *
 * Purely presentational — the float is CSS (.gem-float in globals.css), so this
 * stays a server component and ships no JS.
 *
 * The parent must be `relative`; this centres itself on that box.
 */

type Piece = {
  src: string
  top: string
  left: string
  w: string
  rot: string
  dur: string
  delay: string
  op: number
  /** Hidden below sm, where there is no spare width beside the text. */
  hide: boolean
}

const RING: Piece[] = [
  { src: '/gem.webp',  top: '20%', left: '16%', w: 'w-16 sm:w-24', rot: '-14deg', dur: '6.4s', delay: '0s',    op: 0.85, hide: false },
  { src: '/coin.webp', top: '21%', left: '78%', w: 'w-14 sm:w-20', rot: '12deg',  dur: '7.1s', delay: '-2.2s', op: 0.8,  hide: false },
  { src: '/coin.webp', top: '46%', left: '7%',  w: 'w-12 sm:w-16', rot: '18deg',  dur: '5.8s', delay: '-3.4s', op: 0.7,  hide: true },
  { src: '/gem.webp',  top: '45%', left: '88%', w: 'w-14 sm:w-20', rot: '-9deg',  dur: '6.9s', delay: '-1.1s', op: 0.75, hide: true },
  { src: '/gem.webp',  top: '73%', left: '18%', w: 'w-11 sm:w-14', rot: '22deg',  dur: '8.2s', delay: '-4.6s', op: 0.7,  hide: false },
  { src: '/coin.webp', top: '74%', left: '79%', w: 'w-11 sm:w-14', rot: '-20deg', dur: '7.6s', delay: '-5.3s', op: 0.7,  hide: false },
]

export default function FloatingDecor({
  /** Ring width. Capped against the viewport so nothing lands where an
   *  overflow-hidden ancestor would crop it. */
  width = 'w-[min(920px,92vw)]',
  height = 'h-[300px] sm:h-[360px]',
  className = '',
}: {
  width?: string
  height?: string
  className?: string
}) {
  return (
    <div
      className={`pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${width} ${height} ${className}`}
      aria-hidden
    >
      {RING.map((g, i) => (
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
  )
}
