import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'

const CATEGORIES = ['All', 'Interiors', 'Construction', 'Real Estate', 'RERA & Legal', 'Cost Guides']

const POSTS = [
  { slug: 'modular-kitchen-cost-hyderabad', category: 'Cost Guides', title: 'Modular Kitchen Cost in Hyderabad 2025', excerpt: 'A complete breakdown of modular kitchen costs — materials, finishes, and what to expect at every budget level.', date: '2025-01-15', readTime: '8 min' },
  { slug: 'false-ceiling-cost-guide', category: 'Interiors', title: 'False Ceiling Cost Guide: POP vs Gypsum', excerpt: 'POP or gypsum? We break down the pros, cons, and cost per sq ft for both types of false ceilings.', date: '2025-01-10', readTime: '6 min' },
  { slug: 'rera-compliance-telangana', category: 'RERA & Legal', title: 'RERA Compliance in Telangana: What Buyers Need to Know', excerpt: 'A step-by-step guide to verifying RERA registration and protecting your investment when buying property in Telangana.', date: '2025-01-05', readTime: '10 min' },
  { slug: '2bhk-interior-cost-warangal', category: 'Cost Guides', title: '2BHK Interior Cost in Warangal 2025', excerpt: 'Real numbers, real projects. How much does a 2BHK interior cost in Warangal across Essential, Premium and Luxury tiers?', date: '2024-12-28', readTime: '7 min' },
  { slug: 'home-construction-stages', category: 'Construction', title: 'The 7 Stages of Home Construction — Explained', excerpt: 'From foundation to finishing — understand every stage of home construction and what to expect from your contractor.', date: '2024-12-20', readTime: '12 min' },
  { slug: 'wardrobe-design-ideas', category: 'Interiors', title: '10 Wardrobe Design Ideas for Indian Homes', excerpt: 'Sliding vs hinged, loft storage, mirror panels — explore wardrobe designs that work perfectly for Indian homes.', date: '2024-12-15', readTime: '5 min' },
]

export default function BlogIndex() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = POSTS.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <>
      <SeoHead
        title="Home Design Blog | Interiors, Construction & Real Estate"
        description="Expert guides on modular kitchens, construction costs, RERA compliance, and interior design for Indian homeowners in Telangana."
        canonical="/blog"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        {/* Hero */}
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
            {/* Search */}
            <div className="max-w-lg mx-auto relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles…"
                className="w-full bg-white rounded-xl px-5 py-3.5 text-sm outline-none pr-12"
                style={{ border: '2px solid transparent' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'transparent' }}
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5a6a7e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-1.5 rounded-full text-[12px] font-head font-bold transition-all"
                style={activeCategory === cat
                  ? { background: '#2f80ed', color: '#fff' }
                  : { background: '#e8f1fd', color: '#2f80ed' }
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured + sidebar */}
          {featured && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Featured */}
              <div
                className="md:col-span-2 rounded-2xl overflow-hidden bg-white border cursor-pointer transition-shadow hover:shadow-lg"
                style={{ borderColor: '#dde8f5' }}
                onClick={() => router.push(`/blog/${featured.slug}`)}
              >
                <div className="h-56 flex items-end p-5" style={{ background: 'linear-gradient(135deg, #1a3a5c, #0f2a44)' }}>
                  <span className="text-[11px] font-head font-bold px-3 py-1 rounded-full text-white" style={{ background: 'rgba(47,128,237,0.6)' }}>
                    {featured.category}
                  </span>
                </div>
                <div className="p-6">
                  <h2 className="font-head font-bold text-[20px] text-charcoal mb-2">{featured.title}</h2>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: '#5a6a7e' }}>{featured.excerpt}</p>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: '#5a6a7e' }}>
                    <span>{featured.date}</span>
                    <span>·</span>
                    <span>{featured.readTime} read</span>
                  </div>
                </div>
              </div>

              {/* Sidebar cards */}
              <div className="space-y-4">
                {rest.slice(0, 3).map((post) => (
                  <div
                    key={post.slug}
                    className="bg-white rounded-xl border p-4 cursor-pointer transition-shadow hover:shadow-md"
                    style={{ borderColor: '#dde8f5' }}
                    onClick={() => router.push(`/blog/${post.slug}`)}
                  >
                    <span className="text-[10px] font-head font-bold" style={{ color: '#2f80ed' }}>{post.category}</span>
                    <h3 className="font-head font-bold text-[13px] text-charcoal mt-1 mb-1">{post.title}</h3>
                    <p className="text-[11px]" style={{ color: '#5a6a7e' }}>{post.readTime} read</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {rest.map((post) => (
              <div
                key={post.slug}
                className="bg-white rounded-2xl border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
                style={{ borderColor: '#dde8f5' }}
                onClick={() => router.push(`/blog/${post.slug}`)}
              >
                <div className="h-36 flex items-end p-4" style={{ background: 'linear-gradient(135deg, #1a3a5c, #0f2a44)' }}>
                  <span className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(47,128,237,0.5)' }}>
                    {post.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-head font-bold text-[14px] text-charcoal mb-2">{post.title}</h3>
                  <p className="text-[12px] leading-relaxed mb-3" style={{ color: '#5a6a7e' }}>{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-[11px]" style={{ color: '#5a6a7e' }}>
                    <span>{post.date}</span><span>·</span><span>{post.readTime} read</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted">No articles found for &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
