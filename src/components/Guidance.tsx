import { useGeolocation } from '../hooks/useGeolocation'
import { useCompass } from '../hooks/useCompass'
import { useI18n } from '../i18n'
import { angleDiff, bearing, distance, formatDistance } from '../lib/geo'
import type { Scene } from '../types'

/** Within this radius the user is considered "at the spot" */
const ARRIVED_M = 40
/** Heading tolerance when lining up the shot */
const ALIGNED_DEG = 12

export function Guidance({ scene, compact = false }: { scene: Scene; compact?: boolean }) {
  const { pos, accuracy, error } = useGeolocation(true)
  const { heading, state, start } = useCompass()
  const { t, compassPoint } = useI18n()

  const dist = pos ? distance(pos, scene.spot) : null
  const arrived = dist != null && dist <= Math.max(ARRIVED_M, accuracy ?? 0)

  // Far away: point towards the spot. At the spot: point the way the camera should face.
  const target = arrived ? scene.heading : pos ? bearing(pos, scene.spot) : undefined
  const diff = target != null && heading != null ? angleDiff(target, heading) : null

  let turnText = ''
  if (diff != null) {
    if (Math.abs(diff) <= ALIGNED_DEG) turnText = arrived ? t('facingRight') : t('straightAhead')
    else turnText = t(diff > 0 ? 'turnRight' : 'turnLeft', { deg: Math.round(Math.abs(diff)) })
  }

  return (
    <div className={`guidance ${compact ? 'compact' : ''}`}>
      <span className={`pill ${arrived ? 'ok' : ''}`}>
        {error
          ? t('locationOff')
          : dist == null
            ? t('locating')
            : arrived
              ? t('youAreHere')
              : `📍 ${formatDistance(dist)} ${compassPoint(bearing(pos!, scene.spot))}`}
      </span>
      {target != null &&
        (state === 'granted' ? (
          <span className={`pill ${diff != null && Math.abs(diff) <= ALIGNED_DEG ? 'ok' : ''}`}>
            {turnText || t('calibrating')}
          </span>
        ) : state === 'idle' ? (
          <button className="pill button" onClick={start}>
            {t('enableCompass')}
          </button>
        ) : null)}
      {arrived && scene.heading == null && <span className="pill">{t('notCalibrated')}</span>}
    </div>
  )
}
