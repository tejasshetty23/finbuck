import Image from 'next/image'
import Link from 'next/link'
import CopyButton from '../components/CopyButton'
import Reveal from '../components/Reveal'
import HeroDecor from '../components/HeroDecor'
import Podium from '../components/Podium'
import SectionHeading from '../components/SectionHeading'
import { CODE, SIGNUP_URL, SOCIALS } from '../lib/site'
import { FALLBACK_POOL, FALLBACK_PRIZES, getRace, prizeFor, usd } from '../lib/gamba'

// Layout after benny.gg (centred sections, each opened by a small mint label),
// colours after arjhatescash.com (slate ground, mint accent). The standings are
// live from Gamba; see lib/gamba.ts for where they come from and what happens
// when they can't be fetched.

// Matches lib/gamba's fetch cache: the page is rebuilt at most once a minute.
export const revalidate = 60

const SOCIAL_CARDS = [
  {
    ...SOCIALS.kick,
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/kick-logo.webp" alt="" className="h-5 w-5 object-contain" />
    ),
  },
  {
    ...SOCIALS.x,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    ...SOCIALS.discord,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-[#8b9cff]">
        <path d="M20.3 4.4A19.8 19.8 0 0015.4 3l-.6 1.3a18.3 18.3 0 00-5.5 0L8.7 3a19.7 19.7 0 00-4.9 1.4C.6 9-.3 13.6.1 18.1a19.9 19.9 0 006 3l1.2-2a13 13 0 01-1.9-.9l.4-.3a14.2 14.2 0 0012.1 0l.4.3c-.6.4-1.2.7-1.9.9l1.2 2a19.8 19.8 0 006-3c.5-5.2-.8-9.7-3.5-13.7zM8 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z" />
      </svg>
    ),
  },
]

const arrowUpRight = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
  </svg>
)

