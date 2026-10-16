import type { ReactNode } from 'react'

/**
 * Section opener. A tracked eyebrow set between two rules with a green
 * diamond bullet, then the title in the display face — big, condensed,
 * uppercase — and an optional line of reading text in Inter.
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
      <p className="mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
        <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
        <span className="whitespace-nowrap">{eyebrow}</span>
        <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
      </p>
      <h2 className="font-display mt-4 text-[2.75rem] leading-[0.9] sm:text-7xl">{title}</h2>
      {children && <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">{children}</p>}
    </div>
  )
}
