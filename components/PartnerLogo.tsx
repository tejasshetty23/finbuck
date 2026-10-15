/* eslint-disable @next/next/no-img-element */
// Stake's script wordmark and "S" icon — every partner logo on the site
// renders through this one file.
//
// Plain <img> rather than next/image: these are small static SVGs, which the
// Next image optimiser won't process without dangerouslyAllowSVG anyway.
// Sizing is by height; the width follows the artwork.

export function PartnerWordmark({ className = 'h-6' }: { className?: string }) {
  return <img src="/stake-logo.svg" alt="Stake" className={`w-auto select-none ${className}`} draggable={false} />
}

/** The "S" icon, for the podium avatars (as benny.gg uses it). */
export function PartnerMark({ className = 'h-1/2' }: { className?: string }) {
  return <img src="/stake-icon.svg" alt="" aria-hidden className={`w-auto select-none ${className}`} draggable={false} />
}