export default async function Home() {
  const race = await getRace()
  const pool = race?.prizePool ?? FALLBACK_POOL
  const prizes = race?.prizes.length ? race.prizes : FALLBACK_PRIZES
  const top3 = [1, 2, 3].map((p) => race?.competitors.find((c) => c.position === p) ?? null)
  const top3Prizes = [1, 2, 3].map((p) => prizeFor(prizes, p))
  const paidPlaces = prizes.length

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-[72px]">
        {/* A lighter slate band at the top fading into the page, with a mint
            bloom behind the headline. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 45% at 50% 38%, rgba(92,255,193,0.10) 0%, transparent 70%), linear-gradient(180deg, #232738 0%, #1B1D29 100%)',
          }}
        />
        <HeroDecor />

        <div className="relative z-10 mx-auto flex min-h-[600px] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center md:min-h-[680px]">
          <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.32em] text-muted">
            <span className="h-px w-8 bg-white/15" />
            Official partner
            <Image src="/gamba-logo.png" alt="Gamba" width={600} height={208} className="h-4 w-auto" />
            <span className="h-px w-8 bg-white/15" />
          </div>

          <h1 className="mt-7 font-extrabold uppercase leading-[0.95] tracking-tight">
            <span className="block text-5xl sm:text-7xl md:text-8xl text-white">FinBucks</span>
            <span
              className="block text-5xl sm:text-7xl md:text-8xl text-mint"
              style={{ textShadow: '0 0 40px rgba(92,255,193,0.35)' }}
            >
              Rewards
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base sm:text-lg leading-relaxed text-muted">
            Climb the monthly leaderboard, win stream giveaways and unlock exclusive rewards. Use code{' '}
            <span className="font-bold text-mint">{CODE}</span> on Gamba.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={SOCIALS.kick.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-mint px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-ink-deep shadow-mint transition-all hover:brightness-110 hover:shadow-mint-lg"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink-deep opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-ink-deep" />
              </span>
              Watch Live
            </a>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2.5 rounded-xl border border-white/15 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-mint/60 hover:text-mint"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
                <path d="M9 21V10h6v11M3 21v-6h6M15 21v-8h6v8M2 21h20" />
              </svg>
              Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── SPONSOR ── */}
      <section className="px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-6xl">
            <SectionHeading eyebrow="Official sponsor" title="Play on Gamba" className="mb-10" />

            <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
              {/* Mint banner, after arj's "Play with code" card */}
              <div className="relative overflow-hidden rounded-3xl bg-mint p-8 sm:p-10 text-ink-deep">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{ background: 'radial-gradient(80% 90% at 85% 50%, rgba(255,255,255,0.45), transparent 60%)' }}
                />
                <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto]">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-deep px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-mint">
                      FinBuck × Gamba
                    </span>
                    <h3 className="mt-4 text-4xl sm:text-5xl font-extrabold uppercase leading-[0.95] tracking-tight">
                      Play with
                      <br />
                      code {CODE}
                    </h3>
                    <p className="mt-4 max-w-sm text-sm font-semibold uppercase tracking-wide text-ink-deep/75">
                      Every wager counts toward FinBuck&apos;s monthly leaderboard.
                    </p>
                    <a
                      href={SIGNUP_URL}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink-deep px-6 py-3 text-sm font-bold uppercase tracking-wider text-mint transition-transform hover:scale-[1.03]"
                    >
                      Sign up now
                      {arrowUpRight}
                    </a>
                  </div>

                  {/* The code as a tilted tile */}
                  <div className="hidden sm:flex h-40 w-40 rotate-[8deg] flex-col items-center justify-center rounded-[28px] bg-ink-deep shadow-[0_24px_50px_rgba(21,23,31,0.45)]">
                    <span className="text-4xl font-extrabold tracking-tight text-mint [text-shadow:0_0_20px_rgba(92,255,193,0.5)]">
                      {CODE}
                    </span>
                    <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Code</span>
                  </div>
                </div>
              </div>

              {/* Code card */}
              <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/[0.07] bg-ink-raised p-8 sm:p-10">
                <div>
                  <Image src="/gamba-logo.png" alt="Gamba" width={600} height={208} className="h-8 w-auto" />
                  <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                    The platform behind the big wins.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-mint/25 bg-ink-deep px-5 py-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-faint">Use code</p>
                    <p className="text-3xl font-extrabold tracking-wide text-mint">{CODE}</p>
                  </div>
                  <CopyButton code={CODE} />
                </div>

                <div>
                  <a
                    href={SIGNUP_URL}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-mint/40 px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-mint transition-colors hover:bg-mint hover:text-ink-deep"
                  >
                    Play on Gamba.com
                    {arrowUpRight}
                  </a>
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
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── LEADERBOARD ── */}
      <section className="px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-5xl">
            <SectionHeading
              eyebrow={race ? 'Live race' : 'Monthly race'}
              title={
                <>
                  <span className="block text-5xl sm:text-7xl text-mint [text-shadow:0_0_36px_rgba(92,255,193,0.3)]">
                    {usd(pool)}
                  </span>
                  <span className="block text-white">Leaderboard</span>
                </>
              }
              className="mb-16"
            >
              Wager under code {CODE} on Gamba to climb the ranks. The top {paidPlaces} split the pool when the race
              closes.
            </SectionHeading>

            <Podium entries={top3} prizes={top3Prizes} />

            <div className="mt-12 text-center">
              <Link
                href="/leaderboard"
                className="inline-flex items-center gap-2 rounded-xl bg-mint px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-ink-deep shadow-mint transition-all hover:brightness-110 hover:shadow-mint-lg"
              >
                View full leaderboard
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── SOCIALS ── */}
      <section className="px-6 py-20">
        <Reveal>
          <div className="mx-auto max-w-4xl">
            <SectionHeading eyebrow="Stay connected" title="Follow FinBuck" className="mb-10">
              Stream alerts, giveaways and leaderboard updates.
            </SectionHeading>

            <div className="grid gap-3 sm:grid-cols-3">
              {SOCIAL_CARDS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-ink-raised p-4 transition-colors hover:border-mint/40 hover:bg-ink-high"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-deep">
                    {s.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">{s.label}</span>
                    <span className="block truncate text-xs text-muted">{s.handle}</span>
                  </span>
                  <span className="ml-auto text-faint transition-colors group-hover:text-mint">{arrowUpRight}</span>
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
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-raised p-8 sm:p-12 text-center">
              <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-mint to-transparent" />
              <div className="absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-mint/10 blur-3xl" />

              <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-deep text-mint">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
                  <path d="M12 2l9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10" />
                </svg>
              </span>

              <h2 className="relative mt-5 text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
                Rewards &amp; <span className="text-mint">Perks</span>
              </h2>
              <p className="relative mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed text-muted">
                Affiliate commission, rank up boosts, exclusive giveaways and drops, and the {usd(FALLBACK_POOL)} monthly
                leaderboard — everything you unlock playing under code {CODE}.
              </p>
              <Link
                href="/rewards"
                className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-mint px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-ink-deep shadow-mint transition-all hover:brightness-110 hover:shadow-mint-lg"
              >
                View rewards
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
