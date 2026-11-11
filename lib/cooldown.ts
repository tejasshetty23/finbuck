import { promises as fs } from 'fs'
import path from 'path'

// Giveaway cooldown: the last few giveaway winners, who can't be drawn again
// until that many more rolls have happened. Never shown on the site.
//
// Kept on the server in data/giveaway-cooldown.json (gitignored), so it holds
// across page refreshes, other browsers and app restarts. Deleting the file
// resets it. If the file can't be written (e.g. a read-only preview host),
// it still works in memory for as long as the app keeps running.

export const COOLDOWN_ROLLS = 7

const FILE = path.join(process.cwd(), 'data', 'giveaway-cooldown.json')

// Only used when the file can't be read or written.
let memory: string[] = []

/** Most recent winner last. */
export async function readCooldown(): Promise<string[]> {
  try {
    const data = JSON.parse(await fs.readFile(FILE, 'utf8')) as { recent?: unknown }
    const list = Array.isArray(data.recent) ? data.recent.filter((n): n is string => typeof n === 'string') : []
    return list.slice(-COOLDOWN_ROLLS)
  } catch (e) {
    // No file yet (or it was deleted to reset) means an empty list.
    if ((e as NodeJS.ErrnoException)?.code === 'ENOENT') return []
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
  } catch {
    /* read-only filesystem: the in-memory copy carries on */
  }
  return list
}

export const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
