import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackgroundCoins from '../components/BackgroundCoins'

// Link previews (Discord, X, iMessage) resolve the share image against this
// base. On Vercel it's the deployment's own production address, so a Vercel
// link previews with the image that deployment actually serves; everywhere
// else (the VPS) it's finbuck.bet.
const SITE_URL = process.env.VERCEL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL}`
  : 'https://finbuck.bet'

const SHARE = {
  title: 'FinBuck × Stake — Rewards',
  description: 'Official FinBuck × Stake rewards: the $5,000 monthly leaderboard, live Kick giveaways and exclusive perks with code BUCK.',
  image: { url: '/og-image.jpg', width: 1200, height: 630, alt: 'FinBuck × Stake — FinBucks Rewards' },
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'FinBuck — Kick Streamer',
  description: SHARE.description,
  openGraph: {
    title: SHARE.title,
    description: SHARE.description,
    images: [SHARE.image],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SHARE.title,
    description: SHARE.description,
    images: [SHARE.image],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Scroll-reveal starts elements hidden. If JS never runs, nothing would
            release them, so drop the hidden state outright without it. */}
        <noscript>
          <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body className="bg-ink font-sans text-white min-h-screen flex flex-col antialiased">
        {/* Organic line texture from the seamless grey-and-white source,
            turned into a navy overlay (public/pattern-lines.webp: line colour
            fixed, darkness becomes alpha, white becomes transparent). The
            source is seamless, so it tiles with no visible grid. Fixed, so it
            stays put while the page scrolls; a fixed element rather than
            background-attachment, which iOS ignores. */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-repeat bg-center opacity-[0.35] [background-size:720px_auto] md:[background-size:1100px_auto]"
          style={{ backgroundImage: 'url(/pattern-lines.webp)' }}
        />
        {/* Bronze, silver and gold coins drifting over the pattern. */}
        <BackgroundCoins />
        {/* Film grain over the lot. */}
        <div aria-hidden className="grain pointer-events-none fixed inset-0 -z-10 opacity-[0.07]" />
        <Navbar />
        {/* Clipped sideways so decoration hanging past a heading (the gifts)
            can never widen the page; clip, not hidden, so nothing becomes a
            scroll container. */}
        <main className="flex-1 overflow-x-clip">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
