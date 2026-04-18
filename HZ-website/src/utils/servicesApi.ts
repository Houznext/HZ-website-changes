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

function getBase(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    'http://localhost:4000'
  return raw.replace(/\/+$/, '')
}

export async function fetchAllServices(): Promise<ServiceContent[]> {
  try {
    const res = await fetch(`${getBase()}/services-content/public`)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function fetchServiceBySlug(
  slug: string,
): Promise<ServiceContent | null> {
  try {
    const res = await fetch(`${getBase()}/services-content/public/${slug}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
