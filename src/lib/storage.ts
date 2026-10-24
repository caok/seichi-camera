import { routeOf, STATE_SEP, stateOf } from '../router'

/** How long saved state (stamps, language) is kept */
const TTL_MS = 7 * 24 * 60 * 60 * 1000

type Entry = { v: string; exp: number }
type Store = Record<string, Entry>

function localStorageWorks(): boolean {
  try {
    const k = '__seichi_probe__'
    localStorage.setItem(k, k)
    localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

// localStorage (and cookies / IndexedDB) throw in sandboxed documents without allow-same-origin,
// e.g. FeedMob Pages' CSP sandbox. There we keep state in the URL hash instead, which survives
// reloads and in-app navigation (but not reopening the original link).
const useLocal = localStorageWorks()

const encode = (s: Store) => btoa(JSON.stringify(s)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
function decode(raw: string): Store {
  try {
    return JSON.parse(atob(raw.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

function readEntry(key: string): Entry | null {
  if (useLocal) {
    const raw = localStorage.getItem(key)
    if (raw == null) return null
    try {
      const e = JSON.parse(raw)
      if (e && typeof e.v === 'string' && typeof e.exp === 'number') return e
    } catch {
      // legacy plain value, written before expiry was added
    }
    return { v: raw, exp: Date.now() + TTL_MS }
  }
  return decode(stateOf(location.hash))[key] ?? null
}

export const storage = {
  get(key: string): string | null {
    const e = readEntry(key)
    return e && e.exp > Date.now() ? e.v : null
  },
  /** Saves a value for 7 days (the clock restarts on every write) */
  set(key: string, value: string) {
    const entry: Entry = { v: value, exp: Date.now() + TTL_MS }
    if (useLocal) {
      localStorage.setItem(key, JSON.stringify(entry))
      return
    }
    const now = Date.now()
    const store = Object.fromEntries(Object.entries(decode(stateOf(location.hash))).filter(([, e]) => e.exp > now))
    store[key] = entry
    // replace() keeps the back button history clean
    location.replace(`#${routeOf(location.hash)}${STATE_SEP}${encode(store)}`)
  },
}
