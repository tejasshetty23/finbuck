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
  /** The hook, set large in the display face. Numbers mostly. */
  lead: string
  title: string
  desc: string
  href?: string
  cta?: string
  external?: boolean
  sponsored?: boolean
}

// Sign-up is deliberately not in here: it gets its own panel at the top, since
// it's the one thing every other perk depends on.
const PERKS: Perk[] = [
  { lead: '15%', title: 'Affiliate commission', desc: 'A cut of the house edge on everything wagered under the code.' },
  { lead: '100%', title: 'Rank up bonus boost', desc: 'Every level-up bonus doubled while you play under code BUCK.' },
  {
    lead: 'Exclusive',
    title: 'Stream giveaways',
    desc: 'Live draws on stream, open to anyone playing under the code.',
    href: SOCIALS.kick.href,
    cta: 'Watch live',
    external: true,
  },
  { lead: 'Exclusive', title: 'Code drops', desc: 'Bonus codes dropped in chat and on Discord, code-holders first.' },
  {
    lead: 'Discord',
    title: 'Channel access',
    desc: 'The affiliate channels: drops, giveaway tickets and the mod team.',
    href: SOCIALS.discord.href,
    cta: 'Join Discord',
    external: true,
  },
  {
    lead: 'VIP',
    title: `${PARTNER.name} VIP club`,
    desc: 'Rakeback, level-up bonuses and weekly and monthly boosts as you climb.',
    href: `${PARTNER.url}/vip-club`,
    cta: 'VIP club',
    external: true,
    sponsored: true,
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
      <div className="mx-auto mt-16 max-w-5xl">
        <Reveal>
          <p className="mx-auto flex max-w-xs items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-accent-bright">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/50" />
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="whitespace-nowrap">What you get</span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/50" />
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={(i % 3) * 80} className="h-full">
              <Panel className="h-full" innerClassName="flex h-full flex-col p-6 sm:p-7">
                {/* Index tab, like the podium's trophy tabs */}
                <span className="absolute right-5 top-5 text-[10px] font-bold uppercase tracking-[0.3em] text-faint">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-[3.2rem] leading-none text-accent-bright [text-shadow:0_0_26px_rgba(0,255,135,0.3)]">
                  {p.lead}
                </span>
                <span className="mt-4 block h-px w-10 bg-gradient-to-r from-accent to-transparent" />
                <h3 className="font-display mt-4 text-[1.7rem] leading-none text-white">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{p.desc}</p>
                {p.href && p.cta && (
                  <div className="mt-auto pt-6">
                    <Button href={p.href} external={p.external} sponsored={p.sponsored} variant="outline" size="sm">
                      {p.cta}
                    </Button>
                  </div>
                )}
              </Panel>
            </Reveal>
          ))}
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
