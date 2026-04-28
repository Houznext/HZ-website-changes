import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useQuoteModal } from './QuoteModal'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import LoginModal from './LoginModal'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Interiors', href: '/interiors' },
  { label: 'Design Ideas', href: '/design-ideas' },
  { label: 'Projects', href: '/projects' },
  { label: 'Real Estate', href: '/real-estate' },
  { label: 'LiveBuild', href: '/buildlive' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
]

const PRIMARY_NAV_LINKS = [
  ...NAV_LINKS.slice(0, 4),
  ...NAV_LINKS.filter((link) => link.label === 'LiveBuild'),
]
const MORE_NAV_LINKS = NAV_LINKS.filter((link) => !PRIMARY_NAV_LINKS.some((primary) => primary.href === link.href))
const NAV_OUTSET_PX = 76

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2) || 'HZ'
}

export default function Navbar() {
  const router = useRouter()
  const { openModal } = useQuoteModal()
  const { customer, isLoggedIn, logout } = useCustomerAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const moreRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const isActive = useCallback(
    (href: string) => (href === '/' ? router.pathname === '/' : router.pathname.startsWith(href)),
    [router.pathname],
  )
  const isMoreGroupActive = useCallback(() => MORE_NAV_LINKS.some((l) => isActive(l.href)), [isActive])

  useEffect(() => {
    const update = () => {
      try {
        const raw = localStorage.getItem('hz_saved_designs')
        setSavedCount(raw ? Object.keys(JSON.parse(raw)).length : 0)
      } catch {
        setSavedCount(0)
      }
    }
    update()
    window.addEventListener('saved-changed', update)
    return () => window.removeEventListener('saved-changed', update)
  }, [])

  useEffect(() => {
    if (router.query.login === '1' && !isLoggedIn) {
      setLoginOpen(true)
      void router.replace(router.pathname, undefined, { shallow: true })
    }
  }, [router.query.login, isLoggedIn, router])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMoreOpen(false)
    setProfileOpen(false)
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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[200] isolate flex items-center" style={{ background: '#0f2a44', height: NAV_OUTSET_PX, boxSizing: 'border-box' }}>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 min-h-0 flex items-center justify-between gap-4">
          <a href="/" className="flex-shrink-0 cursor-pointer no-underline flex items-center" aria-label="Houznext home">
            <img src="/images/Houznext Logo.png" alt="Houznext" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </a>

          <div className="hidden md:flex items-center gap-3 md:gap-4 flex-1 min-w-0 justify-center">
            {PRIMARY_NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); void router.push(link.href) }} className="relative px-3.5 sm:px-4 py-2 rounded text-[13px] font-[500] transition-all duration-200 cursor-pointer no-underline inline-block" style={{ color: isActive(link.href) ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                {link.label}
                {isActive(link.href) && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full pointer-events-none" style={{ background: '#2f80ed' }} />}
              </a>
            ))}

            <div className="relative inline-block" ref={moreRef} onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
              <button type="button" onClick={() => setMoreOpen((o) => !o)} className="relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded text-[13px] font-[500] transition-all duration-200 cursor-pointer" style={{ color: isMoreGroupActive() || moreOpen ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                More
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200" style={{ transform: moreOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute z-[250] right-0 left-auto top-full w-max min-w-[220px] pt-1.5" style={{ marginTop: -2 }}>
                  <div role="menu" className="rounded-[10px] border overflow-hidden" style={{ background: '#0f2a44', borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
                    {MORE_NAV_LINKS.map((link) => (
                      <a key={link.href} href={link.href} role="menuitem" onClick={(e) => { e.preventDefault(); setMoreOpen(false); void router.push(link.href) }} className="flex w-full min-w-0 items-center justify-between gap-3 px-4 py-2.5 text-left text-[13px] font-[500] no-underline transition-all duration-200" style={{ color: isActive(link.href) ? '#2f80ed' : 'rgba(255,255,255,0.9)' }}>
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
            <button type="button" onClick={() => openModal('Navbar — Free consultation')} className="px-4 py-1.5 rounded-lg text-[13px] font-head font-bold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-lg" style={{ background: '#2f80ed' }}>
              Free consultation
            </button>
            <div className="relative" ref={profileRef}>
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
                    <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, width: 242, boxShadow: '0 14px 44px rgba(0,0,0,0.14)', overflow: 'hidden', zIndex: 500 }}>
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
                        onClick={() => openLoginFor('/my-account/livebuild')}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <span>My Home (LiveBuild)</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>Active</span>
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
                    <div style={{ position: 'absolute', top: 'calc(100% + 12px)', right: 0, background: '#fff', border: '1px solid #dde8f5', borderRadius: 14, width: 242, boxShadow: '0 14px 44px rgba(0,0,0,0.14)', overflow: 'hidden', zIndex: 500 }}>
                      <div
                        onClick={() => { setProfileOpen(false); void router.push('/my-account') }}
                        style={{ padding: '14px 16px', background: '#f5f7fa', borderBottom: '1px solid #dde8f5', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#2f80ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, system-ui', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                          {getInitials(customer?.name ?? '')}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2933' }}>{customer?.name || 'Profile'}</div>
                          <div style={{ fontSize: 11, color: '#5a6a7e' }}>{customer?.mobile}</div>
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
                      <div onClick={() => { setProfileOpen(false); void router.push('/my-account/livebuild') }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 16px', fontSize: 13, color: '#1f2933', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '0.5px solid #dde8f5' }}>
                        <span>My Home (LiveBuild)</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#d97706' }}>Active</span>
                      </div>
                      <div onClick={() => { setProfileOpen(false); setLogoutConfirmOpen(true) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', fontSize: 13, color: '#5a6a7e', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Log out
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <button type="button" className="md:hidden text-white p-2" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
              {mobileOpen ? (
                <path d="M1 1L21 17M21 1L1 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="0" y1="2" x2="22" y2="2" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="9" x2="22" y2="9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="16" x2="22" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[190] md:hidden" style={{ paddingTop: NAV_OUTSET_PX }} onClick={() => setMobileOpen(false)}>
          <div className="absolute left-0 right-0 shadow-2xl z-10" style={{ background: '#0f2a44', top: NAV_OUTSET_PX }} onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col py-3 overflow-y-auto" style={{ maxHeight: `calc(100vh - ${NAV_OUTSET_PX}px)` }}>
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={(e) => { e.preventDefault(); void router.push(link.href); setMobileOpen(false) }} className="text-left px-6 py-3 text-[14px] font-[500] transition-all duration-200 block w-full cursor-pointer no-underline" style={{ color: isActive(link.href) ? '#2f80ed' : 'rgba(255,255,255,0.8)' }}>
                  {link.label}
                </a>
              ))}
              <div className="px-6 py-3 border-t border-white/10">
                <button type="button" onClick={() => { openModal('Navbar — Free consultation'); setMobileOpen(false) }} className="w-full py-2.5 text-[13px] font-head font-bold text-white rounded-lg transition-all duration-200" style={{ background: '#2f80ed' }}>
                  Free consultation
                </button>
              </div>
              <div className="px-6 pb-4 flex flex-col gap-2">
                <button type="button" onClick={() => { setMobileOpen(false); if (isLoggedIn) void router.push('/my-account'); else setLoginOpen(true) }} className="w-full py-2 text-[13px] font-[500] text-white rounded-lg border border-white/25 transition-all duration-200">
                  {isLoggedIn ? 'My account' : 'Sign in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
      <div style={{ height: NAV_OUTSET_PX }} />
    </>
  )
}
