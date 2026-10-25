import { useRef } from 'react'
import { Guidance } from '../components/Guidance'
import { LangToggle, useI18n } from '../i18n'
import { shotFromGallery } from '../lib/gallery'
import { mapsUrl } from '../lib/geo'
import { unlockAudio } from '../lib/sound'
import { go } from '../router'
import type { Scene } from '../types'

export function ScenePage({ scene }: { scene: Scene }) {
  const { t, l } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) shotFromGallery(file, scene.id, scene.aspect).then(() => go(`/result/${scene.id}`), () => {})
  }
  return (
    <div className="page scene">
      <header className="topbar">
        <button className="icon-btn" onClick={() => go('/')} aria-label={t('back')}>
          ←
        </button>
        <h1>{scene.titleJa}</h1>
        <LangToggle />
      </header>

      <figure className="scene-figure">
        <img className="scene-frame" src={scene.frame} alt={`${l(scene.work)} — ${l(scene.title)}`} style={{ aspectRatio: scene.aspect }} />
        {scene.credit && <figcaption>{scene.credit}</figcaption>}
      </figure>

      <section className="scene-info">
        <p className="eyebrow">
          {scene.workJa} · {scene.year}
        </p>
        <h2>
          {l(scene.title)} <span className="muted">— {l(scene.work)}</span>
        </h2>
        <span className={`tag ${scene.matchType}`}>{t(scene.matchType === 'exact' ? 'exactSpot' : 'vibeMatch')}</span>
        <p>{l(scene.description)}</p>
        <ul className="tips">
          {scene.tips.map((tip) => (
            <li key={tip.en}>{l(tip)}</li>
          ))}
        </ul>
      </section>

      <Guidance scene={scene} />

      <div className="actions">
        <a className="btn" href={mapsUrl(scene.spot)} target="_blank" rel="noreferrer">
          {t('walkThere')}
        </a>
        <button className="btn primary" onClick={() => go(`/camera/${scene.id}`)}>
          {t('lineUp')}
        </button>
      </div>
      <button
        className="gallery-link"
        onClick={() => {
          unlockAudio()
          fileRef.current?.click()
        }}
      >
        🖼 {t('galleryFromScene')}
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
    </div>
  )
}
