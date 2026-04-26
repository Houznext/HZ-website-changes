import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import { useQuoteModal } from './QuoteModal'

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Interiors',   href: '/interiors' },
  { label: 'Design Ideas', href: '/design-ideas' },
  { label: 'Projects',    href: '/projects' },
  { label: 'Real Estate', href: '/real-estate' },
  { label: 'LiveBuild',   href: '/buildlive' },
  { label: 'Pricing',     href: '/pricing' },
  { label: 'Blog',        href: '/blog' },
]

function readSavedCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem('hz_saved_designs')
    if (!raw) return 0
    const a = JSON.parse(raw) as unknown[]
    return Array.isArray(a) ? a.length : 0
  } catch {
    return 0
  }
}

export default function Navbar() {
  const router = useRouter()
  const { openModal } = useQuoteModal()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const isActive = useCallback(
    (href: string) =>
      href === '/' ? router.pathname === '/' : router.pathname.startsWith(href),
    [router.pathname],
  )

  useEffect(() => {
    if (!profileOpen) return
    setSavedCount(readSavedCount())
  }, [profileOpen, router.asPath])

  useEffect(() => {
    if (!profileOpen) return
    function handleMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [profileOpen])

  const userName = session?.user
    ? [session.user.firstName, session.user.lastName].filter(Boolean).join(' ').trim()
      || session.user.email
      || 'Member'
    : null
  const userPhone = session?.user?.phone

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[200] isolate"
        style={{ background: '#0f2a44', height: 60 }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
          <a
            href="/"
            className="flex-shrink-0 cursor-pointer no-underline flex items-center"
            aria-label="Houznext home"
          >
            <img
              src="/images/Houznext Logo.png"
              alt="Houznext"
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            />
          </a>

          <div className="hidden md:flex items-center gap-1 flex-1 min-w-0 justify-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  void router.push(link.href)
                }}
                className="relative px-3 py-1.5 rounded text-[13px] font-[500] transition-colors duration-150 cursor-pointer no-underline inline-block"
                style={{
                  color: isActive(link.href) ? '#fff' : 'rgba(255,255,255,0.75)',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full pointer-events-none"
                    style={{ background: '#2f80ed' }}
                  />
                )}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => openModal('Navbar — Free consultation')}
              className="px-4 py-1.5 rounded-lg text-[13px] font-head font-bold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-lg"
              style={{ background: '#2f80ed' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1a6dd6' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2f80ed' }}
            >
              Free consultation
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((o) => !o)
                  if (!profileOpen) setSavedCount(readSavedCount())
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                }}
                aria-label="Account menu"
                aria-expanded={profileOpen}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {profileOpen && (
                <div
                  className="absolute z-[300] w-[220px] rounded-[12px] border border-[#dde8f5] bg-white shadow-lg overflow-hidden"
                  style={{
                    top: 'calc(100% + 10px)',
                    right: 0,
                    animation: 'hzProfIn 0.2s ease forwards',
                    opacity: 0,
                    transform: 'translateY(-8px)',
                  }}
                >
                  <style>
                    {`@keyframes hzProfIn { to { opacity:1; transform: translateY(0); } }`}
                  </style>
                  <div className="px-4 py-3.5 border-b" style={{ background: '#f5f7fa' }}>
                    {status === 'loading' ? (
                      <p className="text-[12px] text-[#5a6a7e]">…</p>
                    ) : session?.user ? (
                      <>
                        <p className="text-[13px] font-bold text-[#1f2933]">{userName}</p>
                        {userPhone && (
                          <p className="text-[11px] text-[#5a6a7e] mt-0.5">{userPhone}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-[13px] font-bold text-[#1f2933]">Guest user</p>
                        <p className="text-[11px] text-[#5a6a7e] mt-0.5">Sign in to save designs</p>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-[#1f2933] border-b border-[#f1f5f9] hover:bg-[#e8f1fd] hover:text-[#2f80ed] flex items-center justify-between"
                    onClick={() => { setProfileOpen(false); void router.push('/saved-designs') }}
                  >
                    <span>❤ Saved designs</span>
                    {savedCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8f1fd] text-[#2f80ed]">
                        {savedCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-[#1f2933] border-b border-[#f1f5f9] hover:bg-[#e8f1fd] hover:text-[#2f80ed]"
                    onClick={() => { setProfileOpen(false); void router.push('/portal/login') }}
                  >
                    🏠 My Home (LiveBuild)
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-[#1f2933] border-b border-[#f1f5f9] hover:bg-[#e8f1fd] hover:text-[#2f80ed]"
                    onClick={() => { setProfileOpen(false); void router.push('/contact-us') }}
                  >
                    📄 My quotations
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-[12px] font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => {
                      try {
                        localStorage.removeItem('hz_customer_token')
                      } catch { /* ignore */ }
                      setProfileOpen(false)
                      void signOut({ callbackUrl: '/' })
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
              {mobileOpen ? (
                <path d="M1 1L21 17M21 1L1 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="0" y1="2"  x2="22" y2="2"  stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="9"  x2="22" y2="9"  stroke="white" strokeWidth="2" strokeLinecap="round" />
                  <line x1="0" y1="16" x2="22" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #2f80ed 30%, #f2994a 50%, #2f80ed 70%, transparent 100%)',
          }}
        />
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[190] md:hidden"
          style={{ paddingTop: 60 }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-[60px] left-0 right-0 shadow-2xl z-10"
            style={{ background: '#0f2a44' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col py-3 max-h-[calc(100vh-60px)] overflow-y-auto">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    void router.push(link.href)
                    setMobileOpen(false)
                  }}
                  className="text-left px-6 py-3 text-[14px] font-[500] transition-colors block w-full cursor-pointer no-underline"
                  style={{
                    color: isActive(link.href) ? '#2f80ed' : 'rgba(255,255,255,0.8)',
                    background: isActive(link.href) ? 'rgba(47,128,237,0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div className="px-6 py-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => { openModal('Navbar — Free consultation'); setMobileOpen(false) }}
                  className="w-full py-2.5 text-[13px] font-head font-bold text-white rounded-lg"
                  style={{ background: '#2f80ed' }}
                >
                  Free consultation
                </button>
              </div>
              <div className="px-6 pb-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); void router.push('/saved-designs') }}
                  className="w-full py-2 text-[13px] font-[500] text-white rounded-lg border border-white/25"
                >
                  Saved designs{readSavedCount() > 0 ? ` (${readSavedCount()})` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); void router.push('/portal/login') }}
                  className="w-full py-2 text-[13px] font-[500] text-white rounded-lg border border-white/25"
                >
                  My Home (LiveBuild)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem('hz_customer_token')
                    } catch { /* ignore */ }
                    setMobileOpen(false)
                    void signOut({ callbackUrl: '/' })
                  }}
                  className="w-full py-2 text-[13px] font-[500] text-red-300 rounded-lg border border-red-500/30"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 60 }} />
    </>
  )
}
