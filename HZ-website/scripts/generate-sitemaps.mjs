/**
 * Generates sitemap index + split sitemaps for houznext.com (sitemaps.org 0.9).
 * Run after `next build` via package.json postbuild.
 *
 * Env:
 *   SITE_URL — canonical origin (default https://houznext.com)
 *   NEXT_PUBLIC_API_URL | NEXT_PUBLIC_LOCAL_API_ENDPOINT — blog collection
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')
const PAGES = path.join(ROOT, 'src', 'pages')
const PUBLIC = path.join(ROOT, 'public')

const SITE =
  (process.env.SITE_URL || 'https://houznext.com').replace(/\/$/, '')

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
  ''
)
  .toString()
  .trim()
  .replace(/\/$/, '')

const TODAY = new Date().toISOString().split('T')[0]

function xmlEscape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc, { lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${xmlEscape(lastmod || TODAY)}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${String(priority)}</priority>`,
    '  </url>',
  ].join('\n')
}

function urlset(urls) {
  const body = urls
    .map((u) =>
      urlEntry(u.loc, {
        lastmod: u.lastmod,
        changefreq: u.changefreq,
        priority: u.priority,
      }),
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}

function sitemapIndex(sitemaps) {
  const items = sitemaps
    .map(
      (name) => `  <sitemap>
    <loc>${xmlEscape(`${SITE}/${name}`)}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`
}

// ─── Discover static index routes (skip dynamic [param] segments) ───

function walkIndexRoutes(absDir, urlSegments, outSet, { rootLabel }) {
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return

  const indexFile = path.join(absDir, 'index.tsx')
  if (fs.existsSync(indexFile) && urlSegments.length) {
    outSet.add('/' + urlSegments.join('/'))
  }

  let entries = []
  try {
    entries = fs.readdirSync(absDir, { withFileTypes: true })
  } catch {
    return
  }

  for (const ent of entries) {
    if (!ent.isDirectory()) continue
    if (ent.name.startsWith('[') || ent.name.startsWith('.')) continue
    if (ent.name === 'api') continue
    walkIndexRoutes(
      path.join(absDir, ent.name),
      [...urlSegments, ent.name],
      outSet,
      { rootLabel },
    )
  }
}

function discoverServicesPaths() {
  const set = new Set()
  const base = path.join(PAGES, 'services')
  walkIndexRoutes(base, ['services'], set, { rootLabel: 'services' })
  return Array.from(set).sort()
}

function discoverInteriorsExtraPaths() {
  const set = new Set()
  // pages/interiors.tsx → /interiors
  if (fs.existsSync(path.join(PAGES, 'interiors.tsx'))) {
    set.add('/interiors')
  }
  const base = path.join(PAGES, 'interiors')
  walkIndexRoutes(base, ['interiors'], set, { rootLabel: 'interiors' })
  // Drop non-marketing or duplicate
  set.delete('/interiors/Privacy-policy')
  return Array.from(set).sort()
}

// ─── Blog (canonical /blog/{slug} only) ───

async function fetchBlogPosts() {
  if (!API_BASE) {
    console.warn('[sitemap] No API base — blog posts omitted from sitemap-blogs.xml')
    return []
  }
  const url = `${API_BASE}/blog?take=500&sortBy=updatedAt&sortOrder=DESC`
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) {
      console.warn('[sitemap] Blog API HTTP', res.status)
      return []
    }
    const data = await res.json()
    const list = data?.blogs ?? data
    return Array.isArray(list) ? list : []
  } catch (e) {
    console.warn('[sitemap] Blog fetch failed:', e?.message || e)
    return []
  }
}

function priorityForPath(p) {
  if (p === '/') return 1.0
  if (p === '/interiors' || p === '/design-ideas' || p === '/blog') return 0.9
  if (p.startsWith('/blog/')) return 0.7
  if (p.startsWith('/services/')) return 0.8
  if (p === '/buildlive') return 0.85
  return 0.75
}

function changefreqForPath(p) {
  if (p === '/' || p === '/blog' || p.startsWith('/blog/')) return 'weekly'
  if (p === '/design-ideas') return 'weekly'
  if (p.startsWith('/services/') || p.startsWith('/interiors')) return 'weekly'
  if (p === '/buildlive') return 'monthly'
  if (p === '/about-us' || p === '/contact-us') return 'monthly'
  return 'monthly'
}

function lastmodForBlogRow(row) {
  const raw = row?.updatedAt || row?.createdAt
  if (raw && typeof raw === 'string') return raw.split('T')[0]
  if (raw instanceof Date) return raw.toISOString().split('T')[0]
  return TODAY
}

async function main() {
  const seen = new Set()

  const add = (list, pathStr, meta = {}) => {
    const full = `${SITE}${pathStr}`
    if (seen.has(full)) return
    // Hard excludes (non-SEO / private)
    if (
      pathStr.startsWith('/user') ||
      pathStr.startsWith('/portal') ||
      pathStr.startsWith('/api') ||
      pathStr === '/cart' ||
      pathStr === '/signup' ||
      pathStr === '/login' ||
      pathStr.startsWith('/verify-otp') ||
      pathStr.startsWith('/forgot-password') ||
      pathStr === '/saved-designs' ||
      pathStr.startsWith('/post-property') ||
      pathStr.startsWith('/company/') ||
      pathStr.startsWith('/properties')
    ) {
      return
    }
    seen.add(full)
    list.push({
      loc: full,
      lastmod: meta.lastmod || TODAY,
      changefreq: meta.changefreq || changefreqForPath(pathStr),
      priority: meta.priority != null ? meta.priority : priorityForPath(pathStr),
    })
  }

  // ─── sitemap-main.xml ───
  const main = []
  for (const p of [
    '/',
    '/about-us',
    '/contact-us',
    '/pricing',
    '/projects',
  ]) {
    add(main, p)
  }

  // ─── sitemap-interiors.xml ───
  const interiors = []
  for (const p of discoverInteriorsExtraPaths()) {
    add(interiors, p)
  }
  for (const p of discoverServicesPaths()) {
    add(interiors, p)
  }

  // ─── sitemap-design-ideas.xml (Design Ideas page) ───
  const designIdeas = []
  if (fs.existsSync(path.join(PAGES, 'design-ideas.tsx'))) {
    add(designIdeas, '/design-ideas')
  }

  // ─── sitemap-blogs.xml ───
  const blogs = []
  add(blogs, '/blog', { changefreq: 'daily', priority: 0.9 })
  const blogRows = await fetchBlogPosts()
  for (const row of blogRows) {
    const slug = row?.slug
    if (typeof slug !== 'string' || !slug.trim()) continue
    const pathStr = `/blog/${encodeURIComponent(slug.trim())}`
    add(blogs, pathStr, {
      lastmod: lastmodForBlogRow(row),
      changefreq: 'monthly',
      priority: 0.65,
    })
  }

  // ─── sitemap-livebuild.xml ───
  const livebuild = []
  if (fs.existsSync(path.join(PAGES, 'buildlive.tsx'))) {
    add(livebuild, '/buildlive', { changefreq: 'monthly', priority: 0.85 })
  }

  // Sort URL entries by loc for stable output
  const sortEntries = (arr) =>
    arr.sort((a, b) => a.loc.localeCompare(b.loc))

  const files = {
    'sitemap-main.xml': sortEntries(main),
    'sitemap-interiors.xml': sortEntries(interiors),
    'sitemap-design-ideas.xml': sortEntries(designIdeas),
    'sitemap-blogs.xml': sortEntries(blogs),
    'sitemap-livebuild.xml': sortEntries(livebuild),
  }

  for (const [name, entries] of Object.entries(files)) {
    fs.writeFileSync(path.join(PUBLIC, name), urlset(entries), 'utf8')
    console.log(`[sitemap] Wrote ${name} (${entries.length} URLs)`)
  }

  const indexNames = [
    'sitemap-main.xml',
    'sitemap-interiors.xml',
    'sitemap-design-ideas.xml',
    'sitemap-blogs.xml',
    'sitemap-livebuild.xml',
  ]
  fs.writeFileSync(
    path.join(PUBLIC, 'sitemap.xml'),
    sitemapIndex(indexNames),
    'utf8',
  )
  console.log('[sitemap] Wrote sitemap.xml (index)')

  // Remove legacy next-sitemap chunk if present
  const legacy = path.join(PUBLIC, 'sitemap-0.xml')
  if (fs.existsSync(legacy)) {
    fs.unlinkSync(legacy)
    console.log('[sitemap] Removed legacy sitemap-0.xml')
  }
  const legacyInspiration = path.join(PUBLIC, 'sitemap-inspiration.xml')
  if (fs.existsSync(legacyInspiration)) {
    fs.unlinkSync(legacyInspiration)
    console.log('[sitemap] Removed legacy sitemap-inspiration.xml (renamed to sitemap-design-ideas.xml)')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
