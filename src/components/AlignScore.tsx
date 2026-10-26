import { useI18n, type MsgKey } from '../i18n'
import type { AlignResult } from '../lib/align'

const alignRating = (score: number): MsgKey =>
  score >= 80 ? 'alignPerfect' : score >= 60 ? 'alignClose' : score >= 35 ? 'alignGetting' : 'alignKeepTrying'

const HINT: Record<NonNullable<AlignResult['hint']>, MsgKey> = {
  left: 'alignHintLeft',
  right: 'alignHintRight',
  up: 'alignHintUp',
  down: 'alignHintDown',
}

/** Ring gauge with the alignment score, a rating and a tip for the next shot */
export function AlignScore({ result }: { result: AlignResult | null | undefined }) {
  const { t } = useI18n()
  if (result === null) return null // scoring failed — just leave it out
  const score = result?.score ?? 0
  const r = 34
  const c = 2 * Math.PI * r
  const tip = !result ? '' : result.score >= 80 ? '' : result.score < 35 ? t('alignHintFar') : result.hint ? t(HINT[result.hint]) : ''

  return (
    <section className={`align ${result ? 'ready' : ''}`}>
      <svg viewBox="0 0 80 80" className="align-ring" aria-hidden="true">
        <circle cx="40" cy="40" r={r} className="track" />
        <circle cx="40" cy="40" r={r} className="value" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="align-num">{result ? score : '…'}</div>
      <div className="align-text">
        <small>{t('alignTitle')}</small>
        <strong>{result ? t(alignRating(score)) : t('alignComputing')}</strong>
        {tip && <p>{tip}</p>}
      </div>
    </section>
  )
}
