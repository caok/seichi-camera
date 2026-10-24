import { useEffect, useState } from 'react'
import type { LatLng } from '../types'

export interface GeoState {
  pos: LatLng | null
  accuracy: number | null
  error: string | null
}

/** Watches the user's position while `enabled` is true */
export function useGeolocation(enabled: boolean): GeoState {
  const [state, setState] = useState<GeoState>({ pos: null, accuracy: null, error: null })

  useEffect(() => {
    if (!enabled) return
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: 'Location is not supported on this device' }))
      return
    }
    const id = navigator.geolocation.watchPosition(
      (p) =>
        setState({
          pos: { lat: p.coords.latitude, lng: p.coords.longitude },
          accuracy: p.coords.accuracy,
          error: null,
        }),
      (e) => setState((s) => ({ ...s, error: e.message || 'Location unavailable' })),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [enabled])

  return state
}
