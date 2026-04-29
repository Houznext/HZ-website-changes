import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import LiveBuildHeroGraph from '@/components/LiveBuildHeroGraph'
import ServicesSection from '@/components/ServicesSection'
import { HERO_CONSULTATION_CSS } from '@/components/HeroConsultation/keyframes'
import HeroConsultationFormCard from '@/components/HeroConsultation/HeroConsultationFormCard'
import HeroSuccessModal from '@/components/HeroConsultation/HeroSuccessModal'

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
        description="Interior design for 2BHK, 3BHK and villas across Telangana. 45–60 day delivery, LiveBuild live tracking, 1-year warranty. Packages from ₹4.5L. 15+ homes delivered."
        canonical="/"
        schema={[localBusinessSchema, pricingFaqSchema]}
        ogImage="https://houznext.com/og-home.jpg"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <Hero />
        <MetricsStrip />
        <ServicesSection />
        <HowItWorks />
        <>
          <style>{`
    @keyframes hz-calc-proof {
      from { opacity: 0; transform: translateX(-12px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    .hz-calc-grid {
      min-height: 0;
    }
    @media (min-width: 768px) {
      .hz-calc-grid {
        min-height: 680px;
      }
    }
    .hz-calc-left-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      background: linear-gradient(135deg, rgba(15,42,68,0.92) 0%, rgba(15,42,68,0.72) 50%, rgba(15,42,68,0.50) 100%);
    }
    @media (max-width: 767px) {
      .hz-calc-left-overlay {
        background: linear-gradient(165deg, rgba(15,42,68,0.97) 0%, rgba(15,42,68,0.88) 42%, rgba(15,42,68,0.76) 100%);
      }
      .hz-calc-left-inner {
        -webkit-overflow-scrolling: touch;
      }
      .hz-proof-item {
        padding: 10px 12px;
        gap: 8px;
      }
    }
    @media (min-width: 768px) and (max-width: 1023px) {
      .hz-calc-left-overlay {
        background: linear-gradient(135deg, rgba(15,42,68,0.94) 0%, rgba(15,42,68,0.78) 52%, rgba(15,42,68,0.58) 100%);
      }
    }
    .hz-proof-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      background: rgba(255,255,255,0.07);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.10);
      transition: background 0.2s ease, border-color 0.2s ease,
                  transform 0.2s ease;
      cursor: default;
    }
    @media (hover: hover) and (pointer: fine) {
      .hz-proof-item:hover {
        background: rgba(255,255,255,0.13);
        border-color: rgba(255,255,255,0.22);
        transform: translateX(4px);
      }
    }
    .hz-left-photo {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      transition: transform 8s ease;
    }
    .hz-calc-section:hover .hz-left-photo {
      transform: scale(1.04);
    }
  `}</style>
          <section
            className="hz-calc-section"
            style={{ background: '#fff', overflow: 'hidden' }}
          >
            <div className="hz-calc-grid grid grid-cols-1 md:grid-cols-2">
              <div
                className="relative min-h-[400px] sm:min-h-[460px] md:min-h-[400px] overflow-hidden"
                style={{ background: '#0f2a44' }}
              >
                <div
                  className="hz-left-photo"
                  style={{
                    backgroundImage:
                      'url(https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&q=85)',
                  }}
                />
                <div className="hz-calc-left-overlay" />
                <div className="hz-calc-left-inner absolute inset-0 z-[2] flex flex-col justify-start overflow-y-auto py-10 px-5 sm:py-12 sm:px-7 md:justify-center md:overflow-visible md:py-[48px] md:px-[40px]">
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#f2994a',
                      marginBottom: 16,
                    }}
                  >
                    <span
                      style={{
                        display: 'block',
                        width: 16,
                        height: 2,
                        background: '#f2994a',
                        borderRadius: 1,
                      }}
                    />
                    Cost Calculator
                    <span
                      style={{
                        display: 'block',
                        width: 16,
                        height: 2,
                        background: '#f2994a',
                        borderRadius: 1,
                      }}
                    />
                  </div>
                  <h2
                    className="font-head font-black text-white mb-3 sm:mb-4 leading-[1.07]"
                    style={{
                      fontSize: 'clamp(26px, 5vw, 54px)',
                      letterSpacing: '-0.5px',
                    }}
                  >
                    Know your<br />
                    budget{' '}
                    <span style={{ color: '#2f80ed' }}>before</span>
                    <br />
                    you begin.
                  </h2>
                  <p
                    className="max-w-full md:max-w-[320px] mb-6 sm:mb-7 md:mb-7"
                    style={{
                      fontSize: 'clamp(13px, 2.8vw, 15px)',
                      color: 'rgba(255,255,255,0.62)',
                      lineHeight: 1.65,
                    }}
                  >
                    Get a personalised interior cost estimate in 2 minutes. No
                    sign-up. No commitment. Just clarity.
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div className="hz-proof-item">
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: 'rgba(47,128,237,0.20)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#2f80ed"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 22s-8-4.5-8-11V5l8-3 8 3v6c0 6.5-8 11-8 11z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          Fixed price guarantee
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.50)',
                            marginTop: 1,
                          }}
                        >
                          Quote = final invoice, always
                        </div>
                      </div>
                    </div>
                    <div className="hz-proof-item">
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: 'rgba(242,153,74,0.20)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#f2994a"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          45-day avg. delivery
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.50)',
                            marginTop: 1,
                          }}
                        >
                          Fastest in Telangana
                        </div>
                      </div>
                    </div>
                    <div className="hz-proof-item">
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: 'rgba(47,128,237,0.20)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#2f80ed"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          4.8★ from 680+ homeowners
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: 'rgba(255,255,255,0.50)',
                            marginTop: 1,
                          }}
                        >
                          Hyderabad, Warangal, Karimnagar
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    zIndex: 3,
                    background:
                      'linear-gradient(90deg, #2f80ed, #f2994a, #2f80ed)',
                  }}
                />
              </div>
              <div
                className="py-8 px-6 md:py-[48px] md:px-[40px]"
                style={{
                  background: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#f2994a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      width: 16,
                      height: 2,
                      background: '#f2994a',
                      borderRadius: 1,
                    }}
                  />
                  Your estimate
                </div>
                <h2
                  style={{
                    fontSize: 28,
                    fontWeight: 900,
                    color: '#0f2a44',
                    lineHeight: 1.15,
                    marginBottom: 6,
                    fontFamily: 'inherit',
                  }}
                >
                  How much will your<br />
                  interiors cost?
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: '#64748b',
                    lineHeight: 1.6,
                    marginBottom: 28,
                  }}
                >
                  Personalised estimate in 2 minutes — no sign-up needed
                </p>
                <InteriorCalculator />
              </div>
            </div>
          </section>
        </>
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

