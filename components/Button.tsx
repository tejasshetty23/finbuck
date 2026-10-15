import Link from 'next/link'
import type { ReactNode } from 'react'

// The site's one button.
//
// It borrows the podium's language: the top-left and bottom-right corners cut
// at 45°, so buttons and cards read as one system rather than generic rounded
// pills. No glow halo: a flat fill with a slight top-to-bottom shade, a
// one-pixel lift on hover and a press on click. Labels are sentence case; an
// icon appears only where it carries meaning (a brand mark, or ↗ for a link
// that leaves the site).

type Variant = 'primary' | 'ghost' | 'dark'

const CUT = 9

const clip = `polygon(${CUT}px 0, 100% 0, 100% calc(100% - ${CUT}px), calc(100% - ${CUT}px) 100%, 0 100%, 0 ${CUT}px)`

// Only the gradient needs an inline background. The flat fills are classes:
// an inline background would beat Tailwind's hover:bg-* and kill the hover.
const VARIANT: Record<Variant, { cls: string; bg?: string }> = {
  // Neon fill, dark text.
  primary: {
    cls: 'text-[#0B0E2A] hover:brightness-[1.06]',
    bg: 'linear-gradient(180deg, #3DFFA4 0%, #00F07F 100%)',
  },
  // Quiet secondary: a faint lift off whatever it sits on, white text.
  ghost: {
    cls: 'bg-white/[0.07] text-white hover:bg-white/[0.12]',
  },
  // For use on the green banner: dark fill, green text.
  dark: {
    cls: 'bg-[#0B0E2A] text-accent-bright hover:bg-[#151A45]',
  },
}

export const externalIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-3.5 w-3.5 opacity-70" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
  </svg>
)

export default function Button({
  href,
  children,
  variant = 'primary',
  icon,
  external = false,
  sponsored = false,
  size = 'md',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: Variant
  /** Leading icon, e.g. a brand mark. */
  icon?: ReactNode
  /** Opens in a new tab and gets a trailing ↗. */
  external?: boolean
  /** Affiliate link — adds rel="sponsored". */
  sponsored?: boolean
  size?: 'md' | 'sm'
  className?: string
}) {
  const v = VARIANT[variant]
  const cls = `group inline-flex items-center justify-center gap-2 font-bold tracking-[0.01em] whitespace-nowrap transition-[transform,filter,background-color] duration-150 hover:-translate-y-px active:translate-y-px ${
    size === 'md' ? 'h-12 px-6 text-[15px]' : 'h-10 px-4 text-sm'
  } ${v.cls} ${className}`
  const style = v.bg ? { clipPath: clip, background: v.bg } : { clipPath: clip }
  const inner = (
    <>
      {icon}
      {children}
      {external && externalIcon}
    </>
  )

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel={sponsored ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
        className={cls}
        style={style}
      >
        {inner}
      </a>
    )
  }
  return (
    <Link href={href} className={cls} style={style}>
      {inner}
    </Link>
  )
}
