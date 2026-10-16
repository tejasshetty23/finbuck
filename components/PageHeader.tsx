import type { ReactNode } from 'react'

/**
 * The opener every inner page shares: a tracked eyebrow between two rules, the
 * title in the display face with a green glow behind the page, and a line of
 * reading text. Same bones as the leaderboard's header, so the inner pages
 * read as one site rather than five.
 */
export default function PageHeader({
  eyebrow,
  title,
  children,
  className = '',
  live = false,
}: {
  eyebrow: string
  title: ReactNode
  children?: ReactNode
  className?: string
  /** A pulsing red dot before the eyebrow, for the live tools. */
  live?: boolean
}) {
  return (
    <section className={`relative mx-auto max-w-4xl pt-16 text-center ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 h-80"
        style={{ background: 'radial-gradient(50% 60% at 50% 40%, rgba(0,255,135,0.12), transparent 70%)' }}
      />
      <p className="relative mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
        {live ? (
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        ) : (
          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
        )}
        <span className="whitespace-nowrap">{eyebrow}</span>
        <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
      </p>
      <h1 className="font-display relative mt-5 text-[clamp(3.25rem,11vw,6.5rem)] leading-[0.9]">{title}</h1>
      {children && (
        <p className="relative mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">{children}</p>
      )}
    </section>
  )
}
