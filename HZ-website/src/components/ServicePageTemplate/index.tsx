import { useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Reveal from '@/components/ui/Reveal'
import InteriorCalculator from '@/components/InteriorCalculator'
import { useQuoteModal } from '@/components/QuoteModal'
import {
  IconCamera,
  IconCheckCircle,
  IconSmartphone,
  IconCreditCard,
  IconStar,
} from '@/components/ui/Icons'
import LiveBuildHeroGraph from '@/components/LiveBuildHeroGraph'
import { ServiceContent } from '@/utils/servicesApi'

const BUILDLIVE_FEATURES = [
  { label: 'Daily photo updates by room' },
  { label: 'Design approval workflow' },
  { label: 'Milestone-based payments' },
  { label: 'Snag & punch list management' },
]

const REVIEWS = [
  {
    name: 'Priya Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'Absolutely loved the experience. Our 3BHK looked stunning and was delivered in exactly 44 days. LiveBuild kept us in the loop every single day.',
    package: 'Premium Package',
  },
  {
    name: 'Suresh Naidu',
    location: 'Warangal',
    rating: 5,
    text: 'The fixed pricing was the main reason we chose Houznext. No hidden charges, no last-minute surprises. Exactly what we paid at the start.',
    package: 'Essential Package',
  },
  {
    name: 'Kavitha Sharma',
    location: 'Karimnagar',
    rating: 5,
    text: 'The 3D designs were photorealistic — I could visualise the space before work started. The kitchen came out even better than I imagined.',
    package: 'Luxury Package',
  },
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
              <p
                className="text-[15px] leading-relaxed mb-6"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                LiveBuild is Houznext&apos;s proprietary project tracking system.
                See room-by-room progress, approve 3D designs, track milestone
                payments, and raise snags — all from your phone.
              </p>
              <ul className="space-y-3 mb-8">
                {BUILDLIVE_FEATURES.map(({ label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 text-[14px] group cursor-default"
                  >
                    <div
                      className="rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                      style={{
                        width: 6,
                        height: 6,
                        background: '#f2994a',
                      }}
                    />
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => router.push('/buildlive')}
                className="px-6 py-3 rounded-xl font-head font-bold text-white text-[14px] transition-all hover:-translate-y-0.5"
                style={{ background: '#2f80ed' }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background =
                    '#1a6dd6'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.background =
                    '#2f80ed'
                }}
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

function ReviewsSection() {
  return (
    <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Reviews</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[36px] text-charcoal">
            What our homeowners say
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 120} variant="zoom">
              <div
                className="p-6 rounded-2xl bg-white border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ borderColor: '#dde8f5' }}
              >
                <StarRating count={r.rating} />
                <p className="text-[14px] leading-relaxed text-charcoal mb-4">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-head font-bold text-[13px] text-charcoal">
                      {r.name}
                    </p>
                    <p className="text-[11px]" style={{ color: '#5a6a7e' }}>
                      {r.location}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full"
                    style={{ background: '#e8f1fd', color: '#2f80ed' }}
                  >
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

function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <Reveal variant="fade" className="text-center mb-10">
          <EyebrowLabel className="justify-center mb-3">FAQ</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">
            Frequently asked questions
          </h2>
        </Reveal>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Reveal key={i} delay={i * 70} duration={500}>
              <div
                className="rounded-xl border overflow-hidden transition-all duration-200"
                style={{ borderColor: open === i ? '#2f80ed' : '#dde8f5' }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 transition-colors duration-200"
                  style={{ background: open === i ? '#e8f1fd' : '#fff' }}
                >
                  <span className="font-[600] text-[14px] text-charcoal">
                    {faq.q}
                  </span>
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
                  <div
                    className="px-5 pb-4 pt-1 text-[13px] leading-relaxed"
                    style={{ color: '#5a6a7e', background: '#fff' }}
                  >
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

function TrustIconShield() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth={1.8}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrustIconClock() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  )
}

function TrustIconStar() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth={1.8} strokeLinejoin="round">
      <path d="M12 2l2.2 6.8h7l-5.7 4.1 2.2 6.8L12 15.8 6.3 19.7l2.2-6.8L2.8 8.8h7L12 2z" />
    </svg>
  )
}

interface ServicePageTemplateProps {
  service: ServiceContent
  includes: string[]
  why: string[]
  faqs: { q: string; a: string }[]
}

