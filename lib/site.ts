// Site-wide settings that change over time. Edit here, not in the pages.

export const PARTNER = {
  name: 'Stake',
  url: 'https://stake.com',
} as const

/** FinBuck's Stake code — shown on the header button and wherever a code is printed. */
export const CODE = 'BUCK'

/** Stake's referral links take the code as `?c=`. */
export const SIGNUP_URL = `${PARTNER.url}/?c=${CODE}`

/**
 * The monthly race. FinBuck's Stake partnership starts on the 25th of October
 * 2026, and each race runs from the 25th to the 25th (00:00 UTC), rolling over
 * on its own — nothing here needs editing month to month.
 */
export const RACE = {
  firstStart: Date.UTC(2026, 9, 25), // 25 Oct 2026, 00:00 UTC (months are 0-based)
  dayOfMonth: 25,
  prizePool: 10_000,
  /** Share of the pool per place, 1st to 20th. Sums to 100. */
  split: [30, 15, 10, 5.5, 5, 4.5, 4, 3.5, 3.25, 3, 2.75, 2.5, 2.25, 2, 1.75, 1.5, 1.25, 1, 0.75, 0.5],
} as const

export const SOCIALS = {
  kick: { label: 'Kick', handle: '@FinBuck', href: 'https://kick.com/finbuck' },
  discord: { label: 'Discord', handle: 'FinBuckers', href: 'https://discord.com/invite/finbuckers' },
  x: { label: 'X', handle: '@FinBuckk', href: 'https://x.com/FinBuckk' },
} as const
