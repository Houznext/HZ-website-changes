/** Canonical Houznext blog article path (slug preferred, id fallback). */
export function blogPostPath(post: {
  slug?: string | null
  id?: string | number
}): string {
  const slug =
    typeof post.slug === 'string' && post.slug.trim()
      ? post.slug.trim()
      : ''
  const segment = slug || String(post.id ?? '')
  return `/blog/${encodeURIComponent(segment)}`
}
