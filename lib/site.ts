// Site-wide settings that change over time. Edit here, not in the pages.

export const PARTNER = {
  name: 'Stake',
  url: 'https://stake.com',
} as const

/** FinBuck's Stake code — shown on the header button and wherever a code is printed. */
export const CODE = 'BUCK'

/**
 * FinBuck's Stake.com referral link: `c` is the affiliate referral id and
 * `offer` applies code BUCK on sign-up.
 */
export const SIGNUP_URL = `${PARTNER.url}/?c=pzt7XHW3&offer=${CODE.toLowerCase()}`

/** Stake.us, the US social casino. */
export const PARTNER_US = {
  name: 'Stake.us',
  url: 'https://stake.us',
} as const
/** FinBuck's Stake.us sign-up link: `offer` applies code BUCK. */
export const SIGNUP_URL_US = `${PARTNER_US.url}/?offer=${CODE.toLowerCase()}`

/**
 * The monthly race. Each race runs from the 26th to the 26th (00:00 UTC),
 * rolling over on its own — nothing here needs editing month to month.
 */
export const RACE = {
  dayOfMonth: 26,
  /**
   * Races that started before `until` ran on `dayOfMonth` instead (the first
   * race was Oct 25 – Nov 25 2026), so past races keep their real dates.
   */
  earlier: { dayOfMonth: 25, until: Date.UTC(2026, 10, 1) },
  /**
   * The site keeps showing the race that just ended until this hour (UTC) on
   * race day, then switches to the new one. Stake posts its final daily
   * update at 01:45 UTC, so the finished race's last standings show first.
   */
  switchHourUtc: 2,
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

/**
 * Wager milestones: hit a wager target in a leaderboard month, claim a cash
 * reward. Each can be claimed once per month; claims go through a Discord
 * ticket. `tier` picks the coin and colour on the cards.
 */
export const MILESTONES = [
  { wager: 10_000, reward: 15, tier: 'bronze' },
  { wager: 25_000, reward: 25, tier: 'bronze' },
  { wager: 50_000, reward: 50, tier: 'bronze' },
  { wager: 100_000, reward: 125, tier: 'silver' },
  { wager: 250_000, reward: 300, tier: 'silver' },
  { wager: 500_000, reward: 750, tier: 'silver' },
  { wager: 1_000_000, reward: 1_500, tier: 'gold' },
  { wager: 2_500_000, reward: 3_000, tier: 'gold' },
] as const

/** Total of all milestone rewards, rounded down to the nearest $500 ("over $5,500"). */
export const MILESTONES_OVER = Math.floor(MILESTONES.reduce((a, m) => a + m.reward, 0) / 500) * 500
