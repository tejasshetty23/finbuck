// Site-wide settings that change over time. Edit here, not in the pages.

/** Shown on the header button and wherever the code is printed. */
export const CODE = 'BUCK'

/**
 * Sign-up link. NOTE: this still carries `finbuck`, the code Gamba's race data
 * lists as eligible. If CODE above is a different code, confirm with FinBuck
 * which one Gamba actually credits before going live.
 */
export const SIGNUP_URL = 'https://gamba.com/?c=finbuck'

/**
 * Gamba issues a new race id each month (18090, then 21352, ...). This one
 * number drives both the live standings and every "view on Gamba" link.
 */
export const GAMBA_RACE_ID = 21352
export const GAMBA_RACE_URL = `https://gamba.com/promotions/exclusive-leaderboards/${GAMBA_RACE_ID}`

export const SOCIALS = {
  kick: { label: 'Kick', handle: '@FinBuck', href: 'https://kick.com/finbuck' },
  discord: { label: 'Discord', handle: 'FinBuckers', href: 'https://discord.com/invite/finbuckers' },
  x: { label: 'X', handle: '@FinBuckk', href: 'https://x.com/FinBuckk' },
} as const
