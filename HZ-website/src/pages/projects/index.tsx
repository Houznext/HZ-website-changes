import React, { useCallback, useMemo, useState } from 'react'

import FilterBar from '@/components/InteriorPortfolio/FilterBar'
import MasonryGrid from '@/components/InteriorPortfolio/MasonryGrid'
import ProjectModal from '@/components/InteriorPortfolio/ProjectModal'
import ProjectsHero from '@/components/InteriorPortfolio/ProjectsHero'
import {
  DerivedProject,
  FilterCity,
  FilterStyle,
  FilterType,
  PortfolioProject,
  SortOrder,
} from '@/components/InteriorPortfolio/types'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import SeoHead from '@/components/SeoHead'

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

function applyFilters(
  projects: DerivedProject[],
  filterType: FilterType,
  filterStyle: FilterStyle,
  filterCity: FilterCity,
  sortOrder: SortOrder,
): DerivedProject[] {
  let result = [...projects]

  if (filterType !== 'all') {
    result = result.filter((p) => {
      const bhk = (p.bhk ?? '').toLowerCase()
      if (filterType === '2bhk') return bhk.includes('2')
      if (filterType === '3bhk') return bhk.includes('3')
      if (filterType === 'villa') {
        return (
          bhk.includes('villa') ||
          (p.propertyType ?? '').toLowerCase().includes('villa')
        )
      }
      return true
    })
  }

  if (filterStyle !== 'all') {
    result = result.filter((p) => p.styleLabel === filterStyle)
  }

  if (filterCity !== 'all') {
    result = result.filter(
      (p) => (p.city ?? '').toLowerCase() === filterCity.toLowerCase(),
    )
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

interface ProjectsPageProps {
  projects: PortfolioProject[]
}

const PAGE_SIZE = 12

export default function ProjectsPage({ projects: rawProjects }: ProjectsPageProps) {
  const allDerived = useMemo(() => {
    const list = Array.isArray(rawProjects) ? rawProjects : []
    return list.map((r) => deriveProject(r))
  }, [rawProjects])

  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterStyle, setFilterStyle] = useState<FilterStyle>('all')
  const [filterCity, setFilterCity] = useState<FilterCity>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [page, setPage] = useState(1)

  const [selectedProject, setSelectedProject] = useState<DerivedProject | null>(
    null,
  )

  const cities = useMemo(() => {
    const s = new Set(allDerived.map((p) => p.city ?? '').filter(Boolean))
    return Array.from(s).sort()
  }, [allDerived])

  const styles = useMemo(() => {
    const s = new Set(allDerived.map((p) => p.styleLabel).filter(Boolean))
    return Array.from(s).sort()
  }, [allDerived])

  const filtered = useMemo(
    () =>
      applyFilters(
        allDerived,
        filterType,
        filterStyle,
        filterCity,
        sortOrder,
      ),
    [allDerived, filterType, filterStyle, filterCity, sortOrder],
  )

  const handleTypeChange = useCallback((v: FilterType) => {
    setFilterType(v)
    setPage(1)
  }, [])
  const handleStyleChange = useCallback((v: FilterStyle) => {
    setFilterStyle(v)
    setPage(1)
  }, [])
  const handleCityChange = useCallback((v: FilterCity) => {
    setFilterCity(v)
    setPage(1)
  }, [])
  const handleSortChange = useCallback((v: SortOrder) => {
    setSortOrder(v)
    setPage(1)
  }, [])

  const visibleProjects = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = filtered.length > visibleProjects.length

  const openModal = useCallback((p: DerivedProject) => setSelectedProject(p), [])
  const closeModal = useCallback(() => setSelectedProject(null), [])

  return (
    <>
      <SeoHead
        title="Our Projects | Real Home Transformations | Houznext Hyderabad"
        description="Browse 50+ completed home interior projects by Houznext across Hyderabad, Warangal and Karimnagar. Real homes, real transformations — 2BHK, 3BHK and villas."
        canonical="/projects"
        ogImage="https://houznext.com/og-projects.jpg"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <ProjectsHero totalCount={allDerived.length} />

        <FilterBar
          filterType={filterType}
          filterStyle={filterStyle}
          filterCity={filterCity}
          sortOrder={sortOrder}
          cities={cities}
          styles={styles}
          onType={handleTypeChange}
          onStyle={handleStyleChange}
          onCity={handleCityChange}
          onSort={handleSortChange}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div
              className="font-head font-bold"
              style={{ fontSize: 18, color: '#1f2933' }}
            >
              Completed projects{' '}
              <span style={{ fontSize: 13, fontWeight: 400, color: '#5a6a7e' }}>
                Showing {visibleProjects.length} of {filtered.length}
              </span>
            </div>
          </div>

          <MasonryGrid projects={visibleProjects} onCardClick={openModal} />

          {hasMore && (
            <div style={{ textAlign: 'center', paddingBottom: 24 }}>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                className="font-head font-bold"
                style={{
                  padding: '12px 32px',
                  borderRadius: 10,
                  border: '2px solid #2f80ed',
                  background: 'transparent',
                  color: '#2f80ed',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget
                  b.style.background = '#2f80ed'
                  b.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget
                  b.style.background = 'transparent'
                  b.style.color = '#2f80ed'
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
            marginTop: 8,
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
                transition: 'all 0.2s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget
                b.style.background = '#1a6dd6'
                b.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget
                b.style.background = '#2f80ed'
                b.style.transform = 'translateY(0)'
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
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                const a = e.currentTarget
                a.style.borderColor = '#fff'
                a.style.background = 'rgba(255,255,255,0.1)'
              }}
              onMouseLeave={(e) => {
                const a = e.currentTarget
                a.style.borderColor = 'rgba(255,255,255,0.3)'
                a.style.background = 'transparent'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
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
  const raw = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  const API = String(raw).replace(/\/$/, '')
  try {
    const res = await fetch(`${API}/interiors/portfolio`, {
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error(`Backend responded with ${res.status}`)
    const data = (await res.json()) as unknown
    const projects: PortfolioProject[] = Array.isArray(data)
      ? (data as PortfolioProject[])
      : []
    return {
      props: { projects },
      revalidate: 60,
    }
  } catch (err) {
    console.error('[projects/getStaticProps] Failed to fetch portfolio:', err)
    return {
      props: { projects: [] as PortfolioProject[] },
      revalidate: 60,
    }
  }
}
