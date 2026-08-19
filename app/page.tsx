import Image from 'next/image'
import Link from 'next/link'
import CopyButton from '../components/CopyButton'

const socials = [
  {
    label: 'Kick',
    handle: '@FinBuck',
    href: 'https://kick.com/finbuck',
    color: 'from-green-500/20 to-green-600/5',
    border: 'border-green-500/30 hover:border-green-400/60',
    iconColor: 'text-green-400',
    icon: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/kick-logo.png" alt="Kick" className="w-8 h-7 object-contain" />
    ),
    cta: 'Watch Live',
  },
  {
    label: 'X / Twitter',
    handle: '@FinBuckk',
    href: 'https://x.com/FinBuckk',
    color: 'from-gray-500/20 to-gray-600/5',
    border: 'border-gray-500/30 hover:border-gray-300/60',
    iconColor: 'text-white',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    cta: 'Follow',
  },
  {
    label: 'Discord',
    handle: 'FinBuckers',
    href: 'https://discord.com/invite/finbuckers',
    color: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/30 hover:border-indigo-400/60',
    iconColor: 'text-indigo-400',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    cta: 'Join',
  },
]

// Gamba monthly leaderboard prize pool. The twenty places total $10,000 — keep
// PRIZE_TOTAL in step with the amounts below if they ever change.
const PRIZE_TOTAL = '$10,000'

const PRIZE_PODIUM = [
  { place: '2nd', amount: '$1,500', tier: 'silver' as const },
  { place: '1st', amount: '$3,000', tier: 'gold' as const },
  { place: '3rd', amount: '$1,000', tier: 'bronze' as const },
]

// Metallic faces for the podium blocks. 1st is taller as well as brighter.
const PRIZE_TIER = {
  gold: {
    bg: 'linear-gradient(180deg, #ffe27a 0%, #f4bc35 45%, #c98a06 100%)',
    glow: '0 0 45px rgba(244,188,53,0.45)',
    pad: 'py-5 sm:py-9',
  },
  silver: {
    bg: 'linear-gradient(180deg, #f4f4f5 0%, #cbd0d6 45%, #98a0a8 100%)',
    glow: '0 0 30px rgba(203,208,214,0.25)',
    pad: 'py-3.5 sm:py-6',
  },
  bronze: {
    bg: 'linear-gradient(180deg, #e89b5f 0%, #c4713b 45%, #8d481d 100%)',
    glow: '0 0 30px rgba(196,113,59,0.28)',
    pad: 'py-3.5 sm:py-6',
  },
}

