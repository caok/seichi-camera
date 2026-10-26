import type { L10n } from '../types'

// Recommended one-day route through all 9 scenes: west in the morning, central in the afternoon,
// Shibuya at dusk and Skytree lit up at night. Opening hours drive the order: Shinjuku Gyoen opens
// at 9:00 (closed Mondays) and SHELTER asks visitors to shoot on weekdays before 14:00.
// Travel times were checked on 2026-10-26 (sources below); they are approximate.

export interface RouteStop {
  id: string
  /** Suggested arrival time */
  time: string
  tip?: L10n
}

export interface RouteLeg {
  mode: 'walk' | 'train'
  min: number
  text: L10n
}

export const routeStops: RouteStop[] = [
  { id: 'gyoen-kotonoha', time: '9:00', tip: { zh: '开园就进，人最少；下雨天最有电影感', en: 'Go at opening for the fewest people; rain gives the film’s mood' } },
  { id: 'shinjuku-tenki', time: '10:15', tip: { zh: '云缝透光时最还原', en: 'Best when sunlight breaks through the clouds' } },
  { id: 'sangubashi-byosoku', time: '11:00' },
  { id: 'shimokita-bocchi', time: '11:30', tip: { zh: 'SHELTER 希望平日 14 点前拍完；顺便在下北泽吃午饭', en: 'SHELTER asks for weekday shots before 14:00 — have lunch in Shimokitazawa after' } },
  { id: 'ochanomizu-suzume', time: '14:00' },
  { id: 'akiba-steinsgate', time: '14:45' },
  { id: 'akiba-lovelive', time: '15:15', tip: { zh: '和收音机会馆相隔一条马路', en: 'Just across the street from Radio Kaikan' } },
  { id: 'shibuya-jujutsu', time: '17:00', tip: { zh: '傍晚到夜里最还原动画的夜景', en: 'Dusk into night matches the anime best' } },
  { id: 'skytree-conan', time: '18:30', tip: { zh: '日落后点灯，用夜景收尾', en: 'Finish with Skytree lit up after sunset' } },
]

/** legs[i] goes from routeStops[i] to routeStops[i + 1] */
export const routeLegs: RouteLeg[] = [
  { mode: 'train', min: 15, text: { zh: '丸之内线 新宿御苑前 → 西新宿（3 站），步行到都厅前', en: 'Marunouchi Line Shinjuku-gyoemmae → Nishi-Shinjuku (3 stops), walk to the Government Building' } },
  { mode: 'train', min: 18, text: { zh: '大江户线到新宿，换小田急各站停车 → 参宫桥（4 分钟）', en: 'Oedo Line to Shinjuku, then Odakyu local → Sangubashi (4 min)' } },
  { mode: 'train', min: 7, text: { zh: '小田急各站停车 参宫桥 → 下北泽，直达', en: 'Odakyu local Sangubashi → Shimokitazawa, direct' } },
  { mode: 'train', min: 25, text: { zh: '小田急到新宿，换 JR 中央线快速 → 御茶之水（8 分钟）', en: 'Odakyu to Shinjuku, then JR Chuo Rapid → Ochanomizu (8 min)' } },
  { mode: 'walk', min: 15, text: { zh: '沿神田川步行到秋叶原（或 JR 总武线 1 站）', en: 'Walk along the Kanda River to Akihabara (or JR Sobu Line, 1 stop)' } },
  { mode: 'walk', min: 3, text: { zh: '步行，过一条马路', en: 'Walk across the street' } },
  { mode: 'train', min: 30, text: { zh: 'JR 山手线 秋叶原 → 涩谷，直达', en: 'JR Yamanote Line Akihabara → Shibuya, direct' } },
  { mode: 'train', min: 31, text: { zh: '半藏门线 涩谷 → 押上（晴空塔前），直达', en: 'Hanzomon Line Shibuya → Oshiage (Skytree), direct' } },
]

export const routeSources = [
  { label: '駅探', url: 'https://ekitan.com/transit/route/sf-2216/st-2265' },
  { label: 'NAVITIME', url: 'https://www.navitime.co.jp/transfer/searchlist?orvStationCode=00003544&dnvStationCode=00000813&defaultCondition=0' },
  { label: 'Yahoo!路線情報', url: 'https://transit.yahoo.co.jp/search/result/%E4%B8%8B%E5%8C%97%E6%B2%A2-%E5%BE%A1%E8%8C%B6%E3%83%8E%E6%B0%B4' },
]

export const routeTotalTravelMin = routeLegs.reduce((s, l) => s + l.min, 0)
