import { promises as fs } from 'fs'
import path from 'path'

// Giveaway cooldown: the last few giveaway winners, who can't be drawn again
// until that many more rolls have happened. Never shown on the site.
//
// Kept on the server in data/giveaway-cooldown.json (gitignored), so it holds
// across page refreshes, other browsers and app restarts. Deleting the file
// resets it. COOLDOWN_FILE in .env.local can point it somewhere else.
//
// The list is also held in memory, so even if the file can't be written the
// cooldown keeps working until the app restarts, and the failure is logged
// (pm2 logs finbuck) instead of passing silently.

export const COOLDOWN_ROLLS = 7

const FILE = process.env.COOLDOWN_FILE || path.join(process.cwd(), 'data', 'giveaway-cooldown.json')

let memory: string[] = []
let fileOk = true
let lastWarn = 0

function warn(message: string) {
  if (Date.now() - lastWarn < 60_000) return
  lastWarn = Date.now()
  console.error(`[cooldown] ${message} (file: ${FILE})`)
}

/** Most recent winner last. */
export async function readCooldown(): Promise<string[]> {
  try {
    const data = JSON.parse(await fs.readFile(FILE, 'utf8')) as { recent?: unknown }
    const list = Array.isArray(data.recent) ? data.recent.filter((n): n is string => typeof n === 'string') : []
    memory = list.slice(-COOLDOWN_ROLLS)
    return memory
  } catch (e) {
    // No file and the last write worked: it was deleted to reset, so empty.
    if ((e as NodeJS.ErrnoException)?.code === 'ENOENT' && fileOk) return []
    // Otherwise the file can't be used: carry on from memory.
    return memory.slice(-COOLDOWN_ROLLS)
  }
}

/** Records a winner; only the last COOLDOWN_ROLLS stay on cooldown. */
export async function addWinner(name: string) {
  const list = [...(await readCooldown()), name].slice(-COOLDOWN_ROLLS)
  memory = list
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true })
    const tmp = `${FILE}.tmp`
    await fs.writeFile(tmp, JSON.stringify({ recent: list }, null, 2))
    await fs.rename(tmp, FILE)
    fileOk = true
  } catch (e) {
    fileOk = false
    warn(`couldn't save the cooldown list: ${e instanceof Error ? e.message : 'error'}`)
  }
  return list
}

export const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
