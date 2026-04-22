import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import FreeConsultationHeroModal from '@/components/HeroConsultation/FreeConsultationHeroModal'
import { InteriorProject, ProjectsResponse } from '@/types/interior-project'

function StrokeIcon({ path, stroke = '#64748b', size = 16 }: { path: string; stroke?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  )
}

async function fetchProjects(params: Record<string, string>): Promise<ProjectsResponse> {
  const rawApi = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT || 'http://localhost:4000'
  const api = rawApi.endsWith('/') ? rawApi.slice(0, -1) : rawApi
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${api}/interior-projects/public?${qs}`)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

const FILTERS = ['All', '2BHK', '3BHK', 'Villa / 4BHK+', 'Essential', 'Premium', 'Luxury'] as const
const SORTS = ['Newest first', 'Cost: low to high', 'Cost: high to low', 'Fastest delivery'] as const

const STYLE_BG: Record<string, string> = {
  Modern: '#dbeafe',
  'Warm / Scandi': '#fef3c7',
  Classic: '#f3e8ff',
  Bohemian: '#dcfce7',
  Industrial: '#f1f5f9',
  Luxury: '#fef9ee',
}

function getPackageBadgeStyle(pkg?: string) {
  if (pkg === 'Premium') return { background: 'rgba(47,128,237,.9)', color: '#fff' }
  if (pkg === 'Luxury') return { background: 'rgba(242,153,74,.9)', color: '#7c3a00' }
  return { background: 'rgba(255,255,255,.9)', color: '#0f2a44' }
}

function toApiParams(filter: string, sort: string, page: number) {
  const params: Record<string, string> = { page: String(page), limit: '9' }
  if (filter === '2BHK') params.propertyType = '2BHK'
  if (filter === '3BHK') params.propertyType = '3BHK'
  if (filter === 'Villa / 4BHK+') params.propertyType = 'Villa'
  if (filter === 'Essential') params.package = 'Essential'
  if (filter === 'Premium') params.package = 'Premium'
  if (filter === 'Luxury') params.package = 'Luxury'

  if (sort === 'Cost: low to high') params.sort = 'cost-low'
  if (sort === 'Cost: high to low') params.sort = 'cost-high'
  if (sort === 'Fastest delivery') params.sort = 'days'
  if (sort === 'Newest first') params.sort = 'newest'
  return params
}

function PlaceholderImage({ styleName }: { styleName?: string }) {
  const bg = STYLE_BG[styleName || ''] || '#f0f7ff'
  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: bg }}>
      <StrokeIcon path="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" stroke="#2f80ed" size={28} />
      <p className="text-[12px] mt-2 font-[700]" style={{ color: '#0f2a44' }}>{styleName || 'Project image'}</p>
    </div>
  )
}

function PackagePill({ pkg, active, onClick }: { pkg: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-[13px] font-[600] px-4 py-[7px] whitespace-nowrap"
      style={{
        borderRadius: 24,
        border: active ? '1.5px solid #2f80ed' : '1.5px solid #e2e8f0',
        background: active ? '#2f80ed' : '#fff',
        color: active ? '#fff' : '#64748b',
        transition: 'all .2s ease',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#93c5fd'
          e.currentTarget.style.color = '#0f2a44'
          e.currentTarget.style.background = '#f0f7ff'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#e2e8f0'
          e.currentTarget.style.color = '#64748b'
          e.currentTarget.style.background = '#fff'
        }
      }}
    >
      {pkg}
    </button>
  )
}

function ProjectCard({ p, list, featured = false }: { p: InteriorProject; list: boolean; featured?: boolean }) {
  const router = useRouter()
  const imageHeight = list ? '100%' : featured ? 320 : 220
  const rooms = p.rooms || []
  const extraCount = rooms.length > 2 ? rooms.length - 2 : 0
  return (
    <article
      onClick={() => router.push(`/projects/${p.id}`)}
      className={`group bg-white overflow-hidden cursor-pointer ${list ? 'flex flex-col sm:flex-row' : ''}`}
      style={{
        border: '1.5px solid #e2e8f0',
        borderRadius: 16,
        transition: 'all .25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#93c5fd'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(15,42,68,.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        className={`${list ? 'sm:w-[280px] sm:min-h-[180px] flex-shrink-0' : 'w-full'} relative overflow-hidden`}
        style={{ height: list ? 'auto' : imageHeight as number | string, background: '#f1f5f9' }}
      >
        {featured && (
          <span
            className="absolute z-20 top-[14px] left-[14px] text-[10px] font-[800] uppercase tracking-[.05em] px-3 py-1"
            style={{ borderRadius: 20, background: '#f2994a', color: '#7c3a00' }}
          >
            Featured
          </span>
        )}
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-[1.06]">
          {p.images && p.images.length > 0 ? (
            <img src={p.images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <PlaceholderImage styleName={p.style} />
          )}
        </div>
        <span
          className="absolute top-3 left-3 text-white text-[11px] font-[700] px-[10px] py-1"
          style={{ borderRadius: 20, background: 'rgba(15,42,68,.85)' }}
        >
          {p.propertyType} · {p.sqft || 0} sqft
        </span>
        <span className="absolute top-3 right-3 text-[11px] font-[700] px-[10px] py-1" style={{ borderRadius: 20, ...getPackageBadgeStyle(p.package) }}>
          {p.package}
        </span>
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100"
          style={{ transition: 'opacity .25s ease', background: 'rgba(15,42,68,.7)' }}
        >
          <button
            className="flex items-center gap-2 text-[13px] font-[700] px-5 py-2.5"
            style={{ borderRadius: 10, background: '#fff', color: '#0f2a44', border: 'none', transition: 'all .2s ease' }}
          >
            View project
            <StrokeIcon path="M15 3h6v6M10 14L21 3" stroke="#0f2a44" size={14} />
          </button>
        </div>
      </div>

      <div className={`${list ? 'flex-1 p-5' : 'p-4'}`}>
        <h3 className={`font-[800] mb-1 ${list ? 'text-[17px]' : featured ? 'text-[18px]' : 'text-[15px]'}`} style={{ color: '#0f2a44', lineHeight: 1.3 }}>
          {p.title}
        </h3>
        <div className="flex items-center gap-[5px] text-[12px] mb-3" style={{ color: '#64748b' }}>
          <StrokeIcon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#2f80ed" size={12} />
          <span>{p.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {rooms.slice(0, 2).map((r) => (
            <span key={r} className="flex items-center gap-1 text-[11.5px] px-[9px] py-1" style={{ borderRadius: 20, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <StrokeIcon path="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" stroke="#2f80ed" size={11} />
              {r}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="text-[11.5px] px-[9px] py-1" style={{ borderRadius: 20, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              +{extraCount} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>
          <div>
            <p className="text-[16px] font-[900]" style={{ color: '#2f80ed' }}>₹{p.costInLakhs}L</p>
            <p className="text-[10.5px]" style={{ color: '#64748b' }}>fixed price</p>
          </div>
          <div className="flex items-center gap-[5px] text-[12px]" style={{ color: '#64748b' }}>
            <StrokeIcon path="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" stroke="#64748b" size={14} />
            {p.deliveryDays} days
          </div>
        </div>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl overflow-hidden" style={{ border: '1.5px solid #e2e8f0' }}>
      <div className="h-[220px] bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded" />
        <div className="h-3 bg-slate-200 rounded w-2/3" />
        <div className="h-8 bg-slate-200 rounded" />
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [activeSort, setActiveSort] = useState<string>('Newest first')
  const [gridView, setGridView] = useState(true)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [items, setItems] = useState<InteriorProject[]>([])
  const [consultationOpen, setConsultationOpen] = useState(false)
  const loadMoreRef = useRef(false)

  const loadProjects = useCallback(async (targetPage: number, append: boolean) => {
    setLoading(true)
    try {
      const params = toApiParams(activeFilter, activeSort, targetPage)
      const data = await fetchProjects(params)
      setTotalPages(data.totalPages || 1)
      setItems((prev) => (append ? [...prev, ...data.data] : data.data))
    } catch {
      if (!append) setItems([])
    } finally {
      setLoading(false)
    }
  }, [activeFilter, activeSort])

  useEffect(() => {
    setPage(1)
    loadMoreRef.current = false
    void loadProjects(1, false)
  }, [activeFilter, activeSort, loadProjects])

  useEffect(() => {
    const query: Record<string, string> = {}
    if (activeFilter !== 'All') query.filter = activeFilter
    if (activeSort !== 'Newest first') query.sort = activeSort
    void router.replace({ pathname: '/projects', query }, undefined, { shallow: true })
  }, [activeFilter, activeSort, router])

  const canLoadMore = page < totalPages
  const featured = activeFilter === 'All' && items.length > 0 && items[0].featured
  const first = featured ? items[0] : null
  const side = featured ? items.slice(1, 3) : []
  const rest = featured ? items.slice(3) : items

  return (
    <>
      <SeoHead
        title="Our Interior Projects | Houznext"
        description="15+ completed interior projects across Telangana. Fixed-price, 45-day delivery, stunning designs."
        canonical="/projects"
      />
      <Navbar />
      <main style={{ background: '#f8fafc', fontFamily: 'Inter,system-ui,sans-serif' }}>
        <section className="relative overflow-hidden" style={{ background: '#0f2a44', padding: '56px 0 48px' }}>
          <div className="absolute pointer-events-none rounded-full" style={{ width: 280, height: 280, border: '1.5px solid rgba(47,128,237,.15)', top: -60, right: -60 }} />
          <div className="absolute pointer-events-none rounded-full" style={{ width: 200, height: 200, border: '1.5px solid rgba(242,153,74,.12)', bottom: -80, left: -40 }} />
          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-[18px] h-[2px]" style={{ background: '#f2994a' }} />
              <span className="text-[11px] font-[700] tracking-[.12em] uppercase" style={{ color: '#f2994a' }}>OUR WORK</span>
              <span className="w-[18px] h-[2px]" style={{ background: '#f2994a' }} />
            </div>
            <h1 className="text-[28px] md:text-[38px] font-[900] mb-3 text-white leading-[1.1]">
              Homes we&apos;ve <span style={{ color: '#f2994a' }}>transformed</span>
            </h1>
            <p className="text-[15px] leading-[1.6] mx-auto mb-7 max-w-[480px]" style={{ color: 'rgba(255,255,255,.6)' }}>
              15+ completed interior projects across Telangana. Every space designed, built, and delivered on time — fixed price, no surprises.
            </p>
            <div className="flex justify-center gap-8 md:gap-10 flex-wrap">
              {[
                ['15+', 'Projects delivered'],
                ['45d', 'Avg. delivery'],
                ['4.8★', 'Customer rating'],
                ['8', 'Cities served'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-[24px] font-[900] text-white">{v}</p>
                  <p className="text-[11px] font-[500]" style={{ color: 'rgba(255,255,255,.5)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sticky z-[100]" style={{ top: 60, background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 0', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
          <div className="max-w-5xl mx-auto px-6 flex items-center gap-[10px] flex-wrap">
            <span className="text-[12px] font-[700] mr-1" style={{ color: '#64748b' }}>Filter:</span>
            {FILTERS.map((f) => (
              <PackagePill key={f} pkg={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
            ))}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-[12px]" style={{ color: '#64748b' }}>Sort:</label>
              <select
                value={activeSort}
                onChange={(e) => setActiveSort(e.target.value)}
                className="text-[13px] px-3 py-[7px]"
                style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, color: '#0f2a44', background: '#fff', outline: 'none', cursor: 'pointer' }}
              >
                {SORTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-6 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px]" style={{ color: '#64748b' }}><b style={{ color: '#0f2a44' }}>{items.length}</b> projects found</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGridView(true)}
                className="w-8 h-8 flex items-center justify-center"
                style={{ borderRadius: 8, border: `1.5px solid ${gridView ? '#2f80ed' : '#e2e8f0'}`, background: gridView ? '#f0f7ff' : '#fff' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0f2a44" strokeWidth="1.4"><rect x="1" y="1" width="4" height="4"/><rect x="9" y="1" width="4" height="4"/><rect x="1" y="9" width="4" height="4"/><rect x="9" y="9" width="4" height="4"/></svg>
              </button>
              <button
                onClick={() => setGridView(false)}
                className="w-8 h-8 flex items-center justify-center"
                style={{ borderRadius: 8, border: `1.5px solid ${!gridView ? '#2f80ed' : '#e2e8f0'}`, background: !gridView ? '#f0f7ff' : '#fff' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#0f2a44" strokeWidth="1.4"><path d="M2 3h10M2 7h10M2 11h10" /></svg>
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-10">
          {loading ? (
            <div className={`grid gap-5 ${gridView ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center mt-12">
              <div className="mx-auto w-10 h-10 flex items-center justify-center">
                <StrokeIcon path="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" size={40} />
              </div>
              <h3 className="text-[18px] font-[700] mt-3" style={{ color: '#0f2a44' }}>No projects found</h3>
              <p className="text-[14px] mt-1" style={{ color: '#64748b' }}>Try adjusting your filters</p>
              <button onClick={() => { setActiveFilter('All'); setActiveSort('Newest first') }} className="mt-5 px-4 py-2 text-[13px] font-[700]" style={{ borderRadius: 10, border: '2px solid #0f2a44', color: '#0f2a44', background: '#fff' }}>
                Reset filters
              </button>
            </div>
          ) : gridView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {first && (
                <div className="col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
                  <ProjectCard p={first} list={false} featured />
                  <div className="grid grid-cols-1 gap-5">
                    {side.map((p) => <ProjectCard key={p.id} p={p} list={false} />)}
                  </div>
                </div>
              )}
              {rest.map((p) => <ProjectCard key={p.id} p={p} list={false} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {items.map((p) => <ProjectCard key={p.id} p={p} list />)}
            </div>
          )}

          {!loading && canLoadMore && (
            <div className="flex justify-center mt-9">
              <button
                onClick={async () => {
                  if (loadMoreRef.current) return
                  loadMoreRef.current = true
                  const nextPage = page + 1
                  setPage(nextPage)
                  await loadProjects(nextPage, true)
                  loadMoreRef.current = false
                }}
                className="flex items-center gap-[10px] px-9 py-[13px] text-[14px] font-[700]"
                style={{ borderRadius: 12, border: '2px solid #0f2a44', background: '#fff', color: '#0f2a44', transition: 'all .2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#0f2a44'
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 10px 24px rgba(15,42,68,.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff'
                  e.currentTarget.style.color = '#0f2a44'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <StrokeIcon path="M8 3v10M3 8l5 5 5-5" stroke="currentColor" size={14} />
                Load more
              </button>
            </div>
          )}
        </section>

        <section className="max-w-5xl mx-auto px-6 mt-12 mb-12">
          <div className="relative text-center overflow-hidden" style={{ background: '#0f2a44', borderRadius: 20, padding: '40px 32px' }}>
            <div className="absolute rounded-full pointer-events-none" style={{ top: -40, right: -40, width: 160, height: 160, border: '1px solid rgba(47,128,237,.2)' }} />
            <h2 className="relative z-10 text-[26px] font-[900] text-white mb-2">Love what you see?</h2>
            <p className="relative z-10 text-[14px] mb-6" style={{ color: 'rgba(255,255,255,.6)' }}>
              Get a free consultation and personalised 3D design for your home.
            </p>
            <div className="relative z-10 flex justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setConsultationOpen(true)}
                className="inline-flex items-center gap-2 text-[14px] font-[700] px-7 py-[13px]"
                style={{ borderRadius: 11, border: 'none', background: '#2f80ed', color: '#fff', cursor: 'pointer', transition: 'all .2s ease' }}
              >
                <StrokeIcon path="M20 6L9 17l-5-5" stroke="#fff" size={14} />
                Get free estimate
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/pricing'
                }}
                className="text-[14px] font-[700] px-7 py-[13px]"
                style={{
                  display: 'inline-block',
                  borderRadius: 11,
                  border: '2px solid rgba(255,255,255,.3)',
                  background: 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                  fontFamily: 'inherit',
                }}
              >
                View all packages
              </button>
            </div>
          </div>
        </section>
      </main>
      <FreeConsultationHeroModal open={consultationOpen} onClose={() => setConsultationOpen(false)} />
      <Footer />
    </>
  )
}
