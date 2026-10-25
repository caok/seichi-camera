import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import { isMuted, playChime, setMuted, unlockAudio } from '../lib/sound'
import type { SceneStory } from '../types'

const trailerUrl = (v: { videoId: string; t: number }) => `https://www.youtube.com/watch?v=${v.videoId}&t=${v.t}s`

/** "Story behind the shot" — revealed on the result page once the photo is taken */
export function StoryCard({ story }: { story: SceneStory }) {
  const { t, l } = useI18n()
  const [muted, setMutedState] = useState(isMuted)

  // Chime as the card slides in (matches the .3s reveal delay)
  useEffect(() => {
    const id = setTimeout(playChime, 300)
    return () => clearTimeout(id)
  }, [])

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
    if (!next) {
      unlockAudio()
      playChime()
    }
  }
  const rows = [
    { icon: '🎬', label: t('storyDiff'), text: l(story.diff) },
    { icon: '📖', label: t('storyStory'), text: l(story.story) },
    { icon: '💡', label: t('storyFact'), text: l(story.fact) },
  ]
  return (
    <section className="story-card">
      <div className="story-head">
        <p className="story-unlock">🔓 {t('storyUnlocked')}</p>
        <button className="sound-toggle" onClick={toggleMute} aria-label={t(muted ? 'soundOff' : 'soundOn')} title={t(muted ? 'soundOff' : 'soundOn')}>
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
      <h2>{t('storyTitle')}</h2>
      {rows.map((r) => (
        <div key={r.icon} className="story-row">
          <span className="story-icon">{r.icon}</span>
          <div>
            <strong>{r.label}</strong>
            <p>{r.text}</p>
          </div>
        </div>
      ))}
      {story.trailer && (
        <a className="btn trailer-btn" href={trailerUrl(story.trailer)} target="_blank" rel="noreferrer">
          ▶ {t('storyTrailer')}
        </a>
      )}
      <p className="story-sources">
        {t('storySources')}:{' '}
        {story.sources.map((s, i) => (
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
