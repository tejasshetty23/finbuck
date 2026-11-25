import type { Metadata } from 'next'
import Button from '../../components/Button'
import MilestoneGrid from '../../components/MilestoneGrid'
import PageHeader from '../../components/PageHeader'
import Panel from '../../components/Panel'
import Reveal from '../../components/Reveal'
import { CODE, PARTNER, SIGNUP_URL, SOCIALS } from '../../lib/site'

export const metadata: Metadata = {
  title: 'Wager Milestones — FinBuck',
  description: `Hit a wager target under code ${CODE} on ${PARTNER.name} and unlock a cash reward.`,
}

const RULES = [
  { title: 'Resets every month', desc: 'Your progress starts over with each new leaderboard month.' },
  { title: 'Once per month', desc: 'Each milestone can be claimed once per month.' },
  { title: 'Claim on Discord', desc: 'Open a ticket in the FinBuckers Discord to claim your reward.' },
]

export default function MilestonesPage() {
  return (
    <div className="px-6 pb-24 pt-[72px]">
      <PageHeader eyebrow={`FinBuck × ${PARTNER.name}`} title={<>Wager <span className="text-accent-bright">milestones</span></>}>
        Hit a wager target, unlock a cash reward. The more you play, the more you earn.
      </PageHeader>

      <Reveal>
        <div className="mx-auto mt-12 max-w-5xl">
          <MilestoneGrid />
        </div>
      </Reveal>

      {/* How it works */}
      <Reveal>
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {RULES.map((r, i) => (
              <Panel key={r.title} innerClassName="flex h-full gap-4 p-5">
                <span className="font-display shrink-0 text-[2rem] leading-none text-accent-bright">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="font-display text-[1.4rem] leading-none text-white">{r.title}</h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{r.desc}</p>
                </div>
              </Panel>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={SIGNUP_URL} external sponsored className="min-w-[240px]">
              Use code {CODE} on {PARTNER.name}
            </Button>
            <Button href={SOCIALS.discord.href} external variant="outline" className="min-w-[240px]">
              Claim on Discord
            </Button>
          </div>
          <p className="mt-6 text-center text-[11px] text-faint">
            Milestones apply to wagers under code {CODE}. 18+ · Gamble responsibly ·{' '}
            <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted">
              GamblingTherapy.org
            </a>
          </p>
        </div>
      </Reveal>
    </div>
  )
}
