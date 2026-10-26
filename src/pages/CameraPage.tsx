import { useEffect, useRef, useState } from 'react'
import { Guidance } from '../components/Guidance'
import { useI18n } from '../i18n'
import { CameraError, captureFrame, describeError, openCamera, stopCamera, type Facing } from '../lib/camera'
import { shotFromGallery } from '../lib/gallery'
import { unlockAudio } from '../lib/sound'
import { setShot } from '../lib/store'
import { go } from '../router'
import type { Scene } from '../types'

type OverlayMode = 'outline' | 'frame' | 'off'

const TIMERS = [0, 3, 10] as const
type Timer = (typeof TIMERS)[number]

/** Overlay nudge state: offset in px (of the rendered overlay) and extra scale on top of camera zoom. */
type Nudge = { dx: number; dy: number; s: number }
const NUDGE_NONE: Nudge = { dx: 0, dy: 0, s: 1 }

export function CameraPage({ scene }: { scene: Scene }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const { t } = useI18n()
  const [error, setError] = useState<'denied' | 'insecure' | 'unsupported' | string | null>(null)
  const [ready, setReady] = useState(false)
  const [facing, setFacing] = useState<Facing>('environment')
  const [mode, setMode] = useState<OverlayMode>('outline')
  const [showPose, setShowPose] = useState(Boolean(scene.pose))
  const [opacity, setOpacity] = useState(0.7)
  const [zoom, setZoom] = useState(1)
  const [nudge, setNudge] = useState<Nudge>(NUDGE_NONE)
  const [timer, setTimer] = useState<Timer>(0)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  // Bumped by the retry button to reopen the camera
  const [attempt, setAttempt] = useState(0)

  // (Re)open the camera whenever the lens changes or the user retries
  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    setReady(false)
    setError(null)
    const start = async () => {
      let s: MediaStream
      try {
        s = await openCamera(facing)
      } catch (e) {
        if (e instanceof CameraError) throw e
        if ((e as Error)?.name === 'NotAllowedError') throw new Error('denied')
        throw new Error(`getUserMedia → ${describeError(e)}`)
      }
      if (cancelled) return stopCamera(s)
      stream = s
      const v = videoRef.current
      if (!v) throw new Error('video element missing')
      v.srcObject = s
      try {
        await v.play()
      } catch (e) {
        // iOS can reject play() even though frames arrive; accept the stream if it has a size
        await new Promise((r) => setTimeout(r, 800))
        if (!v.videoWidth) throw new Error(`play → ${describeError(e)}`)
      }
      if (!cancelled) setReady(true)
    }
    start().catch((e: Error) => !cancelled && setError(e instanceof CameraError ? e.code : e.message))
    return () => {
      cancelled = true
      stopCamera(stream)
    }
  }, [facing, attempt])

  const capture = () => {
    const v = videoRef.current
    if (!v || !ready) return
    setShot(scene.id, captureFrame(v, scene.aspect, zoom))
    setFlash(true)
    setTimeout(() => go(`/result/${scene.id}`), 180)
  }

  // Self-timer countdown; captures when it reaches 0
  useEffect(() => {
    if (countdown == null) return
    if (countdown === 0) {
      setCountdown(null)
      capture()
      return
    }
    navigator.vibrate?.(30)
    const id = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(id)
    // capture reads the latest zoom/ready on each render, so only the countdown drives this effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  const onShutter = () => {
    unlockAudio()
    if (countdown != null) return setCountdown(null)
    if (timer) setCountdown(timer)
    else capture()
  }

  const nextTimer = () => setTimer(TIMERS[(TIMERS.indexOf(timer) + 1) % TIMERS.length])

  // ---- Overlay nudge: one-finger drag to move, pinch to scale, double-tap to reset ----
  // Purely a viewfinder alignment aid: captureFrame() crops the video, not the overlay,
  // so nudging can never distort the saved photo.
  const gesture = useRef<{ active: boolean; x0: number; y0: number; dx0: number; dy0: number; pinch: null | { d0: number; s0: number } }>({ active: false, x0: 0, y0: 0, dx0: 0, dy0: 0, pinch: null })
  const lastTap = useRef(0)
  const onGestureStart = (e: React.PointerEvent) => {
    if (mode === 'off') return
    gesture.current.active = true
    gesture.current.x0 = e.clientX
    gesture.current.y0 = e.clientY
    gesture.current.dx0 = nudge.dx
    gesture.current.dy0 = nudge.dy
    if (e.pointerType === 'touch') (e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onGestureMove = (e: React.PointerEvent) => {
    if (!gesture.current.active) return
    setNudge((n) => ({ ...n, dx: gesture.current.dx0 + (e.clientX - gesture.current.x0), dy: gesture.current.dy0 + (e.clientY - gesture.current.y0) }))
  }
  const onGestureEnd = () => { gesture.current.active = false }
  const onWheel = (e: React.WheelEvent) => {
    if (mode === 'off') return
    e.preventDefault()
    setNudge((n) => ({ ...n, s: Math.min(2.5, Math.max(0.5, n.s * (e.deltaY < 0 ? 1.05 : 0.95))) }))
  }
  const onDoubleTap = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) setNudge(NUDGE_NONE)
    lastTap.current = now
  }

  const overlayTransform = `translate(${nudge.dx}px, ${nudge.dy}px) scale(${zoom * nudge.s})`

  const pickFromGallery = () => {
    unlockAudio()
    fileRef.current?.click()
  }
  const onGalleryPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    shotFromGallery(file, scene.id, scene.aspect).then(() => go(`/result/${scene.id}`), (err: Error) => setError(err.message))
  }

  return (
    <div className="camera">
      <header className="camera-top">
        <button className="icon-btn" onClick={() => go(`/scene/${scene.id}`)} aria-label={t('back')}>
          ←
        </button>
        <div className="camera-title">
          <strong>{scene.titleJa}</strong>
          <small>{scene.workJa}</small>
        </div>
      </header>

      <Guidance scene={scene} compact />

      <div
        className="viewport nudgeable"
        style={{ ['--ar' as string]: scene.aspect, ['touchAction' as string]: 'none' }}
        onPointerDown={onGestureStart}
        onPointerMove={onGestureMove}
        onPointerUp={onGestureEnd}
        onPointerCancel={onGestureEnd}
        onWheel={onWheel}
        onClick={onDoubleTap}
      >
        {/* Not mirrored even on the front lens, so the scenery lines up with the anime frame.
            The overlays scale with the same zoom as the video, so the outline stays aligned
            with what captureFrame() will actually crop. Drag/pinch the viewport to nudge
            the overlay when the spot/heading is slightly off; double-tap resets. */}
        <video ref={videoRef} playsInline muted autoPlay style={{ transform: `scale(${zoom})` }} />
        {mode !== 'off' && (
          <img
            className={`overlay ${mode}`}
            src={mode === 'outline' ? scene.outline : scene.frame}
            style={{ opacity, transform: overlayTransform }}
            alt=""
          />
        )}
        {showPose && scene.pose && (
          <img className="overlay pose" src={scene.pose} style={{ transform: overlayTransform }} alt="" />
        )}
        {countdown != null && (
          <button className="countdown" onClick={() => setCountdown(null)}>
            <span key={countdown}>{countdown}</span>
            <small>{t('tapToCancel')}</small>
          </button>
        )}
        {flash && <div className="flash" />}
        {error && (
          <div className="camera-error">
            <p>{error === 'denied' ? t('cameraDenied') : error === 'insecure' ? t('cameraInsecure') : error === 'unsupported' ? t('cameraUnsupported') : error}</p>
            <button className="btn primary" onClick={() => setAttempt(attempt + 1)}>
              📷 {t('retryCamera')}
            </button>
            {attempt > 0 && <small>{t('retried', { n: attempt })}</small>}
            {/* Backup only: the camera is the main way to take the shot */}
            <button className="btn" onClick={pickFromGallery}>
              🖼 {t('gallery')}
            </button>
            <small>{t('galleryHint')}</small>
          </div>
        )}
        {!error && !ready && <div className="camera-error">{t('startingCamera')}</div>}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onGalleryPick} />
      </div>

      {showPose && scene.pose ? (
        <p className="hint pose-hint">{t('poseHint')}</p>
      ) : (
        scene.aspect > 1.2 && <p className="hint portrait-only">{t('rotateHint')}</p>
      )}

      <div className="controls">
        <div className="controls-top">
          <div className="segmented">
            {(['outline', 'frame', 'off'] as const).map((m) => (
              <button key={m} className={mode === m ? 'active' : ''} onClick={() => setMode(m)}>
                {t(m === 'outline' ? 'outline' : m === 'frame' ? 'anime' : 'off')}
              </button>
            ))}
          </div>
          {scene.pose && (
            <button className={`chip pose ${showPose ? 'active' : ''}`} onClick={() => setShowPose(!showPose)} aria-pressed={showPose}>
              🧍 {t('pose')}
            </button>
          )}
        </div>
        <label className="slider">
          <span>{t('overlay')}</span>
          <input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(+e.target.value)} />
        </label>
        <label className="slider">
          <span>{t('zoom', { z: zoom.toFixed(1) })}</span>
          <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(+e.target.value)} />
        </label>
        {(nudge.dx !== 0 || nudge.dy !== 0 || nudge.s !== 1) && (
          <button className="chip" onClick={() => setNudge(NUDGE_NONE)}>
            ⟲ {t('resetNudge')}
          </button>
        )}
        <p className="hint nudge-hint">{t('nudgeHint')}</p>
        {/* Like a phone camera: timer · shutter · flip */}
        <div className="shutter-row">
          <button className={`round-btn ${timer ? 'active' : ''}`} onClick={nextTimer} aria-label={t('timer')} title={t('timer')}>
            ⏱{timer > 0 && <small>{timer}s</small>}
          </button>
          <button className={`shutter ${countdown != null ? 'counting' : ''}`} onClick={onShutter} disabled={!ready} aria-label={t('takePhoto')} />
          <button
            className="round-btn"
            onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')}
            aria-label={t('flipCamera')}
            title={t('flipCamera')}
          >
            ⟲
          </button>
        </div>
      </div>
    </div>
  )
}
