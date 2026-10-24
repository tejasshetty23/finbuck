// Site-wide settings that change over time. Edit here, not in the pages.

export const PARTNER = {
  name: 'Stake',
  url: 'https://stake.com',
} as const

/** FinBuck's Stake code — shown on the header button and wherever a code is printed. */
export const CODE = 'BUCK'

/** Stake's referral links take the code as `?c=`. */
export const SIGNUP_URL = `${PARTNER.url}/?c=${CODE}`

/** Stake.us, the US social casino. Same code, same referral link format. */
export const PARTNER_US = {
  name: 'Stake.us',
  url: 'https://stake.us',
} as const
export const SIGNUP_URL_US = `${PARTNER_US.url}/?c=${CODE}`

/**
 * The monthly race. FinBuck's Stake partnership starts on the 25th of October
 * 2026, and each race runs from the 25th to the 25th (00:00 UTC), rolling over
 * on its own — nothing here needs editing month to month.
 */
export const RACE = {
  firstStart: Date.UTC(2026, 9, 25), // 25 Oct 2026, 00:00 UTC (months are 0-based)
  dayOfMonth: 25,
  /** Prize per place in USD, 1st to 10th. The pool is their sum. */
  prizes: [2000, 1000, 600, 320, 275, 225, 180, 155, 135, 110],
  get prizePool() {
    return this.prizes.reduce((a: number, b: number) => a + b, 0)
  },
} as const

export const SOCIALS = {
  kick: { label: 'Kick', handle: '@FinBuck', href: 'https://kick.com/finbuck' },
  discord: { label: 'Discord', handle: 'FinBuckers', href: 'https://discord.com/invite/finbuckers' },
  x: { label: 'X', handle: '@FinBuckk', href: 'https://x.com/FinBuckk' },
} as const
