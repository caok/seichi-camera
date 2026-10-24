// localStorage throws in sandboxed documents without allow-same-origin (e.g. FeedMob Pages'
// CSP sandbox). Fall back to an in-memory store so the app still works for the session.
const memory = new Map<string, string>()

function available(): boolean {
  try {
    const k = '__seichi_probe__'
    localStorage.setItem(k, k)
    localStorage.removeItem(k)
    return true
  } catch {
    return false
  }
}

const persistent = available()

export const storage = {
  get(key: string): string | null {
    return persistent ? localStorage.getItem(key) : (memory.get(key) ?? null)
  },
  set(key: string, value: string) {
    if (persistent) localStorage.setItem(key, value)
    else memory.set(key, value)
  },
}
