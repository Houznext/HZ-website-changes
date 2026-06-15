import type { CitySlug } from './cityLandingRegistry'
import { getDefaultCityContent } from './cityLandingDefaults'
import { getCityMeta } from './cityLandingRegistry'

export type CityLandingContent = {
  seo: {
    title: string
    description: string
    keywords: string
  }
  hero: {
    eyebrow: string
    titleBefore: string
    titleHighlight: string
    subtitle: string
    trustBadges: string[]
    heroImageUrl: string
    heroImageOpacity: number
  }
  areaOptions: string[]
  footerDescription: string
  stats: Array<{ n: string; l: string; s: string }>
  intro: {
    eyebrow: string
    title: string
    paragraphs: string[]
    badgeText: string
  }
  services: {
    eyebrow: string
    title: string
    subtitle: string
    items: Array<{ title: string; desc: string; meta: string }>
  }
  process: {
    eyebrow: string
    title: string
    subtitle: string
    steps: Array<{ n: string; title: string; desc: string }>
  }
  pricing: {
    eyebrow: string
    title: string
    subtitle: string
    packages: Array<{
      name: string
      amount: string
      from: string
      popular: boolean
      features: string[]
    }>
  }
  projects: {
    eyebrow: string
    title: string
    subtitle: string
  }
  whyUs: {
    eyebrow: string
    title: string
    subtitle: string
    items: Array<{ title: string; desc: string }>
  }
  testimonials: {
    eyebrow: string
    title: string
    subtitle: string
    items: Array<{ q: string; name: string; info: string; initial: string }>
  }
  faq: {
    eyebrow: string
    title: string
    subtitle: string
    items: Array<{ q: string; a: string }>
  }
  cta: {
    title: string
    subtitle: string
    whatsappUrl: string
  }
}

export type { CitySlug }

function asString(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback
}

function asStringArray(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback
  const mapped = v.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean)
  return mapped.length ? mapped : fallback
}

function asOpacity(v: unknown, fallback: number): number {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.min(100, Math.max(0, Math.round(n)))
}

