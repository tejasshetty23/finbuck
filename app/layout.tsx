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
        {/* Scroll-reveal starts elements hidden. If JS never runs, nothing would
            release them, so drop the hidden state outright without it. */}
        <noscript>
          <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body className="bg-[#07050f] text-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
