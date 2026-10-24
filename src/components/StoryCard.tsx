import { useI18n } from '../i18n'
import type { SceneStory } from '../types'

/** "Story behind the shot" — revealed on the result page once the photo is taken */
export function StoryCard({ story }: { story: SceneStory }) {
  const { t, l } = useI18n()
  const rows = [
    { icon: '🎬', label: t('storyDiff'), text: l(story.diff) },
    { icon: '📖', label: t('storyStory'), text: l(story.story) },
    { icon: '💡', label: t('storyFact'), text: l(story.fact) },
  ]
  return (
    <section className="story-card">
      <p className="story-unlock">🔓 {t('storyUnlocked')}</p>
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
