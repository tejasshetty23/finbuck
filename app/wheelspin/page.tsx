import SpinWheel from '../../components/SpinWheel'
import LiveSubscriberWheel from '../../components/LiveSubscriberWheel'
import FloatingDecor from '../../components/FloatingDecor'
import NumberRoller from '../../components/NumberRoller'
import Reveal from '../../components/Reveal'

const PRIZE_DEFAULTS = ['10$', '50$ Buy In', '20$', '10$ Buy In', '50$', '20$ Buy In']

const CLAIM_STEPS = [
  {
    n: 1,
    title: 'Join the Discord',
    desc: 'Hop into the FinBuckers Discord server.',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    href: 'https://discord.com/invite/finbuckers',
  },
  {
    n: 2,
    title: 'Create a Ticket',
    desc: 'Open a support ticket in the giveaways channel.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
    href: null as string | null,
  },
  {
    n: 3,
    title: 'Claim Your Reward',
    desc: 'A mod verifies your win and hands over the prize.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
    href: null as string | null,
  },
]

export default function WheelSpinPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/background.png" alt="" className="w-full h-full object-cover object-center" style={{ filter: 'brightness(0.2) saturate(1.1)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/70 via-[#07050f]/50 to-[#07050f]" />
      </div>

      {/* Header */}
      <Reveal>
      <div className="relative max-w-4xl mx-auto mb-12 text-center">
        <FloatingDecor height="h-[280px] sm:h-[340px]" className="!top-[42%]" />
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1.5 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-purple-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 3v9l6 3" />
          </svg>
          <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Viewer Giveaway</span>
        </div>

        <h1 className="relative z-10 text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight text-white mb-4">
          Spin the <span className="animated-gradient-text">Wheel</span>
        </h1>
      </div>
      </Reveal>

      {/* Control bar + two wheels side by side */}
      <div className="w-[90%] mx-auto">
        <LiveSubscriberWheel
          numberPicker={
            <div className="w-full max-w-md mx-auto">
              <div className="rounded-2xl border border-[#00ff87]/20 bg-[#0d0a1a]/40 p-5">
                <div className="mb-4 text-center">
                  <h3 className="text-xl sm:text-2xl font-black uppercase leading-tight">
                    <span className="animated-gradient-text">Number Roller</span>
                  </h3>
                </div>
                <NumberRoller min={1} max={20} />
              </div>
            </div>
          }
          prizeWheel={
            <div className="relative rounded-2xl border border-[#00ff87]/20 bg-[#0d0a1a]/40 p-6">
              <div className="mb-8 text-center">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight"><span className="animated-gradient-text-purple">Prize Picker</span></h3>
              </div>
              <div className="w-full flex items-center justify-center">
                <div className="w-full max-w-[460px]">
                  <SpinWheel
                    defaultItems={PRIZE_DEFAULTS}
                    editLabel="Edit Prizes"
                    itemsLabel="Prizes (one per line, up to 12)"
                    emptyHint="Add at least 2 prizes to spin."
                    winWord="Prize"
                    editCorner
                  />
                </div>
              </div>
            </div>
          }
        />

        <p className="text-center text-gray-600 text-xs mt-8">
          Spin the giveaway wheel to pick a winner, then spin the prize wheel for their reward.
        </p>

        {/* How to claim — below the wheels */}
        <Reveal>
        <div className="max-w-4xl mx-auto mt-20">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[#00ff87]/40" />
            <span className="text-[#00ff87] text-xs font-bold uppercase tracking-[0.3em]">How to Claim</span>
            <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[#00ff87]/40" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-center text-white mb-12">
            Claim Your <span className="animated-gradient-text">Reward</span>
          </h2>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-2">
            {CLAIM_STEPS.map((step, i, arr) => (
              <div key={step.n} className="contents">
                <div className="flex-1 rounded-2xl border border-purple-900/40 bg-[#0d0a1a]/50 p-6 text-center flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-[#00ff87] bg-[#00ff87]/10 border border-[#00ff87]/30">
                      {step.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="text-white font-black uppercase text-sm tracking-wide mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4">{step.desc}</p>
                  {step.href && (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00ff87] hover:underline"
                    >
                      Open Discord →
                    </a>
                  )}
                </div>

                {/* Arrow between steps */}
                {i < arr.length - 1 && (
                  <div className="flex items-center justify-center text-purple-500/60 shrink-0 md:px-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-6 h-6 rotate-90 md:rotate-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      </div>
    </div>
  )
}