const PRIZE_RANKS: [string, string][] = [
  ['4th', '$550'], ['5th', '$500'], ['6th', '$450'], ['7th', '$400'],
  ['8th', '$350'], ['9th', '$325'], ['10th', '$300'], ['11th', '$275'],
  ['12th', '$250'], ['13th', '$225'], ['14th', '$200'], ['15th', '$175'],
  ['16th', '$150'], ['17th', '$125'], ['18th', '$100'], ['19th', '$75'],
  ['20th', '$50'],
]

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/background.png"
            alt="FinBuck hero"
            fill
            priority
            className="object-cover object-center"
            style={{ filter: 'brightness(0.5) saturate(1.2)' }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07050f]/60 via-transparent to-[#07050f]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07050f]/40 via-transparent to-[#07050f]/40" />
          {/* Purple radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-700/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-green-400/5 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto top-8">
          <div className="mb-4">
            <p className="text-gray-400 text-xs md:text-sm font-semibold uppercase tracking-[0.4em] mb-2">Welcome to</p>
            <h1 className="font-black uppercase tracking-tight leading-tight animated-gradient-text">
              <span className="block text-5xl sm:text-6xl md:text-8xl">FinBucks</span>
              <span className="block text-3xl sm:text-4xl md:text-5xl">Rewards</span>
            </h1>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 mt-16 w-full max-w-[260px] mx-auto relative top-8">
            <a
              href="https://kick.com/finbuck"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full p-[2px] transition-all duration-200 shadow-[0_0_20px_rgba(0,255,135,0.15)] hover:shadow-[0_0_40px_rgba(0,255,135,0.45)]"
              style={{
                clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
                background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a, #00ff87)',
              }}
            >
              {/* Inner face — translucent so the hero image still reads through */}
              <span
                className="flex items-center justify-center w-full gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#00ff87] group-hover:text-white transition-colors bg-[#0a0715]/80 backdrop-blur-sm"
                style={{ clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)' }}
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff87] opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff87]"></span>
                </span>
                Watch Live
              </span>
            </a>
            <a
              href="https://gamba.com/promotions/exclusive-leaderboards/18090"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group w-full p-[2px] transition-all duration-200 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.45)]"
              style={{
                clipPath: 'polygon(10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px), 0% 10px)',
                background: 'linear-gradient(135deg, #a855f7, #c084fc, #7e22ce, #a855f7)',
              }}
            >
              {/* Inner face — translucent so the hero image still reads through */}
              <span
                className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider text-purple-200 group-hover:text-white transition-colors bg-[#0a0715]/80 backdrop-blur-sm"
                style={{ clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Gamba Leaderboard
              </span>
            </a>
          </div>
        </div>

      </section>

      {/* Divider */}
      <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent, #a855f7, #c084fc, #a855f7, transparent)', boxShadow: '0 0 12px 2px rgba(168,85,247,0.6)' }} />

      {/* Pattern background for all sections below hero */}
      <div className="relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/pattern2.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
            maskImage: 'radial-gradient(ellipse 100% 80% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 100% 80% at 50% 50%, black 40%, transparent 100%)',
          }}
        />

      {/* ── SPONSOR ── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="max-w-sm mx-auto">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00ff87]/30" />
            <span className="text-[#00ff87] text-xs font-bold uppercase tracking-[0.3em]">Official Sponsor</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00ff87]/30" />
          </div>

          {/* Card — filter wrapper (no clip-path so shadow isn't clipped) */}
          <div className="sponsor-card">
          {/* Clipped octagon border layer */}
          <div
            className="relative p-[3px]"
            style={{
              clipPath: 'polygon(20px 0%, calc(100% - 20px) 0%, 100% 20px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 20px 100%, 0% calc(100% - 20px), 0% 20px)',
              background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a, #00ff87)',
            }}
          >
          <div
            className="relative p-6 flex flex-col items-center gap-5"
            style={{
              background: 'linear-gradient(160deg, #071a0e 0%, #030d07 50%, #000000 100%)',
              clipPath: 'polygon(18px 0%, calc(100% - 18px) 0%, 100% 18px, 100% calc(100% - 18px), calc(100% - 18px) 100%, 18px 100%, 0% calc(100% - 18px), 0% 18px)',
            }}
          >
            {/* Logo */}
            <div className="pt-2">
              <Image
                src="/gamba-logo.png"
                alt="Gamba"
                width={150}
                height={52}
                className="object-contain"
              />
            </div>

            {/* Diamond + tagline */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-2 w-full justify-center">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#00ff87]" />
                <span className="text-[#00ff87] text-xs">◆</span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#00ff87]" />
              </div>
              <p className="text-gray-300 text-sm font-bold uppercase tracking-[0.2em] text-center leading-relaxed">
                The platform<br />behind the big wins.
              </p>
              <div className="flex items-center gap-2 w-full justify-center">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#00ff87]" />
                <span className="text-[#00ff87] text-xs">◆</span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#00ff87]" />
              </div>
            </div>

            {/* Code box */}
            <div
              className="w-full p-[2px]"
              style={{
                clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)',
                background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a, #00ff87)',
              }}
            >
              <div
                className="w-full flex flex-col items-center gap-1 py-5 px-6 bg-[#041209]"
                style={{ clipPath: 'polygon(6px 0%, calc(100% - 6px) 0%, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0% calc(100% - 6px), 0% 6px)' }}
              >
                <span className="text-[#00ff87]/70 text-xs font-bold uppercase tracking-[0.3em]">Use Code</span>
                <div className="flex items-center gap-3">
                  <span className="text-[#00ff87] font-black text-4xl tracking-widest">FINBUCK</span>
                  <CopyButton code="FINBUCK" />
                </div>
              </div>
            </div>

            {/* CTA button */}
            <a
              href="https://gamba.com/?c=finbuck"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="w-full flex items-center justify-center gap-2 text-black font-black py-4 uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(0,255,135,0.3)] hover:shadow-[0_0_40px_rgba(0,255,135,0.5)]"
              style={{
                clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)',
                background: 'linear-gradient(135deg, #00ff87, #4ade80, #00c96a, #00ff87)',
              }}
            >
              Play on Gamba.com
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>

            {/* Footer disclaimer */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <div className="flex items-center gap-2 w-full justify-center">
                <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#00ff87]" />
                <span className="text-[#00ff87] text-xs">◆</span>
                <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#00ff87]" />
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-[#00ff87]/40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <p className="text-gray-600 text-[10px] uppercase tracking-widest text-center leading-relaxed">
                18+ Gambling Responsibly.<br />
                If you need support visit<br />
                <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 transition-colors">
                  GamblingTherapy.org
                </a>
              </p>
            </div>
          </div>
          </div>
          </div>
        </div>
      </section>

      {/* ── GAMBA PRIZE POOL ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-white font-black uppercase tracking-[0.25em] text-xs sm:text-lg mb-2">
              Monthly Leaderboard
            </p>
            <h2 className="font-black uppercase leading-none text-4xl sm:text-6xl md:text-7xl">
              <span className="text-[#00ff87]">{PRIZE_TOTAL}</span> <span className="text-white">Prize Pool</span>
            </h2>
          </div>

          {/* Podium — items-end keeps the three blocks on one baseline while 1st stands taller */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-4 sm:mb-6">
            {PRIZE_PODIUM.map((p) => {
              const t = PRIZE_TIER[p.tier]
              return (
                <div
                  key={p.place}
                  className={`rounded-t-lg px-1 text-center ${t.pad}`}
                  style={{ background: t.bg, boxShadow: t.glow }}
                >
                  <span className="block font-black uppercase leading-none text-black text-xs sm:text-2xl">
                    {p.place}
                  </span>
                  <span className="block font-black leading-none text-black text-lg sm:text-4xl mt-1">
                    {p.amount}
                  </span>
                </div>
              )
            })}
          </div>

          {/* 4th - 20th. 20th is the odd one out, so it spans the middle to stay centred. */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {PRIZE_RANKS.map(([place, amount], i) => {
              const last = i === PRIZE_RANKS.length - 1
              return (
                <div
                  key={place}
                  className={`flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#0e0d14] px-3 py-2.5 sm:px-4 sm:py-3 ${
                    last ? 'col-span-2 sm:col-start-2' : ''
                  }`}
                >
                  <span className="font-black uppercase text-white text-xs sm:text-sm">{place}</span>
                  <span className="font-black text-[#00ff87] text-xs sm:text-base">{amount}</span>
                </div>
              )
            })}
          </div>

          {/* Sponsor lockup */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Image src="/gamba-logo.png" alt="Gamba" width={170} height={59} className="object-contain" />
            <div className="text-center sm:text-right">
              <p className="text-white font-black uppercase tracking-[0.25em] text-[11px] sm:text-sm">
                Play with code
              </p>
              <p className="text-[#00ff87] font-black uppercase leading-none text-3xl sm:text-5xl mt-1">
                FinBuck
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIALS ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 -mx-10 -my-6 bg-[#07050f]/70 blur-2xl rounded-3xl pointer-events-none" />
            <h2 className="relative text-4xl md:text-5xl font-black uppercase tracking-tight mb-3">
              <span style={{ color: '#ffffff' }}>Follow the </span><span className="animated-gradient-text">Buck</span>
            </h2>
            <p className="relative text-gray-300 text-base">Stay connected across all platforms</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-b ${s.color} border ${s.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <span className={`${s.iconColor} transition-transform group-hover:scale-110 duration-300`}>
                  {s.icon}
                </span>
                <div className="text-center">
                  <p className="text-white font-bold text-base">{s.label}</p>
                  <p className="text-gray-500 text-sm">{s.handle}</p>
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${s.iconColor} border border-current/30 rounded-full px-3 py-1`}>
                  {s.cta}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 bg-gradient-to-br from-[#100d1f] to-[#07050f] p-7 sm:p-12">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />

            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 text-purple-400 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>

            <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-3">
              Monthly <span className="text-purple-400">Watchtime Leaderboard</span>
            </h2>
            <p className="text-gray-400 text-base mb-8 max-w-md mx-auto">
              Who&apos;s the most loyal viewer this month? Check the watchtime leaderboard — top fans win recognition every month.
            </p>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            >
              View Watchtime
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
