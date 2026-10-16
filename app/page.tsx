import Button from '../components/Button'
import CopyButton from '../components/CopyButton'
import CountUp from '../components/CountUp'
import Panel from '../components/Panel'
import Podium from '../components/Podium'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import Ticker from '../components/Ticker'
import { PartnerWordmark } from '../components/PartnerLogo'
import { CODE, PARTNER, RACE, SIGNUP_URL, SOCIALS } from '../lib/site'
import { getStandings, prizeFor, usd } from '../lib/leaderboard'

// The homepage. One geometry (45° cut corners) across panels, buttons, tiles
// and the podium; Big Shoulders Display for anything that shouts, Inter for
// anything you read; glow reserved for the prize. Standings come from the
// race CSV — see lib/leaderboard.ts.

// Re-read the CSV at most once a minute, so a new upload shows without a deploy.
export const revalidate = 60

const CUT = 18
const chamfer = `polygon(${CUT}px 0, 100% 0, 100% calc(100% - ${CUT}px), calc(100% - ${CUT}px) 100%, 0 100%, 0 ${CUT}px)`
const smallCut = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'

const kickMark = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
    <path d="M4 3h5v5h2V6h2V4h2V3h5v6h-2v2h-2v2h2v2h2v6h-5v-1h-2v-2h-2v-2H9v5H4z" />
  </svg>
)

