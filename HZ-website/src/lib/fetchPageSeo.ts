/** Public SEO row from HZ-backend `GET page-seo/public/by-path`. */

import { fetchWithTimeout, getPublicApiBase } from '@/lib/fetchWithTimeout'

export type PageSeoPublic = {
  path: string
  label: string
  metaTitle: string
  metaDescription: string
  ogImageUrl: string | null
  hasStructuredData: boolean
  source: 'database' | 'default'
}

export async function fetchPageSeo(path: string): Promise<PageSeoPublic | null> {
  const base = getPublicApiBase()
  if (!base) return null
  const normalized =
    path.trim() === ''
      ? '/'
      : path.trim().startsWith('/')
        ? path.trim()
        : `/${path.trim()}`
  try {
    const res = await fetchWithTimeout(
      `${base}/page-seo/public/by-path?path=${encodeURIComponent(normalized)}`,
    )
    if (!res.ok) return null
    return (await res.json()) as PageSeoPublic
  } catch {
    return null
  }
}
