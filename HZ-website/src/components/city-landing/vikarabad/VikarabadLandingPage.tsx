import CityLandingPage from '../CityLandingPage'
import type { CityLandingContent } from '@/lib/cityLandingCms'

export default function VikarabadLandingPage({ content }: { content: CityLandingContent }) {
  return <CityLandingPage content={content} citySlug="vikarabad" />
}
