import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { withStoreLayout } from '@/components/Layouts/StoreLayout'
import ProductCard from '@/components/Store/ProductCard'
import { fetchProduct, fetchProducts, recordBrowse, FurnitureProduct } from '@/store/storeApi'
import { useCustomerAuth } from '@/context/CustomerAuthContext'

function ProductDetailsPage() {
  const router = useRouter()
  const { customer } = useCustomerAuth()
  const [product, setProduct] = useState<FurnitureProduct | null>(null)
  const [related, setRelated] = useState<FurnitureProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | undefined>()
  const [pincode, setPincode] = useState('')
  const [pincodeMsg, setPincodeMsg] = useState('')

  useEffect(() => {
    if (!router.query.id || typeof router.query.id !== 'string') return
    setLoading(true)
    fetchProduct(router.query.id)
      .then((p) => {
        setProduct(p)
        setSelectedImage(p.images?.[0]?.url)
      })
      .finally(() => setLoading(false))
  }, [router.query.id])

  useEffect(() => {
    if (!product) return
    fetchProducts({ category: product.category, limit: 6 }).then((res) => {
      setRelated((res.data || []).filter((p) => p.id !== product.id).slice(0, 5))
    })
    if (customer?.mobile) {
      recordBrowse(customer.mobile, product.id, product.category)
      try {
        const raw = localStorage.getItem('hz_store_browse_history')
        const arr = raw ? (JSON.parse(raw) as string[]) : []
        const next = [product.category, ...arr.filter((c) => c !== product.category)].slice(0, 10)
        localStorage.setItem('hz_store_browse_history', JSON.stringify(next))
      } catch {}
    }
  }, [product, customer])

  const defaultVariant = useMemo(() => product?.variants?.find((v) => v.isDefault) ?? product?.variants?.[0], [product])
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  const addToCart = async () => {
    if (!product) return
    if (!customer) {
      try {
        sessionStorage.setItem('hz_login_redirect', router.asPath)
      } catch {}
      router.push('/?login=1')
      return
    }
    await fetch(`${API}/cart/${customer.id}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer.token}`,
      },
      body: JSON.stringify({
        productId: product.id,
        variantId: defaultVariant?.id,
        productType: 'FURNITURE_PRODUCT',
        quantity: 1,
        sellingPrice: defaultVariant?.sellingPrice ?? product.baseSellingPrice,
        mrp: defaultVariant?.mrp ?? product.baseMrp,
        unitDiscount: Math.max(
          Number(defaultVariant?.mrp ?? product.baseMrp) - Number(defaultVariant?.sellingPrice ?? product.baseSellingPrice),
          0,
        ),
        name: product.name,
      }),
    })
    window.dispatchEvent(new Event('cart-changed'))
  }

  const buyNow = async () => {
    await addToCart()
    router.push('/store/checkout')
  }

  const checkPincode = async () => {
    if (!pincode.trim()) return
    try {
      const res = await fetch(`${API}/address/check-delivery?pincode=${encodeURIComponent(pincode.trim())}`)
      const data = await res.json()
      setPincodeMsg(data?.message || (res.ok ? 'Delivery available' : 'Delivery unavailable'))
    } catch {
      setPincodeMsg('Unable to check delivery currently')
    }
  }

  if (loading || !product) return <div style={{ padding: 24 }}>Loading...</div>

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ height: 450, borderRadius: 12, overflow: 'hidden', background: '#e8f1fd' }}>
            {selectedImage ? <img src={selectedImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {product.images.slice(0, 5).map((img) => (
              <button key={img.id} onClick={() => setSelectedImage(img.url)} style={{ border: '1px solid #dde8f5', borderRadius: 8, overflow: 'hidden', width: 72, height: 72 }}>
                <img src={img.url} alt={img.alt || product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1f2933' }}>{product.name}</h1>
          <p style={{ marginTop: 8, color: '#5a6a7e' }}>{product.description}</p>
          <div style={{ marginTop: 12, fontSize: 26, fontWeight: 800 }}>₹{Number(defaultVariant?.sellingPrice ?? product.baseSellingPrice).toLocaleString('en-IN')}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => void addToCart()} style={{ border: 'none', borderRadius: 8, background: '#2f80ed', color: '#fff', padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>Add to cart</button>
            <button onClick={() => void buyNow()} style={{ border: 'none', borderRadius: 8, background: '#0f2a44', color: '#fff', padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>Buy now</button>
            <button style={{ border: '1px solid #dde8f5', borderRadius: 8, background: '#fff', color: '#1f2933', padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s' }}>Add to wishlist</button>
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Check pincode delivery" style={{ border: '1px solid #dde8f5', borderRadius: 8, padding: '8px 10px', fontSize: 12 }} />
            <button onClick={() => void checkPincode()} style={{ border: '1px solid #c7daf3', borderRadius: 8, background: '#e8f1fd', color: '#0f2a44', padding: '8px 12px', fontSize: 12 }}>Check</button>
          </div>
          {pincodeMsg ? <div style={{ marginTop: 6, fontSize: 12, color: '#5a6a7e' }}>{pincodeMsg}</div> : null}
        </div>
      </div>
      <h3 style={{ marginTop: 28, fontSize: 20, fontWeight: 800 }}>Related products</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12, marginTop: 10 }}>
        {related.map((p) => <ProductCard key={p.id} product={p} imageHeight={160} />)}
      </div>
    </div>
  )
}

export default withStoreLayout(ProductDetailsPage)
