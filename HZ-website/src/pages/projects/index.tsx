import React, { useCallback, useEffect, useMemo, useState } from 'react'

import ProjectModal from '@/components/InteriorPortfolio/ProjectModal'
import ProjectsHero from '@/components/InteriorPortfolio/ProjectsHero'
import ProjectsLegacyToolbar, {
  type ProjectsLegacyFilter,
} from '@/components/InteriorPortfolio/ProjectsLegacyToolbar'
import LegacyProjectCard from '@/components/InteriorPortfolio/LegacyProjectCard'
import LegacyProjectListItem from '@/components/InteriorPortfolio/LegacyProjectListItem'
import {
  DerivedProject,
  PortfolioProject,
  SortOrder,
} from '@/components/InteriorPortfolio/types'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import SeoHead from '@/components/SeoHead'
import type { InteriorProject } from '@/types/interior-project'
import { fetchPageSeo, type PageSeoPublic } from '@/lib/fetchPageSeo'
import { fetchWithTimeout, getPublicApiBase } from '@/lib/fetchWithTimeout'

function getCardHeight(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  const heights = [220, 240, 260, 280, 300, 320, 340, 350]
  return heights[Math.abs(hash) % heights.length]
}

function getInitials(name: string): string {
  return (name ?? '')
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatArea(sqft: number | null): string {
  if (!sqft) return ''
  return `${Number(sqft).toLocaleString('en-IN')} sqft`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function deriveProject(p: PortfolioProject): DerivedProject {
  const bhkStr = p.bhk ?? ''
  const loc = [p.locality, p.city].filter(Boolean).join(', ')
  const style = p.stylePreference ?? ''
  const pkg = p.packageTier ?? 'Premium'
  const days = p.deliveredInDays
  const area = p.totalAreaSqft
  const repName = p.rep?.fullName ?? 'Houznext team'

  return {
    ...p,
    trades: p.trades ?? [],
    displayName:
      [bhkStr, loc].filter(Boolean).join(' · ') || 'Houznext Project',
    locationFull: loc || 'Hyderabad',
    packageLabel: pkg,
    styleLabel: style,
    daysLabel: days != null && days > 0 ? `${days} days` : '—',
    areaLabel: formatArea(area),
    photoUrls: p.portfolioPhotoUrls ?? [],
    designerInitials: getInitials(repName),
    deliveredMonth: formatDate(p.actualEndDate ?? p.handoverDate),
    cardHeight: getCardHeight(p.id),
  }
}

function applyLegacyFilters(
  projects: DerivedProject[],
  filter: ProjectsLegacyFilter,
  sortOrder: SortOrder,
): DerivedProject[] {
  let result = [...projects]

  if (filter !== 'all') {
    result = result.filter((p) => {
      const bhk = (p.bhk ?? '').toLowerCase()
      const pt = (p.propertyType ?? '').toLowerCase()
      const pkg = (p.packageLabel ?? '').trim().toLowerCase()
      switch (filter) {
        case '2bhk':
          return bhk.includes('2') && !bhk.includes('3') && !bhk.includes('4')
        case '3bhk':
          return bhk.includes('3') && !bhk.includes('4')
        case 'villa4':
          return (
            bhk.includes('villa') ||
            bhk.includes('4') ||
            pt.includes('villa')
          )
        case 'essential':
          return pkg === 'essential'
        case 'premium':
          return pkg === 'premium'
        case 'luxury':
          return pkg === 'luxury'
        default:
          return true
      }
    })
  }

  result.sort((a, b) => {
    if (sortOrder === 'fastest') {
      return (a.deliveredInDays ?? 999) - (b.deliveredInDays ?? 999)
    }
    const da = new Date(a.actualEndDate ?? a.handoverDate ?? 0).getTime()
    const db = new Date(b.actualEndDate ?? b.handoverDate ?? 0).getTime()
    return sortOrder === 'newest' ? db - da : da - db
  })

  return result
}

function parseLocationToCityParts(location: string): {
  locality: string | null
  city: string | null
} {
  const s = (location || '').trim()
  if (!s) return { locality: null, city: null }
  const parts = s
    .split(/\s*-\s*/)
    .map((x) => x.trim())
    .filter(Boolean)
  if (parts.length >= 2) {
    return {
      locality: parts[0] ?? null,
      city: parts[parts.length - 1] ?? null,
    }
  }
  return { locality: null, city: s }
}

function bhkFromPropertyType(propertyType: string): string {
  const t = (propertyType || '').toLowerCase()
  if (t.includes('villa')) return 'Villa'
  if (t.includes('3') && t.includes('bhk')) return '3BHK'
  if (t.includes('2') && t.includes('bhk')) return '2BHK'
  if (t.includes('4') && t.includes('bhk')) return '4BHK'
  const first = (propertyType || '').split(/\s+/)[0]
  return first || 'Home'
}

function cmsToPortfolioShape(c: InteriorProject): PortfolioProject {
  const { locality, city } = parseLocationToCityParts(c.location)
  return {
    id: String(c.id),
    bhk: bhkFromPropertyType(c.propertyType),
    propertyType: c.propertyType,
    totalAreaSqft: c.sqft ?? null,
    locality,
    city,
    stylePreference: c.style,
    scopesSelected: null,
    packageTier: c.package,
    deliveredInDays: c.deliveryDays ?? null,
    projectStory: c.description,
    customerTestimonial: null,
    customerName: null,
    customerRating: c.rating ?? null,
    portfolioPhotoUrls:
      c.images && c.images.length > 0 ? c.images : null,
    actualEndDate: c.createdAt,
    handoverDate: c.updatedAt,
    isHandedOver: true,
    rep: null,
    trades: [],
  }
}

function cmsToDerived(c: InteriorProject): DerivedProject {
  const d = deriveProject(cmsToPortfolioShape(c))
  return {
    ...d,
    displayName: c.title,
    locationFull: c.location,
  }
}

async function fetchCmsLiveProjects(apiBase: string): Promise<InteriorProject[]> {
  const res = await fetchWithTimeout(
    `${apiBase}/interior-projects/public?limit=200&page=1`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    },
  )
  if (!res.ok) return []
  const json: unknown = await res.json()
  if (Array.isArray(json)) return json as InteriorProject[]
  if (json && typeof json === 'object' && 'data' in json) {
    const data = (json as { data?: unknown }).data
    return Array.isArray(data) ? (data as InteriorProject[]) : []
  }
  return []
}

async function fetchProjectsDisplayTotal(apiBase: string): Promise<number | null> {
  try {
    const res = await fetchWithTimeout(`${apiBase}/interior-projects/public/stats`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { displayTotal?: unknown }
    const n = Number(json.displayTotal)
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
  } catch {
    return null
  }
}

interface ProjectsPageProps {
  projects: InteriorProject[]
  pageSeo: PageSeoPublic | null
  displayTotal: number | null
}

const PAGE_SIZE = 12

function getBrowserApiBase(): string {
  if (typeof window === 'undefined') return ''
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
    ''
  )
    .toString()
    .trim()
    .replace(/\/$/, '')
}

type ViewMode = 'grid' | 'list'

export default function ProjectsPage({
  projects: rawProjects,
  pageSeo,
  displayTotal: initialDisplayTotal,
}: ProjectsPageProps) {
  const [projects, setProjects] = useState<InteriorProject[]>(() =>
    Array.isArray(rawProjects) ? rawProjects : [],
  )
  const [displayTotal, setDisplayTotal] = useState<number | null>(
    initialDisplayTotal ?? null,
  )

  useEffect(() => {
    const base = getBrowserApiBase()
    if (!base) return
    let cancelled = false
    void Promise.all([fetchCmsLiveProjects(base), fetchProjectsDisplayTotal(base)])
      .then(([data, total]) => {
        if (cancelled) return
        setProjects(data)
        if (total != null) setDisplayTotal(total)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  const allDerived = useMemo(
    () => projects.map((r) => cmsToDerived(r)),
    [projects],
  )

  const [legacyFilter, setLegacyFilter] =
    useState<ProjectsLegacyFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)

  const [selectedProject, setSelectedProject] = useState<DerivedProject | null>(
    null,
  )

  const filtered = useMemo(
    () => applyLegacyFilters(allDerived, legacyFilter, sortOrder),
    [allDerived, legacyFilter, sortOrder],
  )

  const handleLegacyFilter = useCallback((f: ProjectsLegacyFilter) => {
    setLegacyFilter(f)
    setPage(1)
  }, [])

  const handleSort = useCallback((s: SortOrder) => {
    setSortOrder(s)
    setPage(1)
  }, [])

  const visibleProjects = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = filtered.length > visibleProjects.length

  const openModal = useCallback((p: DerivedProject) => setSelectedProject(p), [])
  const closeModal = useCallback(() => setSelectedProject(null), [])

  return (
    <>
      <SeoHead
        title={
          pageSeo?.metaTitle ??
          'Our Projects | Real Home Transformations | Houznext Hyderabad'
        }
        description={
          pageSeo?.metaDescription ??
          'Browse completed home interior projects by Houznext across Telangana. 2BHK, 3BHK and villas — fixed price, on-time delivery.'
        }
        canonical="/projects"
        ogImage={pageSeo?.ogImageUrl ?? 'https://houznext.com/og-projects.jpg'}
      />
      <Navbar />
      <main style={{ background: '#f8fafc' }}>
        <ProjectsHero listedCount={allDerived.length} displayTotal={displayTotal} />

        <ProjectsLegacyToolbar
          filter={legacyFilter}
          sortOrder={sortOrder}
          viewMode={viewMode}
          onFilter={handleLegacyFilter}
          onSort={handleSort}
          onViewMode={setViewMode}
        />

        <div className="mx-auto max-w-6xl px-4 pb-2 pt-6 md:px-6">
          <p
            className="font-head font-bold text-slate-800"
            style={{ fontSize: 16, marginBottom: 20 }}
          >
            {filtered.length} project{filtered.length === 1 ? '' : 's'} found
          </p>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProjects.map((p) => (
                <LegacyProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => openModal(p)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleProjects.map((p) => (
                <LegacyProjectListItem
                  key={p.id}
                  project={p}
                  onClick={() => openModal(p)}
                />
              ))}
            </div>
          )}

          {visibleProjects.length === 0 && (
            <div
              className="rounded-2xl border border-dashed border-slate-200 py-20 text-center text-slate-500"
            >
              <p className="font-head font-bold text-slate-700">No projects found</p>
              <p className="mt-1 text-sm">Try a different filter above.</p>
            </div>
          )}

          {hasMore && (
            <div className="py-8 text-center">
              <button
                type="button"
                onClick={() => setPage((x) => x + 1)}
                className="font-head font-bold"
                style={{
                  padding: '12px 32px',
                  borderRadius: 10,
                  border: '2px solid #2f80ed',
                  background: 'transparent',
                  color: '#2f80ed',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Load more projects
              </button>
            </div>
          )}
        </div>

        <section
          style={{
            background: '#0f2a44',
            padding: '64px 32px',
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          <div
            style={{
              position: 'relative',
              height: 3,
              background: 'linear-gradient(90deg,#2f80ed,#f2994a,#2f80ed)',
              marginBottom: 0,
            }}
          />
          <div
            className="flex justify-center items-center gap-2"
            style={{ marginBottom: 18, marginTop: 36 }}
          >
            <span className="w-[18px] h-[2px]" style={{ background: '#f2994a' }} />
            <span
              className="font-head font-bold text-[11px] uppercase tracking-[0.12em]"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              Start your journey
            </span>
            <span className="w-[18px] h-[2px]" style={{ background: '#f2994a' }} />
          </div>
          <h2
            className="font-head font-black text-white mx-auto"
            style={{ fontSize: 'clamp(20px,3vw,32px)', marginBottom: 12 }}
          >
            Want a home like these?
          </h2>
          <p
            style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.62)',
              marginBottom: 28,
              maxWidth: 460,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.65,
            }}
          >
            Free 3D design. Fixed price. 45-day delivery. Let&apos;s create your dream
            home together.
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="font-head font-bold"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '13px 26px',
                borderRadius: 10,
                background: '#2f80ed',
                color: '#fff',
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Get free consultation →
            </button>
            <a
              href="https://wa.me/919759750770?text=Hi+Houznext+I+want+a+free+consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="font-head font-bold"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '12px 24px',
                borderRadius: 10,
                background: 'transparent',
                color: '#fff',
                fontSize: 14,
                border: '1.5px solid rgba(255,255,255,0.3)',
                textDecoration: 'none',
                fontFamily: 'inherit',
              }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <ProjectModal project={selectedProject} onClose={closeModal} />
    </>
  )
}

export async function getStaticProps() {
  const API = getPublicApiBase()
  let pageSeo: PageSeoPublic | null = null
  try {
    pageSeo = await fetchPageSeo('/projects')
  } catch {
    pageSeo = null
  }
  if (!API) {
    return {
      props: { projects: [] as InteriorProject[], pageSeo, displayTotal: null },
      revalidate: 60,
    }
  }
  try {
    const [projects, displayTotal] = await Promise.all([
      fetchCmsLiveProjects(API),
      fetchProjectsDisplayTotal(API),
    ])
    return {
      props: { projects, pageSeo, displayTotal },
      revalidate: 60,
    }
  } catch (err) {
    console.error(
      '[projects/getStaticProps] Failed to fetch interior-projects/public:',
      err,
    )
    return {
      props: { projects: [] as InteriorProject[], pageSeo, displayTotal: null },
      revalidate: 60,
    }
  }
}
