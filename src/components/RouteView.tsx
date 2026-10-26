import { getScene } from '../data/scenes'
import { routeLegs, routeSources, routeStops, routeTotalTravelMin } from '../data/route'
import { useI18n } from '../i18n'
import { go } from '../router'

/** The recommended one-day route as a timeline: stop → transit leg → stop … */
export function RouteView({ stamps }: { stamps: string[] }) {
  const { t, l } = useI18n()
  return (
    <section className="route">
      <div className="route-head">
        <h2>{t('routeTitle')}</h2>
        <p className="muted">{t('routeSummary', { n: routeStops.length, from: routeStops[0].time, to: routeStops[routeStops.length - 1].time, m: routeTotalTravelMin })}</p>
      </div>
      <ol className="route-list">
        {routeStops.map((stop, i) => {
          const s = getScene(stop.id)
          if (!s) return null
          const leg = routeLegs[i]
          return (
            <li key={stop.id}>
              <button className="route-stop" onClick={() => go(`/scene/${s.id}`)}>
                <span className={`route-num ${stamps.includes(s.id) ? 'done' : ''}`}>{stamps.includes(s.id) ? '印' : i + 1}</span>
                <img src={s.frame} alt="" />
                <span className="route-body">
                  <small>
                    {stop.time} · {l(s.areaLabel)}
                  </small>
                  <strong>{l(s.title)}</strong>
                  <span className="muted">{l(s.work)}</span>
                  {stop.tip && <em>{l(stop.tip)}</em>}
                </span>
              </button>
              {leg && (
                <div className="route-leg">
                  <span className="route-leg-icon">{leg.mode === 'walk' ? '🚶' : '🚃'}</span>
                  <span>
                    <b>{t('legMin', { n: leg.min })}</b> {l(leg.text)}
                  </span>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <p className="route-note">{t('routeNote')}</p>
      <p className="route-note">
        {t('routeSources')}:{' '}
        {routeSources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && ' · '}
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          </span>
        ))}
      </p>
    </section>
  )
}