const HERO_ANIM_CSS =
  HERO_CONSULTATION_CSS +
  `
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
`

interface Particle {
  id: number
  size: number
  left: number
  duration: number
  delay: number
  opacity: number
}

/** Deterministic 0–1 from seed (pure integer math — identical in Node and browsers). */
function hzParticleFrac(seed: number): number {
  let t = (Math.imul(seed, 1664525) + 1013904223) >>> 0
  t = (t ^ (t >>> 9)) >>> 0
  t = Math.imul(t, 2654435761) >>> 0
  return t / 4294967296
}

/** Particles render only after mount so SSR HTML and the first client pass always match. */
function useParticles(count = 18): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([])
  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: hzParticleFrac(i * 7 + 1) * 4 + 2,
        left: hzParticleFrac(i * 7 + 2) * 100,
        duration: hzParticleFrac(i * 7 + 3) * 14 + 10,
        delay: hzParticleFrac(i * 7 + 4) * -22,
        opacity: hzParticleFrac(i * 7 + 5) * 0.35 + 0.08,
      })),
    )
  }, [count])
  return particles
}

const TRUST_BADGES = [
  { Icon: IconTrophy, label: '4.8★ Rating', color: '#f2994a', animClass: 'animate-hz-bounce' },
  { Icon: IconZap, label: '45–60 day delivery', color: '#2f80ed', animClass: 'animate-hz-spin-slow' },
  { Icon: IconLock, label: 'No cost overrun', color: '#2f80ed', animClass: 'animate-hz-bounce-delay' },
]


