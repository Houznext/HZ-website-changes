/**
 * Ensures infra homepage in sitemap-0.xml has canonical URL, priority 1.0, and SEO comments.
 * Run after next-sitemap (postbuild).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SITEMAP = path.join(__dirname, '..', 'public', 'sitemap-0.xml')

const HOME_LOC = 'https://infra.houznext.com/'
const SEO_TITLE = 'Buy Land, Villa, Apartment & Plot | Houznext Infra'
const SEO_DESCRIPTION =
  'RERA-verified properties across Hyderabad, Bengaluru, Chennai and Mumbai. Browse land, villas, apartments and plots with title & EC verification. Zero brokerage.'

const TODAY = new Date().toISOString().split('T')[0]

function commentSafe(s) {
  return String(s).replace(/--/g, '–')
}

const homeBlock = `  <!-- SEO title: ${commentSafe(SEO_TITLE)} -->
  <!-- SEO description: ${commentSafe(SEO_DESCRIPTION)} -->
  <url><loc>${HOME_LOC}</loc><lastmod>${TODAY}</lastmod><changefreq>daily</changefreq><priority>1</priority></url>`

function main() {
  if (!fs.existsSync(SITEMAP)) {
    console.warn('[sitemap:enhance] sitemap-0.xml not found — skip')
    return
  }

  let xml = fs.readFileSync(SITEMAP, 'utf8')

  const homeUrlRe =
    /<url>\s*<loc>https:\/\/infra\.houznext\.com\/?<\/loc>[\s\S]*?<\/url>/i

  if (homeUrlRe.test(xml)) {
    xml = xml.replace(homeUrlRe, homeBlock.trim())
  } else {
    xml = xml.replace(
      /<urlset[^>]*>/,
      (m) => `${m}\n${homeBlock}`,
    )
  }

  fs.writeFileSync(SITEMAP, xml, 'utf8')
  console.log(`[sitemap:enhance] Homepage ${HOME_LOC} (${SEO_TITLE})`)
}

main()
