import { useEffect, useState } from 'react'
import { StoryCard } from '../components/StoryCard'
import { LangToggle, useI18n } from '../i18n'
import { composeCard, shareOrDownload } from '../lib/compose'
import { addStamp, getShot, getStamps } from '../lib/store'
import { go } from '../router'
import type { Scene } from '../types'

export function ResultPage({ scene }: { scene: Scene }) {
  const shot = getShot(scene.id)
  const { t, l, lang } = useI18n()
  const [card, setCard] = useState<{ blob: Blob; url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wipe, setWipe] = useState(50)
  const [compareMode, setCompareMode] = useState<'stack' | 'wipe'>('stack')
  // Read before the effect stores the stamp, so StrictMode's double effect doesn't hide the toast
  const [newStamp] = useState(() => !getStamps().includes(scene.id))
  const [status, setStatus] = useState('')

  const cardText = {
    title: l(scene.title),
    area: l(scene.areaLabel),
    anime: t('cardAnime'),
    real: t('cardReal'),
    locale: lang === 'zh' ? 'zh-CN' : 'en-US',
    fact: scene.story ? `💡 ${l(scene.story.fact)}` : undefined,
  }
  const cardKey = JSON.stringify(cardText)

  useEffect(() => {
    if (!shot) {
      go(`/camera/${scene.id}`)
      return
    }
    addStamp(scene.id)
    let url = ''
    composeCard(scene, shot, JSON.parse(cardKey))
      .then((blob) => {
        url = URL.createObjectURL(blob)
        setCard({ blob, url })
      })
      .catch((e: Error) => setError(e.message))
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [scene, shot, cardKey])

  if (!shot) return null

  const share = async () => {
    if (!card) return
    const r = await shareOrDownload(card.blob, `seichi-${scene.id}.jpg`, `${scene.titleJa} / ${scene.workJa} #聖地巡礼 #Tokyo`)
    setStatus(r === 'downloaded' ? t('saved') : r === 'shared' ? t('shared') : '')
  }

  return (
    <div className="page result">
      <header className="topbar">
        <button className="icon-btn" onClick={() => go('/')} aria-label={t('home')}>
          ←
        </button>
        <h1>{scene.titleJa}</h1>
        <LangToggle />
      </header>

      {newStamp && (
        <div className="stamp-toast">
          <span className="stamp">印</span> {t('stampCollected', { name: l(scene.title) })}
        </div>
      )}

      <section>
        <div className="compare-head">
          <h2 className="section-title">{t('compare')}</h2>
          <div className="segmented light small">
            {(['stack', 'wipe'] as const).map((m) => (
              <button key={m} className={compareMode === m ? 'active' : ''} onClick={() => setCompareMode(m)}>
                {t(m === 'stack' ? 'compareStack' : 'compareWipe')}
              </button>
            ))}
          </div>
        </div>
        {compareMode === 'stack' ? (
          // Both images shown in full, one above the other
          <div className="compare-stack" style={{ ['--ar' as string]: scene.aspect }}>
            <figure>
              <img src={scene.frame} alt="Anime frame" />
              <figcaption>{t('cardAnime')} · {scene.year}</figcaption>
            </figure>
            <figure>
              <img src={shot} alt="Your photo" />
              <figcaption className="real">{t('cardReal')}</figcaption>
            </figure>
          </div>
        ) : (
          <div className="wipe" style={{ ['--ar' as string]: scene.aspect }}>
            <img src={shot} alt="Your photo" />
            <img src={scene.frame} alt="Anime frame" style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }} />
            <div className="wipe-line" style={{ left: `${wipe}%` }}>
              <span className="wipe-handle">⇔</span>
            </div>
            <input type="range" min={0} max={100} value={wipe} onChange={(e) => setWipe(+e.target.value)} aria-label="Compare" />
          </div>
        )}
        {compareMode === 'wipe' && <p className="hint center">{t('wipeHint')}</p>}
      </section>

      {scene.story && <StoryCard story={scene.story} />}

      <section>
        <h2 className="section-title">{t('yourCard')}</h2>
        {error && <p className="error">{error}</p>}
        {card ? <img className="card-preview" src={card.url} alt="Comparison card" /> : !error && <div className="card-loading">{t('composing')}</div>}
        {card && <p className="hint center">{t('longPressHint')}</p>}
      </section>

      <div className="actions">
        <button className="btn primary" onClick={share} disabled={!card}>
          {t('share')}
        </button>
        <button className="btn" onClick={() => go(`/camera/${scene.id}`)}>
          {t('retake')}
        </button>
      </div>
      {status && <p className="hint center">{status}</p>}
    </div>
  )
}
