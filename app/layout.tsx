import type { Metadata } from 'next'
import './globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

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
        {/* Oxanium, the face of the redesign (as on arjhatescash.com). A <link>
            rather than next/font: next/font downloads the font during the
            build, so Google being unreachable from the VPS would fail the
            deploy. This way the visitor's browser fetches it instead. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Oxanium:wght@400;500;600;700;800&display=swap"
        />
        {/* Scroll-reveal starts elements hidden. If JS never runs, nothing would
            release them, so drop the hidden state outright without it. */}
        <noscript>
          <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body className="bg-ink font-sans text-white min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
