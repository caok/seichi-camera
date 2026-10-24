import type { Scene } from '../types'

const FONT = '-apple-system, "Hiragino Sans", "Noto Sans JP", "Helvetica Neue", sans-serif'
const ACCENT = '#e8452c'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

/** Draws `img` into the box with object-fit: cover */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = w / s
  const sh = h / s
  ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h)
}

function badge(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string) {
  ctx.font = `700 26px ${FONT}`
  const w = ctx.measureText(text).width + 32
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(x, y, w, 46, 23)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + 16, y + 24)
}

function fitText(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, maxW: number) {
  let s = size
  do ctx.font = `${weight} ${s}px ${FONT}`
  while (ctx.measureText(text).width > maxW && --s > 16)
}

/** Builds the shareable "anime vs reality" card (Instagram 4:5-ish portrait) */
export interface CardText {
  title: string
  area: string
  anime: string
  real: string
  locale: string
}

export async function composeCard(scene: Scene, shotUrl: string, text: CardText): Promise<Blob> {
  const [frame, shot] = await Promise.all([loadImage(scene.frame), loadImage(shotUrl)])

  const W = 1080
  const pad = 48
  const imgW = W - pad * 2
  const imgH = Math.round(imgW / scene.aspect)
  const header = 170
  const gap = 20
  const footer = scene.credit ? 170 : 140
  const H = header + imgH * 2 + gap + footer

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#111014'
  ctx.fillRect(0, 0, W, H)

  // Header: work + scene
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = ACCENT
  ctx.font = `700 26px ${FONT}`
  ctx.fillText(`聖地巡礼 · ${scene.workJa}`, pad, 70)
  ctx.fillStyle = '#fff'
  const heading = `${scene.titleJa}  ${text.title}`
  fitText(ctx, heading, 800, 52, imgW)
  ctx.fillText(heading, pad, 138)

  // Images
  const y1 = header
  const y2 = header + imgH + gap
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(pad, y1, imgW, imgH, 18)
  ctx.roundRect(pad, y2, imgW, imgH, 18)
  ctx.clip()
  drawCover(ctx, frame, pad, y1, imgW, imgH)
  drawCover(ctx, shot, pad, y2, imgW, imgH)
  ctx.restore()
  badge(ctx, `${text.anime} · ${scene.year}`, pad + 18, y1 + 18, 'rgba(0,0,0,.6)')
  badge(ctx, `${text.real} · ${new Date().getFullYear()}`, pad + 18, y2 + 18, ACCENT)

  // Footer
  const fy = y2 + imgH + 64
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#bbb'
  ctx.font = `500 28px ${FONT}`
  ctx.fillText(`📍 ${text.area}`, pad, fy)
  ctx.fillStyle = '#777'
  ctx.font = `400 24px ${FONT}`
  ctx.fillText(new Date().toLocaleDateString(text.locale), pad, fy + 42)
  if (scene.credit) {
    ctx.fillStyle = '#666'
    ctx.font = `400 20px ${FONT}`
    ctx.fillText(scene.credit, pad, fy + 78)
  }
  ctx.textAlign = 'right'
  ctx.fillStyle = '#fff'
  ctx.font = `800 30px ${FONT}`
  ctx.fillText('Seichi Camera', W - pad, fy)
  ctx.fillStyle = ACCENT
  ctx.font = `500 24px ${FONT}`
  ctx.fillText('#聖地巡礼 #Tokyo', W - pad, fy + 42)
  ctx.textAlign = 'left'

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed'))), 'image/jpeg', 0.9),
  )
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

export async function shareOrDownload(blob: Blob, filename: string, text: string): Promise<ShareResult> {
  const file = new File([blob], filename, { type: blob.type })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return 'shared'
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled'
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