const SOCIAL_CARDS = [
  {
    ...SOCIALS.kick,
    blurb: 'Streams, giveaways, battles',
    color: '#53FC18',
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/kick-logo.webp" alt="" className="h-6 w-6 object-contain" />
    ),
  },
  {
    ...SOCIALS.discord,
    blurb: 'The FinBuckers community',
    color: '#8B9CFF',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#8b9cff]" aria-hidden>
        <path d="M20.3 4.4A19.8 19.8 0 0015.4 3l-.6 1.3a18.3 18.3 0 00-5.5 0L8.7 3a19.7 19.7 0 00-4.9 1.4C.6 9-.3 13.6.1 18.1a19.9 19.9 0 006 3l1.2-2a13 13 0 01-1.9-.9l.4-.3a14.2 14.2 0 0012.1 0l.4.3c-.6.4-1.2.7-1.9.9l1.2 2a19.8 19.8 0 006-3c.5-5.2-.8-9.7-3.5-13.7zM8 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z" />
      </svg>
    ),
  },
  {
    ...SOCIALS.x,
    blurb: 'Announcements and drops',
    color: '#FFFFFF',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

export default async function Home() {
  const race = await getStandings()
  const top3 = [1, 2, 3].map((p) => race.competitors.find((c) => c.position === p) ?? null)
  const top3Prizes = [1, 2, 3].map((p) => prizeFor(race.prizes, p))

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-[72px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 50% 40%, rgba(0,255,135,0.11) 0%, transparent 70%), linear-gradient(180deg, rgba(24,30,72,0.6) 0%, rgba(11,14,42,0) 100%)',
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-[540px] max-w-5xl flex-col items-center justify-center px-6 py-20 text-center md:min-h-[600px]">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.32em] text-muted">
            <span className="h-px w-8 bg-white/15" />
            Official partner
            <PartnerWordmark className="h-6" />
            <span className="h-px w-8 bg-white/15" />
          </div>

          {/* The headline scales with the viewport up to a capped size:
              FINBUCKS leads, REWARDS sits a step down. Both are green with a faint
              outlined copy offset behind, for a printed, double-struck depth. */}
          <h1 className="font-display mt-5 leading-[0.86]">
            <span className="relative block text-[clamp(4rem,15vw,8.5rem)] text-accent-bright [text-shadow:0_0_32px_rgba(0,255,135,0.32)]">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 translate-x-[0.04em] translate-y-[0.06em] text-transparent"
                style={{ WebkitTextStroke: '1.5px rgba(0,255,135,0.35)' }}
              >
                FinBucks
              </span>
              <span className="relative">FinBucks</span>
            </span>
            <span className="relative block text-[clamp(2.6rem,9.5vw,5.5rem)] text-accent-bright [text-shadow:0_0_32px_rgba(0,255,135,0.32)]">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 translate-x-[0.04em] translate-y-[0.06em] text-transparent"
                style={{ WebkitTextStroke: '1.5px rgba(0,255,135,0.35)' }}
              >
                Rewards
              </span>
              <span className="relative">Rewards</span>
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Climb the monthly leaderboard, win stream giveaways and unlock exclusive rewards. Use code{' '}
            <span className="font-bold text-accent-bright">{CODE}</span> on {PARTNER.name}.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button href={SOCIALS.kick.href} external icon={kickMark}>
              Watch live
            </Button>
            <Button href="/leaderboard" variant="ghost">
              Leaderboard
            </Button>
          </div>
        </div>
      </section>

      <Ticker
        items={[
          <>
            <b className="text-white">{usd(RACE.prizePool)}</b> monthly prize pool
          </>,
          <>
            Top <b className="text-white">{RACE.split.length}</b> places paid
          </>,
          <>
            Use code <b className="text-accent-bright">{CODE}</b> on {PARTNER.name}
          </>,
          <>Race resets on the 25th</>,
          <>Live giveaways on stream</>,
        ]}
      />

      {/* ── SPONSOR ── */}
      <section className="px-6 pt-24 pb-20">
        <Reveal>
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Exclusive code" title={`Play on ${PARTNER.name}`} className="mb-12" />

            <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
              {/* Green banner, after arj's "Play with code" card */}
              <div
                className="relative overflow-hidden p-8 text-[#0B0E2A] sm:p-10"
                style={{
                  clipPath: chamfer,
                  background: 'linear-gradient(135deg, #3DFFA4 0%, #00FF87 45%, #00D973 100%)',
                }}
              >
                {/* Diagonal stripes, like the security lines on a printed voucher */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(135deg, transparent 0 14px, rgba(11,14,42,0.6) 14px 15px)',
                  }}
                />
                <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto]">
                  <div>
                    <span className="inline-flex items-center gap-2 bg-[#0B0E2A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-bright">
                      <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
                      FinBuck × {PARTNER.name}
                    </span>
                    <h3 className="font-display mt-5 text-[3.4rem] leading-[0.88] sm:text-[4.2rem]">
                      Play with
                      <br />
                      code {CODE}
                    </h3>
                    <p className="mt-4 max-w-sm text-[13px] font-semibold uppercase tracking-[0.08em] text-[#0B0E2A]/70">
                      Every wager counts toward FinBuck&apos;s monthly leaderboard.
                    </p>
                    <Button href={SIGNUP_URL} external sponsored variant="dark" className="mt-7">
                      Sign up now
                    </Button>
                  </div>

                  {/* The code as a chip: a cut-corner tile with a glossy top */}
                  <div
                    className="relative hidden h-44 w-44 rotate-[8deg] flex-col items-center justify-center bg-[#0B0E2A] shadow-[0_30px_60px_rgba(11,14,42,0.45)] sm:flex"
                    style={{ clipPath: chamfer }}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1/2"
                      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)' }}
                    />
                    <span className="font-display relative text-[3.2rem] leading-none text-accent-bright [text-shadow:0_0_22px_rgba(0,255,135,0.5)]">
                      {CODE}
                    </span>
                    <span className="relative mt-2 text-[10px] font-bold uppercase tracking-[0.34em] text-muted">Code</span>
                  </div>
                </div>
              </div>

              {/* Code panel */}
              <Panel tone="accent" innerClassName="flex flex-col justify-between gap-7 p-8 sm:p-9">
                <div>
                  <PartnerWordmark className="h-12" />
                  <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.18em] text-muted">
                    The platform behind the big wins.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 bg-[#0B0E2A] px-5 py-4" style={{ clipPath: smallCut }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-faint">Use code</p>
                    <p className="font-display text-[2.6rem] leading-none text-accent-bright">{CODE}</p>
                  </div>
                  <CopyButton code={CODE} />
                </div>

                <div>
                  <Button href={SIGNUP_URL} external sponsored variant="ghost" className="w-full">
                    Play on {PARTNER.name}.com
                  </Button>
                  <p className="mt-4 text-center text-[11px] leading-relaxed text-faint">
                    18+ · Gamble responsibly · Support at{' '}
                    <a
                      href="https://www.gamblingtherapy.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-muted"
                    >
                      GamblingTherapy.org
                    </a>
                  </p>
                </div>
              </Panel>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── LEADERBOARD ── */}
      <section className="px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow={race.upcoming ? 'First race starts 25 October' : 'Live race'}
              title={
                <>
                  <span className="block text-[4.5rem] text-accent-bright [text-shadow:0_0_36px_rgba(0,255,135,0.3)] sm:text-[8rem]">
                    <CountUp value={race.prizePool} />
                  </span>
                  <span className="block text-white">Leaderboard</span>
                </>
              }
              className="mb-16"
            >
              Wager under code {CODE} on {PARTNER.name} to climb the ranks. The top {race.prizes.length} split the pool
              when the race closes.
            </SectionHeading>

            <Podium entries={top3} prizes={top3Prizes} />

            <div className="mt-12 text-center">
              <Button href="/leaderboard">View full leaderboard</Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── SOCIALS ── */}
      <section className="px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <SectionHeading eyebrow="Stay connected" title="Follow FinBuck" className="mb-10">
              Stream alerts, giveaways and leaderboard updates.
            </SectionHeading>

            <div className="grid gap-4 sm:grid-cols-3">
              {SOCIAL_CARDS.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="group block">
                  <Panel innerClassName="flex h-full items-center gap-4 p-5">
                    {/* Brand-coloured edge */}
                    <span aria-hidden className="absolute inset-y-4 left-0 w-[3px]" style={{ background: s.color }} />
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#0B0E2A]" style={{ clipPath: smallCut }}>
                      {s.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="font-display block text-[1.6rem] leading-none text-white">{s.label}</span>
                      <span className="mt-1 block truncate text-xs text-muted">{s.blurb}</span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.2}
                      className="ml-auto h-4 w-4 shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-bright"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </Panel>
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── REWARDS CTA ── */}
      <section className="px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-3xl">
            <Panel tone="accent" innerClassName="p-8 text-center sm:p-12">
              <span className="mx-auto flex h-14 w-14 items-center justify-center bg-[#0B0E2A] text-accent-bright" style={{ clipPath: smallCut }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden>
                  <path d="M12 2l9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10" />
                </svg>
              </span>

              <h2 className="font-display mt-5 text-[3rem] leading-[0.9] sm:text-[4rem]">
                Rewards <span className="text-accent-bright">&amp; perks</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted sm:text-base">
                Affiliate commission, rank up boosts, exclusive giveaways and drops, and the {usd(race.prizePool)} monthly
                leaderboard — everything you unlock playing under code {CODE}.
              </p>
              <Button href="/rewards" className="mt-8">
                View rewards
              </Button>
            </Panel>
          </div>
        </Reveal>
      </section>
    </>
  )
}
