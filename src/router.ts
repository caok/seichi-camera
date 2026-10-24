import { useEffect, useState } from 'react'

export type Route =
  | { page: 'home' }
  | { page: 'scene'; id: string }
  | { page: 'camera'; id: string }
  | { page: 'result'; id: string }

/**
 * The hash looks like `#/scene/<id>~<state>`: the part before `~` is the route, the part after
 * is persisted app state (see lib/storage.ts) that must survive navigation and reloads.
 */
export const STATE_SEP = '~'
export const routeOf = (hash: string) => hash.replace(/^#/, '').split(STATE_SEP)[0] || '/'
export const stateOf = (hash: string) => hash.replace(/^#/, '').split(STATE_SEP)[1] ?? ''

function parse(path: string): Route {
  const [, page, id] = path.split('/')
  if ((page === 'scene' || page === 'camera' || page === 'result') && id) return { page, id }
  return { page: 'home' }
}

export function useRoute(): Route {
  const [path, setPath] = useState(() => routeOf(location.hash))
  useEffect(() => {
    const onChange = () => {
      const next = routeOf(location.hash)
      // State-only updates (e.g. a new stamp) keep the same route: don't re-render or scroll
      setPath((prev) => {
        if (prev !== next) window.scrollTo(0, 0)
        return next
      })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return parse(path)
}

export const go = (path: string) => {
  const state = stateOf(location.hash)
  location.hash = state ? `${path}${STATE_SEP}${state}` : path
}
