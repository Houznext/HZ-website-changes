import { fetchWithTimeout, getPublicApiBase } from '@/lib/fetchWithTimeout'

export interface ServiceContent {
  id: number
  slug: string
  cardTitle: string
  cardDescription: string
  cardImageUrl: string
  cardBadge: string
  heroHeadline: string
  heroSubheading: string
  heroImageUrl: string
  heroEyebrow: string
  heroCta: string
  sortOrder: number
  active: boolean
}

export async function fetchAllServices(): Promise<ServiceContent[]> {
  const base = getPublicApiBase()
  if (!base) return []
  try {
    const res = await fetchWithTimeout(`${base}/services-content/public`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function fetchServiceBySlug(
  slug: string,
): Promise<ServiceContent | null> {
  const base = getPublicApiBase()
  if (!base) return null
  try {
    const res = await fetchWithTimeout(`${base}/services-content/public/${slug}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
