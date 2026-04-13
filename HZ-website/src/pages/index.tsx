import { useRouter } from 'next/router'
import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import apiClient from '@/utils/apiClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import InteriorCalculator from '@/components/InteriorCalculator'
import { useQuoteModal } from '@/components/QuoteModal'
import { localBusinessSchema, pricingFaqSchema } from '@/lib/schemas'
import {
  AnimatedIconBox,
  IconHome, IconStar, IconClock, IconTag, IconMapPin,
  IconPhone, IconLayers, IconCheckCircle, IconTool,
  IconShield, IconSmartphone, IconCreditCard,
  IconZap, IconLock, IconTrophy, IconCheck, IconCamera,
} from '@/components/ui/Icons'
import Reveal from '@/components/ui/Reveal'

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(end: number, decimals: number, active: boolean, duration = 1600): number {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    const t0 = performance.now()
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(parseFloat((eased * end).toFixed(decimals)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, end, decimals, duration])
  return val
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <SeoHead
        title="Home Interiors in Hyderabad | Houznext"
        description="Fixed-price interior design for 2BHK, 3BHK and villas across Telangana. 45-day delivery, LiveBuild live tracking, 1-year warranty. Packages from ₹4.5L. 500+ homes delivered."
        canonical="/"
        schema={[localBusinessSchema, pricingFaqSchema]}
        ogImage="https://houznext.com/og-home.jpg"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <Hero />
        <MetricsStrip />
        <HowItWorks />
        <section className="py-16 px-4" style={{ background: '#fff' }}>
          <div className="max-w-7xl mx-auto">
            <Reveal variant="fade" className="text-center mb-10">
              <EyebrowLabel className="justify-center mb-3">Cost Calculator</EyebrowLabel>
              <h2 className="font-head font-bold text-[28px] md:text-[36px] text-charcoal">
                How much will your interiors cost?
              </h2>
              <p className="text-muted mt-2 text-sm">Get a personalised estimate in 2 minutes</p>
            </Reveal>
            <Reveal variant="zoom" delay={150} className="flex justify-center">
              <InteriorCalculator />
            </Reveal>
          </div>
        </section>
        <PackagesSection />
        <BuildLivePreview />
        <StatsStrip />
        <WhyHouznext />
        <ReviewsSection />
        <FaqSection />
        <WaBar />
      </main>
      <Footer />
    </>
  )
}

// ─── Hero (keyframes injected here — keep scoped to homepage bundle) ────────

const HERO_ANIM_CSS = `
@keyframes hz-expand-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes hz-float-particle {
  0% { transform: translateY(600px) scale(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 0.35; }
  100% { transform: translateY(-80px) scale(1.3); opacity: 0; }
}
@keyframes hz-spin-slow { to { transform: rotate(360deg); } }
@keyframes hz-bounce-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@keyframes hz-bg-kenburns { from { transform: scale(1.05); } to { transform: scale(1); } }
.animate-hz-expand-line {
  animation: hz-expand-line 0.8s ease both;
  transform-origin: left;
}
.animate-hz-float-p {
  animation: hz-float-particle linear infinite;
}
.animate-hz-spin-slow {
  animation: hz-spin-slow 4s linear infinite;
}
.animate-hz-bounce {
  animation: hz-bounce-icon 2s ease-in-out infinite;
}
.animate-hz-bounce-delay {
  animation: hz-bounce-icon 2s ease-in-out infinite 0.45s;
}
.animate-hz-kenburns {
  animation: hz-bg-kenburns 9s ease-out forwards;
}
@keyframes hz-city-dropdown-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hz-modal-in {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes hz-modal-bg-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes hz-check-pop {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  70% { transform: scale(1.18) rotate(4deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes hz-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.12); opacity: 0.15; }
}
.animate-hz-city-in { animation: hz-city-dropdown-in 0.18s ease both; }
.animate-hz-modal-in { animation: hz-modal-in 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }
.animate-hz-modal-bg { animation: hz-modal-bg-in 0.22s ease both; }
.animate-hz-check-pop { animation: hz-check-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.15s; }
.animate-hz-ring { animation: hz-ring-pulse 2.4s ease-in-out infinite; }
`

const BUILDLIVE_ROOMS = [
  { label: 'Living room', pct: 90, color: '#2f80ed' },
  { label: 'Kitchen', pct: 100, color: '#4ade80' },
  { label: 'Master bed', pct: 65, color: '#f2994a' },
  { label: 'Bedroom 2', pct: 55, color: '#a78bfa' },
]

const OVERALL_PCT = 76

const BUILDLIVE_TIMELINE = [
  { label: 'Civil & flooring', date: 'Feb 2', status: 'done' },
  { label: 'Electrical fit-out', date: 'Feb 18', status: 'done' },
  { label: 'Furniture & finishing', date: 'Mar 14', status: 'active' },
  { label: 'Handover', date: 'Mar 28', status: 'upcoming' },
]

interface DonutProps {
  pct: number
  color: string
  size?: number
  strokeWidth?: number
  animate?: boolean
}

function DonutChart({ pct, color, size = 40, strokeWidth = 5, animate = false }: DonutProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const targetOffset = circ * (1 - pct / 100)
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    if (!animate) {
      setOffset(targetOffset)
      return
    }
    const t = setTimeout(() => setOffset(targetOffset), 350)
    return () => clearTimeout(t)
  }, [targetOffset, animate])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: animate ? 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}
      />
    </svg>
  )
}

function useCountUpOnce(target: number, duration = 1700): number {
  const [val, setVal] = useState(0)
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return val
}

interface Particle {
  id: number
  size: number
  left: number
  duration: number
  delay: number
  opacity: number
}

