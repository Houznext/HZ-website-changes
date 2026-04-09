import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import type { GetServerSideProps } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import apiClient from '@/utils/apiClient'

export interface ApiBlogRow {
  id: number | string
  title?: string
  previewDescription?: string
  blogType?: string
  blogStatus?: string
  createdAt?: string
  updatedAt?: string
  CoverImageUrl?: string
  thumbnailImageUrl?: string
  content?: string
}

interface BlogIndexProps {
  initialBlogs: ApiBlogRow[]
}

function estimateReadMin(b: ApiBlogRow): string {
  const len = (b.content?.length || 0) + (b.previewDescription?.length || 0)
  const mins = Math.max(3, Math.min(20, Math.ceil(len / 1200)))
  return `${mins} min`
}

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function BlogIndex({ initialBlogs }: BlogIndexProps) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const categories = useMemo(() => {
    const types = new Set<string>()
    initialBlogs.forEach((b) => {
      if (b.blogType?.trim()) types.add(b.blogType.trim())
    })
    return ['All', ...Array.from(types).sort((a, b) => a.localeCompare(b))]
  }, [initialBlogs])

  const filtered = useMemo(() => {
    return initialBlogs.filter((b) => {
      const catOk =
        activeCategory === 'All' || (b.blogType || '').trim() === activeCategory
      const q = search.toLowerCase().trim()
      const text = `${b.title || ''} ${b.previewDescription || ''}`.toLowerCase()
      const searchOk = !q || text.includes(q)
      return catOk && searchOk
    })
  }, [initialBlogs, activeCategory, search])

  const featured = useMemo(() => {
    if (filtered.length === 0) return null
    const feat = filtered.find((b) => b.blogStatus === 'Featured')
    if (feat) return feat
    const trend = filtered.find((b) => b.blogStatus === 'Trending')
    if (trend) return trend
    return filtered[0]
  }, [filtered])

  const rest = useMemo(() => {
    if (!featured) return filtered
    return filtered.filter((b) => String(b.id) !== String(featured.id))
  }, [filtered, featured])

  const sidebarPosts = rest.slice(0, 3)
  const gridPosts = rest.slice(3)

  const goToPost = (id: number | string) => {
    void router.push(`/blogs/${id}`)
  }

  const cover = (b: ApiBlogRow) => b.CoverImageUrl || b.thumbnailImageUrl || ''

  return (
    <>
      <SeoHead
        title="Home Design Blog | Interiors, Construction & Real Estate | Houznext"
        description="Expert guides on modular kitchens, interior costs, RERA compliance, and home design for Indian homeowners in Telangana. Tips from 500+ delivered projects."
        canonical="/blog"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
          <div className="max-w-7xl mx-auto text-center">
            <EyebrowLabel className="justify-center mb-4">Houznext Blog</EyebrowLabel>
            <h1 className="font-head font-black text-[36px] md:text-[48px] text-white mb-4">
              Ideas for your{' '}
              <span style={{ color: '#2f80ed' }}>dream home.</span>
            </h1>
            <p className="text-[15px] mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Interior design tips, construction guides, and real estate insights for homeowners across Telangana.
            </p>
            <div className="max-w-lg mx-auto relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="w-full bg-white rounded-xl px-5 py-3.5 text-sm outline-none pr-12"
                style={{ border: '2px solid transparent' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2f80ed'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5a6a7e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-[12px] font-head font-bold transition-all"
                style={
                  activeCategory === cat
                    ? { background: '#2f80ed', color: '#fff' }
                    : { background: '#e8f1fd', color: '#2f80ed' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {initialBlogs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted mb-2">No articles published yet.</p>
              <p className="text-sm text-muted">New posts will appear here once they are added in the admin.</p>
            </div>
          )}

          {featured && initialBlogs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div
                className="md:col-span-2 rounded-2xl overflow-hidden bg-white border cursor-pointer transition-shadow hover:shadow-lg"
                style={{ borderColor: '#dde8f5' }}
                onClick={() => goToPost(featured.id)}
                onKeyDown={(e) => e.key === 'Enter' && goToPost(featured.id)}
                role="link"
                tabIndex={0}
              >
                <div className="relative h-56 w-full" style={{ background: 'linear-gradient(135deg, #1a3a5c, #0f2a44)' }}>
                  {cover(featured) ? (
                    <Image
                      src={cover(featured)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f2a44]/90 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
                    {(featured.blogType || featured.blogStatus) && (
                      <span
                        className="text-[11px] font-head font-bold px-3 py-1 rounded-full text-white"
                        style={{ background: 'rgba(47,128,237,0.85)' }}
                      >
                        {featured.blogType || featured.blogStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="font-head font-bold text-[20px] text-charcoal mb-2">{featured.title}</h2>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: '#5a6a7e' }}>
                    {featured.previewDescription}
                  </p>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: '#5a6a7e' }}>
                    <span>{formatDate(featured.createdAt || featured.updatedAt)}</span>
                    <span>·</span>
                    <span>{estimateReadMin(featured)} read</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {sidebarPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-xl border p-4 cursor-pointer transition-shadow hover:shadow-md"
                    style={{ borderColor: '#dde8f5' }}
                    onClick={() => goToPost(post.id)}
                    onKeyDown={(e) => e.key === 'Enter' && goToPost(post.id)}
                    role="link"
                    tabIndex={0}
                  >
                    <span className="text-[10px] font-head font-bold" style={{ color: '#2f80ed' }}>
                      {post.blogType || post.blogStatus || 'Article'}
                    </span>
                    <h3 className="font-head font-bold text-[13px] text-charcoal mt-1 mb-1">{post.title}</h3>
                    <p className="text-[11px]" style={{ color: '#5a6a7e' }}>
                      {estimateReadMin(post)} read
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gridPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {gridPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
                  style={{ borderColor: '#dde8f5' }}
                  onClick={() => goToPost(post.id)}
                  onKeyDown={(e) => e.key === 'Enter' && goToPost(post.id)}
                  role="link"
                  tabIndex={0}
                >
                  <div className="relative h-36 w-full" style={{ background: 'linear-gradient(135deg, #1a3a5c, #0f2a44)' }}>
                    {cover(post) ? (
                      <Image
                        src={cover(post)}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2a44]/80 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span
                        className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: 'rgba(47,128,237,0.65)' }}
                      >
                        {post.blogType || post.blogStatus || 'Article'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-head font-bold text-[14px] text-charcoal mb-2">{post.title}</h3>
                    <p className="text-[12px] leading-relaxed mb-3 line-clamp-3" style={{ color: '#5a6a7e' }}>
                      {post.previewDescription}
                    </p>
                    <div className="flex items-center gap-2 text-[11px]" style={{ color: '#5a6a7e' }}>
                      <span>{formatDate(post.createdAt || post.updatedAt)}</span>
                      <span>·</span>
                      <span>{estimateReadMin(post)} read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {initialBlogs.length > 0 && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted">No articles match your filters.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<BlogIndexProps> = async () => {
  try {
    const res = await apiClient.get(apiClient.URLS.blogs, {
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    })
    const raw = Array.isArray(res.body) ? res.body : res.body?.blogs || []
    const initialBlogs: ApiBlogRow[] = (raw as ApiBlogRow[]).filter((b) => b?.id != null)

    return { props: { initialBlogs } }
  } catch (e) {
    console.error('[blog index] fetch failed', e)
    return { props: { initialBlogs: [] } }
  }
}
