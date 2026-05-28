import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.join(__dirname, '..')
const PUBLIC = path.join(ROOT, 'public')

const SITEMAPS = ['sitemap-main.xml', 'sitemap-interiors.xml', 'sitemap-blogs.xml']
const FORBIDDEN_SUBSTRINGS = ['/careers/apply', '/interiors/privacy-policy']

function extractLocs(xml) {
  const matches = xml.match(/<loc>(.*?)<\/loc>/g) || []
  return matches.map((m) => m.replace('<loc>', '').replace('</loc>', '').trim())
}

function normalize(url) {
  return String(url || '').toLowerCase()
}

function main() {
  const all = []
  const perFile = []

  for (const name of SITEMAPS) {
    const abs = path.join(PUBLIC, name)
    if (!fs.existsSync(abs)) {
      throw new Error(`[sitemap:verify] Missing file: ${name}`)
    }
    const xml = fs.readFileSync(abs, 'utf8')
    const locs = extractLocs(xml)
    perFile.push({ name, count: locs.length })
    all.push(...locs)
  }

  const offenders = all.filter((u) =>
    FORBIDDEN_SUBSTRINGS.some((needle) => normalize(u).includes(needle)),
  )

  if (offenders.length) {
    console.error('[sitemap:verify] Legacy URLs found:')
    for (const bad of offenders) console.error(` - ${bad}`)
    process.exit(1)
  }

  const unique = Array.from(new Set(all))
  console.log('[sitemap:verify] OK')
  for (const row of perFile) {
    console.log(` - ${row.name}: ${row.count}`)
  }
  console.log(` - total entries: ${all.length}`)
  console.log(` - unique URLs: ${unique.length}`)
}

main()
