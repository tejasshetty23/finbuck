import type { Metadata } from 'next'
import CopyButton from '../../components/CopyButton'
import Countdown from '../../components/Countdown'
import Podium from '../../components/Podium'
import Reveal from '../../components/Reveal'
import { CODE, PARTNER, SIGNUP_URL } from '../../lib/site'
import { getStandings, maskName, ordinal, prizeFor, usd } from '../../lib/leaderboard'

export const metadata: Metadata = {
  title: 'Leaderboard — FinBuck',
  description: `FinBuck's monthly ${PARTNER.name} leaderboard: standings, prizes and countdown.`,
}

// Re-read the CSV at most once a minute, so a new upload shows without a deploy.
export const revalidate = 60

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const updatedFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
  hour12: false,
})

export default async function LeaderboardPage() {
  const race = await getStandings()
  const { prizes, competitors } = race

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
          style={{ background: 'radial-gradient(50% 60% at 50% 40%, rgba(30,128,240,0.12), transparent 70%)' }}
        />
        <p className="relative text-xl sm:text-3xl font-bold">
          <span className="text-gold">{usd(race.prizePool)}</span> <span className="text-white">Monthly Prize Pool</span>
        </p>
        <h1
          className="relative mt-2 text-[clamp(2.25rem,11vw,6rem)] font-extrabold uppercase tracking-tight leading-none text-accent-bright"
          style={{ textShadow: '0 0 44px rgba(30,128,240,0.35)' }}
        >
          Leaderboard
        </h1>
        {/* A plain paragraph, not a flex row: as flex, the copy button forced a
            wrap that stranded "Play with code BUCK" on a line of its own. */}
        <p className="relative mx-auto mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-muted">
          Play with code <span className="font-bold text-accent-bright">{CODE}</span>{' '}
          <span className="inline-block align-middle -mt-1">
            <CopyButton code={CODE} />
          </span>{' '}
          on {PARTNER.name}. Every wager counts, and the top {prizes.length} split the pool when the race closes.
        </p>

        <div className="relative mt-8 flex justify-center">
          <a
            href={SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-accent transition-all hover:brightness-110 hover:shadow-accent-lg"
          >
            Sign up with {CODE}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </section>

      {race.isSample && (
        <p className="mx-auto mb-8 max-w-md rounded-xl border border-gold/30 bg-gold/5 px-4 py-2.5 text-center text-xs text-gold">
          Preview — placeholder standings until the first {PARTNER.name} race data is uploaded.
        </p>
      )}

      {/* Podium */}
      <section className="mx-auto max-w-5xl pt-8">
        <Podium entries={top3} prizes={top3Prizes} />
      </section>

      {/* Countdown — to the start while the first race is still ahead */}
      <section className="mx-auto mt-14 max-w-5xl">
        <Countdown
          endsAt={race.upcoming ? race.startsAt : race.endsAt}
          label={race.upcoming ? 'First race starts in' : 'Race ends in'}
          endedLabel={race.upcoming ? 'Race is live' : 'Race finished'}
        />
      </section>

      {/* Standings table */}
      <section className="mx-auto mt-14 max-w-4xl">
        <Reveal>
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
                <span className={`text-right font-bold tabular-nums ${prize === null ? 'text-faint' : 'text-accent-bright'}`}>
                  {prize === null ? '—' : usd(prize)}
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-center text-xs text-faint">
            {dateFmt.format(race.startsAt)} – {dateFmt.format(race.endsAt)} (UTC)
            {race.updatedAt !== null && !race.isSample && <> · Updated {updatedFmt.format(race.updatedAt)} UTC</>}
            {' · '}Wagers as reported by {PARTNER.name}.
          </p>
        </Reveal>
      </section>
    </div>
  )
}
