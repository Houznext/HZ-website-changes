export * from './apiClient.js'
import apiClientJs from './apiClient.js'

const rawBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
  'http://localhost:4000/'
const BASE_URL = rawBase.replace(/\/?$/, '/')

const apiClient = apiClientJs as any

apiClient.URLS = {
  ...apiClient.URLS,
  interiors: `${BASE_URL}interiors`,
  hero_carousel: `${BASE_URL}hero-carousel`,
  hero_carousel_upload: `${BASE_URL}hero-carousel/upload`,
  hero_carousel_settings: `${BASE_URL}hero-carousel/settings`,
  hero_carousel_reorder: `${BASE_URL}hero-carousel/reorder`,
  services_content: `${BASE_URL}services-content`,
  services_content_upload_card: `${BASE_URL}services-content`,
  services_content_upload_hero: `${BASE_URL}services-content`,
}

export default apiClient
