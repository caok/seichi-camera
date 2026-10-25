import { storage } from './storage'

// A tiny "achievement unlocked" chime synthesised with Web Audio — no audio files, no licensing.
// iOS only lets a page make sound after a user gesture, so unlockAudio() must be called from a
// tap (the shutter / gallery buttons); the chime itself plays later on the result page.

const MUTE_KEY = 'seichi.mute'
let ctx: AudioContext | null = null
let lastPlayed = 0

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } }
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

export const isMuted = () => storage.get(MUTE_KEY) === '1'
export const setMuted = (muted: boolean) => storage.set(MUTE_KEY, muted ? '1' : '0')

/** Call from a user gesture (click / tap) so later playback is allowed */
export function unlockAudio() {
  try {
    // Respect the iPhone silent switch and don't interrupt the user's music (Safari 17+)
    const session = (navigator as AudioSessionNavigator).audioSession
    if (session) session.type = 'ambient'
    const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
    if (!Ctor) return
    ctx ??= new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
  } catch {
    // Sound is optional; ignore any failure
  }
}

/** Rising three-note arpeggio with a soft sparkle on top (~0.7 s) */
export function playChime() {
  if (!ctx || ctx.state !== 'running' || isMuted()) return
  const now = ctx.currentTime
  if (performance.now() - lastPlayed < 1000) return // StrictMode / double mounts
  lastPlayed = performance.now()

  const master = ctx.createGain()
  master.gain.value = 0.18
  master.connect(ctx.destination)

  const notes = [
    { f: 880.0, at: 0.0 }, // A5
    { f: 1318.5, at: 0.09 }, // E6
    { f: 1760.0, at: 0.18 }, // A6
  ]
  for (const n of notes) {
    for (const [type, mult, vol] of [['triangle', 1, 1], ['sine', 2, 0.25]] as const) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.value = n.f * mult
      const t0 = now + n.at
      g.gain.setValueAtTime(0, t0)
      g.gain.linearRampToValueAtTime(vol, t0 + 0.012)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5)
      osc.connect(g).connect(master)
      osc.start(t0)
      osc.stop(t0 + 0.55)
    }
  }
}
