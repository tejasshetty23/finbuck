import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-purple-900/20 bg-[#07050f] py-10 mt-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <span className="font-black text-lg tracking-widest uppercase text-white">FinBuck</span>
          <p className="text-gray-500 text-sm mt-1">Casino · Gaming · Entertainment</p>
        </div>

        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#00ff87] transition-colors">Home</Link>
          <Link href="/leaderboard" className="hover:text-[#00ff87] transition-colors">Watchtime</Link>
          <Link href="/tournaments" className="hover:text-[#00ff87] transition-colors">Tournaments</Link>
          <Link href="/wheelspin" className="hover:text-[#00ff87] transition-colors">Giveaways</Link>
          <Link href="/vschat" className="hover:text-[#00ff87] transition-colors">Slot Battles</Link>
          <Link href="/shop" className="hover:text-[#00ff87] transition-colors">Shop</Link>
          <a href="https://kick.com/finbuck" target="_blank" rel="noopener noreferrer" className="hover:text-[#00ff87] transition-colors">Watch Live</a>
        </div>

        <div className="text-right">
          <p className="text-gray-600 text-xs text-center md:text-right">
            © {new Date().getFullYear()} FinBuck. Gambling can be addictive — play responsibly.
          </p>
          <p className="text-gray-600 text-[10px] uppercase tracking-widest text-center md:text-right mt-1 leading-relaxed">
            18+ Gambling Responsibly.<br />
            If you need support visit{' '}
            <a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 transition-colors">
              GamblingTherapy.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
