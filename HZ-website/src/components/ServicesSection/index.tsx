import { useState, useEffect, type CSSProperties } from 'react'
import { useRouter } from 'next/router'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Reveal from '@/components/ui/Reveal'
import { useQuoteModal } from '@/components/QuoteModal'
import {
  ServiceContent,
  fetchAllServices,
} from '@/utils/servicesApi'

const SLUG_TO_ROUTE: Record<string, string> = {
  'full-home-interiors': '/services/full-home-interiors',
  'modular-kitchen': '/services/modular-kitchen',
  '2bhk-3bhk-packages': '/services/2bhk-3bhk-packages',
  'commercial-interiors': '/services/commercial-interiors',
}

const PLACEHOLDER_COLOURS: Record<
  string,
  {
    bg: string
    accent: string
    hoverBg: string
    iconBoxBg: string
    iconBoxBorder: string
  }
> = {
  'full-home-interiors': {
    bg: '#e8f1fd',
    accent: '#2f80ed',
    hoverBg: '#dce8fc',
    iconBoxBg: 'rgba(47,128,237,0.12)',
    iconBoxBorder: 'rgba(47,128,237,0.30)',
  },
  'modular-kitchen': {
    bg: '#e8f5ee',
    accent: '#16a34a',
    hoverBg: '#d8efe0',
    iconBoxBg: 'rgba(22,163,74,0.12)',
    iconBoxBorder: 'rgba(22,163,74,0.30)',
  },
  '2bhk-3bhk-packages': {
    bg: '#fff7ed',
    accent: '#f2994a',
    hoverBg: '#ffedd5',
    iconBoxBg: 'rgba(242,153,74,0.12)',
    iconBoxBorder: 'rgba(242,153,74,0.30)',
  },
  'commercial-interiors': {
    bg: '#f3e8ff',
    accent: '#8b5cf6',
    hoverBg: '#ede4fa',
    iconBoxBg: 'rgba(139,92,246,0.12)',
    iconBoxBorder: 'rgba(139,92,246,0.30)',
  },
}

const EMPTY_FALLBACK: ServiceContent[] = [
  {
    id: 0,
    slug: 'full-home-interiors',
    cardTitle: 'Full Home Interiors',
    cardDescription:
      'Complete turnkey interior solutions — from design to handover. Every room, every detail, managed by us.',
    cardImageUrl: '',
    cardBadge: 'Most Popular',
    heroHeadline: '',
    heroSubheading: '',
    heroImageUrl: '',
    heroEyebrow: '',
    heroCta: '',
    sortOrder: 0,
    active: true,
  },
  {
    id: 0,
    slug: 'modular-kitchen',
    cardTitle: 'Modular Kitchen & Wardrobes',
    cardDescription:
      'Smart, space-efficient kitchens and storage solutions designed for everyday living and lasting quality.',
    cardImageUrl: '',
    cardBadge: 'Storage Solutions',
    heroHeadline: '',
    heroSubheading: '',
    heroImageUrl: '',
    heroEyebrow: '',
    heroCta: '',
    sortOrder: 1,
    active: true,
  },
  {
    id: 0,
    slug: '2bhk-3bhk-packages',
    cardTitle: '2BHK / 3BHK Interior Packages',
    cardDescription:
      'Clear, fixed-price packages for your home. Know exactly what you get and what you pay — before work begins.',
    cardImageUrl: '',
    cardBadge: 'Budget Friendly',
    heroHeadline: '',
    heroSubheading: '',
    heroImageUrl: '',
    heroEyebrow: '',
    heroCta: '',
    sortOrder: 2,
    active: true,
  },
  {
    id: 0,
    slug: 'commercial-interiors',
    cardTitle: 'Commercial Interiors',
    cardDescription:
      'Functional, modern office and retail spaces designed to match your business goals and team culture.',
    cardImageUrl: '',
    cardBadge: 'Commercial',
    heroHeadline: '',
    heroSubheading: '',
    heroImageUrl: '',
    heroEyebrow: '',
    heroCta: '',
    sortOrder: 3,
    active: true,
  },
]

