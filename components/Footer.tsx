import Link from 'next/link'
import { Lockup } from './Navbar'
import { CODE, SOCIALS } from '../lib/site'

// Footer after benny.gg: lockup and a one-line pitch on the left, link columns,
// and a responsible-gambling card, with the affiliate disclaimer underneath.

const PAGES = [
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/vschat', label: 'Slot Battles' },
  { href: '/wheelspin', label: 'Giveaways' },
  { href: '/shop', label: 'Shop' },
]

const COMMUNITY = [SOCIALS.kick, SOCIALS.discord, SOCIALS.x]

const columnHead = 'mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-mint'
const linkCls = 'text-sm text-muted hover:text-white transition-colors'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/[0.06] bg-ink-deep">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Lockup size="sm" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Exclusive Gamba rewards, a monthly leaderboard and stream giveaways — use code{' '}
              <span className="font-bold text-white">{CODE}</span> on Gamba.
            </p>
          </div>

          <div>
            <p className={columnHead}>Pages</p>
            <ul className="flex flex-col gap-2.5">
              {PAGES.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className={linkCls}>
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={columnHead}>Community</p>
            <ul className="flex flex-col gap-2.5">
              {COMMUNITY.map((s) => (
                <li key={s.href}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className={linkCls}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={columnHead}>Play safe</p>
            <div className="rounded-2xl border border-white/[0.07] bg-ink-raised p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-mint/40 text-[10px] text-mint">
                  18+
                </span>
                Gamble responsibly
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Only play with what you can afford to lose. If you need support, visit{' '}
                <a
                  href="https://www.gamblingtherapy.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-mint hover:underline"
                >
                  GamblingTherapy.org
                </a>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.06] pt-6 text-xs text-faint md:flex-row md:items-center md:justify-between">
          <p className="max-w-2xl leading-relaxed">
            finbuck.bet is an independent affiliate site. Gamba operates the casino, the leaderboard and all
            rewards, subject to Gamba&apos;s terms.
          </p>
          <p>© {new Date().getFullYear()} FinBuck</p>
        </div>
      </div>
    </footer>
  )
}
