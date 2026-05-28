import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useQuoteModal } from './QuoteModal'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import LoginModal from './LoginModal'
import { countSavedDesigns } from '@/utils/savedDesigns'
import { fetchAllServices } from '@/utils/servicesApi'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Design Ideas', href: '/design-ideas' },
  { label: 'Projects', href: '/projects' },
  { label: 'LiveBuild', href: '/buildlive' },
  { label: 'Interiors Cost Calculator', href: '/interiors/cost-calculator' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'About us', href: '/about-us' },
]

const INTERIORS_DROPDOWN_LINKS = [
  {
    slug: 'full-home-interiors',
    label: 'Full Home Interiors',
    subtitle: 'End-to-end home interiors',
    href: '/interiors',
    thumb: 'linear-gradient(135deg, #d8c4aa 0%, #9a7c58 100%)',
  },
  {
    slug: 'commercial-interiors',
    label: 'Commercial Interiors',
    subtitle: 'Interiors designed for business spaces',
    href: '/services/commercial-interiors',
    thumb: 'linear-gradient(135deg, #9daac3 0%, #44506b 100%)',
  },
  {
    slug: '2bhk-3bhk-packages',
    label: '2BHK / 3BHK Interiors packages',
    subtitle: 'Fixed-price solutions by home size',
    href: '/services/2bhk-3bhk-packages',
    thumb: 'linear-gradient(135deg, #90b3bf 0%, #335f77 100%)',
  },
  {
    slug: 'modular-kitchen',
    label: 'Modular Kitchen and wardrobes',
    subtitle: 'Kitchens, wardrobes and smart storage',
    href: '/services/modular-kitchen',
    thumb: 'linear-gradient(135deg, #98c1e8 0%, #38689c 100%)',
  },
]

const PRIMARY_NAV_LINKS = NAV_LINKS.filter((link) =>
  ['Home', 'Design Ideas', 'Projects', 'LiveBuild'].includes(link.label),
)
const MORE_NAV_LINKS = NAV_LINKS.filter((link) => !PRIMARY_NAV_LINKS.some((primary) => primary.href === link.href))
const NAV_OUTSET_PX = 76

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2) || 'HZ'
}

