import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useQuoteModal } from './QuoteModal'

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Interiors',   href: '/interiors' },
  { label: 'Real Estate', href: '/real-estate' },
  { label: 'LiveBuild',   href: '/buildlive' },
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
        className="fixed top-0 left-0 right-0 z-[200] isolate"
        style={{ background: '#0f2a44', height: 60 }}
      >
        {/* Main nav row — plain <a href> = full navigation; works even if client router is stuck */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-6">
          {/* Logo */}
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

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
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

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-1.5 rounded-lg text-[13px] font-[500] text-white transition-colors duration-150 hover:bg-white/10 inline-block cursor-pointer no-underline"
              style={{ border: '1px solid rgba(255,255,255,0.25)' }}
            >
              Login / My Home
            </a>
            <button
              type="button"
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

        {/* Bottom gradient line — must not steal clicks from row above */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-[2px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #2f80ed 30%, #f2994a 50%, #2f80ed 70%, transparent 100%)',
          }}
        />
      </nav>

      {/* Mobile menu drawer */}
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
            <div className="flex flex-col py-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-left px-6 py-3 text-[14px] font-[500] transition-colors block w-full cursor-pointer no-underline"
                  style={{
                    color: isActive(link.href) ? '#2f80ed' : 'rgba(255,255,255,0.8)',
                    background: isActive(link.href) ? 'rgba(47,128,237,0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 px-6 py-4 border-t border-white/10 mt-2">
                <a
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 py-2 text-[13px] font-[500] text-white rounded-lg border border-white/25 text-center cursor-pointer no-underline"
                >
                  Login
                </a>
                <button
                  type="button"
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
