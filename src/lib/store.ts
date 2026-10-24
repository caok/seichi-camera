// Last captured photo, kept in memory between the camera and result pages.
let lastShot: { sceneId: string; dataUrl: string } | null = null

export const setShot = (sceneId: string, dataUrl: string) => {
  lastShot = { sceneId, dataUrl }
}

export const getShot = (sceneId: string) => (lastShot?.sceneId === sceneId ? lastShot.dataUrl : null)

// Collected stamps persist across visits.
const STAMPS_KEY = 'seichi.stamps'

export function getStamps(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STAMPS_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** Returns true if the stamp is new */
export function addStamp(sceneId: string): boolean {
  const stamps = getStamps()
  if (stamps.includes(sceneId)) return false
  localStorage.setItem(STAMPS_KEY, JSON.stringify([...stamps, sceneId]))
  return true
}
