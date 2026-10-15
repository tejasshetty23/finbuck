'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PartnerWordmark } from './PartnerLogo'
import { CODE, PARTNER, SIGNUP_URL, SOCIALS } from '../lib/site'

// Header modelled on the YUNGREAL × Gamdom bar: a two-tone wordmark with the
// partner logo, uppercase items that each carry a line icon (the current page
// white with an accent icon, the rest grey), and the code as an accent button.

type Child = { href: string; label: string; icon: ReactNode; external?: boolean }
type NavLink = { href: string; label: string; icon: ReactNode }
type NavGroup = { label: string; icon: ReactNode; children: Child[] }
type NavItem = NavLink | NavGroup

function isGroup(item: NavItem): item is NavGroup {
  return 'children' in item
}

const svg = (d: ReactNode, cls = 'w-[18px] h-[18px]') => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={cls}>
    {d}
  </svg>
)

const icons = {
  podium: svg(<path d="M9 21V10h6v11M3 21v-6h6M15 21v-8h6v8M2 21h20M12 3l1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 9l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z" />),
  cube: svg(<path d="M12 2l9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10" />),
  dice: svg(<><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8.5" cy="8.5" r="1" fill="currentColor" /><circle cx="15.5" cy="15.5" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>),
  ticket: svg(<path d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />),
  bag: svg(<path d="M6 7h12l1 14H5L6 7zM9 7V6a3 3 0 016 0v1" />),
  people: svg(<path d="M16 19v-1.5A3.5 3.5 0 0012.5 14h-5A3.5 3.5 0 004 17.5V19M10 10.5a3 3 0 100-6 3 3 0 000 6zM20 19v-1.5a3.5 3.5 0 00-2.5-3.35M15.5 4.6a3 3 0 010 5.8" />),
  trophy: svg(<path d="M8 21h8m-4 0v-4m-7-13h14v3a7 7 0 01-14 0V4zm14 1h2.5a2.5 2.5 0 01-2.5 4.5M5 5H2.5A2.5 2.5 0 005 9.5" />),
  swords: svg(<path d="M14.5 14.5L20 20m0-16l-9 9m-1.5 1.5L4 20m3-6L3 4l4 1 10 10m0 0l1 4-4-1" />),
  gift: svg(<path d="M12 8v13m0-13a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 114-4 4 4 0 01-4 4zM4 12h16M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />),
  hash: svg(<path d="M5 9h14M5 15h14M10 3L8 21M16 3l-2 18" />),
  kick: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M4 3h5v5h2V6h2V4h2V3h5v6h-2v2h-2v2h2v2h2v6h-5v-1h-2v-2h-2v-2H9v5H4z" />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M20.3 4.4A19.8 19.8 0 0015.4 3l-.6 1.3a18.3 18.3 0 00-5.5 0L8.7 3a19.7 19.7 0 00-4.9 1.4C.6 9-.3 13.6.1 18.1a19.9 19.9 0 006 3l1.2-2a13 13 0 01-1.9-.9l.4-.3a14.2 14.2 0 0012.1 0l.4.3c-.6.4-1.2.7-1.9.9l1.2 2a19.8 19.8 0 006-3c.5-5.2-.8-9.7-3.5-13.7zM8 15.3c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4zm8 0c-1.2 0-2.2-1.1-2.2-2.4s1-2.4 2.2-2.4 2.2 1.1 2.2 2.4-1 2.4-2.2 2.4z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[16px] h-[16px]">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

const NAV_ITEMS: NavItem[] = [
  { href: '/leaderboard', label: 'Leaderboard', icon: icons.podium },
  { href: '/rewards', label: 'Rewards', icon: icons.cube },
  {
    label: 'Games',
    icon: icons.dice,
    children: [
      { href: '/tournaments', label: 'Tournaments', icon: icons.trophy },
      { href: '/vschat', label: 'Slot Battles', icon: icons.swords },
    ],
  },
  {
    label: 'Giveaways',
    icon: icons.ticket,
    children: [
      { href: '/wheelspin?picker=giveaway', label: 'Giveaway Picker', icon: icons.ticket },
      { href: '/wheelspin?picker=prize', label: 'Prize Picker', icon: icons.gift },
      { href: '/wheelspin?picker=number', label: 'Number Roller', icon: icons.hash },
    ],
  },
  { href: '/shop', label: 'Shop', icon: icons.bag },
  {
    label: 'Community',
    icon: icons.people,
    children: [
      { href: SOCIALS.kick.href, label: 'Kick', icon: icons.kick, external: true },
      { href: SOCIALS.discord.href, label: 'Discord', icon: icons.discord, external: true },
      { href: SOCIALS.x.href, label: 'X', icon: icons.x, external: true },
    ],
  },
]

const chevron = (open: boolean) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
)

/** FIN in white, BUCK in the glowing accent, slanted like the reference wordmark. */
export function Wordmark({ className = 'text-[22px]' }: { className?: string }) {
  return (
    <span className={`inline-block -skew-x-[8deg] font-extrabold uppercase tracking-tight leading-none ${className}`}>
      <span className="text-white">Fin</span>
      <span className="text-accent-bright [text-shadow:0_0_18px_rgba(0,255,135,0.65)]">Buck</span>
    </span>
  )
}

/** Wordmark × partner, as one link home. */
export function Lockup({ size = 'md' }: { size?: 'md' | 'sm' }) {
  return (
    <Link href="/" className="flex items-center gap-3 shrink-0" aria-label={`FinBuck × ${PARTNER.name} — home`}>
      <Wordmark className={size === 'md' ? 'text-[22px] sm:text-2xl' : 'text-xl'} />
      <span className="text-faint text-sm font-semibold">×</span>
      <PartnerWordmark className={size === 'md' ? 'h-7 sm:h-8' : 'h-7'} />
    </Link>
  )
}

export function CodeButton({ className = '' }: { className?: string }) {
  return (
    <a
      href={SIGNUP_URL}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl px-5 py-3 text-[15px] text-ink-deep transition-all hover:brightness-110 shadow-accent hover:shadow-accent-lg ${className}`}
      style={{ background: 'linear-gradient(110deg, #6BFFB8 0%, #00FF87 50%, #00C96A 100%)' }}
    >
      <span className="font-semibold">Use code&nbsp;</span>
      <span className="font-extrabold tracking-wide">{CODE}</span>
    </a>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const pathname = usePathname()
  const groupRef = useRef<HTMLDivElement | null>(null)

  // Navigating away closes both menus, including when the click came from
  // inside the dropdown itself.
  useEffect(() => {
    setOpenGroup(null)
    setMobileOpen(false)
  }, [pathname])

  // Dismiss the dropdown on an outside click or Escape.
  useEffect(() => {
    if (!openGroup) return
    const onDown = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) setOpenGroup(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroup(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openGroup])

  // A group is active while any of its pages is the current one. Compared on
  // the path alone — this deliberately doesn't read useSearchParams, which
  // would force every page using the header into a Suspense boundary.
  const isActive = (item: NavItem) =>
    isGroup(item)
      ? item.children.some((c) => !c.external && c.href.split('?')[0] === pathname)
      : pathname === item.href

  const itemClass = (active: boolean) =>
    `group flex items-center gap-2 text-[14px] 2xl:text-[15px] font-bold uppercase tracking-[0.05em] whitespace-nowrap transition-colors ${
      active ? 'text-white' : 'text-muted hover:text-white'
    }`

  const iconClass = (active: boolean) =>
    active ? 'text-accent-bright' : 'text-muted group-hover:text-white transition-colors'

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-deep/95 backdrop-blur-md border-b border-white/[0.06]">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8">
        <Lockup />

        {/* Desktop nav */}
        <div ref={groupRef} className="hidden xl:flex items-center gap-6 2xl:gap-9">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item)

            if (!isGroup(item)) {
              return (
                <Link key={item.href} href={item.href} className={itemClass(active)}>
                  <span className={iconClass(active)}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            }

            const open = openGroup === item.label
            return (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : item.label)}
                  aria-expanded={open}
                  aria-haspopup="menu"
                  className={itemClass(active || open)}
                >
                  <span className={iconClass(active || open)}>{item.icon}</span>
                  {item.label}
                  {chevron(open)}
                </button>

                {open && (
                  <div
                    role="menu"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-5 w-56 rounded-2xl border border-white/[0.07] bg-ink-raised p-2 shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                  >
                    {item.children.map((c) => {
                      const on = !c.external && pathname === c.href.split('?')[0]
                      const cls = `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        on ? 'text-white bg-white/[0.04]' : 'text-muted hover:text-white hover:bg-white/[0.04]'
                      }`
                      const inner = (
                        <>
                          <span className={on ? 'text-accent-bright' : 'text-faint'}>{c.icon}</span>
                          {c.label}
                          {c.external && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="ml-auto w-3.5 h-3.5 text-faint">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M9 7h8v8" />
                            </svg>
                          )}
                        </>
                      )
                      return c.external ? (
                        <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer" role="menuitem" className={cls}>
                          {inner}
                        </a>
                      ) : (
                        <Link key={c.href} href={c.href} role="menuitem" className={cls}>
                          {inner}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <CodeButton className="hidden sm:inline-flex" />
          <button
            className="xl:hidden rounded-lg p-2 text-muted hover:text-white hover:bg-white/[0.05] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu — groups render as a heading with their pages nested
          under it, since a click-to-open flyout is awkward on touch. */}
      {mobileOpen && (
        <div className="xl:hidden max-h-[calc(100vh-72px)] overflow-y-auto border-t border-white/[0.06] bg-ink-deep px-5 sm:px-8 py-5 flex flex-col gap-5">
          {NAV_ITEMS.map((item) =>
            isGroup(item) ? (
              <div key={item.label} className="flex flex-col gap-3">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-faint">
                  {item.label}
                </span>
                {item.children.map((c) => {
                  const on = !c.external && pathname === c.href.split('?')[0]
                  const cls = `flex items-center gap-3 pl-1 text-sm font-semibold uppercase tracking-[0.06em] ${on ? 'text-white' : 'text-muted'}`
                  const inner = (
                    <>
                      <span className={on ? 'text-accent-bright' : 'text-faint'}>{c.icon}</span>
                      {c.label}
                    </>
                  )
                  return c.external ? (
                    <a key={c.href} href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <Link key={c.href} href={c.href} onClick={() => setMobileOpen(false)} className={cls}>
                      {inner}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.06em] ${isActive(item) ? 'text-white' : 'text-muted'}`}
              >
                <span className={isActive(item) ? 'text-accent-bright' : 'text-faint'}>{item.icon}</span>
                {item.label}
              </Link>
            )
          )}
          <CodeButton className="sm:hidden mt-1 w-full" />
        </div>
      )}
    </nav>
  )
}
