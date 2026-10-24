import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Marker, TileLayer } from 'react-leaflet'
import { scenes } from '../data/scenes'
import { useGeolocation } from '../hooks/useGeolocation'
import { LangToggle, useI18n } from '../i18n'
import { distance, formatDistance } from '../lib/geo'
import { getStamps } from '../lib/store'
import { go } from '../router'

const pinIcon = (n: number, done: boolean) =>
  L.divIcon({
    className: '',
    html: `<div class="map-pin ${done ? 'done' : ''}">${done ? '印' : n}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })

export function HomePage() {
  const { t, l } = useI18n()
  const [view, setView] = useState<'list' | 'map'>('list')
  const [locate, setLocate] = useState(false)
  const { pos } = useGeolocation(locate)
  // Ignore stamps of scenes that were removed from the list
  const [stamps] = useState(() => getStamps().filter((id) => scenes.some((s) => s.id === id)))

  const sorted = useMemo(
    () =>
      scenes
        .map((s, i) => ({ s, n: i + 1, d: pos ? distance(pos, s.spot) : null }))
        .sort((a, b) => (a.d != null && b.d != null ? a.d - b.d : 0)),
    [pos],
  )

  return (
    <div className="page home">
      <header className="hero">
        <div className="hero-top">
          <p className="eyebrow">聖地巡礼カメラ</p>
          <LangToggle />
        </div>
        <h1>{t('appName')}</h1>
        <p className="sub">{t('heroSub')}</p>
        <div className="stamp-bar">
          {scenes.map((s) => (
            <span key={s.id} className={`stamp ${stamps.includes(s.id) ? 'got' : ''}`} title={l(s.title)}>
              印
            </span>
          ))}
          <span className="stamp-count">
            {t('collected', { n: stamps.length, total: scenes.length })}
          </span>
        </div>
      </header>

      <div className="toolbar">
        <div className="segmented light">
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            {t('list')}
          </button>
          <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
            {t('map')}
          </button>
        </div>
        {!locate && (
          <button className="btn small" onClick={() => setLocate(true)}>
            {t('nearMe')}
          </button>
        )}
      </div>

      {view === 'map' ? (
        <MapContainer
          className="map"
          bounds={L.latLngBounds(scenes.map((s) => [s.spot.lat, s.spot.lng]))}
          boundsOptions={{ padding: [40, 40] }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {sorted.map(({ s, n }) => (
            <Marker
              key={s.id}
              position={[s.spot.lat, s.spot.lng]}
              icon={pinIcon(n, stamps.includes(s.id))}
              eventHandlers={{ click: () => go(`/scene/${s.id}`) }}
            />
          ))}
          {pos && <CircleMarker center={[pos.lat, pos.lng]} radius={8} pathOptions={{ color: '#fff', fillColor: '#2b7cff', fillOpacity: 1 }} />}
        </MapContainer>
      ) : (
        <ul className="scene-list">
          {sorted.map(({ s, d }) => (
            <li key={s.id}>
              <button className="scene-card" onClick={() => go(`/scene/${s.id}`)}>
                <img src={s.frame} alt="" />
                <div className="scene-card-body">
                  <small>{l(s.work)}</small>
                  <strong>{l(s.title)}</strong>
                  <span className="muted">
                    {l(s.areaLabel)}
                    {d != null && ` · ${formatDistance(d)}`}
                  </span>
                </div>
                {stamps.includes(s.id) && <span className="stamp got corner">印</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
