import type { ReactNode } from 'react'

/**
 * The benny.gg section opener: a small letter-spaced label in the accent
 * colour, a large heading, and an optional line of supporting text.
 */
export default function SectionHeading({
  eyebrow,
  title,
  children,
  className = '',
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={`text-center ${className}`}>
      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.32em] text-mint">{eyebrow}</p>
      <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[1.05]">{title}</h2>
      {children && <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-muted">{children}</p>}
    </div>
  )
}