function badgeStyle(slug: string, badge: string): CSSProperties {
  if (!badge) return { display: 'none' }
  const base: CSSProperties = {
    position: 'absolute',
    top: 12,
    left: 12,
    fontSize: 10,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 20,
    letterSpacing: '0.03em',
    backdropFilter: 'blur(4px)',
  }
  switch (slug) {
    case 'full-home-interiors':
      return { ...base, background: 'rgba(47,128,237,0.92)', color: '#fff' }
    case 'modular-kitchen':
      return { ...base, background: 'rgba(22,163,74,0.92)', color: '#fff' }
    case '2bhk-3bhk-packages':
      return { ...base, background: 'rgba(242,153,74,0.92)', color: '#7c3a00' }
    case 'commercial-interiors':
      return { ...base, background: 'rgba(139,92,246,0.92)', color: '#fff' }
    default:
      return { ...base, background: 'rgba(47,128,237,0.92)', color: '#fff' }
  }
}

function PlaceholderIcon({ slug, accent }: { slug: string; accent: string }) {
  const sw = 1.75
  const common = {
    width: 26,
    height: 26,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: accent,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (slug === 'full-home-interiors') {
    return (
      <svg {...common}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" />
      </svg>
    )
  }
  if (slug === 'modular-kitchen') {
    return (
      <svg {...common}>
        <rect x="3" y="11" width="18" height="10" rx="1" />
        <path d="M3 11V8a2 2 0 012-2h14a2 2 0 012 2v3" />
        <path d="M8 21V11M16 21V11" />
      </svg>
    )
  }
  if (slug === '2bhk-3bhk-packages') {
    return (
      <svg {...common}>
        <path d="M3 20l9-14 9 14H3z" />
        <path d="M9 20v-5h6v5" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <rect x="2" y="6" width="20" height="15" rx="1" />
      <rect x="2" y="6" width="20" height="5" />
    </svg>
  )
}

export default function ServicesSection() {
  const [services, setServices] = useState<ServiceContent[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)
  const { openModal } = useQuoteModal()
  const router = useRouter()

  useEffect(() => {
    fetchAllServices().then((data) => {
      setServices(data)
      setLoading(false)
    })
  }, [])

  const displayList =
    !loading && services.length === 0 ? EMPTY_FALLBACK : services

  return (
    <>
      <style>{`
        @keyframes hz-fade-up {
          from { opacity: 0; transform: translateY(14px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes hz-arrow-slide {
          from { transform: translateX(0) }
          to   { transform: translateX(4px) }
        }
      `}</style>
      <section style={{ background: '#fff', padding: '72px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <header style={{ textAlign: 'center', marginBottom: 48 }}>
            <EyebrowLabel className="justify-center mb-4">
              Our Services
            </EyebrowLabel>
            <Reveal variant="fade">
              <h2
                className="font-head"
                style={{
                  fontSize: 'clamp(24px, 4vw, 32px)',
                  fontWeight: 900,
                  color: '#0f2a44',
                  lineHeight: 1.15,
                  marginTop: 10,
                }}
              >
                Everything your home needs,{' '}
                <br className="hidden md:block" />
                handled in one place
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: '#64748b',
                  lineHeight: 1.65,
                  maxWidth: 580,
                  margin: '10px auto 0',
                }}
              >
                At Houznext, we don&apos;t just design interiors — we take
                complete responsibility for your home. From understanding your
                space to final installation, every step is planned and executed
                with care.
              </p>
            </Reveal>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((k) => (
                <div
                  key={k}
                  className="animate-pulse bg-gray-100 rounded-[18px] h-[320px]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayList.map((service) => {
                const slug = service.slug
                const route = SLUG_TO_ROUTE[slug]
                const ph = PLACEHOLDER_COLOURS[slug] || PLACEHOLDER_COLOURS['full-home-interiors']
                const hasImg =
                  typeof service.cardImageUrl === 'string' &&
                  service.cardImageUrl.trim() !== ''
                const isHover = hoveredSlug === slug
                return (
                  <div
                    key={`${slug}-${service.id}`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && route) router.push(route)
                    }}
                    onClick={() => {
                      if (route) router.push(route)
                    }}
                    onMouseEnter={() => setHoveredSlug(slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                    style={{
                      background: '#fff',
                      border: `1.5px solid ${isHover ? '#93c5fd' : '#e2e8f0'}`,
                      borderRadius: 18,
                      overflow: 'hidden',
                      cursor: route ? 'pointer' : 'default',
                      transition: 'all 0.28s ease',
                      transform: isHover ? 'translateY(-6px)' : 'translateY(0)',
                      boxShadow: isHover
                        ? '0 16px 48px rgba(15,42,68,0.12)'
                        : 'none',
                    }}
                  >
                    <div
                      style={{
                        height: 200,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {hasImg ? (
                        <>
                          <img
                            src={service.cardImageUrl}
                            alt={service.cardTitle}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.5s ease',
                              transform: isHover ? 'scale(1.07)' : 'scale(1)',
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background:
                                'linear-gradient(180deg,transparent 40%,rgba(15,42,68,0.6) 100%)',
                              pointerEvents: 'none',
                            }}
                          />
                        </>
                      ) : (
                        <div
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = ph.hoverBg
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = ph.bg
                          }}
                          style={{
                            background: ph.bg,
                            width: '100%',
                            height: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            transition: 'background 0.3s',
                          }}
                        >
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 14,
                              background: ph.iconBoxBg,
                              border: `2px dashed ${ph.iconBoxBorder}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PlaceholderIcon slug={slug} accent={ph.accent} />
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: ph.accent,
                              opacity: 0.75,
                              textAlign: 'center',
                              letterSpacing: '0.03em',
                            }}
                          >
                            {service.cardTitle}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: '#94a3b8',
                              marginTop: 3,
                            }}
                          >
                            Recommended: 600×400px
                          </div>
                        </div>
                      )}
                      {service.cardBadge ? (
                        <span style={badgeStyle(slug, service.cardBadge)}>
                          {service.cardBadge}
                        </span>
                      ) : null}
                    </div>

                    <div style={{ padding: '18px 18px 20px' }}>
                      <h3
                        style={{
                          fontSize: 14.5,
                          fontWeight: 800,
                          color: '#0f2a44',
                          marginBottom: 7,
                          lineHeight: 1.3,
                        }}
                      >
                        {service.cardTitle}
                      </h3>
                      <p
                        style={{
                          fontSize: 12.5,
                          color: '#64748b',
                          lineHeight: 1.6,
                          marginBottom: 14,
                        }}
                      >
                        {service.cardDescription}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: isHover ? 9 : 5,
                          alignItems: 'center',
                          transition: 'gap 0.2s ease',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12.5,
                            fontWeight: 700,
                            color: '#2f80ed',
                          }}
                        >
                          Explore service
                        </span>
                        <svg
                          width={13}
                          height={13}
                          viewBox="0 0 14 14"
                          fill="none"
                          style={{
                            animation: isHover
                              ? 'hz-arrow-slide 0.35s ease forwards'
                              : 'none',
                          }}
                        >
                          <path
                            d="M2 7h10M7 2l5 5-5 5"
                            stroke="#2f80ed"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div
            style={{
              marginTop: 40,
              textAlign: 'center',
              padding: '32px 24px',
              background: '#f8fafc',
              borderRadius: 16,
              border: '1.5px solid #e2e8f0',
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 900,
                color: '#0f2a44',
                marginBottom: 8,
              }}
            >
              Not sure where to start?
            </h3>
            <p
              style={{
                fontSize: 13.5,
                color: '#64748b',
                marginBottom: 18,
              }}
            >
              Talk to our design team — free, no commitment needed.
            </p>
            <button
              type="button"
              onClick={() => openModal()}
              style={{
                background: '#2f80ed',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
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
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
              </svg>
              Get free consultation
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
