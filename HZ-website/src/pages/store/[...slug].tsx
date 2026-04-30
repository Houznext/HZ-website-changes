import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { withStoreLayout } from '@/components/Layouts/StoreLayout'
import ProductCard from '@/components/Store/ProductCard'
import { fetchProducts, FurnitureProduct } from '@/store/storeApi'
import { ProductSkeleton } from '@/components/Store/ProductSkeleton'

const PRICE_RANGES = [
  { label: 'Under ₹20,000', value: 'under20000' },
  { label: '₹20,000 – ₹30,000', value: '20000to29999' },
  { label: '₹30,000 – ₹40,000', value: '30000to39999' },
  { label: '₹40,000 – ₹50,000', value: '40000to49999' },
  { label: 'Above ₹50,000', value: 'above50000' },
]

const SUB_CATEGORIES: Record<string, string[]> = {
  Sofas: ['L-Shaped', 'Sectional', 'Recliner', 'Sofa Bed'],
  Beds: ['Platform', 'Storage', 'Bunk', 'Hydraulic'],
  Chairs: ['Office Chair', 'Dining Chair', 'Lounge Chair', 'Accent Chair'],
  Tables: ['Coffee Table', 'Side Table', 'Center Table', 'Console Table'],
  Wardrobes: ['2 Door', '3 Door', 'Sliding'],
  'Study & Office': ['Study Table', 'Study Set'],
  'Dining Tables': ['4 Seater', '6 Seater', '8 Seater'],
}

function StoreListingPage() {
  const router = useRouter()
  const [products, setProducts] = useState<FurnitureProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const page = Number(router.query.page || 1)
  const query = router.query

  const setQuery = (patch: Record<string, any>) => {
    const next = { ...query, ...patch }
    Object.keys(next).forEach((k) => {
      if (next[k] === '' || next[k] === undefined || next[k] === null) delete next[k]
    })
    router.push({ pathname: '/store', query: next }, undefined, { shallow: true })
  }

  useEffect(() => {
    if (!router.isReady) return
    setLoading(true)
    fetchProducts({
      category: typeof router.query.category === 'string' ? router.query.category : undefined,
      q: typeof router.query.q === 'string' ? router.query.q : undefined,
      sort: typeof router.query.sort === 'string' ? router.query.sort : undefined,
      priceRange: typeof router.query.priceRange === 'string' ? router.query.priceRange : undefined,
      subCategory: typeof router.query.subCategory === 'string' ? router.query.subCategory : undefined,
      material: typeof router.query.material === 'string' ? router.query.material : undefined,
      page,
      limit: 12,
      brand: typeof router.query.brand === 'string' ? router.query.brand : undefined,
      status: 'active',
    })
      .then((res) => {
        setProducts(res.data || [])
        setTotalPages(res.totalPages || 1)
      })
      .finally(() => setLoading(false))
  }, [router.isReady, router.query, page])

  const selectedCategory = typeof query.category === 'string' ? query.category : ''
  const selectedSubCats = selectedCategory ? (SUB_CATEGORIES[selectedCategory] ?? []) : []

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '18px 20px 30px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1f2933', marginBottom: 12 }}>Store products</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <aside style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 12, padding: 14, height: 'fit-content' }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Filters</div>
          <div style={{ fontSize: 12, marginBottom: 6 }}>Price range</div>
          {PRICE_RANGES.map((r) => (
            <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 6 }}>
              <input type="radio" checked={query.priceRange === r.value} onChange={() => setQuery({ priceRange: r.value, page: 1, status: 'active' })} />
              {r.label}
            </label>
          ))}
          {!!selectedSubCats.length && (
            <>
              <div style={{ fontSize: 12, marginTop: 10, marginBottom: 6 }}>Sub-category</div>
              <select value={typeof query.subCategory === 'string' ? query.subCategory : ''} onChange={(e) => setQuery({ subCategory: e.target.value || undefined, page: 1, status: 'active' })} style={{ width: '100%', border: '1px solid #dde8f5', borderRadius: 8, padding: '7px 10px', fontSize: 12 }}>
                <option value="">All</option>
                {selectedSubCats.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </>
          )}
          <div style={{ fontSize: 12, marginTop: 10, marginBottom: 6 }}>Brand</div>
          <input
            value={typeof query.brand === 'string' ? query.brand : ''}
            onChange={(e) => setQuery({ brand: e.target.value, page: 1, status: 'active' })}
            placeholder="Search brand"
            style={{ width: '100%', border: '1px solid #dde8f5', borderRadius: 8, padding: '7px 10px', fontSize: 12 }}
          />
          <div style={{ fontSize: 12, marginTop: 10, marginBottom: 6 }}>Material</div>
          <select value={typeof query.material === 'string' ? query.material : ''} onChange={(e) => setQuery({ material: e.target.value || undefined, page: 1, status: 'active' })} style={{ width: '100%', border: '1px solid #dde8f5', borderRadius: 8, padding: '7px 10px', fontSize: 12 }}>
            <option value="">All</option>
            <option value="Fabric">Fabric</option>
            <option value="Leatherette">Leatherette</option>
            <option value="Solid Wood">Solid Wood</option>
            <option value="Engineered Wood">Engineered Wood</option>
            <option value="Velvet">Velvet</option>
          </select>
        </aside>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#5a6a7e' }}>{products.length} products{selectedCategory ? ` in ${selectedCategory}` : ''}</div>
            <select value={typeof query.sort === 'string' ? query.sort : ''} onChange={(e) => setQuery({ sort: e.target.value || undefined, page: 1, status: 'active' })} style={{ border: '1px solid #dde8f5', borderRadius: 8, padding: '7px 10px', fontSize: 12 }}>
              <option value="">Sort</option>
              <option value="latest">Latest</option>
              <option value="popularity">Popularity</option>
              <option value="priceLowHigh">Price low-high</option>
              <option value="priceHighLow">Price high-low</option>
            </select>
          </div>
          {Object.entries(router.query).some(([key, val]) => !['page', 'limit', 'status'].includes(key) && !!val) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {Object.entries(router.query).map(([key, val]) => {
                if (['page', 'limit', 'status'].includes(key) || !val) return null
                return (
                  <span
                    key={key}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: '#e8f1fd', color: '#1e40af', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => {
                      const q = { ...router.query } as Record<string, any>
                      delete q[key]
                      router.push({ query: q }, undefined, { shallow: true })
                    }}
                  >
                    {String(val)} <span style={{ fontSize: 13, fontWeight: 900, lineHeight: 1 }}>×</span>
                  </span>
                )
              })}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
            {loading
              ? Array.from({ length: 9 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.length
                ? products.map((p) => <ProductCard key={p.id} product={p} />)
                : <div style={{ gridColumn: '1 / -1', color: '#5a6a7e' }}>No products found</div>}
          </div>
        </section>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button disabled={page <= 1} onClick={() => router.push({ pathname: '/store', query: { ...router.query, page: Math.max(page - 1, 1) } }, undefined, { shallow: true })} style={{ border: '1px solid #dde8f5', borderRadius: 8, padding: '8px 12px', background: '#fff' }}>Prev</button>
        <div style={{ padding: '8px 12px' }}>Page {page} / {totalPages}</div>
        <button disabled={page >= totalPages} onClick={() => router.push({ pathname: '/store', query: { ...router.query, page: page + 1 } }, undefined, { shallow: true })} style={{ border: '1px solid #dde8f5', borderRadius: 8, padding: '8px 12px', background: '#fff' }}>Next</button>
      </div>
    </div>
  )
}

export default withStoreLayout(StoreListingPage)
