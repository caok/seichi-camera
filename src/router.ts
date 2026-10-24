import { useEffect, useState } from 'react'

export type Route =
  | { page: 'home' }
  | { page: 'scene'; id: string }
  | { page: 'camera'; id: string }
  | { page: 'result'; id: string }

function parse(hash: string): Route {
  const [, page, id] = hash.replace(/^#/, '').split('/')
  if ((page === 'scene' || page === 'camera' || page === 'result') && id) return { page, id }
  return { page: 'home' }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parse(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const go = (path: string) => {
  location.hash = path
}
