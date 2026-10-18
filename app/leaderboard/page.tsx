import type { Metadata } from 'next'
import Button from '../../components/Button'
import CopyButton from '../../components/CopyButton'
import CountUp from '../../components/CountUp'
import Countdown from '../../components/Countdown'
import HeadingGifts from '../../components/HeadingGifts'
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
  // Each row's bar is its wager as a share of the leader's, so the table
  // doubles as a chart of how far the field is behind.
  const topWager = competitors[0]?.wagered ?? 0
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
          style={{ background: 'radial-gradient(50% 60% at 50% 40%, rgba(0,255,135,0.12), transparent 70%)' }}
        />
        <p className="relative mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
          <span className="whitespace-nowrap">Monthly prize pool</span>
          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
        </p>
        <h1 className="font-display relative mt-6">
          <span className="relative inline-block">
          <HeadingGifts size="lg" variant={1} />
          <span className="block text-[clamp(4rem,16vw,9rem)] leading-[1] text-gold [text-shadow:0_0_40px_rgba(255,196,77,0.3)]">
            <CountUp value={race.prizePool} />
          </span>
          <span
            className="mt-1 block text-[clamp(2.75rem,11vw,6.5rem)] leading-[0.9] text-accent-bright sm:mt-2"
            style={{ textShadow: '0 0 44px rgba(0,255,135,0.35)' }}
          >
            Leaderboard
          </span>
          </span>
        </h1>
        {/* A plain paragraph, not a flex row: as flex, the copy button forced a
            wrap that stranded "Play with code BUCK" on a line of its own. */}
        <p className="relative mx-auto mt-6 max-w-xl text-sm sm:text-base leading-relaxed text-muted">
          Play with code <span className="font-bold text-accent-bright">{CODE}</span>{' '}
          <span className="inline-block align-middle -mt-1">
            <CopyButton code={CODE} />
          </span>{' '}
          on {PARTNER.name}. Every wager counts, and the top {prizes.length} split the pool when the race closes.
        </p>

        <div className="relative mt-8 flex justify-center">
          <Button href={SIGNUP_URL} external sponsored>
            Sign up with {CODE}
          </Button>
        </div>
      </section>

      {race.isSample && (
        <p className="mx-auto mb-8 flex max-w-md items-center justify-center gap-2 border border-gold/30 bg-gold/5 px-4 py-2.5 text-center text-xs text-gold" style={{ clipPath: 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)' }}>
          <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" />
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
                className="relative grid grid-cols-[2.6rem_1fr_auto_3.6rem] sm:grid-cols-[4.5rem_1fr_9rem_7rem] items-center gap-x-2 sm:gap-x-3 overflow-hidden border border-white/[0.06] bg-ink-raised px-3 sm:px-4 py-3 text-[13px] sm:text-sm transition-colors hover:bg-ink-high"
                style={{ clipPath: 'polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px)' }}
              >
                {/* Wager bar along the bottom edge */}
                {entry && topWager > 0 && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-accent/80 to-accent/20"
                    style={{ width: `${Math.max(2, (entry.wagered / topWager) * 100)}%` }}
                  />
                )}
                <span className="font-display text-[1.35rem] leading-none text-muted tabular-nums">{ordinal(position)}</span>
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
                <span className={`font-display text-right text-[1.35rem] leading-none tabular-nums ${prize === null ? 'text-faint' : 'text-accent-bright'}`}>
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
