import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { storage } from './lib/storage'
import type { L10n } from './types'

export type Lang = 'zh' | 'en'

const zh = {
  appName: '圣地巡礼相机',
  heroSub: '找到东京动漫名场面的原作机位，对准取景，一键生成「动画 vs 现实」对比卡。',
  collected: '已收集 {n}/{total}',
  list: '列表',
  map: '地图',
  route: '路线',
  routeTitle: '东京一日巡礼路线',
  routeSummary: '{n} 个场景 · {from}–{to} · 移动合计约 {m} 分钟',
  legMin: '约 {n} 分钟',
  routeNote: '建议平日出发：新宿御苑周一闭园，下北泽 SHELTER 希望平日 14 点前拍摄。时间为估算，出发前请用换乘 App 确认。',
  routeSources: '换乘时间参考',
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
  accessLine: '{station} 步行约 {min} 分钟',
  nudgeHint: '拖动/滚轮微调叠加位置，双击复位',
  resetNudge: '复位叠加',
  takePhoto: '拍照',
  pose: '人物站位',
  poseHint: '站到红色轮廓的位置，摆出和角色一样的姿势',
  timer: '⏱ 定时',
  timerSec: '⏱ {s} 秒',
  flipCamera: '切换镜头',
  gallery: '从相册选照片',
  galleryHint: '备用方案：用一张在现场拍好的照片继续',
  galleryFromScene: '相机用不了？从相册选一张现场照片',
  retryCamera: '重试相机',
  retried: '已重试 {n} 次',
  tapToCancel: '点击取消',
  stampCollected: '获得印章：{name}',
  compare: '动画 ↔ 现实',
  alignTitle: '对齐度',
  alignComputing: '正在比对原作…',
  alignPerfect: '完美复刻！',
  alignClose: '相当接近',
  alignGetting: '有几分神似',
  alignKeepTrying: '还差一点',
  alignHintLeft: '镜头再往左转一点，会更像原作',
  alignHintRight: '镜头再往右转一点，会更像原作',
  alignHintUp: '镜头再往上抬一点，会更像原作',
  alignHintDown: '镜头再往下压一点，会更像原作',
  alignHintFar: '离原作机位还有点距离，对照线稿再找找',
  compareStack: '上下对比',
  compareWipe: '滑动对比',
  wipeHint: '左右拖动画面，切换动画和现实',
  yourCard: '你的对比卡',
  composing: '生成中…',
  share: '分享 / 保存',
  retake: '重拍',
  saved: '已保存到设备',
  longPressHint: '也可以长按上面的图片保存到相册',
  storyUnlocked: '拍摄成功，解锁新内容',
  storyTitle: '镜头背后的故事',
  storyDiff: '原作 vs 现实',
  storyStory: '背后的故事',
  storyFact: '冷知识',
  storySources: '资料来源',
  storyTrailer: '在官方预告片里看这一幕',
  soundOn: '音效：开（点击静音）',
  soundOff: '音效：关（点击开启）',
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
  route: 'Route',
  routeTitle: 'One-day Tokyo pilgrimage',
  routeSummary: '{n} scenes · {from}–{to} · about {m} min of travel',
  legMin: '~{n} min',
  routeNote: 'Go on a weekday: Shinjuku Gyoen is closed on Mondays and SHELTER asks for weekday shots before 14:00. Times are estimates — check a transit app before you set off.',
  routeSources: 'Travel times from',
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
  accessLine: '{min} min walk from {station}',
  nudgeHint: 'Drag to nudge the overlay, double-tap to reset',
  resetNudge: 'Reset overlay',
  takePhoto: 'Take photo',
  pose: 'Pose',
  poseHint: 'Stand inside the red outline and strike the same pose',
  timer: '⏱ Timer',
  timerSec: '⏱ {s}s',
  flipCamera: 'Flip camera',
  gallery: 'Pick from gallery',
  galleryHint: 'Backup: continue with a photo you took on site',
  galleryFromScene: 'Camera not working? Pick a photo you took on site',
  retryCamera: 'Retry camera',
  retried: 'Retried {n}×',
  tapToCancel: 'Tap to cancel',
  stampCollected: 'Stamp collected: {name}',
  compare: 'Anime ↔ Reality',
  alignTitle: 'Match',
  alignComputing: 'Comparing with the original…',
  alignPerfect: 'Spot on!',
  alignClose: 'Very close',
  alignGetting: 'Getting there',
  alignKeepTrying: 'Not quite yet',
  alignHintLeft: 'Turn the camera a little to the left to match better',
  alignHintRight: 'Turn the camera a little to the right to match better',
  alignHintUp: 'Tilt the camera up a little to match better',
  alignHintDown: 'Tilt the camera down a little to match better',
  alignHintFar: 'Still a way off the original spot — use the outline to find it',
  compareStack: 'Stacked',
  compareWipe: 'Slider',
  wipeHint: 'Drag across the image to switch between anime and reality',
  yourCard: 'Your card',
  composing: 'Composing…',
  share: 'Share / Save',
  retake: 'Retake',
  saved: 'Saved to your device',
  longPressHint: 'You can also long-press the image above to save it',
  storyUnlocked: 'Unlocked by your shot',
  storyTitle: 'The story behind the shot',
  storyDiff: 'Anime vs reality',
  storyStory: 'Behind the scene',
  storyFact: 'Fun fact',
  storySources: 'Sources',
  storyTrailer: 'Watch this scene in the official trailer',
  soundOn: 'Sound on (tap to mute)',
  soundOff: 'Sound off (tap to unmute)',
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
const initialLang = (): Lang => (storage.get(LANG_KEY) === 'en' ? 'en' : 'zh')

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void } | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const setLang = useCallback((l: Lang) => {
    storage.set(LANG_KEY, l)
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
