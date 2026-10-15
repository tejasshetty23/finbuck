import type { Metadata } from 'next'
import CopyButton from '../../components/CopyButton'
import Countdown from '../../components/Countdown'
import Podium from '../../components/Podium'
import Reveal from '../../components/Reveal'
import { CODE, GAMBA_RACE_URL, SIGNUP_URL } from '../../lib/site'
import { FALLBACK_POOL, FALLBACK_PRIZES, getRace, maskName, ordinal, prizeFor, usd } from '../../lib/gamba'

export const metadata: Metadata = {
  title: 'Leaderboard — FinBuck',
  description: "FinBuck's monthly Gamba leaderboard: live standings, prizes and countdown.",
}

// Same cadence as the Gamba fetch cache in lib/gamba.ts.
export const revalidate = 60

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export default async function LeaderboardPage() {
  const race = await getRace()
  const pool = race?.prizePool ?? FALLBACK_POOL
  const prizes = race?.prizes.length ? race.prizes : FALLBACK_PRIZES
  const competitors = race?.competitors ?? []

  const top3 = [1, 2, 3].map((p) => competitors.find((c) => c.position === p) ?? null)
  const top3Prizes = [1, 2, 3].map((p) => prizeFor(prizes, p))

  // Every place from 4th down: all competitors, plus any paid places nobody
  // has reached yet shown as open spots, so the whole prize ladder is visible.
  const lastRow = Math.max(prizes.length, competitors.length)
  const rows = Array.from({ length: Math.max(0, lastRow - 3) }, (_, i) => {
    const position = i + 4
    return { position, entry: competitors.find((c) => c.position === position) ?? null, prize: prizeFor(prizes, position) }
  })

  return (
    <div className="px-6 pb-8 pt-[72px]">
      {/* Header */}
      <section className="relative mx-auto max-w-4xl pt-16 pb-14 text-center">
        <div
          className="pointer-events-none absolute inset-x-0 -top-10 h-80"
          style={{ background: 'radial-gradient(50% 60% at 50% 40%, rgba(92,255,193,0.09), transparent 70%)' }}
        />
        <p className="relative text-xl sm:text-3xl font-bold">
          <span className="text-gold">{usd(pool)}</span> <span className="text-white">Monthly Prize Pool</span>
        </p>
        <h1
          className="relative mt-2 text-[clamp(2.25rem,11vw,6rem)] font-extrabold uppercase tracking-tight leading-none text-mint"
          style={{ textShadow: '0 0 44px rgba(92,255,193,0.3)' }}
        >
          Leaderboard
        </h1>
        {/* A plain paragraph, not a flex row: as flex, the copy button forced a
            wrap that stranded "Play with code BUCK" on a line of its own. */}
        <p className="relative mx-auto mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted">
          Play with code <span className="font-bold text-mint">{CODE}</span>{' '}
          <span className="inline-block align-middle -mt-1">
            <CopyButton code={CODE} />
          </span>{' '}
          on Gamba. Every wager counts, and the top {prizes.length} split the pool when the race closes.
        </p>

        <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 rounded-xl bg-mint px-7 py-3 text-sm font-bold uppercase tracking-wider text-ink-deep shadow-mint transition-all hover:brightness-110 hover:shadow-mint-lg"
          >
            Sign up with {CODE}
          </a>
          <a
            href={GAMBA_RACE_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 rounded-xl border border-mint/40 px-7 py-3 text-sm font-bold uppercase tracking-wider text-mint transition-colors hover:bg-mint hover:text-ink-deep"
          >
            View on Gamba
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </section>

      {/* Podium */}
      <section className="mx-auto max-w-5xl pt-8">
        <Podium entries={top3} prizes={top3Prizes} />
      </section>

      {/* Countdown */}
      {race && Number.isFinite(race.endsAt) && (
        <section className="mx-auto mt-14 max-w-5xl">
          <Countdown endsAt={race.endsAt} />
        </section>
      )}

      {/* Standings table */}
      <section className="mx-auto mt-14 max-w-4xl">
        <Reveal>
          {!race && (
            <p className="mb-5 rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-center text-sm text-gold">
              Live standings are unavailable right now — showing the prize ladder. Check back in a minute.
            </p>
          )}

          <div className="grid grid-cols-[2.6rem_1fr_auto_3.6rem] sm:grid-cols-[4.5rem_1fr_9rem_7rem] items-center gap-x-3 px-4 pb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-faint">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">Wagered</span>
            <span className="text-right">Prize</span>
          </div>

          <ol className="flex flex-col gap-2">
            {rows.map(({ position, entry, prize }) => (
              <li
                key={position}
                className="grid grid-cols-[2.6rem_1fr_auto_3.6rem] sm:grid-cols-[4.5rem_1fr_9rem_7rem] items-center gap-x-2 sm:gap-x-3 rounded-xl border border-white/[0.06] bg-ink-raised px-3 sm:px-4 py-3 text-[13px] sm:text-sm transition-colors hover:bg-ink-high"
              >
                <span className="font-bold text-muted tabular-nums">{ordinal(position)}</span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-deep text-[11px] font-bold text-faint">
                    {entry ? (maskName(entry.name)[0] ?? '?').toUpperCase() : '·'}
                  </span>
                  <span className={`truncate font-semibold ${entry ? 'text-white' : 'text-faint'}`}>
                    {entry ? maskName(entry.name) : 'Open spot'}
                  </span>
                </span>
                <span className="text-right font-semibold tabular-nums text-white/85">
                  {entry ? usd(entry.wagered, true) : '—'}
                </span>
                <span className={`text-right font-bold tabular-nums ${prize === null ? 'text-faint' : 'text-mint'}`}>
                  {prize === null ? '—' : usd(prize)}
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-center text-xs text-faint">
            {race && Number.isFinite(race.startsAt) && Number.isFinite(race.endsAt) && (
              <>
                {dateFmt.format(race.startsAt)} – {dateFmt.format(race.endsAt)} (UTC) ·{' '}
              </>
            )}
            Standings refresh every minute, straight from Gamba.
          </p>
        </Reveal>
      </section>
    </div>
  )
}
