/** Public SEO row from HZ-backend `GET page-seo/public/by-path`. */

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
  const raw =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT
  if (!raw) return null
  const base = String(raw).replace(/\/$/, '')
  const normalized = path.trim() === '' ? '/' : path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`
  try {
    const res = await fetch(
      `${base}/page-seo/public/by-path?path=${encodeURIComponent(normalized)}`,
    )
    if (!res.ok) return null
    return (await res.json()) as PageSeoPublic
  } catch {
    return null
  }
}
