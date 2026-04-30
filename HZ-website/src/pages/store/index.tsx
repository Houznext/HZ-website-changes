import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { withStoreLayout } from '@/components/Layouts/StoreLayout'
import ProductCard from '@/components/Store/ProductCard'
import { fetchProducts, fetchRecommended, FurnitureProduct } from '@/store/storeApi'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { ProductSkeleton } from '@/components/Store/ProductSkeleton'

function StoreHomePage() {
  const router = useRouter()
  const { customer, isLoggedIn } = useCustomerAuth()
  const [slideIdx, setSlideIdx] = useState(0)
  const [bestSellers, setBestSellers] = useState<FurnitureProduct[]>([])
  const [newArrivals, setNewArrivals] = useState<FurnitureProduct[]>([])
  const [recommended, setRecommended] = useState<FurnitureProduct[]>([])
  const [featuredLoading, setFeaturedLoading] = useState(true)
  const [arrivalsLoading, setArrivalsLoading] = useState(true)
  const [recoLoading, setRecoLoading] = useState(false)
  const [browseChips, setBrowseChips] = useState<string[]>([])
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  useEffect(() => {
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % 4), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setFeaturedLoading(true)
    fetch(`${API}/furniture?status=active&sort=popularity&limit=4`)
      .then((r) => r.json())
      .then((data) => setBestSellers(data?.data ?? []))
      .finally(() => setFeaturedLoading(false))
  }, [API])

  useEffect(() => {
    setArrivalsLoading(true)
    fetch(`${API}/furniture?status=active&sort=latest&limit=5`)
      .then((r) => r.json())
      .then((data) => setNewArrivals(data?.data ?? []))
      .finally(() => setArrivalsLoading(false))
  }, [API])

  useEffect(() => {
    if (!customer?.mobile) return
    setRecoLoading(true)
    fetch(`${API}/furniture/recommended?mobile=${encodeURIComponent(customer.mobile)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRecommended(Array.isArray(data) ? data.slice(0, 5) : []))
      .finally(() => setRecoLoading(false))
  }, [API, customer?.mobile])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hz_store_browse_history')
      const list = raw ? (JSON.parse(raw) as string[]) : []
      setBrowseChips(list.slice(0, 4))
    } catch {
      setBrowseChips([])
    }
  }, [isLoggedIn])

  const slides = useMemo(
    () => [
      { title: 'Featured collection', sub: 'Handpicked premium furniture for your dream home.', bg: 'linear-gradient(120deg,#0f2a44,#2f80ed)' },
      { title: 'Republic Day Sale', sub: 'Biggest savings across store categories.', bg: 'linear-gradient(120deg,#7f1d1d,#dc2626)' },
      { title: 'Custom Furniture', sub: 'Design your own pieces with Houznext experts.', bg: 'linear-gradient(120deg,#065f46,#16a34a)' },
      { title: 'No-Cost EMI', sub: 'Easy monthly plans on select products.', bg: 'linear-gradient(120deg,#312e81,#4f46e5)' },
    ],
    [],
  )

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 20px 30px' }}>
      <section style={{ borderRadius: 16, padding: '26px 30px', color: '#fff', background: slides[slideIdx].bg, minHeight: 220, transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setSlideIdx((i) => (i + 3) % 4)} style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, width: 28, height: 28 }}>‹</button>
          <button onClick={() => setSlideIdx((i) => (i + 1) % 4)} style={{ border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: 8, width: 28, height: 28 }}>›</button>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>{slides[slideIdx].title}</h1>
        <p style={{ fontSize: 14, opacity: 0.92, maxWidth: 620 }}>{slides[slideIdx].sub}</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} style={{ width: 9, height: 9, borderRadius: '50%', border: 'none', background: i === slideIdx ? '#f2994a' : 'rgba(255,255,255,0.45)' }} />
          ))}
        </div>
      </section>

      <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0,1fr))', gap: 10 }}>
        {[
          { label: 'Sofas', count: 48 },
          { label: 'Beds', count: 36 },
          { label: 'Dining Tables', count: 29 },
          { label: 'TV Units', count: 22 },
          { label: 'Wardrobes', count: 18 },
          { label: 'View all', count: 0 },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => router.push(c.label === 'View all' ? '/store' : `/store?category=${encodeURIComponent(c.label)}`)}
            style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, padding: '12px 10px', textAlign: 'center', transition: 'all 0.2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 10px 26px rgba(15,42,68,0.12)'
              e.currentTarget.style.borderColor = '#93c5fd'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = '#dde8f5'
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2933' }}>{c.label}</div>
            {c.count > 0 ? <div style={{ fontSize: 11, color: '#5a6a7e', marginTop: 2 }}>{c.count} products</div> : null}
          </button>
        ))}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1f2933', marginTop: 24, marginBottom: 10 }}>Best sellers</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
        {featuredLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
          : bestSellers.length
            ? bestSellers.map((p) => <ProductCard key={p.id} product={p} />)
            : <div style={{ gridColumn: '1 / -1', color: '#5a6a7e' }}>No products found</div>}
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1f2933', marginTop: 24, marginBottom: 10 }}>New arrivals</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12 }}>
        {arrivalsLoading
          ? Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} height={170} />)
          : newArrivals.length
            ? newArrivals.map((p) => <ProductCard key={p.id} product={p} imageHeight={170} />)
            : <div style={{ gridColumn: '1 / -1', color: '#5a6a7e' }}>No products found</div>}
      </div>

      <section onClick={() => router.push('/store?sale=true')} style={{ marginTop: 26, borderRadius: 16, cursor: 'pointer', background: 'linear-gradient(120deg,#450a0a,#7f1d1d,#991b1b)', color: '#fff', padding: '24px 22px', minHeight: '30vh' }}>
        <h3 style={{ fontSize: 30, fontWeight: 900 }}>Up to 50% off on 200+ products</h3>
        <p style={{ marginTop: 8, opacity: 0.9 }}>Shop the sale</p>
      </section>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1f2933', marginTop: 24, marginBottom: 10 }}>
        {isLoggedIn && customer?.name ? `Picked for you · ${customer.name}` : 'Personalised recommendations'}
      </h2>
      {isLoggedIn ? (
        <>
          {!!browseChips.length && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {browseChips.map((chip) => <span key={chip} style={{ fontSize: 11, background: '#e8f1fd', color: '#0f2a44', border: '1px solid #cfe1f9', borderRadius: 999, padding: '4px 10px' }}>{chip}</span>)}
            </div>
          )}
          <button onClick={() => customer?.mobile && fetchRecommended(customer.mobile).then((list) => setRecommended(list.slice(0, 5)))} style={{ marginBottom: 10, border: '1px solid #c7daf3', borderRadius: 8, background: '#e8f1fd', color: '#0f2a44', padding: '7px 12px', fontSize: 12 }}>Refresh</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12 }}>
            {recoLoading
              ? Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} height={170} />)
              : recommended.length
                ? recommended.map((p) => <ProductCard key={p.id} product={p} imageHeight={170} />)
                : <div style={{ gridColumn: '1 / -1', color: '#5a6a7e' }}>No products found</div>}
          </div>
        </>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, padding: 18 }}>
          <div style={{ fontWeight: 700, color: '#1f2933' }}>Sign in for personalised picks</div>
          <button onClick={() => router.push('/?login=1')} style={{ marginTop: 8, border: 'none', borderRadius: 8, background: '#2f80ed', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}>Sign in</button>
        </div>
      )}
    </div>
  )
}

export default withStoreLayout(StoreHomePage)
