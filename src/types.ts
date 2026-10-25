export interface LatLng {
  lat: number
  lng: number
}

/** A string in every supported UI language */
export interface L10n {
  zh: string
  en: string
}

/** "Story behind the shot", revealed after taking the photo. Every item should be backed by `sources`. */
export interface SceneStory {
  /** What the anime shows vs what is there now */
  diff: L10n
  /** What happened around the place / the work */
  story: L10n
  /** One-liner also printed on the share card */
  fact: L10n
  sources: { label: string; url: string }[]
  /** Official trailer on YouTube and the second where this scene appears */
  trailer?: { videoId: string; t: number }
}

export interface Scene {
  id: string
  /** Anime / film title */
  work: L10n
  /** Original Japanese title */
  workJa: string
  year: number
  /** Scene name */
  title: L10n
  titleJa: string
  areaLabel: L10n
  /** Where to stand when shooting */
  spot: LatLng
  /** Direction the camera should face (0 = north, clockwise). Undefined = not calibrated yet */
  heading?: number
  /** Width / height of the original frame */
  aspect: number
  /** Original frame (replace the placeholder with a real screenshot) */
  frame: string
  /** Transparent outline image used for alignment */
  outline: string
  /** Transparent outline of the characters, shown as a separate coloured layer so visitors can pose like them */
  pose?: string
  /** Copyright notice for the original frame, shown wherever the frame appears */
  credit?: string
  /** exact = the real place looks like the frame; vibe = recreated / fictionalised place */
  matchType: 'exact' | 'vibe'
  description: L10n
  tips: L10n[]
  story?: SceneStory
  /** Whether spot / heading have been checked on site */
  verified: boolean
}
