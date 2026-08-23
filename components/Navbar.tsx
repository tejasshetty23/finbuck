'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavLink = { href: string; label: string }
type NavGroup = { label: string; children: (NavLink & { icon: ReactNode })[] }
type NavItem = NavLink | NavGroup

function isGroup(item: NavItem): item is NavGroup {
  return 'children' in item
}

const trophyIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4 0v-4m-7-13h14v3a7 7 0 01-14 0V4zm14 1h2.5a2.5 2.5 0 01-2.5 4.5M5 5H2.5A2.5 2.5 0 005 9.5" />
  </svg>
)

const swordsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 14.5L20 20m0-16l-9 9m-1.5 1.5L4 20m3-6L3 4l4 1 10 10m0 0l1 4-4-1" />
  </svg>
)

const ticketIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4V7a2 2 0 012-2z" />
  </svg>
)

const giftIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13a4 4 0 10-4-4 4 4 0 004 4zm0 0a4 4 0 114-4 4 4 0 01-4 4zM4 12h16M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
)

const diceIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Watchtime' },
  {
    label: 'Games',
    children: [
      { href: '/tournaments', label: 'Tournaments', icon: trophyIcon },
      { href: '/vschat', label: 'Slot Battles', icon: swordsIcon },
    ],
  },
  {
    label: 'Giveaways',
    children: [
      { href: '/wheelspin?picker=giveaway', label: 'Giveaway Picker', icon: ticketIcon },
      { href: '/wheelspin?picker=prize', label: 'Prize Picker', icon: giftIcon },
      { href: '/wheelspin?picker=number', label: 'Number Roller', icon: diceIcon },
    ],
  },
  { href: '/shop', label: 'Shop' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const pathname = usePathname()
  const groupRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Navigating away closes both menus, including when the click came from
  // inside the dropdown itself.
  useEffect(() => {
    setOpenGroup(null)
    setMobileOpen(false)
  }, [pathname])

  // Dismiss the dropdown on an outside click or Escape. The ref sits on the nav
  // container rather than an individual group so this keeps working if more
  // groups are added; switching between two triggers is handled by onClick.
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

  const linkClass = (active: boolean) =>
    `text-sm font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
      active ? 'text-[#00ff87]' : 'text-gray-400 hover:text-white'
    }`

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07050f]/95 backdrop-blur-md border-b border-purple-900/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="group">
          <span
            className="font-black text-xl tracking-widest uppercase"
            style={{
              background: 'linear-gradient(270deg, #00ff87, #4ade80, #86efac, #4ade80, #00ff87)',
              backgroundSize: '300% 300%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 8s ease infinite',
            }}
          >
            FinBuck
          </span>
        </Link>

        {/* Desktop nav — absolutely centered */}
        <div ref={groupRef} className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 -translate-x-1/2">
          {NAV_ITEMS.map((item) => {
            if (!isGroup(item)) {
              return (
                <Link key={item.href} href={item.href} className={linkClass(pathname === item.href)}>
                  {item.label}
                </Link>
              )
            }

            // A group counts as active while any of its pages is the current one.
            const active = item.children.some((c) => c.href.split('?')[0] === pathname)
            const open = openGroup === item.label

            return (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : item.label)}
                  aria-expanded={open}
                  aria-haspopup="menu"
                  className={`${linkClass(active)} flex items-center gap-1.5`}
                >
                  {item.label}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {open && (
                  <div
                    role="menu"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-4 w-56 rounded-2xl border border-purple-900/50 bg-[#0d0a1a]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.65)] p-2"
                  >
                    {item.children.map((c) => {
                      const on = pathname === c.href
                      return (
                        <Link
                          key={c.href}
                          href={c.href}
                          role="menuitem"
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                            on ? 'text-[#00ff87] bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className={on ? 'text-[#00ff87]' : 'text-purple-400'}>{c.icon}</span>
                          {c.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-400 hover:text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
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

      {/* Mobile menu — a group renders as a heading with its pages nested under
          it, since a click-to-open flyout is awkward on touch. */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d0a1a]/95 backdrop-blur-md border-t border-purple-900/30 px-6 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((item) =>
            isGroup(item) ? (
              <div key={item.label} className="flex flex-col gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-600">
                  {item.label}
                </span>
                {item.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 pl-3 text-sm font-semibold uppercase tracking-wider transition-colors ${
                      pathname === c.href ? 'text-[#00ff87]' : 'text-gray-400'
                    }`}
                  >
                    <span className={pathname === c.href ? 'text-[#00ff87]' : 'text-purple-400'}>{c.icon}</span>
                    {c.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-semibold uppercase tracking-wider transition-colors ${
                  pathname === item.href ? 'text-[#00ff87]' : 'text-gray-400'
                }`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  )
}
