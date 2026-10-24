import { setShot } from './store'

/** Centre-crops an image to `aspect`, matching what captureFrame() does for the live camera */
function cropToAspect(img: HTMLImageElement, aspect: number): string {
  const vw = img.naturalWidth
  const vh = img.naturalHeight
  let sw = vw
  let sh = vh
  if (vw / vh > aspect) sw = vh * aspect
  else sh = vw / aspect
  const outW = Math.min(1600, Math.round(sw))
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = Math.round(outW / aspect)
  canvas.getContext('2d')!.drawImage(img, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.9)
}

/**
 * Uses a photo from the gallery as the shot for a scene (for when the camera is unavailable,
 * or for demoing indoors with photos taken on site). Resolves once the shot is stored.
 */
export function shotFromGallery(file: File, sceneId: string, aspect: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setShot(sceneId, cropToAspect(img, aspect))
      URL.revokeObjectURL(url)
      resolve()
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read this image'))
    }
    img.src = url
  })
}
