import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { getStoreCartUserId } from '@/utils/storeCustomer'

interface ProductCardProps {
  product: FurnitureProduct
  imageHeight?: number
}

export default function ProductCard({ product, imageHeight = 190 }: ProductCardProps) {
  const router = useRouter()
  const { customer } = useCustomerAuth()
  const [imgFailed, setImgFailed] = useState(false)
  const primaryImage = product.images?.find((i) => i.isPrimary) ?? product.images?.[0]
  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0]
  const discountPct = defaultVariant?.discountPercent ?? product.baseDiscountPercent
  const price = defaultVariant?.sellingPrice ?? product.baseSellingPrice
  const mrp = defaultVariant?.mrp ?? product.baseMrp

  const addToCart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!customer) {
      try {
        sessionStorage.setItem('hz_login_redirect', router.asPath)
      } catch {}
      router.push('/?login=1')
      return
    }
    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    const storeUserId = getStoreCartUserId(customer)
    if (!storeUserId) return
    await fetch(`${API}/cart/${storeUserId}/items`, {
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
        sellingPrice: price,
        mrp: mrp,
        unitDiscount: Math.max(Number(mrp) - Number(price), 0),
        name: product.name,
        snapshot: { name: product.name, imageUrl: primaryImage?.url },
      }),
    })
    window.dispatchEvent(new Event('cart-changed'))
  }

  const addToWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!customer) {
      try {
        sessionStorage.setItem('hz_login_redirect', router.asPath)
      } catch {}
      router.push('/?login=1')
      return
    }
    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    try {
      await fetch(`${API}/wishlist/${customer.id}/furniture/${product.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customer.token}` },
      })
      window.dispatchEvent(new Event('wishlist-changed'))
    } catch {}
  }

  return (
    <div
      className="p-card"
      onClick={() => router.push(`/store/product/${product.id}`)}
      style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#93c5fd'
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(15,42,68,0.12)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#dde8f5'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ height: imageHeight, background: 'linear-gradient(135deg,#e8f1fd,#dde8f5)', position: 'relative', overflow: 'hidden' }}>
        {primaryImage?.url && !imgFailed ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt ?? product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: getCategoryGradient(product.category), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getCategoryIcon(product.category)}
          </div>
        )}
        {discountPct > 0 && <span style={{ position: 'absolute', top: 10, left: 10, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>{Math.round(discountPct)}% off</span>}
        <button
          className="wishlist-btn"
          onClick={addToWishlist}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            opacity: 0,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>
      <div style={{ padding: '12px 13px 14px' }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5a6a7e', fontWeight: 700, marginBottom: 4 }}>{product.brand ?? 'Houznext'}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2933', marginBottom: 5, lineHeight: 1.3, minHeight: 34 }}>{product.name}</div>
        {(product.ratingCount ?? 0) > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, color: '#d97706', fontSize: 11 }}>
            <span>★</span>
            <span style={{ fontWeight: 700 }}>{Number(product.averageRating ?? 0).toFixed(1)}</span>
            <span style={{ color: '#5a6a7e' }}>({product.ratingCount})</span>
          </div>
        ) : null}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 9 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#1f2933' }}>₹{Number(price).toLocaleString('en-IN')}</span>
          {mrp > price && <span style={{ fontSize: 11, color: '#5a6a7e', textDecoration: 'line-through' }}>₹{Number(mrp).toLocaleString('en-IN')}</span>}
          {discountPct > 0 && <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>{Math.round(discountPct)}% off</span>}
        </div>
        <button onClick={addToCart} style={{ width: '100%', padding: 8, borderRadius: 8, background: '#2f80ed', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          Add to cart
        </button>
      </div>
      <style>{`.p-card:hover .wishlist-btn{opacity:1 !important}`}</style>
    </div>
  )
}

function getCategoryGradient(category: string): string {
  const gradients: Record<string, string> = {
    Sofas: 'linear-gradient(135deg, #e8f1fd, #c7d9f5)',
    Beds: 'linear-gradient(135deg, #fce7f3, #f0d4e8)',
    'Dining Tables': 'linear-gradient(135deg, #fef3c7, #fde68a)',
    'TV Units': 'linear-gradient(135deg, #dcfce7, #a7f3d0)',
    Wardrobes: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)',
    Chairs: 'linear-gradient(135deg, #fff7ed, #fef3c7)',
    'Study & Office': 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
    Storage: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    'Custom Furniture': 'linear-gradient(135deg, #ecfdf5, #a7f3d0)',
    'New Arrivals': 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    'Living room': 'linear-gradient(135deg, #fffbeb, #fef3c7)',
  }
  return gradients[category] ?? 'linear-gradient(135deg, #e8f1fd, #dde8f5)'
}

function getCategoryIcon(category: string): React.ReactNode {
  const paths: Record<string, string> = {
    Sofas: 'M20 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v3M2 9h20M4 9v10a2 2 0 002 2h12a2 2 0 002-2V9',
    Beds: 'M2 4h5v6H2zM2 14h5v6H2zM17 4h5v6h-5zM17 14h5v6h-5zM7 7h10M7 17h10',
    'Dining Tables': 'M3 3h18v18H3z M3 9h18 M9 21V9',
    'TV Units': 'M2 7h20v14H2z M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2',
    Wardrobes: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
    Chairs: 'M3 11V3h18v8M3 11h18M3 11l-1 7h20l-1-7',
  }
  const path = paths[category] ?? paths.Sofas
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(15,42,68,0.15)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}