export default function Navbar() {
  const router = useRouter()
  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL ?? 'https://store.houznext.com'
  const { openModal } = useQuoteModal()
  const { customer, isLoggedIn, logout } = useCustomerAuth()
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false)
  const [mobileMoreView, setMobileMoreView] = useState<'root' | 'interiorSolutions'>('root')
  const [interiorsOpen, setInteriorsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const [interiorThumbs, setInteriorThumbs] = useState<Record<string, string>>({})
  const interiorsRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const mobileProfileRef = useRef<HTMLDivElement>(null)

  const isActive = useCallback(
    (href: string) => (href === '/' ? router.pathname === '/' : router.pathname.startsWith(href)),
    [router.pathname],
  )
  const isMoreGroupActive = useCallback(() => MORE_NAV_LINKS.some((l) => isActive(l.href)), [isActive])
  const isInteriorsGroupActive = useCallback(
    () => router.pathname.startsWith('/interiors') || INTERIORS_DROPDOWN_LINKS.some((l) => isActive(l.href)),
    [isActive, router.pathname],
  )

  useEffect(() => {
    const update = () => {
      try {
        setSavedCount(countSavedDesigns())
      } catch {
        setSavedCount(0)
      }
    }
    update()
    window.addEventListener('saved-changed', update)
    return () => window.removeEventListener('saved-changed', update)
  }, [])

  useEffect(() => {
    let alive = true
    fetchAllServices()
      .then((services) => {
        if (!alive) return
        const thumbs: Record<string, string> = {}
        services.forEach((service) => {
          if (service?.slug && typeof service.cardImageUrl === 'string' && service.cardImageUrl.trim()) {
            thumbs[service.slug] = service.cardImageUrl
          }
        })
        setInteriorThumbs(thumbs)
      })
      .catch(() => {
        // keep fallback gradients if API data isn't available
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (router.query.login !== '1' || isLoggedIn) return
    if (router.pathname === '/login') {
      void router.replace({ pathname: '/login' }, undefined, { shallow: true })
      return
    }
    setLoginOpen(true)
    void router.replace(router.pathname, undefined, { shallow: true })
  }, [router.query.login, isLoggedIn, router])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inDesktopProfile = profileRef.current?.contains(e.target as Node)
      const inMobileProfile = mobileProfileRef.current?.contains(e.target as Node)
      if (!inDesktopProfile && !inMobileProfile) setProfileOpen(false)
      if (interiorsRef.current && !interiorsRef.current.contains(e.target as Node)) setInteriorsOpen(false)
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setInteriorsOpen(false)
    setMoreOpen(false)
    setProfileOpen(false)
    setMobileMoreOpen(false)
    setMobileMoreView('root')
  }, [router.pathname])

  const handleLoginSuccess = () => {
    let dest = ''
    try {
      dest = sessionStorage.getItem('hz_login_redirect') ?? ''
      sessionStorage.removeItem('hz_login_redirect')
    } catch {
      dest = ''
    }
    if (dest && dest !== '/' && dest !== '/?login=1') {
      void router.push(dest)
    } else {
      void router.push('/my-account')
    }
  }

  const openLoginFor = (dest?: string) => {
    try {
      if (dest) sessionStorage.setItem('hz_login_redirect', dest)
    } catch {
      // ignore
    }
    setProfileOpen(false)
    setLoginOpen(true)
  }

  const handleInteriorLinkClick = (href: string) => {
    setInteriorsOpen(false)
    void router.push(href).catch(() => {
      if (typeof window !== 'undefined') window.location.href = href
    })
  }

  return (
    <>
      <style>{`
        @keyframes hzStoreNewPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>
      <nav className="sticky md:fixed top-0 left-0 right-0 z-[200] isolate flex items-center" style={{ background: '#0f2a44', height: NAV_OUTSET_PX, boxSizing: 'border-box' }}>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 min-h-0 flex items-center justify-between gap-4">
          <a href="/" className="flex-shrink-0 cursor-pointer no-underline flex items-center" aria-label="Houznext home">
            <img src="/images/Houznext Logo.png" alt="Houznext" className="h-[26px] md:h-[32px] w-auto" style={{ objectFit: 'contain' }} />
          </a>

          <div className="hidden md:flex items-center gap-3 md:gap-4 flex-1 min-w-0 justify-center">
            {PRIMARY_NAV_LINKS.filter((link) => link.label === 'Home').map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); void router.push(link.href) }} className="relative px-3.5 sm:px-4 py-2 rounded text-[13px] font-[500] transition-all duration-200 cursor-pointer no-underline inline-block hover:bg-[rgba(47,128,237,0.16)] hover:-translate-y-[1px]" style={{ color: isActive(link.href) ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                {link.label}
                {isActive(link.href) && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full pointer-events-none" style={{ background: '#2f80ed' }} />}
              </a>
            ))}

            <div className="relative inline-block" ref={interiorsRef} onMouseEnter={() => setInteriorsOpen(true)} onMouseLeave={() => setInteriorsOpen(false)}>
              <button type="button" onClick={() => setInteriorsOpen((o) => !o)} className="relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded text-[13px] font-[500] transition-all duration-200 cursor-pointer hover:bg-[rgba(47,128,237,0.16)] hover:-translate-y-[1px]" style={{ color: isInteriorsGroupActive() || interiorsOpen ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                Interior Solutions
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200" style={{ transform: interiorsOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
                {isInteriorsGroupActive() && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full pointer-events-none" style={{ background: '#2f80ed' }} />}
              </button>
              {interiorsOpen && (
                <div className="absolute z-[250] left-0 top-full w-[440px] pt-2" style={{ marginTop: -2 }}>
                  <div role="menu" className="rounded-[14px] border p-3" style={{ background: '#0f2a44', borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 16px 44px rgba(0,0,0,0.35)' }}>
                    <p className="px-2 pb-2 text-[11px] font-[700] uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      Explore interior solutions
                    </p>
                    {INTERIORS_DROPDOWN_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        role="menuitem"
                        onClick={(e) => {
                          e.preventDefault()
                          handleInteriorLinkClick(link.href)
                        }}
                        className="group mb-2 flex w-full min-w-0 items-center gap-3 rounded-[10px] border px-2.5 py-2 no-underline transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
                        style={{
                          borderColor: isActive(link.href) ? 'rgba(47,128,237,0.45)' : 'rgba(255,255,255,0.14)',
                          background: isActive(link.href) ? 'rgba(47,128,237,0.18)' : 'rgba(255,255,255,0.04)',
                        }}
                      >
                        {interiorThumbs[link.slug] ? (
                          <img
                            src={interiorThumbs[link.slug]}
                            alt={link.label}
                            className="h-[54px] w-[96px] flex-shrink-0 rounded-[8px] border object-cover"
                            style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                          />
                        ) : (
                          <span
                            className="h-[54px] w-[96px] flex-shrink-0 rounded-[8px] border"
                            style={{
                              background: link.thumb,
                              borderColor: 'rgba(255,255,255,0.18)',
                            }}
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-[600] leading-tight" style={{ color: '#fff' }}>
                            {link.label}
                          </span>
                          <span className="mt-1 block truncate text-[12px] leading-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {link.subtitle}
                          </span>
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {PRIMARY_NAV_LINKS.filter((link) => link.label !== 'Home').map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); void router.push(link.href) }} className="relative px-3.5 sm:px-4 py-2 rounded text-[13px] font-[500] transition-all duration-200 cursor-pointer no-underline inline-block hover:bg-[rgba(47,128,237,0.16)] hover:-translate-y-[1px]" style={{ color: isActive(link.href) ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                {link.label}
                {isActive(link.href) && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full pointer-events-none" style={{ background: '#2f80ed' }} />}
              </a>
            ))}

            <div className="relative inline-block" ref={moreRef} onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
              <button type="button" onClick={() => setMoreOpen((o) => !o)} className="relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded text-[13px] font-[500] transition-all duration-200 cursor-pointer hover:bg-[rgba(47,128,237,0.16)] hover:-translate-y-[1px]" style={{ color: isMoreGroupActive() || moreOpen ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200" style={{ transform: moreOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute z-[250] right-0 left-auto top-full w-max min-w-[220px] pt-1.5" style={{ marginTop: -2 }}>
                  <div role="menu" className="rounded-[10px] border overflow-hidden" style={{ background: '#0f2a44', borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
                    {MORE_NAV_LINKS.map((link) => (
                      <a key={link.href} href={link.href} role="menuitem" onClick={(e) => { e.preventDefault(); setMoreOpen(false); void router.push(link.href) }} className="flex w-full min-w-0 items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] font-[500] no-underline transition-all duration-200 hover:bg-[rgba(47,128,237,0.16)] hover:-translate-y-[1px]" style={{ color: isActive(link.href) ? '#2f80ed' : 'rgba(255,255,255,0.9)' }}>
                        <span className="min-w-0 flex-1">{link.label}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-50" aria-hidden>
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-[700] text-white no-underline"
              style={{
                background: 'rgba(47,128,237,0.15)',
                border: '1px solid rgba(47,128,237,0.35)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(47,128,237,0.28)'
                el.style.borderColor = 'rgba(47,128,237,0.7)'
                el.style.transform = 'translateY(-1px)'
                const icon = el.querySelector('.hz-store-nav-icon') as HTMLElement | null
                if (icon) icon.style.transform = 'scale(1.12) rotate(-5deg)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(47,128,237,0.15)'
                el.style.borderColor = 'rgba(47,128,237,0.35)'
                el.style.transform = 'translateY(0)'
                const icon = el.querySelector('.hz-store-nav-icon') as HTMLElement | null
                if (icon) icon.style.transform = 'scale(1) rotate(0deg)'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: '#f2994a',
                  color: '#fff',
                  fontSize: 8,
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  animation: 'hzStoreNewPulse 2s ease-in-out infinite',
                }}
              >
                New
              </span>
              <svg
                className="hz-store-nav-icon"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
                  flexShrink: 0,
                }}
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Store
            </a>
            <button type="button" onClick={() => openModal('Navbar — Free consultation')} className="px-4 py-1.5 rounded-lg text-[13px] font-head font-bold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-lg" style={{ background: '#2f80ed' }}>
              Free consultation
            </button>
            <div
              className="relative"
              ref={profileRef}
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
            >
              {!isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                    title="Sign in"
                    aria-label="Sign in to your account"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>
                  {profileOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 10, zIndex: 500 }}>
                      <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, width: 242, boxShadow: '0 14px 44px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 16px', background: '#f5f7fa', borderBottom: '1px solid #dde8f5' }}>
                        <div style={{ fontSize: 12, color: '#5a6a7e', marginBottom: 8 }}>Sign in to access your dashboard</div>
                        <button
                          type="button"
                          onClick={() => openLoginFor('/my-account')}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: '#2f80ed', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          Login
                        </button>
                      </div>
                      <div
                        onClick={() => openLoginFor('/my-account/quotations')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}
                      >
                        <span>My quotations</span>
                      </div>
                      <div
                        onClick={() => openLoginFor('/my-account/invoices')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}
                      >
                        <span>Invoices</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>Due</span>
                      </div>
                      <div
                        onClick={() => openLoginFor('/my-account/saved-designs')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}
                      >
                        <span>Saved designs</span>
                      </div>
                      <div
                        onClick={() => openLoginFor('/livebuild/dashboard')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <span>My Home (LiveBuild)</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>Active</span>
                      </div>
                    </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setProfileOpen((v) => !v)}
                    style={{ width: 36, height: 36, borderRadius: '50%', background: '#2f80ed', border: '1.5px solid #2f80ed', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
                    title="My account"
                    aria-label="My account"
                  >
                    <span style={{ fontFamily: 'Montserrat, system-ui', fontSize: 12, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{getInitials(customer?.name ?? '')}</span>
                  </button>
                  {profileOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 10, zIndex: 500 }}>
                      <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, width: 242, boxShadow: '0 14px 44px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
                      <div
                        onClick={() => { setProfileOpen(false); void router.push('/my-account') }}
                        style={{ padding: '14px 16px', background: '#f5f7fa', borderBottom: '1px solid #dde8f5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2f80ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, system-ui', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                          {getInitials(customer?.name ?? '')}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2933' }}>{customer?.name || 'Profile'}</div>
                          <div style={{ fontSize: 11, color: '#5a6a7e' }}>{customer?.mobile?.trim() || customer?.email || ''}</div>
                        </div>
                      </div>
                      <div onClick={() => { setProfileOpen(false); void router.push('/my-account/quotations') }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}>
                        My quotations
                      </div>
                      <div onClick={() => { setProfileOpen(false); void router.push('/my-account/invoices') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}>
                        <span>Invoices</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>Due</span>
                      </div>
                      <div onClick={() => { setProfileOpen(false); void router.push('/my-account/saved-designs') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}>
                        <span>Saved designs</span>
                        {savedCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#e8f1fd', color: '#2f80ed' }}>{savedCount}</span>}
                      </div>
                      <div onClick={() => { setProfileOpen(false); void router.push('/livebuild/dashboard') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}>
                        <span>My Home (LiveBuild)</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>Active</span>
                      </div>
                      <div onClick={() => { setProfileOpen(false); setLogoutConfirmOpen(true) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: '#5a6a7e', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Log out
                      </div>
                    </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center justify-center h-9 min-w-[54px] px-2.5 rounded-lg text-white no-underline"
              style={{ background: 'rgba(47,128,237,0.15)', border: '1px solid rgba(47,128,237,0.35)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(47,128,237,0.28)'
                el.style.borderColor = 'rgba(47,128,237,0.7)'
                el.style.transform = 'translateY(-1px)'
                const icon = el.querySelector('.hz-store-nav-icon') as HTMLElement | null
                if (icon) icon.style.transform = 'scale(1.12) rotate(-5deg)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(47,128,237,0.15)'
                el.style.borderColor = 'rgba(47,128,237,0.35)'
                el.style.transform = 'translateY(0)'
                const icon = el.querySelector('.hz-store-nav-icon') as HTMLElement | null
                if (icon) icon.style.transform = 'scale(1) rotate(0deg)'
              }}
              aria-label="Open store"
            >
              <span style={{ position: 'absolute', top: -5, right: -5, background: '#f2994a', color: '#fff', fontSize: 7, fontWeight: 800, padding: '1px 4px', borderRadius: 8, letterSpacing: '0.06em', textTransform: 'uppercase', animation: 'hzStoreNewPulse 2s ease-in-out infinite' }}>
                New
              </span>
              <svg
                className="hz-store-nav-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)' }}
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </a>
            <div className="relative" ref={mobileProfileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: isLoggedIn ? '#2f80ed' : 'rgba(255,255,255,0.12)',
                  border: isLoggedIn ? '1.5px solid #2f80ed' : '1.5px solid rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flexShrink: 0,
                }}
                title={isLoggedIn ? 'My account' : 'Login / Register'}
                aria-label={isLoggedIn ? 'My account' : 'Login / Register'}
              >
                {isLoggedIn ? (
                  <span style={{ fontFamily: 'Montserrat, system-ui', fontSize: 12, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                    {getInitials(customer?.name ?? '')}
                  </span>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </button>
              {profileOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: 10, zIndex: 500 }}>
                  <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, width: 242, boxShadow: '0 14px 44px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
                    {!isLoggedIn ? (
                      <>
                        <div style={{ padding: '14px 16px', background: '#f5f7fa', borderBottom: '1px solid #dde8f5' }}>
                          <div style={{ fontSize: 12, color: '#5a6a7e', marginBottom: 8 }}>Sign in to access your dashboard</div>
                          <button type="button" onClick={() => openLoginFor('/my-account')} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: '#2f80ed', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Login</button>
                        </div>
                        <div onClick={() => openLoginFor('/my-account/quotations')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}><span>My quotations</span></div>
                        <div onClick={() => openLoginFor('/my-account/invoices')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}><span>Invoices</span><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>Due</span></div>
                        <div onClick={() => openLoginFor('/my-account/saved-designs')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}><span>Saved designs</span></div>
                        <div onClick={() => openLoginFor('/livebuild/dashboard')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s' }}><span>My Home (LiveBuild)</span><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>Active</span></div>
                      </>
                    ) : (
                      <>
                        <div onClick={() => { setProfileOpen(false); void router.push('/my-account') }} style={{ padding: '14px 16px', background: '#f5f7fa', borderBottom: '1px solid #dde8f5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2f80ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, system-ui', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{getInitials(customer?.name ?? '')}</div>
                          <div><div style={{ fontSize: 13, fontWeight: 700, color: '#1f2933' }}>{customer?.name || 'Profile'}</div><div style={{ fontSize: 11, color: '#5a6a7e' }}>{customer?.mobile?.trim() || customer?.email || ''}</div></div>
                        </div>
                        <div onClick={() => { setProfileOpen(false); void router.push('/my-account/quotations') }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}>My quotations</div>
                        <div onClick={() => { setProfileOpen(false); void router.push('/my-account/invoices') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}><span>Invoices</span><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fee2e2', color: '#dc2626' }}>Due</span></div>
                        <div onClick={() => { setProfileOpen(false); void router.push('/my-account/saved-designs') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}><span>Saved designs</span>{savedCount > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#e8f1fd', color: '#2f80ed' }}>{savedCount}</span>}</div>
                        <div onClick={() => { setProfileOpen(false); void router.push('/livebuild/dashboard') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}><span>My Home (LiveBuild)</span><span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>Active</span></div>
                        <div style={{ padding: '10px 16px', borderTop: '0.5px solid #dde8f5' }}>
                          <button type="button" onClick={() => { logout(); setProfileOpen(false); void router.push('/') }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #dbe4f1', background: '#fff', color: '#5a6a7e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Logout</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {mobileMoreOpen && (
        <div className="fixed inset-0 z-[300] md:hidden" style={{ paddingTop: NAV_OUTSET_PX, background: 'rgba(15,42,68,0.25)' }} onClick={() => { setMobileMoreOpen(false); setMobileMoreView('root') }}>
          <div className="absolute left-0 right-0 bottom-[78px] bg-white border-t" style={{ maxHeight: `calc(100vh - ${NAV_OUTSET_PX + 78}px)`, borderColor: '#dde8f5' }} onClick={(e) => e.stopPropagation()}>
            {mobileMoreView === 'root' ? (
              <div className="overflow-y-auto" style={{ maxHeight: `calc(100vh - ${NAV_OUTSET_PX + 78}px)` }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#edf2f7' }}>
                  <button
                    type="button"
                    onClick={() => { setMobileMoreOpen(false); setMobileMoreView('root') }}
                    className="w-8 h-8 rounded-full border flex items-center justify-center"
                    style={{ borderColor: '#dde8f5', color: '#5a6a7e' }}
                    aria-label="Close menu"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="text-[15px] font-[700]" style={{ color: '#0f2a44' }}>More</p>
                  <div className="w-8 h-8" />
                </div>
                <button type="button" onClick={() => setMobileMoreView('interiorSolutions')} className="w-full px-5 py-4 border-b text-left flex items-center justify-between" style={{ borderColor: '#edf2f7', color: '#0f2a44' }}>
                  <span className="text-[15px] font-[600]">Interior Solutions</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 18l6-6-6-6" /></svg>
                </button>
                {MORE_NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => { setMobileMoreOpen(false); setMobileMoreView('root'); void router.push(link.href) }}
                    className="w-full px-5 py-4 border-b text-left flex items-center justify-between"
                    style={{ borderColor: '#edf2f7', color: isActive(link.href) ? '#2f80ed' : '#334155' }}
                  >
                    <span className="text-[15px] font-[500]">{link.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setMobileMoreOpen(false); setMobileMoreView('root'); if (isLoggedIn) void router.push('/my-account'); else setLoginOpen(true) }}
                  className="w-full px-5 py-4 border-b text-left flex items-center justify-between"
                  style={{ borderColor: '#edf2f7', color: '#334155' }}
                >
                  <span className="text-[15px] font-[500]">{isLoggedIn ? 'My account' : 'Login / Register'}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 18l6-6-6-6" /></svg>
                </button>
              </div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: `calc(100vh - ${NAV_OUTSET_PX + 78}px)` }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#edf2f7' }}>
                  <p className="text-[16px] font-[700]" style={{ color: '#0f2a44' }}>Interior Solutions</p>
                  <button
                    type="button"
                    onClick={() => setMobileMoreView('root')}
                    className="text-[14px] font-[500] flex items-center gap-1"
                    style={{ color: '#5a6a7e' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 18l-6-6 6-6" /></svg>
                    Back
                  </button>
                </div>
                {INTERIORS_DROPDOWN_LINKS.map((link) => (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => { setMobileMoreOpen(false); setMobileMoreView('root'); void router.push(link.href) }}
                    className="w-full px-5 py-4 border-b text-left flex items-center justify-between"
                    style={{ borderColor: '#edf2f7', color: isActive(link.href) ? '#2f80ed' : '#334155' }}
                  >
                    <span className="text-[15px] font-[500]">{link.label}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-[310] md:hidden border-t bg-white" style={{ borderColor: '#dbe6f3' }}>
        <div className="grid grid-cols-5 items-end pt-1 pb-2" style={{ paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}>
          <button type="button" onClick={() => void router.push('/')} className="flex flex-col items-center gap-1 py-1" style={{ color: isActive('/') ? '#2f80ed' : '#64748b' }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-10.5z" /></svg>
            <span className="text-[11px] font-[500]">Home</span>
          </button>
          <button type="button" onClick={() => void router.push('/design-ideas')} className="flex flex-col items-center gap-1 py-1" style={{ color: isActive('/design-ideas') ? '#2f80ed' : '#64748b' }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
            <span className="text-[11px] font-[500]">Design Ideas</span>
          </button>
          <button type="button" onClick={() => openModal('Navbar — Free consultation')} className="flex flex-col items-center gap-1 -mt-6">
            <span className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-4" style={{ background: '#2f80ed', borderColor: '#fff', color: '#fff' }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.32 1.78.59 2.62a2 2 0 0 1-.45 2.11L8 9.85a16 16 0 0 0 6.15 6.15l1.4-1.25a2 2 0 0 1 2.11-.45c.84.27 1.72.47 2.62.59A2 2 0 0 1 22 16.92z" /></svg>
            </span>
            <span className="text-[11px] font-[600]" style={{ color: '#0f2a44' }}>Lets Talk</span>
          </button>
          <button type="button" onClick={() => void router.push('/projects')} className="flex flex-col items-center gap-1 py-1" style={{ color: isActive('/projects') ? '#2f80ed' : '#64748b' }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M8 4v5" /></svg>
            <span className="text-[11px] font-[500]">Projects</span>
          </button>
          <button type="button" onClick={() => { setMobileMoreOpen((v) => !v); setMobileMoreView('root') }} className="flex flex-col items-center gap-1 py-1" style={{ color: mobileMoreOpen ? '#2f80ed' : '#64748b' }}>
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
            <span className="text-[11px] font-[500]">More</span>
          </button>
        </div>
      </div>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} onSuccess={handleLoginSuccess} />
      {logoutConfirmOpen && (
        <div
          className="fixed inset-0 z-[650] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,42,68,0.45)' }}
          onClick={() => setLogoutConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-[14px] border bg-white p-5 shadow-2xl"
            style={{ borderColor: '#dde8f5' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[16px] font-[700] text-[#1f2933]">Are you confirm to log out</h3>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="rounded-lg border px-4 py-2 text-[13px] font-[600] text-[#5a6a7e] transition-all duration-200"
                style={{ borderColor: '#dde8f5' }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  logout()
                  setLogoutConfirmOpen(false)
                  setProfileOpen(false)
                  void router.push('/')
                }}
                className="rounded-lg px-4 py-2 text-[13px] font-[700] text-white transition-all duration-200"
                style={{ background: '#2f80ed' }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="hidden md:block" style={{ height: NAV_OUTSET_PX }} />
    </>
  )
}
