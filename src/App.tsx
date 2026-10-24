import { getScene } from './data/scenes'
import { CameraPage } from './pages/CameraPage'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'
import { ScenePage } from './pages/ScenePage'
import { useRoute } from './router'

export default function App() {
  const route = useRoute()
  const scene = route.page === 'home' ? undefined : getScene(route.id)

  if (!scene) return <HomePage />
  switch (route.page) {
    case 'scene':
      return <ScenePage key={scene.id} scene={scene} />
    case 'camera':
      return <CameraPage key={scene.id} scene={scene} />
    case 'result':
      return <ResultPage key={scene.id} scene={scene} />
    default:
      return <HomePage />
  }
}
