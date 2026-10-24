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
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: facing },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  })
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