export function mergeCityLandingCms(slug: CitySlug, raw: unknown): CityLandingContent {
  const d = getDefaultCityContent(slug)
  if (!raw || typeof raw !== 'object') return d
  const r = raw as Record<string, unknown>

  const seo = r.seo && typeof r.seo === 'object' ? (r.seo as Record<string, unknown>) : {}
  const hero = r.hero && typeof r.hero === 'object' ? (r.hero as Record<string, unknown>) : {}
  const intro = r.intro && typeof r.intro === 'object' ? (r.intro as Record<string, unknown>) : {}

  const mergeSection = <T extends { eyebrow: string; title: string; subtitle: string }>(
    key: string,
    fallback: T,
  ): T => {
    const s = r[key] && typeof r[key] === 'object' ? (r[key] as Record<string, unknown>) : {}
    return {
      ...fallback,
      eyebrow: asString(s.eyebrow, fallback.eyebrow),
      title: asString(s.title, fallback.title),
      subtitle: asString(s.subtitle, fallback.subtitle),
    }
  }

  return {
    seo: {
      title: asString(seo.title, d.seo.title),
      description: asString(seo.description, d.seo.description),
      keywords: asString(seo.keywords, d.seo.keywords),
    },
    hero: {
      eyebrow: asString(hero.eyebrow, d.hero.eyebrow),
      titleBefore: asString(hero.titleBefore, d.hero.titleBefore),
      titleHighlight: asString(hero.titleHighlight, d.hero.titleHighlight),
      subtitle: asString(hero.subtitle, d.hero.subtitle),
      trustBadges: asStringArray(hero.trustBadges, d.hero.trustBadges),
      heroImageUrl: asString(hero.heroImageUrl, d.hero.heroImageUrl),
      heroImageOpacity: asOpacity(hero.heroImageOpacity, d.hero.heroImageOpacity),
    },
    areaOptions: asStringArray(r.areaOptions, d.areaOptions),
    footerDescription: asString(r.footerDescription, d.footerDescription),
    stats: Array.isArray(r.stats) && r.stats.length
      ? r.stats.map((item, i) => {
          const src = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
          const fb = d.stats[i] ?? d.stats[0]
          return {
            n: asString(src.n, fb.n),
            l: asString(src.l, fb.l),
            s: asString(src.s, fb.s),
          }
        })
      : d.stats,
    intro: {
      eyebrow: asString(intro.eyebrow, d.intro.eyebrow),
      title: asString(intro.title, d.intro.title),
      paragraphs: asStringArray(intro.paragraphs, d.intro.paragraphs),
      badgeText: asString(intro.badgeText, d.intro.badgeText),
    },
    services: {
      ...mergeSection('services', d.services),
      items: Array.isArray((r.services as Record<string, unknown> | undefined)?.items)
        ? ((r.services as { items: unknown[] }).items).map((item, i) => {
            const src = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
            const fb = d.services.items[i] ?? d.services.items[0]
            return {
              title: asString(src.title, fb.title),
              desc: asString(src.desc, fb.desc),
              meta: asString(src.meta, fb.meta),
            }
          })
        : d.services.items,
    },
    process: {
      ...mergeSection('process', d.process),
      steps: Array.isArray((r.process as Record<string, unknown> | undefined)?.steps)
        ? ((r.process as { steps: unknown[] }).steps).map((item, i) => {
            const src = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
            const fb = d.process.steps[i] ?? d.process.steps[0]
            return {
              n: asString(src.n, fb.n),
              title: asString(src.title, fb.title),
              desc: asString(src.desc, fb.desc),
            }
          })
        : d.process.steps,
    },
    pricing: {
      ...mergeSection('pricing', d.pricing),
      packages: Array.isArray((r.pricing as Record<string, unknown> | undefined)?.packages)
        ? ((r.pricing as { packages: unknown[] }).packages).map((item, i) => {
            const src = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
            const fb = d.pricing.packages[i] ?? d.pricing.packages[0]
            return {
              name: asString(src.name, fb.name),
              amount: asString(src.amount, fb.amount),
              from: asString(src.from, fb.from),
              popular: typeof src.popular === 'boolean' ? src.popular : fb.popular,
              features: asStringArray(src.features, fb.features),
            }
          })
        : d.pricing.packages,
    },
    projects: mergeSection('projects', d.projects),
    whyUs: {
      ...mergeSection('whyUs', d.whyUs),
      items: Array.isArray((r.whyUs as Record<string, unknown> | undefined)?.items)
        ? ((r.whyUs as { items: unknown[] }).items).map((item, i) => {
            const src = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
            const fb = d.whyUs.items[i] ?? d.whyUs.items[0]
            return {
              title: asString(src.title, fb.title),
              desc: asString(src.desc, fb.desc),
            }
          })
        : d.whyUs.items,
    },
    testimonials: {
      ...mergeSection('testimonials', d.testimonials),
      items: Array.isArray((r.testimonials as Record<string, unknown> | undefined)?.items)
        ? ((r.testimonials as { items: unknown[] }).items).map((item, i) => {
            const src = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
            const fb = d.testimonials.items[i] ?? d.testimonials.items[0]
            return {
              q: asString(src.q, fb.q),
              name: asString(src.name, fb.name),
              info: asString(src.info, fb.info),
              initial: asString(src.initial, fb.initial),
            }
          })
        : d.testimonials.items,
    },
    faq: {
      ...mergeSection('faq', d.faq),
      items: Array.isArray((r.faq as Record<string, unknown> | undefined)?.items)
        ? ((r.faq as { items: unknown[] }).items).map((item, i) => {
            const src = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
            const fb = d.faq.items[i] ?? d.faq.items[0]
            return {
              q: asString(src.q, fb.q),
              a: asString(src.a, fb.a),
            }
          })
        : d.faq.items,
    },
    cta: {
      title: asString((r.cta as Record<string, unknown> | undefined)?.title, d.cta.title),
      subtitle: asString((r.cta as Record<string, unknown> | undefined)?.subtitle, d.cta.subtitle),
      whatsappUrl: asString((r.cta as Record<string, unknown> | undefined)?.whatsappUrl, d.cta.whatsappUrl),
    },
  }
}

export function getCityCmsKey(slug: CitySlug): string {
  return getCityMeta(slug).cmsKey
}

// Vikarabad backward compatibility
export const VIKARABAD_CMS_KEY = 'landing_vikarabad'
export type VikarabadLandingContent = CityLandingContent
export function getDefaultVikarabadContent(): CityLandingContent {
  return getDefaultCityContent('vikarabad')
}
export function mergeVikarabadCms(raw: unknown): CityLandingContent {
  return mergeCityLandingCms('vikarabad', raw)
}
