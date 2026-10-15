// TEMPORARY Stake wordmark and mark, drawn as text.
//
// stake.com can't be reached from where this was built, so the official logo
// couldn't be pulled. Replace both with the files from FinBuck's Stake
// affiliate brand kit (e.g. public/stake-logo.svg and public/stake-mark.svg)
// — every partner logo on the site renders through this one file.

export function PartnerWordmark({ className = 'text-xl' }: { className?: string }) {
  return (
    <span className={`inline-block -skew-x-[10deg] font-extrabold tracking-tight leading-none text-white ${className}`} aria-label="Stake">
      Stake
    </span>
  )
}

/** Round badge for the podium avatars, like benny's Stake "S". */
export function PartnerMark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-block -skew-x-[10deg] font-extrabold leading-none text-white ${className}`} aria-hidden>
      S
    </span>
  )
}
