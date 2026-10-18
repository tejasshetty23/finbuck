/* eslint-disable @next/next/no-img-element */

// Two gift boxes tucked at the corners of a heading, like stickers: one
// above the top-left, one below the bottom-right. Unlike the background
// gifts they're at full colour and sit above the content.
//
// Drop it inside a `relative` element that wraps the heading text. They
// show from sm up only: on a phone the headings fill the screen width, so
// there's no margin beside them and a gift would sit on the text. (The
// background gifts still show there.)
// They float on the shared .gem-float animation, so they stand still under
// prefers-reduced-motion.

const GIFTS = ['gift-teal.webp', 'gift-orange.webp', 'gift-blue.webp']

const SIZE = {
  lg: 'w-20 md:w-24',
  md: 'w-14 md:w-16',
}

const OFFSET = {
  lg: { left: '-left-20 -top-6 md:-left-28', right: '-right-20 bottom-0 md:-right-28' },
  md: { left: '-left-16 -top-4 md:-left-20', right: '-right-16 bottom-0 md:-right-20' },
}

export default function HeadingGifts({
  size = 'md',
  variant = 0,
  side = 'both',
}: {
  size?: 'md' | 'lg'
  /** Rotates which two gifts appear, so neighbouring headings differ. */
  variant?: number
  side?: 'both' | 'right'
}) {
  const a = GIFTS[variant % GIFTS.length]
  const b = GIFTS[(variant + 1) % GIFTS.length]
  const gift = (src: string, pos: string, rot: string, delay: string) => (
    <img
      src={`/${src}`}
      alt=""
      aria-hidden
      draggable={false}
      className={`gem-float pointer-events-none absolute z-20 hidden h-auto sm:block select-none drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)] ${SIZE[size]} ${pos}`}
      style={{ animationDelay: delay, ['--gem-rot' as string]: rot, ['--gem-dur' as string]: '6.5s' }}
    />
  )
  return (
    <>
      {side === 'both' && gift(a, OFFSET[size].left, '-12deg', '0s')}
      {gift(b, OFFSET[size].right, '10deg', '-3.2s')}
    </>
  )
}
