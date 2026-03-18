import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useQuoteModal } from './QuoteModal'

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Interiors',   href: '/interiors' },
  { label: 'Real Estate', href: '/real-estate' },
  { label: 'BuildLive',   href: '/buildlive' },
  { label: 'Pricing',     href: '/pricing' },
  { label: 'Blog',        href: '/blog' },
]

export default function Navbar() {
  const router = useRouter()
  const { openModal } = useQuoteModal()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = useCallback(
    (href: string) =>
      href === '/' ? router.pathname === '/' : router.pathname.startsWith(href),
    [router.pathname]
  )

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{ background: '#0f2a44', height: 60 }}
      >
        {/* Main nav row */}
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-6">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex-shrink-0 font-head font-extrabold text-[22px] leading-none"
          >
            <span className="text-white">Houz</span>
            <span style={{ color: '#f2994a' }}>next</span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                className="relative px-3 py-1.5 rounded text-[13px] font-[500] transition-colors duration-150"
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
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: '#2f80ed' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-1.5 rounded-lg text-[13px] font-[500] text-white transition-colors duration-150 hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.25)' }}
            >
              Login / My Home
            </button>
            <button
              onClick={openModal}
              className="px-4 py-1.5 rounded-lg text-[13px] font-head font-bold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-lg"
              style={{ background: '#2f80ed' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1a6dd6' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2f80ed' }}
            >
              Free Quote
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
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

        {/* Bottom gradient line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #2f80ed 30%, #f2994a 50%, #2f80ed 70%, transparent 100%)',
          }}
        />
      </nav>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ paddingTop: 60 }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-[60px] left-0 right-0 shadow-2xl"
            style={{ background: '#0f2a44' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col py-3">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => { router.push(link.href); setMobileOpen(false) }}
                  className="text-left px-6 py-3 text-[14px] font-[500] transition-colors"
                  style={{
                    color: isActive(link.href) ? '#2f80ed' : 'rgba(255,255,255,0.8)',
                    background: isActive(link.href) ? 'rgba(47,128,237,0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex gap-3 px-6 py-4 border-t border-white/10 mt-2">
                <button
                  onClick={() => { router.push('/login'); setMobileOpen(false) }}
                  className="flex-1 py-2 text-[13px] font-[500] text-white rounded-lg border border-white/25"
                >
                  Login
                </button>
                <button
                  onClick={() => { openModal(); setMobileOpen(false) }}
                  className="flex-1 py-2 text-[13px] font-head font-bold text-white rounded-lg"
                  style={{ background: '#2f80ed' }}
                >
                  Free Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to push content below fixed nav */}
      <div style={{ height: 60 }} />
    </>
  )
}
