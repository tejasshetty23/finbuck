import { promises as fs } from 'fs'
import path from 'path'

// Giveaway cooldown: the last few giveaway winners, who can't be drawn again
// until that many more rolls have happened.
//
// Kept on the server in data/giveaway-cooldown.json (gitignored), so it holds
// across page refreshes, other browsers and app restarts. If the file can't
// be written (e.g. a read-only preview host), it still works in memory for
// as long as the app keeps running.

export const COOLDOWN_ROLLS = 7

const FILE = path.join(process.cwd(), 'data', 'giveaway-cooldown.json')

let memory: string[] | null = null

/** Most recent winner last. */
export async function readCooldown(): Promise<string[]> {
  if (memory) return memory
  try {
    const data = JSON.parse(await fs.readFile(FILE, 'utf8')) as { recent?: unknown }
    memory = Array.isArray(data.recent) ? data.recent.filter((n): n is string => typeof n === 'string') : []
  } catch {
    memory = []
  }
  return memory.slice(-COOLDOWN_ROLLS)
}

async function save(list: string[]) {
  memory = list
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true })
    const tmp = `${FILE}.tmp`
    await fs.writeFile(tmp, JSON.stringify({ recent: list }, null, 2))
    await fs.rename(tmp, FILE)
  } catch {
    /* read-only filesystem: keep the in-memory copy */
  }
}

/** Records a winner; only the last COOLDOWN_ROLLS stay on cooldown. */
export async function addWinner(name: string) {
  const list = [...(await readCooldown()), name].slice(-COOLDOWN_ROLLS)
  await save(list)
  return list
}

export async function clearCooldown() {
  await save([])
}

export const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase()
