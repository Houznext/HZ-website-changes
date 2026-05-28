'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import LoginModal from '@/components/LoginModal'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const STORE_CATEGORIES = [
  { label: 'New Arrivals', iconPath: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
  { label: 'Sofas', iconPath: '<path d="M20 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v3M2 9h20M4 9v10a2 2 0 002 2h12a2 2 0 002-2V9"/>' },
  { label: 'Beds', iconPath: '<path d="M2 4h5v6H2zM2 14h5v6H2zM17 4h5v6h-5zM17 14h5v6h-5zM7 7h10M7 17h10"/>' },
  { label: 'Dining Tables', iconPath: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>' },
  { label: 'TV Units', iconPath: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>' },
  { label: 'Wardrobes', iconPath: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/>' },
]

const NavBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null
  return (
    <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, background: '#f2994a', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', fontFamily: 'Montserrat, system-ui', letterSpacing: 0, lineHeight: 1, border: '1.5px solid #0f2a44' }}>
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function StoreNavbar() {
  const router = useRouter()
  const { customer, isLoggedIn, logout } = useCustomerAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const profileRef = useRef<HTMLDivElement>(null)
  const mobileProfileRef = useRef<HTMLDivElement>(null)
  const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL ?? 'https://houznext.com'

  useEffect(() => {
    const updateCounts = () => {
      if (!customer) return
      fetch(`${API}/cart/${customer.id}`, { headers: { Authorization: `Bearer ${customer.token}` } })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setCartCount(data?.items?.length ?? 0))
        .catch(() => {})
    }
    updateCounts()
    window.addEventListener('cart-changed', updateCounts)
    return () => window.removeEventListener('cart-changed', updateCounts)
  }, [customer])

  useEffect(() => {
    if (!customer) return
    fetch(`${API}/wishlist/${customer.id}`, { headers: { Authorization: `Bearer ${customer.token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setWishlistCount(data?.items?.length ?? 0))
      .catch(() => {})
  }, [customer])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(e.target as Node)) setMobileProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = customer?.name ? customer.name.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2) : 'HZ'

  return (
    <div style={{ background: '#0f2a44', position: 'sticky', top: 0, zIndex: 200, width: '100%', overflowX: 'hidden' }}>
      <style>{`
        @media (max-width: 767px) {
          .store-nav-wrap { padding: 0 10px !important; height: auto !important; min-height: 56px; gap: 8px !important; }
          .store-nav-search { display: none !important; }
          .store-nav-action { padding: 7px 8px !important; }
          .store-nav-action span { display: none !important; }
          .store-nav-action:not(.store-nav-design) { display: none !important; }
          .store-nav-design { padding: 7px 10px !important; }
          .store-nav-design span { display: inline !important; }
          .store-nav-profile { display: none !important; }
          .store-nav-categories { padding: 0 8px !important; }
          .store-mobile-bottom-nav { display: grid !important; }
        }
      `}</style>
      <div className="store-nav-wrap" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
        <Link href="/store" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
          <img src="/images/Houznext Logo.png" alt="Houznext" style={{ height: 24, width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: '#2f80ed', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Store</span>
        </Link>
        <div className="store-nav-search" style={{ flex: 1, maxWidth: 540, position: 'relative', minWidth: 160 }}>
          <input
            type="text"
            placeholder="Search sofas, beds, dining tables, decor..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value.trim()
                if (val) router.push(`/store?q=${encodeURIComponent(val)}`)
              }
            }}
            style={{ width: '100%', padding: '9px 16px', borderRadius: 9, border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', minWidth: 0, overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none' }}>
          <a className="store-nav-action store-nav-design" href={mainUrl} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(242,153,74,0.15)', border: '1px solid rgba(242,153,74,0.35)', color: '#fff', textDecoration: 'none', transition: 'all 0.18s', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f2994a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3h11a2 2 0 012 2v14a2 2 0 01-2 2H5z" />
              <line x1="13" y1="12" x2="13.01" y2="12" />
              <line x1="5" y1="3" x2="5" y2="21" />
            </svg>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#f2994a', whiteSpace: 'nowrap' }}>Design</span>
          </a>
          <button
            onClick={() => router.push('/my-account?tab=orders')}
            className="store-nav-action"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Orders
          </button>
          <button
            onClick={() => router.push('/store/wishlist')}
            className="store-nav-action"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap', position: 'relative', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            Wishlist
            <NavBadge count={wishlistCount} />
          </button>
          <button
            onClick={() => router.push('/store/cart')}
            className="store-nav-action"
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap', position: 'relative', flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Cart
            <NavBadge count={cartCount} />
          </button>
          <div className="store-nav-profile" ref={profileRef} style={{ position: 'relative' }}>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  setLoginOpen(true)
                } else setProfileOpen((v) => !v)
              }}
              style={{ width: 36, height: 36, borderRadius: '50%', background: isLoggedIn ? '#2f80ed' : 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', cursor: 'pointer' }}
            >
              {isLoggedIn ? (
                initials
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>
            {profileOpen && isLoggedIn && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', border: '1px solid #dde8f5', borderRadius: 12, width: 220, zIndex: 500 }}>
                {[{ label: 'My account', href: '/my-account' }, { label: 'My orders', href: '/my-account?tab=orders' }, { label: 'Wishlist', href: '/store/wishlist' }, { label: 'Saved designs', href: '/my-account/saved-designs' }, { label: 'LiveBuild project', href: '/livebuild' }].map((item) => (
                  <div key={item.href} onClick={() => { router.push(item.href); setProfileOpen(false) }} style={{ padding: '11px 14px', cursor: 'pointer', borderBottom: '1px solid #dde8f5', fontSize: 13 }}>{item.label}</div>
                ))}
                <div onClick={() => { logout(); setProfileOpen(false) }} style={{ padding: '11px 14px', cursor: 'pointer', fontSize: 13 }}>Log out</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.18)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="store-nav-categories" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px', display: 'flex', overflowX: 'auto', gap: 2 }}>
          {STORE_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => router.push(`/store?category=${encodeURIComponent(cat.label)}`)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '9px 14px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', flexShrink: 0 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: cat.iconPath }} />
              <span style={{ fontSize: 10.5, fontWeight: 600 }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 2, background: 'linear-gradient(90deg,#2f80ed,#f2994a,#2f80ed)' }} />
      {mobileProfileOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 260, background: 'rgba(15,42,68,0.2)' }} onClick={() => setMobileProfileOpen(false)}>
          <div ref={mobileProfileRef} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', right: 10, bottom: 'calc(72px + env(safe-area-inset-bottom))', width: 220, background: '#fff', border: '1px solid #dde8f5', borderRadius: 12, boxShadow: '0 14px 44px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
            {!isLoggedIn ? (
              <>
                <div style={{ padding: '12px 12px', background: '#f5f7fa', borderBottom: '1px solid #dde8f5' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileProfileOpen(false)
                      setLoginOpen(true)
                    }}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: '#2f80ed', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Login
                  </button>
                </div>
                <button type="button" onClick={() => { setMobileProfileOpen(false); setLoginOpen(true) }} style={{ width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 13, color: '#1f2933', border: 'none', borderBottom: '1px solid #dde8f5', background: '#fff', cursor: 'pointer' }}>Orders</button>
                <button type="button" onClick={() => { setMobileProfileOpen(false); setLoginOpen(true) }} style={{ width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 13, color: '#1f2933', border: 'none', borderBottom: '1px solid #dde8f5', background: '#fff', cursor: 'pointer' }}>Wishlist</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => { setMobileProfileOpen(false); void router.push('/my-account') }} style={{ width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 13, color: '#1f2933', border: 'none', borderBottom: '1px solid #dde8f5', background: '#fff', cursor: 'pointer' }}>My account</button>
                <button type="button" onClick={() => { setMobileProfileOpen(false); void router.push('/my-account?tab=orders') }} style={{ width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 13, color: '#1f2933', border: 'none', borderBottom: '1px solid #dde8f5', background: '#fff', cursor: 'pointer' }}>Orders</button>
                <button type="button" onClick={() => { setMobileProfileOpen(false); void router.push('/store/wishlist') }} style={{ width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 13, color: '#1f2933', border: 'none', borderBottom: '1px solid #dde8f5', background: '#fff', cursor: 'pointer' }}>Wishlist</button>
                <div style={{ padding: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setMobileProfileOpen(false)
                    }}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid #dbe4f1', background: '#fff', color: '#5a6a7e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <div
        className="store-mobile-bottom-nav"
        style={{
          display: 'none',
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 250,
          gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
          alignItems: 'center',
          borderTop: '1px solid #dbe6f3',
          background: '#fff',
          padding: '6px 10px calc(6px + env(safe-area-inset-bottom))',
        }}
      >
        <button type="button" onClick={() => void router.push('/store')} style={{ border: 'none', background: 'transparent', color: router.pathname.startsWith('/store') && !router.asPath.includes('?category=') ? '#2f80ed' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-10.5z" /></svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Home</span>
        </button>
        <button type="button" onClick={() => void router.push('/store?category=New%20Arrivals')} style={{ border: 'none', background: 'transparent', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Categories</span>
        </button>
        <button type="button" onClick={() => void router.push('/store/cart')} style={{ border: 'none', background: 'transparent', color: router.asPath.includes('/store/cart') ? '#2f80ed' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
          <span style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
            <NavBadge count={cartCount} />
          </span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Cart</span>
        </button>
        <button type="button" onClick={() => setMobileProfileOpen((v) => !v)} style={{ border: 'none', background: 'transparent', color: mobileProfileOpen ? '#2f80ed' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Profile</span>
        </button>
      </div>
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
