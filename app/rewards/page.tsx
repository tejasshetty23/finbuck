import type { Metadata } from 'next'
import Button from '../../components/Button'
import CopyButton from '../../components/CopyButton'
import CountUp from '../../components/CountUp'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import Reveal from '../../components/Reveal'
import { PartnerWordmark } from '../../components/PartnerLogo'
import { CODE, PARTNER, RACE, SIGNUP_URL, SOCIALS } from '../../lib/site'
import { usd } from '../../lib/leaderboard'

export const metadata: Metadata = {
  title: 'Rewards — FinBuck',
  description: `Everything you unlock playing under code ${CODE} on ${PARTNER.name}.`,
}

type Perk = {
  /** Small chip above the number: who it's for, or how often. */
  tag: string
  /** The hook, set large in the display face. */
  lead: string
  title: string
  desc: string
  /** Three short steps, shown as a checklist. */
  steps: [string, string, string]
  /** The claim button. Without an href it goes to the sign-up link. */
  cta?: string
  href?: string
  sponsored?: boolean
  /** Gold instead of green, to alternate across the grid. */
  gold?: boolean
  /** The ribbon in the corner. One card at most. */
  ribbon?: string
}

// Sign-up is deliberately not in here: it gets its own panel at the top, since
// it's the one thing every other perk depends on. Every claim button that
// isn't a link elsewhere goes to the sign-up with code BUCK.
const PERKS: Perk[] = [
  {
    tag: 'Every wager',
    lead: '15%',
    title: 'Affiliate commission',
    desc: 'A cut of the house edge on everything you wager under code BUCK, on top of what Stake already gives back.',
    steps: [`Sign up with code ${CODE}`, 'Play on Stake as usual', 'Commission builds as you wager'],
  },
  {
    tag: 'Every rank-up',
    lead: '100%',
    title: 'Rank up bonus boost',
    desc: 'Every level-up bonus Stake pays you is doubled while you play under code BUCK.',
    steps: [`Play under code ${CODE}`, "Climb Stake's VIP ranks", 'Each rank-up bonus doubled'],
    gold: true,
    ribbon: 'Top perk',
  },
  {
    tag: 'Live on Kick',
    lead: 'Exclusive',
    title: 'Stream giveaways',
    desc: 'Live draws on stream, open to anyone playing under the code. Type the keyword in chat to enter.',
    steps: [`Play under code ${CODE}`, 'Join the stream on Kick', 'Type the keyword to enter'],
    cta: 'Watch live',
    href: SOCIALS.kick.href,
  },
  {
    tag: 'Chat & Discord',
    lead: 'Exclusive',
    title: 'Code drops',
    desc: 'Bonus codes dropped in chat and on Discord, with code-holders first in line.',
    steps: [`Play under code ${CODE}`, 'Watch chat and Discord', 'Redeem before it runs out'],
    gold: true,
  },
  {
    tag: 'Community',
    lead: 'Discord',
    title: 'Channel access',
    desc: 'The affiliate channels on the FinBuckers Discord: drops, giveaway tickets and the mod team.',
    steps: [`Sign up with code ${CODE}`, 'Join the FinBuckers Discord', 'Unlock the affiliate channels'],
    cta: 'Join Discord',
    href: SOCIALS.discord.href,
  },
  {
    tag: 'Every week',
    lead: 'VIP',
    title: `${PARTNER.name} VIP club`,
    desc: 'Rakeback, level-up bonuses and weekly and monthly boosts that grow as you climb.',
    steps: [`Play under code ${CODE}`, "Rise through Stake's VIP tiers", 'Collect rakeback and boosts'],
    cta: 'VIP club',
    href: `${PARTNER.url}/vip-club`,
    sponsored: true,
    gold: true,
  },
]

const smallCut = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'

