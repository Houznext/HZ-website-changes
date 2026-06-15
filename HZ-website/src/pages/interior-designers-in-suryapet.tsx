import CityLandingPage from '@/components/city-landing/CityLandingPage'
import { createCityLandingStaticProps } from '@/lib/cityLandingPageProps'
import '@/styles/vikarabad-landing.css'

export default CityLandingPage

export const getStaticProps = createCityLandingStaticProps('suryapet')
