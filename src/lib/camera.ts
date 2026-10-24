export class CameraError extends Error {
  code: 'insecure' | 'unsupported'
  constructor(code: 'insecure' | 'unsupported') {
    super(code)
    this.code = code
  }
}

export type Facing = 'environment' | 'user'

export async function openCamera(facing: Facing = 'environment'): Promise<MediaStream> {
  if (!window.isSecureContext) {
    throw new CameraError('insecure')
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new CameraError('unsupported')
  }
  // Some mobile browsers reject richer constraints (TypeError / OverconstrainedError), so fall back
  // to progressively simpler requests. Permission errors are not retried.
  const attempts: MediaStreamConstraints[] = [
    { video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false },
    { video: { facingMode: facing }, audio: false },
    { video: true, audio: false },
  ]
  let lastError: unknown
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints)
    } catch (e) {
      lastError = e
      const name = (e as Error)?.name
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'AbortError') break
    }
  }
  throw lastError
}

/** Human-readable description of any camera failure, for on-screen diagnostics */
export function describeError(e: unknown): string {
  if (e instanceof Error) return e.message && e.message !== e.name ? `${e.name}: ${e.message}` : e.name
  return String(e)
}

export function stopCamera(stream: MediaStream | null) {
  stream?.getTracks().forEach((t) => t.stop())
}

/**
 * Grabs exactly what the viewfinder shows: the video is rendered with
 * `object-fit: cover` inside a box of `aspect`, then scaled by `zoom` from the centre.
 */
export function captureFrame(video: HTMLVideoElement, aspect: number, zoom: number, maxWidth = 1600): string {
  const vw = video.videoWidth
  const vh = video.videoHeight
  let sw = vw
  let sh = vh
  if (vw / vh > aspect) sw = vh * aspect
  else sh = vw / aspect
  sw /= zoom
  sh /= zoom
  const sx = (vw - sw) / 2
  const sy = (vh - sh) / 2

  const outW = Math.min(maxWidth, Math.round(sw))
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = Math.round(outW / aspect)
  canvas.getContext('2d')!.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.9)
}
