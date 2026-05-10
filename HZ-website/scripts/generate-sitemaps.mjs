/**
 * Generates static sitemap index + split sitemaps for houznext.com (sitemaps.org 0.9).
 * Output: /public/*.xml only — no Next.js API sitemap.
 * Run via package.json `postbuild`: node scripts/generate-sitemaps.mjs
 *
 * Env:
 *   SITE_URL — canonical origin (default https://houznext.com)
 *   NEXT_PUBLIC_API_URL | NEXT_PUBLIC_LOCAL_API_ENDPOINT — blog posts for sitemap-blogs.xml
 *
 * sitemap-main.xml URL order matches primary nav / sitelink hinting:
 *   Home → Design ideas → Full home interiors → About → Store → Projects → Blog → Pricing → Contact
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

function sitemapIndex(sitemapFilenames) {
  const items = sitemapFilenames
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

function walkIndexRoutes(absDir, urlSegments, outSet) {
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
    walkIndexRoutes(path.join(absDir, ent.name), [...urlSegments, ent.name], outSet)
  }
}

function discoverInteriorsPaths() {
  const set = new Set()
  if (fs.existsSync(path.join(PAGES, 'interiors.tsx'))) {
    set.add('/interiors')
  }
  const base = path.join(PAGES, 'interiors')
  walkIndexRoutes(base, ['interiors'], set)
  set.delete('/interiors/Privacy-policy')
  return Array.from(set).sort()
}

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

function shouldSkipPath(pathStr) {
  return (
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
    pathStr.startsWith('/properties') ||
    pathStr.startsWith('/real-estate')
  )
}

function priorityForPath(p) {
  if (p === '/') return 1.0
  if (p === '/design-ideas') return 0.95
  if (p === '/interiors') return 0.94
  if (p === '/about-us') return 0.92
  if (p === '/store') return 0.91
  if (p === '/projects') return 0.89
  if (p === '/blog') return 0.87
  if (p.startsWith('/blog/')) return 0.68
  if (p === '/pricing') return 0.84
  if (p === '/contact-us') return 0.72
  if (p === '/buildlive') return 0.8
  return 0.75
}

function changefreqForPath(p) {
  if (p === '/' || p === '/blog' || p.startsWith('/blog/')) return 'weekly'
  if (p === '/design-ideas') return 'weekly'
  if (p.startsWith('/interiors')) return 'weekly'
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

/** Per-sitemap dedupe (URLs may repeat across different sitemap files). */
function createAdder() {
  const seen = new Set()
  return (list, pathStr, meta = {}) => {
    if (shouldSkipPath(pathStr)) return
    const full = `${SITE}${pathStr}`
    if (seen.has(full)) return
    seen.add(full)
    list.push({
      loc: full,
      lastmod: meta.lastmod || TODAY,
      changefreq: meta.changefreq || changefreqForPath(pathStr),
      priority: meta.priority != null ? meta.priority : priorityForPath(pathStr),
    })
  }
}

function sortEntries(arr) {
  return [...arr].sort((a, b) => a.loc.localeCompare(b.loc))
}

async function main() {
  const addMain = createAdder()
  const addInteriors = createAdder()
  const addBlogs = createAdder()
  const addLivebuild = createAdder()

  // ─── sitemap-main.xml — order = primary marketing / sitelink hinting ───
  const main = []
  addMain(main, '/', { changefreq: 'weekly', priority: 1.0 })
  addMain(main, '/design-ideas', { changefreq: 'weekly', priority: 0.95 })
  addMain(main, '/interiors', { changefreq: 'weekly', priority: 0.94 })
  addMain(main, '/about-us', { changefreq: 'monthly', priority: 0.92 })
  addMain(main, '/store', { changefreq: 'weekly', priority: 0.91 })
  addMain(main, '/projects', { changefreq: 'monthly', priority: 0.89 })
  addMain(main, '/blog', { changefreq: 'weekly', priority: 0.87 })
  addMain(main, '/pricing', { changefreq: 'monthly', priority: 0.84 })
  addMain(main, '/contact-us', { changefreq: 'monthly', priority: 0.72 })

  // ─── sitemap-interiors.xml — interior tool & subpages (/interiors is in main) ───
  const interiors = []
  for (const p of discoverInteriorsPaths()) {
    if (p === '/interiors') continue
    addInteriors(interiors, p)
  }

  // ─── sitemap-blogs.xml — own dedupe set so /blog + slugs are not skipped by main ───
  const blogs = []
  addBlogs(blogs, '/blog', { changefreq: 'weekly', priority: 0.9 })
  const blogRows = await fetchBlogPosts()
  for (const row of blogRows) {
    const slug = row?.slug
    if (typeof slug !== 'string' || !slug.trim()) continue
    const pathStr = `/blog/${encodeURIComponent(slug.trim())}`
    addBlogs(blogs, pathStr, {
      lastmod: lastmodForBlogRow(row),
      changefreq: 'monthly',
      priority: 0.68,
    })
  }

  // ─── sitemap-livebuild.xml ───
  const livebuild = []
  if (fs.existsSync(path.join(PAGES, 'buildlive.tsx'))) {
    addLivebuild(livebuild, '/buildlive', { changefreq: 'monthly', priority: 0.8 })
  }

  const writtenIndexNames = []

  const writeIfNonEmpty = (name, entries, { sort = false } = {}) => {
    const list = sort ? sortEntries(entries) : entries
    if (list.length === 0) {
      console.warn(`[sitemap] Skipped ${name} (no URLs)`)
      return
    }
    fs.writeFileSync(path.join(PUBLIC, name), urlset(list), 'utf8')
    writtenIndexNames.push(name)
    console.log(`[sitemap] Wrote ${name} (${list.length} URLs)`)
  }

  writeIfNonEmpty('sitemap-main.xml', main, { sort: false })
  writeIfNonEmpty('sitemap-interiors.xml', interiors, { sort: true })
  writeIfNonEmpty('sitemap-blogs.xml', blogs, { sort: true })
  writeIfNonEmpty('sitemap-livebuild.xml', livebuild, { sort: true })

  fs.writeFileSync(
    path.join(PUBLIC, 'sitemap.xml'),
    sitemapIndex(writtenIndexNames),
    'utf8',
  )
  console.log('[sitemap] Wrote sitemap.xml (index)')

  for (const obsolete of [
    'sitemap-about-us.xml',
    'sitemap-design-ideas.xml',
    'sitemap-inspiration.xml',
    'sitemap-0.xml',
  ]) {
    const p = path.join(PUBLIC, obsolete)
    if (fs.existsSync(p)) {
      fs.unlinkSync(p)
      console.log(`[sitemap] Removed obsolete ${obsolete}`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
