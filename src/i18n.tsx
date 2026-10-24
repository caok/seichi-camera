import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { L10n } from './types'

export type Lang = 'zh' | 'en'

const zh = {
  appName: '圣地巡礼相机',
  heroSub: '找到东京动漫名场面的原作机位，对准取景，一键生成「动画 vs 现实」对比卡。',
  collected: '已收集 {n}/{total}',
  list: '列表',
  map: '地图',
  nearMe: '📍 离我最近',
  exactSpot: '原地还原',
  vibeMatch: '氛围对比',
  walkThere: '🗺 步行前往',
  lineUp: '📷 对准取景',
  back: '返回',
  home: '首页',
  locationOff: '📍 定位未开启',
  locating: '📍 定位中…',
  youAreHere: '📍 已到达拍摄点！',
  facingRight: '✓ 方向正确',
  straightAhead: '↑ 直走',
  turnRight: '↻ 向右转 {deg}°',
  turnLeft: '↺ 向左转 {deg}°',
  calibrating: '🧭 校准中…',
  enableCompass: '🧭 开启指南针',
  notCalibrated: '🧭 拍摄方向待校准',
  startingCamera: '正在启动相机…',
  cameraDenied: '相机权限被拒绝。请在浏览器设置中允许后刷新页面。',
  cameraInsecure: '相机需要 HTTPS，请通过 https:// 打开本页面。',
  cameraUnsupported: '当前浏览器不支持调用相机。',
  rotateHint: '↻ 横过手机，取景框更大',
  outline: '线稿',
  anime: '原画',
  off: '关闭',
  overlay: '叠加',
  zoom: '变焦 {z}×',
  takePhoto: '拍照',
  pose: '人物站位',
  poseHint: '站到红色轮廓的位置，摆出和角色一样的姿势',
  timer: '⏱ 定时',
  timerSec: '⏱ {s} 秒',
  flipCamera: '切换镜头',
  tapToCancel: '点击取消',
  stampCollected: '获得印章：{name}',
  compare: '动画 ↔ 现实',
  yourCard: '你的对比卡',
  composing: '生成中…',
  share: '分享 / 保存',
  retake: '重拍',
  saved: '已保存到设备',
  shared: '分享成功！',
  cardAnime: '动画',
  cardReal: '现实',
  langSwitch: 'EN',
}

const en: typeof zh = {
  appName: 'Seichi Camera',
  heroSub: 'Find the exact spot from your favourite anime in Tokyo, line up the shot, and share the anime ↔ reality card.',
  collected: '{n}/{total} collected',
  list: 'List',
  map: 'Map',
  nearMe: '📍 Near me',
  exactSpot: 'Exact spot',
  vibeMatch: 'Vibe match',
  walkThere: '🗺 Walk there',
  lineUp: '📷 Line up the shot',
  back: 'Back',
  home: 'Home',
  locationOff: '📍 Location off',
  locating: '📍 Locating…',
  youAreHere: '📍 You are here!',
  facingRight: '✓ Facing the right way',
  straightAhead: '↑ Straight ahead',
  turnRight: '↻ Turn right {deg}°',
  turnLeft: '↺ Turn left {deg}°',
  calibrating: '🧭 Calibrating…',
  enableCompass: '🧭 Enable compass',
  notCalibrated: '🧭 Direction not calibrated yet',
  startingCamera: 'Starting camera…',
  cameraDenied: 'Camera permission was denied. Allow it in your browser settings and reload.',
  cameraInsecure: 'The camera needs HTTPS. Open this page over https://.',
  cameraUnsupported: 'This browser does not support camera access.',
  rotateHint: '↻ Turn your phone sideways for a bigger frame',
  outline: 'Outline',
  anime: 'Anime',
  off: 'Off',
  overlay: 'Overlay',
  zoom: 'Zoom {z}×',
  takePhoto: 'Take photo',
  pose: 'Pose',
  poseHint: 'Stand inside the red outline and strike the same pose',
  timer: '⏱ Timer',
  timerSec: '⏱ {s}s',
  flipCamera: 'Flip camera',
  tapToCancel: 'Tap to cancel',
  stampCollected: 'Stamp collected: {name}',
  compare: 'Anime ↔ Reality',
  yourCard: 'Your card',
  composing: 'Composing…',
  share: 'Share / Save',
  retake: 'Retake',
  saved: 'Saved to your device',
  shared: 'Shared!',
  cardAnime: 'ANIME',
  cardReal: 'REAL',
  langSwitch: '中文',
}

export type MsgKey = keyof typeof zh
const dicts: Record<Lang, typeof zh> = { zh, en }

const COMPASS: Record<Lang, string[]> = {
  zh: ['北', '东北', '东', '东南', '南', '西南', '西', '西北'],
  en: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
}

const LANG_KEY = 'seichi.lang'
const initialLang = (): Lang => (localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'zh')

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void } | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LANG_KEY, l)
    setLangState(l)
  }, [])
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useI18n() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useI18n must be used inside LangProvider')
  const { lang, setLang } = ctx
  const t = (key: MsgKey, vars: Record<string, string | number> = {}) =>
    dicts[lang][key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''))
  /** Pick the current language from a localized value */
  const l = (v: L10n) => v[lang]
  const compassPoint = (b: number) => COMPASS[lang][Math.round(b / 45) % 8]
  const toggle = () => setLang(lang === 'zh' ? 'en' : 'zh')
  return { lang, setLang, toggle, t, l, compassPoint }
}

export function LangToggle() {
  const { t, toggle } = useI18n()
  return (
    <button className="lang-toggle" onClick={toggle} aria-label="Switch language">
      {t('langSwitch')}
    </button>
  )
}
