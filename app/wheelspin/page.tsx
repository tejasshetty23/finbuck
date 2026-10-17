import { Suspense } from 'react'
import Button from '../../components/Button'
import LiveSubscriberWheel from '../../components/LiveSubscriberWheel'
import NumberRoller from '../../components/NumberRoller'
import Panel from '../../components/Panel'
import Reveal from '../../components/Reveal'
import SectionHeading from '../../components/SectionHeading'
import SpinWheel from '../../components/SpinWheel'
import { SOCIALS } from '../../lib/site'
import { getStandings, prizeFor } from '../../lib/leaderboard'

// The number roller shows who holds the drawn place on the leaderboard, so
// re-read the race CSV at most once a minute, like the leaderboard itself.
export const revalidate = 60

const PRIZE_DEFAULTS = ['10$', '50$ Buy In', '20$', '10$ Buy In', '50$', '20$ Buy In']

const CLAIM_STEPS = [
  {
    n: 1,
    title: 'Join the Discord',
    desc: 'Hop into the FinBuckers Discord server.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    href: SOCIALS.discord.href as string | null,
  },
  {
    n: 2,
    title: 'Create a ticket',
    desc: 'Open a support ticket in the giveaways channel.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
    href: null as string | null,
  },
  {
    n: 3,
    title: 'Claim your reward',
    desc: 'A mod verifies your win and hands over the prize.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    href: null as string | null,
  },
]

const smallCut = 'polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px)'

export default async function WheelSpinPage() {
  const race = await getStandings()
  // Full usernames, unmasked: the roller is a stream tool and the drawn
  // place's holder is read out on air. (The leaderboard page still masks.)
  const places = race.competitors.map((c) => ({
    position: c.position,
    name: c.name,
    wagered: c.wagered,
    prize: prizeFor(race.prizes, c.position),
  }))
  return (
    <div className="px-6 pb-24 pt-[72px]">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={null}>
          <LiveSubscriberWheel
            numberPicker={
              <div className="mx-auto w-full max-w-2xl">
                <Panel tone="accent" innerClassName="p-7 sm:p-10">
                  <NumberRoller min={1} max={race.prizes.length} places={places} paidPlaces={race.prizes.length} />
                </Panel>
              </div>
            }
            prizeWheel={
              <Panel innerClassName="relative p-6 sm:p-8">
                <div className="flex w-full items-center justify-center">
                  <div className="w-full max-w-[460px]">
                    <SpinWheel
                      defaultItems={PRIZE_DEFAULTS}
                      editLabel="Edit prizes"
                      itemsLabel="Prizes (one per line, up to 12)"
                      emptyHint="Add at least 2 prizes to spin."
                      winWord="Prize"
                      editCorner
                    />
                  </div>
                </div>
              </Panel>
            }
          />
        </Suspense>

        <p className="mt-6 text-center text-xs text-faint">
          Pick a winner with the giveaway roller, then spin the prize wheel for their reward.
        </p>

        {/* How to claim */}
        <Reveal>
          <div className="mx-auto mt-24 max-w-4xl">
            <SectionHeading eyebrow="How to claim" title={<>Claim your <span className="text-accent-bright">reward</span></>} className="mb-10" />

            <div className="grid gap-4 md:grid-cols-3">
              {CLAIM_STEPS.map((step) => (
                <Panel key={step.n} innerClassName="flex h-full flex-col items-center p-6 text-center">
                  <div className="relative">
                    <span className="flex h-14 w-14 items-center justify-center bg-[#0B0E2A] text-accent-bright" style={{ clipPath: smallCut }}>
                      {step.icon}
                    </span>
                    <span className="font-display absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center bg-accent text-[1rem] leading-none text-[#0B0E2A]" style={{ clipPath: smallCut }}>
                      {step.n}
                    </span>
                  </div>
                  <h3 className="font-display mt-5 text-[1.6rem] leading-none text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.desc}</p>
                  {step.href && (
                    <div className="mt-auto pt-5">
                      <Button href={step.href} external variant="outline" size="sm">
                        Open Discord
                      </Button>
                    </div>
                  )}
                </Panel>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