export default function ServicePageTemplate({
  service,
  includes,
  why,
  faqs,
}: ServicePageTemplateProps) {
  const { openModal } = useQuoteModal()
  const hasHero =
    typeof service.heroImageUrl === 'string' &&
    service.heroImageUrl.trim() !== ''

  return (
    <>
      <style>{`
        @keyframes hz-fade-up {
          from { opacity: 0; transform: translateY(14px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes hz-kb {
          from { transform: scale(1) }
          to   { transform: scale(1.04) }
        }
      `}</style>
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <section
          style={{
            position: 'relative',
            minHeight: 600,
            background: '#0f2a44',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {hasHero ? (
            <img
              src={service.heroImageUrl}
              alt=""
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                animation: 'hz-kb 12s ease forwards',
                zIndex: 0,
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                background:
                  'linear-gradient(135deg,#1a3a5c 0%,#0f2a44 60%,#1a2e40 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 18,
                  background: 'rgba(255,255,255,0.07)',
                  border: '2px dashed rgba(255,255,255,0.20)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width={28}
                  height={28}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1.5}
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.35)',
                }}
              >
                Hero background image
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'rgba(255,255,255,0.20)',
                }}
              >
                Recommended: 1440×600px · JPG/WebP
              </div>
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'none',
              background:
                'linear-gradient(105deg,rgba(15,42,68,0.95) 0%,rgba(15,42,68,0.82) 45%,rgba(15,42,68,0.58) 100%)',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: 1100,
              margin: '0 auto',
              padding: '64px 24px 56px',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                color: '#f2994a',
                fontSize: 10.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 2,
                  background: '#f2994a',
                  borderRadius: 1,
                }}
              />
              {service.heroEyebrow}
              <span
                style={{
                  width: 16,
                  height: 2,
                  background: '#f2994a',
                  borderRadius: 1,
                }}
              />
            </div>
            <h1
              className="font-head"
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 900,
                color: '#fff',
                lineHeight: 1.08,
                marginBottom: 14,
                maxWidth: 620,
              }}
            >
              {service.heroHeadline}
            </h1>
            <p
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.62)',
                lineHeight: 1.7,
                maxWidth: 520,
                marginBottom: 28,
              }}
            >
              {service.heroSubheading}
            </p>
            <button
              type="button"
              onClick={() => openModal()}
              style={{
                background: '#2f80ed',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: 10,
                display: 'inline-flex',
                gap: 7,
                alignItems: 'center',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget
                t.style.background = '#1a6dd6'
                t.style.transform = 'translateY(-2px)'
                t.style.boxShadow = '0 6px 20px rgba(47,128,237,0.35)'
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget
                t.style.background = '#2f80ed'
                t.style.transform = 'translateY(0)'
                t.style.boxShadow = 'none'
              }}
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
              </svg>
              {service.heroCta}
            </button>
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
                'linear-gradient(90deg,#2f80ed 0%,#f2994a 50%,#2f80ed 100%)',
            }}
          />
        </section>

        <section style={{ background: '#f8fafc', padding: '56px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-9">
              <Reveal variant="right">
                <div>
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#0f2a44',
                      marginBottom: 14,
                    }}
                  >
                    What&apos;s included
                  </h2>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    {includes.map((item) => (
                      <li
                        key={item}
                        style={{
                          fontSize: 13.5,
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          lineHeight: 1.55,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#2f80ed',
                            flexShrink: 0,
                            marginTop: 7,
                            display: 'block',
                          }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: '#0f2a44',
                      margin: '18px 0 9px',
                    }}
                  >
                    Why choose Houznext
                  </h3>
                  <ul
                    style={{
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {why.map((item) => (
                      <li
                        key={item}
                        style={{
                          fontSize: 13.5,
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 8,
                          lineHeight: 1.55,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#2f80ed',
                            flexShrink: 0,
                            marginTop: 7,
                            display: 'block',
                          }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: '#94a3b8',
                      borderTop: '1px solid #e2e8f0',
                      paddingTop: 12,
                      marginTop: 8,
                    }}
                  >
                    All projects include real-time LiveBuild tracking, fixed
                    pricing, and a 1-year workmanship warranty.
                  </p>
                </div>
              </Reveal>

              <div
                style={{
                  position: 'sticky',
                  top: 24,
                  alignSelf: 'start',
                  background: '#fff',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 22,
                }}
              >
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: '#0f2a44',
                    marginBottom: 5,
                  }}
                >
                  Ready to get started?
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: '#64748b',
                    lineHeight: 1.5,
                    marginBottom: 18,
                  }}
                >
                  Free consultation, no commitment needed.
                </p>
                <button
                  type="button"
                  onClick={() => openModal()}
                  style={{
                    width: '100%',
                    background: '#2f80ed',
                    color: '#fff',
                    fontSize: 13.5,
                    fontWeight: 800,
                    borderRadius: 9,
                    padding: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: 10,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1a6dd6'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#2f80ed'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <svg
                    width={14}
                    height={14}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M9 11l3 3L22 4" />
                  </svg>
                  {service.heroCta}
                </button>
                <a
                  href="https://wa.me/919759750770"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    background: '#25D366',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    borderRadius: 9,
                    padding: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#128C7E'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#25D366'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    margin: '14px 0',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    fontSize: 12,
                    color: '#64748b',
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                    <TrustIconShield />
                    Fixed price guarantee
                  </div>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                    <TrustIconClock />
                    45-day avg. delivery
                  </div>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                    <TrustIconStar />
                    4.8★ customer rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: '#fff', padding: '56px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <header style={{ textAlign: 'center', marginBottom: 36 }}>
              <EyebrowLabel className="justify-center mb-3">
                Cost Calculator
              </EyebrowLabel>
              <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal text-center">
                How much will your interiors cost?
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: '#64748b',
                  textAlign: 'center',
                  marginTop: 8,
                }}
              >
                Get a personalised estimate in 2 minutes
              </p>
            </header>
            <div className="flex justify-center mt-8">
              <InteriorCalculator />
            </div>
          </div>
        </section>

        <BuildLivePreview />
        <ReviewsSection />
        <FaqSection faqs={faqs} />
        <WaBar />
      </main>
      <Footer />
    </>
  )
}