function Hero() {
  const router = useRouter()
  const particles = useParticles(18)

  const [showModal, setShowModal] = useState(false)
  const [submittedName, setSubmittedName] = useState('')

  // ── Carousel state ───────────────────────────────────
  const [slides, setSlides] = useState<string[]>([])
  const [settings, setSettings] = useState({
    intervalMs: 3000,
    showArrows: true,
    showDots: true,
    pauseOnHover: true,
    kenBurns: true,
  })
  const [curIdx, setCurIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const pausedRef = useRef(false)
  pausedRef.current = paused

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL
      || process.env.NEXT_PUBLIC_BACKEND_URL
      || 'http://localhost:4000'
    fetch(`${API}/hero-carousel/public`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.slides?.length) {
          setSlides(data.slides.map((s: { imageUrl: string }) => s.imageUrl))
        }
        if (data?.settings) {
          setSettings({
            intervalMs: data.settings.intervalMs ?? 3000,
            showArrows: data.settings.showArrows ?? true,
            showDots: data.settings.showDots ?? true,
            pauseOnHover: data.settings.pauseOnHover ?? true,
            kenBurns: data.settings.kenBurns ?? true,
          })
        }
      })
      .catch(() => {})
  }, [])

  const goTo = useCallback((n: number) => {
    if (!slides.length) return
    setPrevIdx(curIdx)
    const next = ((n % slides.length) + slides.length) % slides.length
    setCurIdx(next)
    setProgress(0)
    startRef.current = performance.now()
  }, [curIdx, slides.length])

  const goNext = useCallback(() => goTo(curIdx + 1), [curIdx, goTo])
  const goPrev = useCallback(() => goTo(curIdx - 1), [curIdx, goTo])

  useEffect(() => {
    if (!slides.length) return
    startRef.current = performance.now()
    const interval = settings.intervalMs

    function tick(now: number) {
      if (!pausedRef.current) {
        const elapsed = now - startRef.current
        const pct = Math.min(100, (elapsed / interval) * 100)
        setProgress(pct)
        if (pct >= 100) {
          setCurIdx(prev => {
            const next = (prev + 1) % slides.length
            setPrevIdx(prev)
            return next
          })
          setProgress(0)
          startRef.current = performance.now()
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [slides.length, settings.intervalMs])

  useEffect(() => {
    startRef.current = performance.now()
    setProgress(0)
  }, [curIdx])

  const handleMouseEnter = useCallback(() => {
    if (settings.pauseOnHover) setPaused(true)
  }, [settings.pauseOnHover])

  const handleMouseLeave = useCallback(() => {
    if (settings.pauseOnHover) {
      setPaused(false)
      startRef.current = performance.now()
    }
  }, [settings.pauseOnHover])

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

      <style>{`
        @keyframes hz-kb { from { transform: scale(1); } to { transform: scale(1.06); } }
        .hz-slide-bg { position: absolute; inset: 0; background-size: cover; background-position: center; background-repeat: no-repeat; }
        .hz-slide-bg.hz-kb-active { animation: hz-kb 6s ease forwards; }
      `}</style>

      <section
        className="relative overflow-hidden"
        style={{ background: '#0f2a44' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <style dangerouslySetInnerHTML={{ __html: HERO_ANIM_CSS }} />

        {/* ── Image carousel layer — only images animate ── */}
        {slides.length > 0 && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            {slides.map((url, i) => {
              const isActive = i === curIdx
              const isPrev = i === prevIdx
              return (
                <div
                  key={url + i}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: isActive ? 1 : 0,
                    transition: isPrev
                      ? 'opacity 1s ease'
                      : isActive
                      ? 'opacity 1s ease'
                      : 'none',
                    zIndex: isActive ? 2 : isPrev ? 1 : 0,
                  }}
                >
                  <div
                    className={
                      'hz-slide-bg' +
                      (isActive && settings.kenBurns ? ' hz-kb-active' : '')
                    }
                    style={{ backgroundImage: `url(${url})` }}
                  />
                </div>
              )
            })}
          </div>
        )}

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            zIndex: 1,
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

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-16 lg:py-20" style={{ zIndex: 2 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 xl:gap-14 items-center">
            <div className="animate-fade-up min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-4 sm:mb-5">
                <div
                  className="h-0.5 animate-hz-expand-line flex-shrink-0"
                  style={{ width: 28, background: '#f2994a', borderRadius: 1 }}
                />
                <span
                  className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] leading-snug"
                  style={{ color: '#f2994a' }}
                >
                  15+ homes delivered
                </span>
              </div>

              <h1
                className="font-head font-black text-white mb-3 sm:mb-4 leading-[1.1] sm:leading-[1.08] max-w-[22ch] sm:max-w-none"
                style={{
                  fontSize: 'clamp(22px, 4.5vw, 48px)',
                  letterSpacing: '-0.35px',
                }}
              >
                Making Home Interiors <span style={{ color: '#2f80ed' }}>Effortless</span>.
              </h1>

              <p
                className="text-[16px] sm:text-[17px] md:text-[19px] mb-7 sm:mb-8 leading-relaxed max-w-xl"
                style={{ color: 'rgba(255,255,255,0.62)', letterSpacing: '0.01em' }}
              >
                Turnkey home interiors with real-time LiveBuild updates, ensuring everything stays on time and within budget.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-7 sm:mb-8">
                <button
                  type="button"
                  onClick={() => void router.push('/interiors')}
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
                  Explore interiors →
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

              <div className="flex flex-wrap gap-x-4 gap-y-3 sm:gap-5">
                {TRUST_BADGES.map(({ Icon, label, color, animClass }) => (
                  <div key={label} className="flex items-center gap-2 min-w-0 cursor-default group">
                    <div
                      className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6"
                      style={{ background: `${color}22` }}
                    >
                      <div className={animClass}>
                        <Icon size={14} strokeWidth={2} stroke={color} />
                      </div>
                    </div>
                    <span
                      className="text-[11.5px] sm:text-[12.5px] font-[500] leading-snug"
                      style={{ color: 'rgba(255,255,255,0.72)' }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-in w-full">
              <div className="flex flex-col lg:grid lg:gap-3 gap-3" style={{ gridTemplateColumns: 'minmax(300px, 36%) 1fr' }}>
                <HeroConsultationFormCard
                  tellUsMoreSourceLine="Source: Homepage hero (email not collected on this form)."
                  onSuccess={(n) => {
                    setSubmittedName(n)
                    setShowModal(true)
                  }}
                />

                <LiveBuildHeroGraph />
              </div>
            </div>
          </div>
        </div>

        {/* ── Gradient overlay so text stays legible ── */}
        {slides.length > 0 && (
          <div
            style={{
              position: 'absolute', inset: 0, zIndex: 1,
              background:
                'linear-gradient(105deg, rgba(15,42,68,0.93) 0%, rgba(15,42,68,0.78) 45%, rgba(15,42,68,0.32) 100%)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* ── Progress bar ── */}
        {slides.length > 1 && (
          <div
            style={{
              position: 'absolute', bottom: 0, left: 0,
              height: 3, zIndex: 10,
              background: '#f2994a',
              width: `${progress}%`,
              transition: 'width 0.1s linear',
            }}
          />
        )}

        {/* ── Dots ── */}
        {slides.length > 1 && settings.showDots && (
          <div
            style={{
              position: 'absolute', bottom: 18, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', gap: 8, zIndex: 10,
            }}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === curIdx ? 24 : 8,
                  height: 8,
                  borderRadius: i === curIdx ? 4 : '50%',
                  background: i === curIdx
                    ? '#f2994a'
                    : 'rgba(255,255,255,0.35)',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Arrows ── */}
        {slides.length > 1 && settings.showArrows && (
          <>
            <button
              onClick={goPrev}
              style={{
                position: 'absolute', left: 14,
                top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                cursor: 'pointer', zIndex: 10,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement)
                  .style.background = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement)
                  .style.background = 'rgba(255,255,255,0.10)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={goNext}
              style={{
                position: 'absolute', right: 14,
                top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                cursor: 'pointer', zIndex: 10,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement)
                  .style.background = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement)
                  .style.background = 'rgba(255,255,255,0.10)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24"
                fill="none" stroke="#fff" strokeWidth="2.2"
                strokeLinecap="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </>
        )}
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
  { num: 15,  decimals: 0, suffix: '+',  label: 'Homes Delivered',       sub: 'Across Telangana',      color: '#2f80ed', Icon: IconHome },
  { num: 4.8,  decimals: 1, suffix: '★',  label: 'Average Rating',        sub: '680+ verified reviews', color: '#f2994a', Icon: IconStar },
  { num: 45,   decimals: 0, suffix: 'd',  label: 'Avg. Delivery',         sub: 'Fastest in the market', color: '#2f80ed', Icon: IconClock },
  { num: 100,  decimals: 0, suffix: '%',  label: 'Fixed-Price Projects',  sub: 'Zero surprises',        color: '#f2994a', Icon: IconTag },
  { num: 4,   decimals: 0, suffix: '+',  label: 'Cities Served',         sub: 'Growing every month',   color: '#2f80ed', Icon: IconMapPin },
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

      {/* Count-up number — suppressHydrationWarning: IO can flip visible before paint in edge cases */}
      <p
        className="font-head font-black text-[28px] leading-none tabular-nums"
        style={{ color: m.color }}
        suppressHydrationWarning
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
                  onClick={() => openModal('Homepage — request proposal strip')}
                  className="w-full py-2.5 rounded-xl text-[13px] font-head font-bold transition-all hover:-translate-y-px"
                  style={
                    pkg.highlighted
                      ? { background: '#2f80ed', color: '#fff' }
                      : { background: '#f5f7fa', color: '#2f80ed', border: '1px solid #dde8f5' }
                  }
                >
                  Request {pkg.name} consultation →
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

          <Reveal variant="left" delay={180}>
            <div className="flex justify-center md:justify-end w-full animate-float">
              <div className="w-full max-w-[min(100%,400px)] sm:max-w-md mx-auto md:mx-0">
                <LiveBuildHeroGraph />
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
  { num: 15, decimals: 0, suffix: '+',  label: 'Homes delivered' },
  { num: 48,  decimals: 0, suffix: 'd',  label: 'Average delivery' },
  { num: 4.8, decimals: 1, suffix: '★',  label: 'Customer rating' },
  { num: 4,  decimals: 0, suffix: '+',  label: 'Cities served' },
]

function StatCounter({ stat, active }: { stat: StatDef; active: boolean }) {
  const count = useCountUp(stat.num, stat.decimals, active, 1800)
  const display = stat.decimals > 0 ? count.toFixed(stat.decimals) : Math.floor(count).toString()
  return (
    <div className="text-center">
      <p
        className="font-head font-black text-[40px] text-white leading-none tabular-nums"
        suppressHydrationWarning
      >
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
  { Icon: IconShield,     color: '#2f80ed', title: '10 years warranty',      desc: 'All work is covered for 10 years - Terms and conditions apply' },
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