export default function RewardsPage() {
  return (
    <div className="px-6 pb-24 pt-[72px]">
      <PageHeader eyebrow={`FinBuck × ${PARTNER.name}`} title={<>Rewards <span className="text-accent-bright">&amp; perks</span></>}>
        Everything you unlock playing under code {CODE}: the monthly leaderboard, affiliate commission, boosted
        bonuses and the stream giveaways.
      </PageHeader>

      {/* The two calls to action share a row: the headline prize and the
          sign-up. Everything below depends on one of these two. */}
      <Reveal>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
          <Panel tone="gold" innerClassName="flex flex-col items-center p-8 text-center sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Headline prize</p>
            <p className="font-display mt-3 text-[clamp(3.5rem,9vw,5.5rem)] leading-none text-gold [text-shadow:0_0_36px_rgba(255,200,61,0.3)]">
              <CountUp value={RACE.prizePool} />
            </p>
            <h2 className="font-display mt-3 text-[2rem] leading-none text-white">Monthly leaderboard</h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Wager under code {CODE} and climb the board. Top {RACE.split.length} paid, every month.
            </p>
            <Button href="/leaderboard" variant="ghost" className="mt-7">
              View leaderboard
            </Button>
          </Panel>

          <Panel tone="accent" innerClassName="flex flex-col justify-between gap-7 p-8 sm:p-10">
            <div>
              <PartnerWordmark className="h-10" />
              <h2 className="font-display mt-5 text-[2.4rem] leading-[0.9] text-white">
                Ready to <span className="text-accent-bright">start?</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Sign up under code {CODE} on {PARTNER.name} to unlock all of it.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#0B0E2A] px-5 py-4" style={{ clipPath: smallCut }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-faint">Use code</p>
                <p className="font-display text-[2.4rem] leading-none text-accent-bright">{CODE}</p>
              </div>
              <CopyButton code={CODE} />
            </div>

            <Button href={SIGNUP_URL} external sponsored className="w-full">
              Sign up on {PARTNER.name}
            </Button>
          </Panel>
        </div>
      </Reveal>

      {/* The perks */}
      <div className="mx-auto mt-20 max-w-6xl">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-[clamp(2.8rem,7vw,4.5rem)] leading-[0.9] text-white">
                Perks that <span className="text-accent-bright">pay out</span>
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
                Stacked on top of {PARTNER.name}&apos;s own rewards, only for players under code {CODE}.
              </p>
            </div>
            <a
              href="/leaderboard"
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-accent-bright transition-colors hover:text-white"
            >
              View leaderboard
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((p, i) => {
            const c = p.gold
              ? { text: 'text-gold', chip: 'bg-gold/[0.12] text-gold', tick: 'bg-gold/[0.14] text-gold', glow: 'rgba(255,200,61,0.10)', ribbon: '#FFC83D' }
              : { text: 'text-accent-bright', chip: 'bg-accent/[0.12] text-accent-bright', tick: 'bg-accent/[0.14] text-accent-bright', glow: 'rgba(0,255,135,0.09)', ribbon: '#00FF87' }
            return (
              <Reveal key={p.title} delay={(i % 3) * 80} className="h-full">
                <Panel tone={p.ribbon ? (p.gold ? 'gold' : 'accent') : 'default'} className="h-full" innerClassName="flex h-full flex-col p-7 sm:p-8">
                  {/* A soft wash of the card's colour from the top */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ background: `radial-gradient(90% 55% at 30% 0%, ${c.glow}, transparent 70%)` }}
                  />

                  {p.ribbon && (
                    <span
                      className="absolute right-0 top-0 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0B0E2A]"
                      style={{ background: c.ribbon, clipPath: 'polygon(10px 0,100% 0,100% 100%,0 100%,0 100%)' }}
                    >
                      {p.ribbon}
                    </span>
                  )}

                  <div className="relative flex h-full flex-col">
                    <span className={`self-start px-3 py-1 text-[12px] font-bold ${c.chip}`} style={{ clipPath: smallCut }}>
                      {p.tag}
                    </span>

                    <span className={`font-display mt-6 text-[3.6rem] leading-none ${c.text}`}>{p.lead}</span>
                    <h3 className="font-display mt-2 text-[2rem] leading-none text-white">{p.title}</h3>
                    <p className="mt-4 text-[15px] leading-relaxed text-muted">{p.desc}</p>

                    <ul className="mt-6 space-y-3.5">
                      {p.steps.map((s) => (
                        <li key={s} className="flex items-center gap-3 text-[15px] text-white">
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${c.tick}`}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3 w-3" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      <Button
                        href={p.href ?? SIGNUP_URL}
                        external
                        sponsored={p.href ? p.sponsored : true}
                        variant={p.gold ? 'gold' : 'primary'}
                        className="w-full [&>svg:last-child]:hidden"
                      >
                        {p.cta ?? 'Claim now'}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-[18px] w-[18px]" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </Panel>
              </Reveal>
            )
          })}
        </div>
      </div>

      {/* Closing line */}
      <Reveal>
        <p className="mx-auto mt-14 max-w-md text-center text-[12px] leading-relaxed text-faint">
          Perks apply to accounts registered under code {CODE}. The {usd(RACE.prizePool)} leaderboard resets on the{' '}
          {RACE.dayOfMonth}th of every month. 18+ · Gamble responsibly.
        </p>
      </Reveal>
    </div>
  )
}
