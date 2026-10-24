import { useCallback, useEffect, useState } from 'react'

type CompassState = 'idle' | 'granted' | 'denied' | 'unsupported'

interface IOSOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

type PermissionRequester = { requestPermission?: () => Promise<'granted' | 'denied'> }

/**
 * Device compass heading (0 = north, clockwise).
 * iOS needs `start()` to be called from a user gesture to ask for permission.
 */
export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null)
  const [state, setState] = useState<CompassState>('idle')

  const start = useCallback(async () => {
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setState('unsupported')
      return
    }
    const req = (window.DeviceOrientationEvent as unknown as PermissionRequester).requestPermission
    if (typeof req === 'function') {
      try {
        if ((await req()) !== 'granted') {
          setState('denied')
          return
        }
      } catch {
        setState('denied')
        return
      }
    }
    setState('granted')
  }, [])

  useEffect(() => {
    if (state !== 'granted') return
    // iOS Safari
    const onIOS = (e: IOSOrientationEvent) => {
      if (typeof e.webkitCompassHeading === 'number') setHeading(e.webkitCompassHeading)
    }
    // Android Chrome
    const onAbsolute = (e: DeviceOrientationEvent) => {
      if (e.alpha != null) setHeading((360 - e.alpha) % 360)
    }
    window.addEventListener('deviceorientation', onIOS)
    window.addEventListener('deviceorientationabsolute', onAbsolute)
    return () => {
      window.removeEventListener('deviceorientation', onIOS)
      window.removeEventListener('deviceorientationabsolute', onAbsolute)
    }
  }, [state])

  return { heading, state, start }
}
