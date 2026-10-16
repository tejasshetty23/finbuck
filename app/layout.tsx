import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackgroundCoins from '../components/BackgroundCoins'

export const metadata: Metadata = {
  metadataBase: new URL('https://finbuck.bet'),
  title: 'FinBuck — Kick Streamer',
  description: 'Official website of FinBuck — Casino, Gaming & Entertainment on Kick.',
  openGraph: {
    title: 'FinBuck',
    description: 'Official website of FinBuck — Casino, Gaming & Entertainment on Kick.',
    images: ['/logo.jpg'],
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
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