function useParticles(count = 18): Particle[] {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      duration: Math.random() * 14 + 10,
      delay: Math.random() * -22,
      opacity: Math.random() * 0.35 + 0.08,
    }))
  )
  return particles
}

const TRUST_BADGES = [
  { Icon: IconTrophy, label: '4.8★ Rating', color: '#f2994a', animClass: 'animate-hz-bounce' },
  { Icon: IconZap, label: '45-day delivery', color: '#2f80ed', animClass: 'animate-hz-spin-slow' },
  { Icon: IconLock, label: 'Fixed price', color: '#2f80ed', animClass: 'animate-hz-bounce-delay' },
]

const HERO_CITIES = [
  'Hyderabad',
  'Warangal',
  'Karimnagar',
  'Nizamabad',
  'Khammam',
  'Ramagundam',
  'Mahbubnagar',
  'Nalgonda',
  'Adilabad',
  'Suryapet',
  'Miryalaguda',
  'Siddipet',
  'Jagtial',
  'Mancherial',
  'Other',
]

interface HeroCityDropdownProps {
  value: string
  onChange: (city: string) => void
}

function HeroCityDropdown({ value, onChange }: HeroCityDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = search.trim()
    ? HERO_CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase().trim()))
    : HERO_CITIES

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function openDropdown() {
    setOpen(true)
    setSearch('')
    setTimeout(() => searchRef.current?.focus(), 60)
  }

  function selectCity(city: string) {
    onChange(city)
    setOpen(false)
    setSearch('')
  }

  const triggerStyle: CSSProperties = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: open ? '9px 9px 0 0' : 9,
    border: `1px solid ${open ? 'rgba(47,128,237,0.7)' : 'rgba(255,255,255,0.12)'}`,
    background: open ? 'rgba(47,128,237,0.08)' : 'rgba(255,255,255,0.055)',
    color: value ? '#fff' : 'rgba(255,255,255,0.28)',
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.18s, background 0.18s',
    outline: 'none',
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', marginBottom: 8 }}>
      <button
        type="button"
        style={triggerStyle}
        onClick={() => {
          if (open) {
            setOpen(false)
            setSearch('')
          } else {
            openDropdown()
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'rgba(47,128,237,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2f80ed" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 1C4.3 1 3 2.3 3 4c0 2.5 3 6 3 6s3-3.5 3-6c0-1.7-1.3-3-3-3z" />
              <circle cx="6" cy="4" r="1" />
            </svg>
          </span>
          <span style={{ fontSize: 13 }}>{value || 'Select your city'}</span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s', flexShrink: 0 }}
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div
          className="animate-hz-city-in"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 999,
            background: 'rgba(6,18,34,0.98)',
            border: '1px solid rgba(47,128,237,0.35)',
            borderTop: '1px solid rgba(47,128,237,0.18)',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              padding: '10px 10px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="5.5" cy="5.5" r="4" />
              <path d="M11 11l-2.5-2.5" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 12.5,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ maxHeight: 132, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '12px 14px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.35)',
                  textAlign: 'center',
                }}
              >
                No cities found
              </div>
            ) : (
              filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => selectCity(city)}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    background: city === value ? 'rgba(47,128,237,0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background 0.14s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (city !== value) e.currentTarget.style.background = 'rgba(47,128,237,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    if (city !== value) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: city === value ? '#2f80ed' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      flex: 1,
                      color: city === value ? '#2f80ed' : 'rgba(255,255,255,0.65)',
                      fontWeight: city === value ? 600 : 400,
                    }}
                  >
                    {city}
                  </span>
                  {city === value && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2f80ed" strokeWidth="2" strokeLinecap="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface HeroSuccessModalProps {
  name: string
  onClose: () => void
  onViewPricing: () => void
}

function HeroSuccessModal({ name, onClose, onViewPricing }: HeroSuccessModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="animate-hz-modal-bg"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4,10,20,0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="animate-hz-modal-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(6,16,30,0.97)',
          border: '1px solid rgba(47,128,237,0.32)',
          borderRadius: 20,
          padding: '40px 40px',
          width: '100%',
          maxWidth: 580,
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)',
            fontSize: 16,
            lineHeight: 1,
            transition: 'background 0.18s, color 0.18s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.background = 'rgba(255,255,255,0.14)'
            el.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.background = 'rgba(255,255,255,0.07)'
            el.style.color = 'rgba(255,255,255,0.45)'
          }}
        >
          ×
        </button>

        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 20px' }}>
          <div
            className="animate-hz-ring"
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '1.5px solid rgba(47,128,237,0.22)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(47,128,237,0.1)',
              border: '2px solid rgba(47,128,237,0.3)',
            }}
          />
          <div
            className="animate-hz-check-pop"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#2f80ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11l5 5 9-9" />
              </svg>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            marginBottom: 14,
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.25)',
            fontSize: 10.5,
            fontWeight: 700,
            color: '#4ade80',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ade80',
              display: 'inline-block',
              animation: 'hz-ring-pulse 1.8s ease-in-out infinite',
            }}
          />
          Enquiry received
        </div>

        <p
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#fff',
            marginBottom: 8,
            letterSpacing: '-0.3px',
            lineHeight: 1.2,
            fontFamily: 'inherit',
          }}
        >
          We&apos;ve got your{' '}
          <span style={{ color: '#2f80ed' }}>
            details{name ? `, ${name.split(' ')[0]}` : ''}!
          </span>
        </p>

        <p
          style={{
            fontSize: 13.5,
            color: 'rgba(255,255,255,0.52)',
            lineHeight: 1.65,
            marginBottom: 24,
            maxWidth: 460,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Our interior design expert will reach out within{' '}
          <strong style={{ color: 'rgba(255,255,255,0.78)' }}>2 hours</strong>. We&apos;ll walk you through packages, pricing, and a free 3D design
          preview.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 0,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 20,
          }}
        >
          {[
            { num: '<2hr', label: 'First callback' },
            { num: 'Free', label: '3D design' },
            { num: 'Fixed', label: 'Price quote' },
          ].map((s, i, arr) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: '12px 10px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.03)',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 900, color: '#2f80ed', marginBottom: 2 }}>{s.num}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 24,
            textAlign: 'left',
            padding: '14px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {[
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M7 1v4l2.5 1.5" />
                  <circle cx="7" cy="7" r="5.5" />
                </svg>
              ),
              bg: 'rgba(47,128,237,0.15)',
              title: 'Expert calls you',
              sub: 'Within 2 hours on your number',
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#f2994a" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="1" y="2" width="12" height="10" rx="2" />
                  <path d="M1 5h12" />
                </svg>
              ),
              bg: 'rgba(242,153,74,0.15)',
              title: 'Free site visit scheduled',
              sub: 'At your convenience, zero cost',
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 7l4 4 6-6" />
                </svg>
              ),
              bg: 'rgba(74,222,128,0.12)',
              title: 'Fixed price quote delivered',
              sub: 'No surprises, no hidden charges',
            },
          ].map((step) => (
            <div key={step.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: step.bg,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.icon}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 1 }}>{step.title}</p>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)' }}>{step.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onViewPricing}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: '#2f80ed',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = '#1a6dd6'
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 22px rgba(47,128,237,0.45)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = '#2f80ed'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            View Pricing Packages →
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.65)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.18s, border-color 0.18s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.07)'
              el.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = 'transparent'
              el.style.borderColor = 'rgba(255,255,255,0.15)'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  const router = useRouter()
  const particles = useParticles(18)
  const overallCount = useCountUpOnce(OVERALL_PCT)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [propType, setPropType] = useState('')
  const [city, setCity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [submittedName, setSubmittedName] = useState('')

  const isValid = name.trim().length >= 2 && /^\d{10}$/.test(phone.trim())

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      const res = await apiClient.post(apiClient.URLS.contact_us, {
        firstName: name.trim(),
        // Backend DTO requires non-empty lastName + valid email (CreateContactUsDto)
        lastName: '-',
        contactNumber: phone.trim(),
        emailAddress: 'noreply+hero@houznext.com',
        tellUsMore: [
          'Source: Homepage hero (email not collected on this form).',
          propType ? `Property: ${propType}` : '',
          city ? `City: ${city}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
        serviceType: 'Home Interiors',
        city: city || undefined,
      })
      if (res.status === 201 || res.status === 200) {
        setSubmittedName(name.trim())
        setName('')
        setPhone('')
        setPropType('')
        setCity('')
        setShowModal(true)
        toast.success('We will call you back shortly!')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase: CSSProperties = {
    width: '100%',
    padding: '8px 11px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.055)',
    color: '#fff',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: 8,
    transition: 'border-color 0.18s, background 0.18s',
  }

  const handleInputFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(47,128,237,0.7)'
    e.currentTarget.style.background = 'rgba(47,128,237,0.08)'
  }
  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
    e.currentTarget.style.background = 'rgba(255,255,255,0.055)'
  }

  const PROPERTY_TYPES = ['2BHK', '3BHK', 'Villa / 4BHK+']

  return (
    <>
      {showModal && (
        <HeroSuccessModal
          name={submittedName}
          onClose={() => setShowModal(false)}
          onViewPricing={() => {
            setShowModal(false)
            router.push('/pricing')
          }}
        />
      )}

      <section className="relative overflow-hidden" style={{ background: '#0f2a44' }}>
        <style dangerouslySetInnerHTML={{ __html: HERO_ANIM_CSS }} />

        <div
          className="absolute inset-0 animate-hz-kenburns"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1600&q=90')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(108deg, #0f2a44 0%, rgba(15,42,68,0.95) 26%, rgba(15,42,68,0.80) 46%, rgba(15,42,68,0.28) 66%, rgba(15,42,68,0.06) 100%)',
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-hz-float-p"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                bottom: 0,
                background: 'rgba(47,128,237,0.4)',
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                opacity: p.opacity,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2.5 mb-5">
                <div
                  className="h-0.5 animate-hz-expand-line flex-shrink-0"
                  style={{ width: 28, background: '#f2994a', borderRadius: 1 }}
                />
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: '#f2994a' }}
                >
                  500+ Homes Delivered
                </span>
              </div>

              <h1
                className="font-head font-black text-white mb-4 leading-[1.07]"
                style={{ fontSize: 'clamp(26px, 5vw, 54px)', letterSpacing: '-0.5px' }}
              >
                Your home.{' '}
                <br className="hidden sm:block" />
                <span style={{ color: '#2f80ed' }}>Beautifully</span> realised.
              </h1>

              <p
                className="text-[15px] mb-8"
                style={{ color: 'rgba(255,255,255,0.57)', letterSpacing: '0.04em' }}
              >
                Buy Right · Build Strong · Design Beautiful
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedName(name.trim())
                    setShowModal(true)
                  }}
                  className="font-head font-bold text-white rounded-xl text-[14px]"
                  style={{ padding: '13px 28px', background: '#2f80ed', border: 'none', minHeight: 44, transition: 'all 0.18s' }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = '#1a6dd6'
                    el.style.transform = 'translateY(-3px)'
                    el.style.boxShadow = '0 10px 30px rgba(47,128,237,0.5)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = '#2f80ed'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  Get free estimate →
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/buildlive')}
                  className="font-head font-bold text-white rounded-xl text-[14px]"
                  style={{
                    padding: '13px 28px',
                    border: '1px solid rgba(255,255,255,0.28)',
                    background: 'transparent',
                    minHeight: 44,
                    transition: 'all 0.18s',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'rgba(255,255,255,0.1)'
                    el.style.borderColor = 'rgba(255,255,255,0.55)'
                    el.style.transform = 'translateY(-3px)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget
                    el.style.background = 'transparent'
                    el.style.borderColor = 'rgba(255,255,255,0.28)'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  See LiveBuild
                </button>
              </div>

              <div className="flex flex-wrap gap-4 sm:gap-5">
                {TRUST_BADGES.map(({ Icon, label, color, animClass }) => (
                  <div key={label} className="flex items-center gap-2 cursor-default group">
                    <div
                      className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6"
                      style={{ background: `${color}22` }}
                    >
                      <div className={animClass}>
                        <Icon size={14} strokeWidth={2} stroke={color} />
                      </div>
                    </div>
                    <span className="text-[12.5px] font-[500]" style={{ color: 'rgba(255,255,255,0.72)' }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in w-full">
              <div className="flex flex-col lg:grid lg:gap-3 gap-3" style={{ gridTemplateColumns: 'minmax(300px, 36%) 1fr' }}>
                <div
                  className="rounded-[18px] overflow-visible w-full"
                  style={{
                    background: 'rgba(6,16,30,0.92)',
                    border: '1px solid rgba(47,128,237,0.38)',
                    borderRadius: 18,
                  }}
                >
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(47,128,237,0.22) 0%, rgba(47,128,237,0.08) 100%)',
                      borderBottom: '1px solid rgba(47,128,237,0.2)',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      borderRadius: '18px 18px 0 0',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: 'rgba(47,128,237,0.2)',
                        border: '1px solid rgba(47,128,237,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <IconHome size={14} stroke="#2f80ed" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Free Consultation</p>
                      <p
                        style={{
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.45)',
                          marginTop: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#4ade80',
                            display: 'inline-block',
                            animation: 'hz-ring-pulse 2s ease-in-out infinite',
                          }}
                        />
                        Team online · responds in {'<'}2 hrs
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px 14px' }}>
                    <form onSubmit={handleSubmit} noValidate>
                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.5)',
                          marginBottom: 4,
                          letterSpacing: '0.03em',
                        }}
                      >
                        Full name *
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: 'rgba(47,128,237,0.12)',
                            border: '1px solid rgba(47,128,237,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#2f80ed" strokeWidth="1.6" strokeLinecap="round">
                            <circle cx="6.5" cy="4" r="2.5" />
                            <path d="M1 12c0-3 2.5-4.5 5.5-4.5S12 9 12 12" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Ravi Reddy"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          style={{ ...inputBase, marginBottom: 0, flex: 1 }}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                        />
                      </div>

                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.5)',
                          marginBottom: 4,
                          letterSpacing: '0.03em',
                        }}
                      >
                        Phone number *
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: 'rgba(47,128,237,0.12)',
                            border: '1px solid rgba(47,128,237,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="#2f80ed" strokeWidth="1.6" strokeLinecap="round">
                            <rect x="3" y="1" width="7" height="11" rx="1.5" />
                            <circle cx="6.5" cy="9.5" r="0.7" fill="#2f80ed" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="10-digit mobile"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          style={{ ...inputBase, marginBottom: 0, flex: 1 }}
                          onFocus={handleInputFocus}
                          onBlur={handleInputBlur}
                        />
                      </div>

                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.5)',
                          marginBottom: 5,
                          letterSpacing: '0.03em',
                        }}
                      >
                        Property type
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {PROPERTY_TYPES.map((pt) => (
                          <button
                            key={pt}
                            type="button"
                            onClick={() => setPropType(pt === propType ? '' : pt)}
                            style={{
                              padding: '5px 11px',
                              borderRadius: 18,
                              fontSize: 11,
                              fontWeight: propType === pt ? 700 : 600,
                              border: `1px solid ${propType === pt ? '#2f80ed' : 'rgba(255,255,255,0.14)'}`,
                              background: propType === pt ? 'rgba(47,128,237,0.18)' : 'rgba(255,255,255,0.05)',
                              color: propType === pt ? '#fff' : 'rgba(255,255,255,0.55)',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.18s',
                              fontFamily: 'inherit',
                            }}
                            onMouseEnter={(e) => {
                              if (propType !== pt) {
                                e.currentTarget.style.borderColor = 'rgba(47,128,237,0.5)'
                                e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                                e.currentTarget.style.background = 'rgba(47,128,237,0.08)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (propType !== pt) {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                                e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                              }
                            }}
                          >
                            {pt}
                          </button>
                        ))}
                      </div>

                      <p
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.5)',
                          marginBottom: 4,
                          letterSpacing: '0.03em',
                        }}
                      >
                        Your city
                      </p>
                      <HeroCityDropdown value={city} onChange={setCity} />

                      <button
                        type="submit"
                        disabled={submitting || !isValid}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: 9,
                          border: 'none',
                          background: '#2f80ed',
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: !isValid || submitting ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                          marginTop: 0,
                          marginBottom: 6,
                          opacity: !isValid ? 0.6 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                          letterSpacing: '0.01em',
                        }}
                        onMouseEnter={(e) => {
                          if (!isValid || submitting) return
                          const el = e.currentTarget
                          el.style.background = '#1a6dd6'
                          el.style.transform = 'translateY(-3px)'
                          el.style.boxShadow = '0 10px 28px rgba(47,128,237,0.55)'
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget
                          el.style.background = '#2f80ed'
                          el.style.transform = 'translateY(0)'
                          el.style.boxShadow = 'none'
                        }}
                      >
                        {submitting ? (
                          'Sending…'
                        ) : (
                          <>
                            Get Free Quote
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              style={{ transition: 'transform 0.2s' }}
                            >
                              <path d="M2 7h10M7 2l5 5-5 5" />
                            </svg>
                          </>
                        )}
                      </button>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.28)',
                        }}
                      >
                        <IconLock size={10} stroke="rgba(255,255,255,0.28)" strokeWidth={1.6} />
                        Private &amp; secure — no spam, ever.
                      </div>
                    </form>
                  </div>
                </div>

                <div
                  className="rounded-[18px] p-3 w-full"
                  style={{
                    background: 'rgba(6,16,30,0.86)',
                    border: '1px solid rgba(47,128,237,0.30)',
                    backdropFilter: 'blur(18px)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full animate-pulse-dot flex-shrink-0" style={{ background: '#f2994a' }} />
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: '#f2994a' }}>
                        LiveBuild
                      </span>
                    </div>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(74,222,128,0.14)',
                        color: '#4ade80',
                        border: '1px solid rgba(74,222,128,0.24)',
                      }}
                    >
                      LIVE
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="text-[12px] font-bold text-white leading-tight">Ravi&apos;s Home</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
                      3BHK · Kondapur, Hyderabad
                    </p>
                  </div>

                  <div
                    className="flex items-center gap-2 mb-2 p-2 rounded-lg"
                    style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.18)' }}
                  >
                    <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
                      <DonutChart pct={OVERALL_PCT} color="#2f80ed" size={52} strokeWidth={5} animate />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-black text-[12px]" style={{ color: '#2f80ed' }}>
                          {overallCount}%
                        </span>
                        <span className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                          overall
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white mb-0.5">Site progress</p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
                        Est. finish: Mar 28
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {BUILDLIVE_ROOMS.map((room) => (
                      <div
                        key={room.label}
                        className="flex items-center gap-1.5 rounded-lg p-2 transition-all duration-200 cursor-default"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget
                          el.style.background = 'rgba(255,255,255,0.08)'
                          el.style.borderColor = 'rgba(255,255,255,0.14)'
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget
                          el.style.background = 'rgba(255,255,255,0.04)'
                          el.style.borderColor = 'rgba(255,255,255,0.07)'
                        }}
                      >
                        <div className="relative flex-shrink-0" style={{ width: 34, height: 34 }}>
                          <DonutChart pct={room.pct} color={room.color} size={34} strokeWidth={4} animate />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span
                              className="font-extrabold"
                              style={{ fontSize: room.pct === 100 ? 11 : 8.5, color: room.color }}
                            >
                              {room.pct === 100 ? '✓' : room.pct}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-[600] truncate" style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>
                            {room.label}
                          </p>
                          <p className="font-black mt-0.5" style={{ fontSize: 11, color: room.color }}>
                            {room.pct}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-1 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    {BUILDLIVE_TIMELINE.map((tl) => (
                      <div key={tl.label} className="flex items-center gap-2">
                        <span
                          className="flex-shrink-0 rounded-full"
                          style={{
                            width: 7,
                            height: 7,
                            background:
                              tl.status === 'done' ? '#4ade80' : tl.status === 'active' ? '#2f80ed' : 'transparent',
                            border:
                              tl.status === 'done'
                                ? '1.5px solid #4ade80'
                                : tl.status === 'active'
                                  ? '1.5px solid #2f80ed'
                                  : '1.5px solid rgba(255,255,255,0.18)',
                          }}
                        />
                        <span
                          className="text-[10px] truncate"
                          style={{
                            color:
                              tl.status === 'done'
                                ? 'rgba(74,222,128,0.75)'
                                : tl.status === 'active'
                                  ? 'rgba(255,255,255,0.88)'
                                  : 'rgba(255,255,255,0.45)',
                            fontWeight: tl.status === 'active' ? 600 : 400,
                          }}
                        >
                          {tl.label}
                        </span>
                        <span className="text-[9.5px] ml-auto flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
                          {tl.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── MetricsStrip ─────────────────────────────────────────────────────────────

interface MetricDef {
  num: number
  decimals: number
  suffix: string
  label: string
  sub: string
  color: string
  Icon: React.ComponentType<{ size?: number; stroke?: string; strokeWidth?: number }>
}

const METRICS: MetricDef[] = [
  { num: 500,  decimals: 0, suffix: '+',  label: 'Homes Delivered',       sub: 'Across Telangana',      color: '#2f80ed', Icon: IconHome },
  { num: 4.8,  decimals: 1, suffix: '★',  label: 'Average Rating',        sub: '680+ verified reviews', color: '#f2994a', Icon: IconStar },
  { num: 45,   decimals: 0, suffix: 'd',  label: 'Avg. Delivery',         sub: 'Fastest in the market', color: '#2f80ed', Icon: IconClock },
  { num: 100,  decimals: 0, suffix: '%',  label: 'Fixed-Price Projects',  sub: 'Zero surprises',        color: '#f2994a', Icon: IconTag },
  { num: 12,   decimals: 0, suffix: '+',  label: 'Cities Served',         sub: 'Growing every month',   color: '#2f80ed', Icon: IconMapPin },
]

function MetricItem({ m, visible, index }: { m: MetricDef; visible: boolean; index: number }) {
  const count = useCountUp(m.num, m.decimals, visible, 1600)
  const display = m.decimals > 0 ? count.toFixed(m.decimals) : Math.floor(count).toString()

  return (
    <div
      className="text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${index * 120}ms, transform 0.6s ease ${index * 120}ms`,
      }}
    >
      {/* Circle with icon */}
      <div className="relative w-[72px] h-[72px] mx-auto mb-4">
        {/* Rotating dashed orbit */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: '10s' }}
          viewBox="0 0 72 72"
        >
          <circle
            cx="36" cy="36" r="32"
            fill="none"
            stroke={m.color}
            strokeWidth="1.5"
            strokeDasharray="8 5"
            opacity="0.35"
          />
        </svg>

        {/* Inner filled circle */}
        <div
          className="absolute inset-[6px] rounded-full flex items-center justify-center"
          style={{
            background: `${m.color}14`,
            border: `1.5px solid ${m.color}30`,
            transition: `transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${index * 120 + 300}ms, opacity 0.4s ease ${index * 120 + 300}ms`,
            transform: visible ? 'scale(1)' : 'scale(0.4)',
            opacity: visible ? 1 : 0,
          }}
        >
          <m.Icon
            size={22}
            stroke={m.color}
            strokeWidth={1.6}
          />
        </div>
      </div>

      {/* Count-up number */}
      <p
        className="font-head font-black text-[28px] leading-none tabular-nums"
        style={{ color: m.color }}
      >
        {display}{m.suffix}
      </p>
      <p className="font-head font-bold text-[13px] text-charcoal mt-1.5">{m.label}</p>
      <p className="text-[11px] mt-0.5" style={{ color: '#5a6a7e' }}>{m.sub}</p>
    </div>
  )
}

function MetricsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative overflow-hidden py-16 px-4" style={{ background: '#fff' }}>
      {/* Premium shimmer top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: 'linear-gradient(90deg, transparent, #2f80ed 20%, #f2994a 50%, #2f80ed 80%, transparent)',
        }}
      />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {METRICS.map((m, i) => (
            <MetricItem key={m.label} m={m} visible={visible} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── HowItWorks ───────────────────────────────────────────────────────────────

interface StepDef {
  step: string
  title: string
  desc: string
  Icon: React.ComponentType<{ size?: number; stroke?: string; strokeWidth?: number }>
  color: string
}

const STEPS: StepDef[] = [
  { step: '01', title: 'Free Consultation', desc: 'Call or WhatsApp us. We discuss your vision, space, and budget.', Icon: IconPhone, color: '#2f80ed' },
  { step: '02', title: '3D Design',          desc: 'Our designers create a photorealistic 3D design for every room.', Icon: IconLayers, color: '#2f80ed' },
  { step: '03', title: 'Approval',            desc: 'Review and approve designs online. Revisions are free.',          Icon: IconCheckCircle, color: '#2f80ed' },
  { step: '04', title: 'Execution',           desc: 'Our team begins work. LiveBuild gives you daily updates.',         Icon: IconTool, color: '#2f80ed' },
]

function HowItWorks() {
  return (
    <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">The Process</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[36px] text-charcoal">How it works</h2>
          <p className="text-muted mt-2 text-sm max-w-lg mx-auto">
            From your first call to a beautifully finished home in 4 simple steps
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 110}>
              <HowItWorksCard step={s} isLast={i === STEPS.length - 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksCard({ step, isLast }: { step: StepDef; isLast: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="relative p-6 rounded-2xl border bg-white cursor-default transition-all duration-300"
      style={{
        borderColor: hovered ? '#2f80ed' : '#dde8f5',
        boxShadow: hovered ? '0 8px 30px rgba(47,128,237,0.12)' : 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-3 mb-4">
        <AnimatedIconBox color={step.color} size="md" hovered={hovered}>
          <step.Icon size={20} strokeWidth={1.7} />
        </AnimatedIconBox>
        <span
          className="font-head font-black text-[38px] leading-none mt-1"
          style={{ color: hovered ? '#e8f1fd' : '#f0f4fa', transition: 'color 0.3s' }}
        >
          {step.step}
        </span>
      </div>
      <h3 className="font-head font-bold text-[15px] text-charcoal mb-2">{step.title}</h3>
      <p className="text-[13px] leading-relaxed" style={{ color: '#5a6a7e' }}>{step.desc}</p>

      {!isLast && (
        <div
          className="hidden md:block absolute top-8 -right-3 w-6 text-center font-bold text-lg transition-colors duration-300"
          style={{ color: hovered ? '#2f80ed' : '#c5d9f5' }}
        >
          →
        </div>
      )}
    </div>
  )
}

// ─── PackagesSection ──────────────────────────────────────────────────────────

const PACKAGES = [
  {
    name: 'Essential',
    price: '₹4.5L',
    suffix: 'onwards',
    color: '#5a6a7e',
    features: ['Modular kitchen', 'Wardrobes', 'False ceiling', 'TV unit', '1-yr warranty'],
    highlighted: false,
  },
  {
    name: 'Premium',
    price: '₹7.5L',
    suffix: 'onwards',
    color: '#2f80ed',
    features: ['Everything in Essential', 'Wall panelling', 'Study unit', 'Crockery unit', 'LiveBuild tracking'],
    highlighted: true,
  },
  {
    name: 'Luxury',
    price: '₹13L',
    suffix: 'onwards',
    color: '#f2994a',
    features: ['Italian lacquer finishes', 'Walk-in wardrobe', 'Smart lighting', 'Full furniture package', '2-yr warranty'],
    highlighted: false,
  },
]

function PackagesSection() {
  const { openModal } = useQuoteModal()
  return (
    <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Packages</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[36px] text-charcoal">Pick the right package</h2>
          <p className="text-muted mt-2 text-sm">All packages are fixed-price with no hidden costs</p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PACKAGES.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 120} variant="zoom">
            <div
              key={pkg.name}
              className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{
                border: pkg.highlighted ? `2px solid ${pkg.color}` : '1px solid #dde8f5',
                background: '#fff',
                boxShadow: pkg.highlighted ? `0 8px 40px rgba(47,128,237,0.15)` : undefined,
                transform: pkg.highlighted ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {pkg.highlighted && (
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#f2994a' }}>
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-6 pb-4" style={{ borderBottom: '1px solid #f5f7fa' }}>
                <p className="font-head font-bold text-[13px] uppercase tracking-wider mb-2" style={{ color: pkg.color }}>{pkg.name}</p>
                <p className="font-head font-black text-[32px]" style={{ color: '#1f2933' }}>{pkg.price}</p>
                <p className="text-[12px]" style={{ color: '#5a6a7e' }}>{pkg.suffix} for 2BHK</p>
              </div>
              <div className="p-6">
                <ul className="space-y-2.5 mb-5">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: '#1f2933' }}>
                      <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: `${pkg.color}18` }}>
                        <IconCheck size={10} stroke={pkg.color} strokeWidth={2.5} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={openModal}
                  className="w-full py-2.5 rounded-xl text-[13px] font-head font-bold transition-all hover:-translate-y-px"
                  style={
                    pkg.highlighted
                      ? { background: '#2f80ed', color: '#fff' }
                      : { background: '#f5f7fa', color: '#2f80ed', border: '1px solid #dde8f5' }
                  }
                >
                  Get {pkg.name} quote →
                </button>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── LiveBuild Preview ────────────────────────────────────────────────────────

const BUILDLIVE_FEATURES = [
  { Icon: IconCamera,       label: 'Daily photo updates by room' },
  { Icon: IconCheckCircle,  label: 'Design approval workflow' },
  { Icon: IconTag,          label: 'Milestone-based payments' },
  { Icon: IconTool,         label: 'Snag & punch list management' },
]

function BuildLivePreview() {
  const router = useRouter()
  return (
    <section className="py-20 px-4" style={{ background: '#0f2a44' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal variant="right">
          <div>
            <EyebrowLabel className="mb-4">Live Tracking</EyebrowLabel>
            <h2 className="font-head font-bold text-[28px] md:text-[38px] leading-tight text-white mb-4">
              Know exactly what&apos;s happening at your site — every day
            </h2>
            <p className="text-[15px] leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
              LiveBuild is Houznext&apos;s proprietary project tracking system. See room-by-room
              progress, approve 3D designs, track milestone payments, and raise snags
              — all from your phone.
            </p>
            <ul className="space-y-3 mb-8">
              {BUILDLIVE_FEATURES.map(({ Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-[14px] group cursor-default">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                    style={{ background: 'rgba(47,128,237,0.2)', color: '#2f80ed' }}
                  >
                    <Icon size={14} strokeWidth={1.8} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>{label}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/buildlive')}
              className="px-6 py-3 rounded-xl font-head font-bold text-white text-[14px] transition-all hover:-translate-y-0.5"
              style={{ background: '#2f80ed' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed' }}
            >
              Explore LiveBuild →
            </button>
          </div>
          </Reveal>

          {/* Floating card */}
          <Reveal variant="left" delay={180}>
          <div className="flex justify-center animate-float">
            <div
              className="w-full max-w-sm rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(47,128,237,0.3)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#f2994a' }} />
                <span className="text-[12px] font-head font-bold uppercase tracking-wider" style={{ color: '#f2994a' }}>
                  Live Updates
                </span>
              </div>
              {[
                { room: 'Living room',    pct: 82,  status: 'Panelling in progress' },
                { room: 'Kitchen',        pct: 95,  status: 'Final touches' },
                { room: 'Master bedroom', pct: 65,  status: 'Wardrobe installation' },
                { room: 'Bathroom 1',     pct: 100, status: 'Complete ✓' },
              ].map((item) => (
                <div key={item.room} className="mb-3 last:mb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-[500] text-white">{item.room}</span>
                    <span className="text-[11px]" style={{ color: item.pct === 100 ? '#4ade80' : '#2f80ed' }}>{item.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mb-0.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.pct}%`, background: item.pct === 100 ? '#4ade80' : '#2f80ed' }}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.status}</p>
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Strip ─────────────────────────────────────────────────────────────

interface StatDef { num: number; decimals: number; suffix: string; label: string }

const STATS: StatDef[] = [
  { num: 500, decimals: 0, suffix: '+',  label: 'Homes delivered' },
  { num: 48,  decimals: 0, suffix: 'd',  label: 'Average delivery' },
  { num: 4.8, decimals: 1, suffix: '★',  label: 'Customer rating' },
  { num: 12,  decimals: 0, suffix: '+',  label: 'Cities served' },
]

function StatCounter({ stat, active }: { stat: StatDef; active: boolean }) {
  const count = useCountUp(stat.num, stat.decimals, active, 1800)
  const display = stat.decimals > 0 ? count.toFixed(stat.decimals) : Math.floor(count).toString()
  return (
    <div className="text-center">
      <p className="font-head font-black text-[40px] text-white leading-none tabular-nums">
        {display}{stat.suffix}
      </p>
      <p className="text-[13px] mt-1.5 font-[500]" style={{ color: 'rgba(255,255,255,0.8)' }}>{stat.label}</p>
    </div>
  )
}

function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-14 px-4" style={{ background: '#2f80ed' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <StatCounter key={s.label} stat={s} active={active} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Why Houznext ─────────────────────────────────────────────────────────────

interface WhyDef {
  title: string
  desc: string
  Icon: React.ComponentType<{ size?: number; stroke?: string; strokeWidth?: number }>
  color: string
}

const WHY: WhyDef[] = [
  { Icon: IconLayers,     color: '#2f80ed', title: '3D design first',       desc: 'See your room before a single nail is hammered. Revisions are always free.' },
  { Icon: IconLock,       color: '#2f80ed', title: 'Fixed pricing',          desc: 'Quote = Invoice. No surprises, no escalations, ever.' },
  { Icon: IconZap,        color: '#f2994a', title: '45-day delivery',        desc: 'We commit to delivery dates and stick to them — guaranteed.' },
  { Icon: IconSmartphone, color: '#2f80ed', title: 'LiveBuild tracking',     desc: 'Daily photos and progress updates from your site.' },
  { Icon: IconShield,     color: '#2f80ed', title: '1-year warranty',        desc: 'All work is covered for 12 months with no questions asked.' },
  { Icon: IconCreditCard, color: '#f2994a', title: 'EMI options available',  desc: 'Zero-cost EMI plans through leading banks and NBFCs.' },
]

function WhyCard({ item }: { item: WhyDef }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="p-6 rounded-2xl border cursor-default transition-all duration-300"
      style={{
        borderColor: hovered ? item.color : '#dde8f5',
        background: '#fff',
        boxShadow: hovered ? `0 8px 30px ${item.color}18` : 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatedIconBox color={item.color} size="md" hovered={hovered} className="mb-4">
        <item.Icon size={20} strokeWidth={1.7} />
      </AnimatedIconBox>
      <h3 className="font-head font-bold text-[15px] text-charcoal mb-2">{item.title}</h3>
      <p className="text-[13px] leading-relaxed" style={{ color: '#5a6a7e' }}>{item.desc}</p>
    </div>
  )
}

function WhyHouznext() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Why Houznext</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[36px] text-charcoal">Why 500+ families chose us</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 90}>
              <WhyCard item={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

const REVIEWS = [
  { name: 'Priya Reddy',    location: 'Hyderabad',  rating: 5, text: 'Absolutely loved the experience. Our 3BHK looked stunning and was delivered in exactly 44 days. LiveBuild kept us in the loop every single day.', package: 'Premium Package' },
  { name: 'Suresh Naidu',   location: 'Warangal',   rating: 5, text: 'The fixed pricing was the main reason we chose Houznext. No hidden charges, no last-minute surprises. Exactly what we paid at the start.', package: 'Essential Package' },
  { name: 'Kavitha Sharma', location: 'Karimnagar', rating: 5, text: 'The 3D designs were photorealistic — I could visualise the space before work started. The kitchen came out even better than I imagined.', package: 'Luxury Package' },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: count }).map((_, i) => (
        <IconStar
          key={i}
          size={14}
          stroke="#f2994a"
          fill="#f2994a"
          strokeWidth={1}
        />
      ))}
    </div>
  )
}

function ReviewsSection() {
  return (
    <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Reviews</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[36px] text-charcoal">What our homeowners say</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 120} variant="zoom">
            <div
              key={r.name}
              className="p-6 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{ borderColor: '#dde8f5' }}
            >
              <StarRating count={r.rating} />
              <p className="text-[14px] leading-relaxed text-charcoal mb-4">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-head font-bold text-[13px] text-charcoal">{r.name}</p>
                  <p className="text-[11px]" style={{ color: '#5a6a7e' }}>{r.location}</p>
                </div>
                <span className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full" style={{ background: '#e8f1fd', color: '#2f80ed' }}>
                  {r.package}
                </span>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'What is the cost of 2BHK interiors in Hyderabad?',  a: 'Houznext 2BHK interior packages start from ₹4.5 lakhs (Essential) and go up to ₹18 lakhs (Luxury) — fixed price, all-inclusive.' },
  { q: 'How long does a 2BHK interior take?',               a: 'Most 2BHK projects are completed within 42–48 working days with our LiveBuild daily tracking system.' },
  { q: 'Does Houznext charge anything extra after quoting?', a: 'No. We guarantee fixed pricing — what is quoted before project start is exactly what you pay at the end.' },
  { q: 'What areas do you serve?',                           a: 'We currently serve Hyderabad, Warangal, Karimnagar, Nizamabad, Khammam and surrounding areas across Telangana.' },
  { q: 'What is LiveBuild?',                                 a: 'LiveBuild is our proprietary progress tracking platform. You get daily photo updates by room, design approvals, milestone payment tracking and snag management — all on your phone.' },
]

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <Reveal variant="fade" className="text-center mb-10">
          <EyebrowLabel className="justify-center mb-3">FAQ</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">Frequently asked questions</h2>
        </Reveal>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <Reveal key={i} delay={i * 70} duration={500}>
            <div className="rounded-xl border overflow-hidden transition-all duration-200" style={{ borderColor: open === i ? '#2f80ed' : '#dde8f5' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 transition-colors duration-200"
                style={{ background: open === i ? '#e8f1fd' : '#fff' }}
              >
                <span className="font-[600] text-[14px] text-charcoal">{faq.q}</span>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    background: open === i ? '#2f80ed' : '#f5f7fa',
                    color: open === i ? '#fff' : '#2f80ed',
                    transform: open === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    fontSize: 16,
                  }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div className="px-5 pb-4 pt-1 text-[13px] leading-relaxed" style={{ color: '#5a6a7e', background: '#fff' }}>
                  {faq.a}
                </div>
              )}
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── WaBar ────────────────────────────────────────────────────────────────────

function WaBar() {
  return (
    <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
      <Reveal variant="zoom" className="max-w-3xl mx-auto text-center">
        <h2 className="font-head font-bold text-[24px] md:text-[32px] text-white mb-3">
          Ready to start your dream interiors?
        </h2>
        <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Chat with our design advisor on WhatsApp for a free consultation
        </p>
        <a
          href="https://wa.me/919759750770?text=Hi%20Houznext%2C%20I%20want%20a%20free%20consultation"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-head font-bold text-white text-[15px] transition-all hover:-translate-y-0.5 hover:shadow-xl"
          style={{ background: '#25D366' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat on WhatsApp
        </a>
      </Reveal>
    </section>
  )
}
