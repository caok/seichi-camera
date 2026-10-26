// "How well does the photo line up with the original?" — computed on-device, no server or model.
//
// Both images are reduced to a small edge-orientation map. For every pixel of the scene's outline
// (the scenery edges, characters already removed) we look for a photo edge nearby that runs in the
// same direction. The raw match is compared against a chance baseline (the same outline slid far
// off its position), so busy photos don't score high just for having lots of edges, and against the
// original frame's own match (the per-scene "perfect" level, since some outlines are hand-tuned).
// A small local search also tells us which way to turn the camera.

const W = 160
const H = 90
const SEARCH = 6 // px at 160 wide ≈ 4% of the frame
const TOL = 2 // neighbourhood radius for "nearby" edges

export interface AlignResult {
  /** 0–100 */
  score: number
  /** Which way to turn the camera to improve, if a clear shift was found */
  hint: 'left' | 'right' | 'up' | 'down' | null
  raw: number
  baseline: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

function pixels(img: HTMLImageElement): Uint8ClampedArray {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d', { willReadFrequently: true })!
  g.drawImage(img, 0, 0, W, H)
  return g.getImageData(0, 0, W, H).data
}

function boxBlur(src: Float32Array): Float32Array {
  const out = new Float32Array(src.length)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let s = 0
      let n = 0
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx
          const yy = y + dy
          if (xx >= 0 && yy >= 0 && xx < W && yy < H) {
            s += src[yy * W + xx]
            n++
          }
        }
      out[y * W + x] = s / n
    }
  return out
}

/** Edge strength (normalised to 0–1) and orientation (structure tensor, mod 180°) */
function edgeField(gray: Float32Array) {
  const gx = new Float32Array(W * H)
  const gy = new Float32Array(W * H)
  const at = (x: number, y: number) => gray[Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))]
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      gx[y * W + x] = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1)
      gy[y * W + x] = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1)
    }
  const jxx = new Float32Array(W * H)
  const jyy = new Float32Array(W * H)
  const jxy = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) {
    jxx[i] = gx[i] * gx[i]
    jyy[i] = gy[i] * gy[i]
    jxy[i] = gx[i] * gy[i]
  }
  const [sxx, syy, sxy] = [boxBlur(jxx), boxBlur(jyy), boxBlur(jxy)]
  const mag = new Float32Array(W * H)
  const ang = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) {
    mag[i] = Math.sqrt(sxx[i] + syy[i])
    ang[i] = 0.5 * Math.atan2(2 * sxy[i], sxx[i] - syy[i])
  }
  // normalise by the 90th percentile so exposure / contrast don't matter
  const sorted = Float32Array.from(mag).sort()
  const p90 = sorted[Math.floor(sorted.length * 0.9)] || 1
  for (let i = 0; i < W * H; i++) mag[i] = Math.min(1, mag[i] / p90)
  return { mag, ang }
}

function toGray(px: Uint8ClampedArray): Float32Array {
  const g = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) g[i] = (0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]) / 255
  return boxBlur(g)
}

function toAlpha(px: Uint8ClampedArray): Float32Array {
  const a = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) a[i] = px[i * 4 + 3] / 255
  return boxBlur(a)
}

/** Precompute, for every pixel, the best oriented photo-edge support in a small neighbourhood per orientation bucket */
const BINS = 8
function supportMaps(photo: { mag: Float32Array; ang: Float32Array }): Float32Array[] {
  const maps: Float32Array[] = []
  for (let b = 0; b < BINS; b++) {
    const theta = (b / BINS) * Math.PI - Math.PI / 2
    const local = new Float32Array(W * H)
    for (let i = 0; i < W * H; i++) {
      const c = Math.cos(photo.ang[i] - theta)
      local[i] = photo.mag[i] * c * c
    }
    // max filter over (2·TOL+1)²
    const out = new Float32Array(W * H)
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        let m = 0
        for (let dy = -TOL; dy <= TOL; dy++) {
          const yy = y + dy
          if (yy < 0 || yy >= H) continue
          for (let dx = -TOL; dx <= TOL; dx++) {
            const xx = x + dx
            if (xx >= 0 && xx < W && local[yy * W + xx] > m) m = local[yy * W + xx]
          }
        }
        out[y * W + x] = m
      }
    maps.push(out)
  }
  return maps
}

/** Match quality of one image against the outline: best nearby shift + chance baseline */
function measure(img: HTMLImageElement, pts: { x: number; y: number; b: number }[]) {
  const maps = supportMaps(edgeField(toGray(pixels(img))))
  const match = (sx: number, sy: number) => {
    let s = 0
    let n = 0
    for (const p of pts) {
      const x = p.x + sx
      const y = p.y + sy
      if (x < 0 || y < 0 || x >= W || y >= H) continue
      s += maps[p.b][y * W + x]
      n++
    }
    return n > pts.length * 0.5 ? s / n : 0
  }

  // best match near the original position (forgiving small framing differences)
  let best = { v: -1, dx: 0, dy: 0 }
  for (let dy = -SEARCH; dy <= SEARCH; dy += 2)
    for (let dx = -SEARCH; dx <= SEARCH; dx += 2) {
      const v = match(dx, dy) - 0.0015 * (Math.abs(dx) + Math.abs(dy)) // prefer no shift on ties
      if (v > best.v) best = { v, dx, dy }
    }

  // chance level: the outline slid far away from where it belongs
  const far: number[] = []
  for (const [sx, sy] of [[-40, 0], [40, 0], [0, -25], [0, 25], [-30, -20], [30, 20], [-30, 20], [30, -20]]) {
    const v = match(sx, sy)
    if (v > 0) far.push(v)
  }
  far.sort((a, b) => a - b)
  return { ...best, baseline: far.length ? far[Math.floor(far.length / 2)] : 0.2 }
}

export async function alignScore(shotUrl: string, outlineUrl: string, frameUrl: string): Promise<AlignResult> {
  const [shot, outline, frame] = await Promise.all([loadImage(shotUrl), loadImage(outlineUrl), loadImage(frameUrl)])
  const refAlpha = toAlpha(pixels(outline))
  const ref = edgeField(refAlpha)

  // reference edge pixels with their orientation bucket
  const pts: { x: number; y: number; b: number }[] = []
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = y * W + x
      if (refAlpha[i] > 0.12) {
        const b = Math.round(((ref.ang[i] + Math.PI / 2) / Math.PI) * BINS) % BINS
        pts.push({ x, y, b })
      }
    }
  if (pts.length < 30) return { score: 0, hint: null, raw: 0, baseline: 0 }

  const photo = measure(shot, pts)
  const perfect = measure(frame, pts) // the original frame lined up with its own outline
  const baseline = photo.baseline
  const raw = photo.v
  const ceiling = Math.max(baseline + 0.05, perfect.v)
  const match = Math.min(1, Math.max(0, (raw - baseline) / (ceiling - baseline)))
  // never show a flat 0 — a real photo never looks exactly like the drawing
  const score = Math.round(5 + 95 * match)
  const best = photo

  // content sits right of where it should → the camera points too far left → turn right
  let hint: AlignResult['hint'] = null
  if (score < 90 && (best.dx !== 0 || best.dy !== 0)) {
    hint = Math.abs(best.dx) >= Math.abs(best.dy) ? (best.dx > 0 ? 'right' : 'left') : best.dy > 0 ? 'down' : 'up'
  }
  return { score, hint, raw, baseline }
}
