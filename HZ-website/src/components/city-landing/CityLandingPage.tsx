import { useCallback, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import toast from 'react-hot-toast'
import SeoHead from '@/components/SeoHead'
import apiClient from '@/utils/apiClient'
import type { CityLandingContent } from '@/lib/cityLandingCms'
import type { CitySlug } from '@/lib/cityLandingRegistry'
import type { InteriorProject } from '@/types/interior-project'
import { getCityMeta, buildCitySchema } from '@/lib/cityLandingRegistry'
import { pushDataLayer } from '@/lib/analytics'
import {
  CITY_LINKS,
  MOB_NAV_LINKS,
  NAV_LINKS,
  PROPERTY_TYPES,
  SERVICE_ICON_META,
  WHY_US_ICONS,
} from '@/components/city-landing/shared/constants'
import { parseStatValue } from '@/components/city-landing/parseStatValue'
import { useStatsCounter } from '@/components/city-landing/useStatsCounter'

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

function HomeIcon({ size = 22, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ServiceIcon({ type, color }: { type: string; color: string }) {
  switch (type) {
    case 'grid':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      )
    case 'wardrobe':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="12" y1="3" x2="12" y2="21" />
        </svg>
      )
    case 'ceiling':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
        </svg>
      )
    case 'tv':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" />
        </svg>
      )
    case 'paint':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    default:
      return <HomeIcon size={22} color={color} />
  }
}

function WhyIcon({ type }: { type: string }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const }
  switch (type) {
    case 'check':
      return <svg {...props}><polyline points="20 6 9 17 4 12" /></svg>
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    case 'card':
      return <svg {...props}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
    case 'chat':
      return <svg {...props}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
    case 'shield':
      return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    default:
      return <svg {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="6" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
  }
}

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function pushLeadEvent(leadSource: string, cityName: string) {
  pushDataLayer({
    event: 'lead_submission',
    form_source: leadSource,
    city: cityName,
  })
}

function formatProjectCost(costInLakhs?: number | null): string {
  if (costInLakhs == null || !Number.isFinite(Number(costInLakhs))) return ''
  return `₹${costInLakhs}L`
}

function formatProjectMeta(project: InteriorProject): string {
  const parts = [project.propertyType].filter(Boolean)
  if (project.sqft) parts.push(`${project.sqft} sqft`)
  return parts.join(' · ')
}

export default function CityLandingPage({
  content,
  citySlug,
  landingProjects = [],
}: {
  content: CityLandingContent
  citySlug: CitySlug
  landingProjects?: InteriorProject[]
}) {
  const meta = getCityMeta(citySlug)
  const schema = buildCitySchema(citySlug)
  const landingRef = useRef<HTMLDivElement>(null)
  useStatsCounter(landingRef)
  const [mobOpen, setMobOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [area, setArea] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const consultationRef = useRef<HTMLDivElement>(null)

  const scrollToConsultation = useCallback(() => {
    consultationRef.current?.scrollIntoView({ behavior: 'smooth' })
    setMobOpen(false)
  }, [])

  const isValid = name.trim().length >= 2 && /^\d{10}$/.test(phone.trim()) && propertyType && area

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      const res = await apiClient.post(apiClient.URLS.contact_us, {
        firstName: name.trim(),
        lastName: '-',
        contactNumber: phone.trim(),
        emailAddress: `noreply+${meta.slug}@houznext.com`,
        tellUsMore: [
          `source: ${meta.leadSource}`,
          `city: ${meta.name}`,
          propertyType ? `Property: ${propertyType}` : '',
          area ? `Area: ${area}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
        serviceType: 'Home Interiors',
        city: meta.name,
      })
      if (res.status === 201 || res.status === 200) {
        pushLeadEvent(meta.leadSource, meta.name)
        setName('')
        setPhone('')
        setPropertyType('')
        setArea('')
        toast.success(`Thank you! Our ${meta.name} team will reach out within 2 hours.`)
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch (err) {
      console.warn('[vikarabad-landing] Lead API failed:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SeoHead
        title={content.seo.title}
        description={content.seo.description}
        canonical={meta.path}
        schema={schema}
        ogImage="https://houznext.com/og-home.jpg"
      />
      <Head>
        <meta name="keywords" content={content.seo.keywords} />
        <meta name="theme-color" content="#0f2a44" />
      </Head>

      <div className="vik-landing" ref={landingRef}>
        <nav className="nb">
          <div className="nbi">
            <Link href="/" className="logo">
              <img src="/images/Houznext Logo.png" alt="Houznext" className="vik-logo" />
            </Link>
            <div className="nl">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </div>
            <a href="#consultation" className="nb-cta" onClick={(e) => { e.preventDefault(); scrollToConsultation() }}>
              Free Consultation
            </a>
            <button type="button" className="nb-mob" onClick={() => setMobOpen((o) => !o)} aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
          <div className={`mob-drawer${mobOpen ? ' open' : ''}`}>
            {MOB_NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="mob-d-item" onClick={() => setMobOpen(false)}>
                {l.label}
              </Link>
            ))}
            <button type="button" className="mob-d-cta" onClick={scrollToConsultation}>
              Free Consultation
            </button>
          </div>
        </nav>

        <section className="hero">
          <div
            className="hero-bg-img"
            style={{
              backgroundImage: `url(${content.hero.heroImageUrl})`,
              opacity: content.hero.heroImageOpacity / 100,
            }}
            aria-hidden
          />
          <div className="mw">
            <div className="hero-i">
              <div>
                <div className="hero-eyebrow">{content.hero.eyebrow}</div>
                <h1>
                  {content.hero.titleBefore}<span className="hl">{content.hero.titleHighlight}</span>
                </h1>
                <p className="hero-sub">{content.hero.subtitle}</p>
                <div className="hero-ctas">
                  <a href="#consultation" className="btn-pri" onClick={(e) => { e.preventDefault(); scrollToConsultation() }}>
                    Get free consultation
                    <ArrowIcon />
                  </a>
                  <a href="#pricing" className="btn-sec">
                    View packages
                  </a>
                </div>
                <div className="hero-trust">
                  {content.hero.trustBadges.map((label) => (
                    <div key={label} className="htm">
                      <CheckIcon />
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-form" id="consultation" ref={consultationRef}>
                <div className="hf-title">Free Consultation</div>
                <div className="hf-sub">Design team online · responds in &lt;2 hrs</div>
                <form onSubmit={handleSubmit} noValidate>
                  <input type="hidden" name="source" value={meta.leadSource} />
                  <input type="hidden" name="city" value={meta.name} />
                  <input
                    className="fi"
                    type="text"
                    placeholder="Full name *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    className="fi"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Phone number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                  <select className="fi" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} required>
                    <option value="">Property type *</option>
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt} value={pt}>
                        {pt}
                      </option>
                    ))}
                  </select>
                  <select className="fi" value={area} onChange={(e) => setArea(e.target.value)} required>
                    <option value="">Area in {meta.name}</option>
                    {content.areaOptions.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="hf-btn" disabled={!isValid || submitting}>
                    {submitting ? 'Sending…' : 'Request free consultation'}
                  </button>
                  <div className="hf-note">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Private &amp; secure — no spam, ever
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="mw">
            <div className="stats-g">
              {content.stats.map((s) => {
                const { target, suffix, initial } = parseStatValue(s.n)
                return (
                <div key={s.l}>
                  <div className="stat-n" data-target={target} data-suffix={suffix}>{initial}</div>
                  <div className="stat-l">{s.l}</div>
                  <div className="stat-s">{s.s}</div>
                </div>
              )})}
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="mw">
            <div className="intro-grid">
              <div className="intro">
                <div className="sec-eyebrow">{content.intro.eyebrow}</div>
                <h2 className="sec-h2">{content.intro.title}</h2>
                {content.intro.paragraphs.map((para) => (
                  <p key={para.slice(0, 40)}>{para}</p>
                ))}
              </div>
              <div className="intro-img">
                <HomeIcon size={80} color="rgba(47,128,237,0.2)" />
                <div className="badge">
                  <div className="badge-d" />
                  <div className="badge-t">{content.intro.badgeText}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sec serv-bg">
          <div className="mw">
            <div className="sec-head">
              <div className="sec-eyebrow">{content.services.eyebrow}</div>
              <h2 className="sec-h2">{content.services.title}</h2>
              <p className="sec-sub">{content.services.subtitle}</p>
            </div>
            <div className="serv-g">
              {content.services.items.map((s, i) => {
                const iconMeta = SERVICE_ICON_META[i] ?? SERVICE_ICON_META[0]
                return (
                <div key={`${s.title}-${i}`} className="serv-c">
                  <div className="serv-ic" style={{ background: iconMeta.iconBg, color: iconMeta.iconColor }}>
                    <ServiceIcon type={iconMeta.icon} color={iconMeta.iconColor} />
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <div className="serv-meta">{s.meta}</div>
                </div>
              )})}
            </div>
          </div>
        </section>

        <section className="sec proc-bg">
          <div className="mw">
            <div className="sec-head">
              <div className="sec-eyebrow">{content.process.eyebrow}</div>
              <h2 className="sec-h2">{content.process.title}</h2>
              <p className="sec-sub">{content.process.subtitle}</p>
            </div>
            <div className="proc-g">
              {content.process.steps.map((step) => (
                <div key={step.n} className="proc-c">
                  <div className="proc-n">{step.n}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec" id="pricing">
          <div className="mw">
            <div className="sec-head">
              <div className="sec-eyebrow">{content.pricing.eyebrow}</div>
              <h2 className="sec-h2">{content.pricing.title}</h2>
              <p className="sec-sub">{content.pricing.subtitle}</p>
            </div>
            <div className="pri-g">
              {content.pricing.packages.map((pkg) => (
                <div key={pkg.name} className={`pri-c${pkg.popular ? ' pop' : ''}`}>
                  {pkg.popular && <div className="pri-pop-tag">Most Popular</div>}
                  <div className="pri-name">{pkg.name}</div>
                  <div className="pri-amt">{pkg.amount}</div>
                  <div className="pri-from">{pkg.from}</div>
                  <ul className="pri-feat">
                    {pkg.features.map((f) => (
                      <li key={f}>
                        <CheckIcon />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="#consultation" className="pri-btn" onClick={(e) => { e.preventDefault(); scrollToConsultation() }}>
                    Free Consultation
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec serv-bg">
          <div className="mw">
            <div className="sec-head">
              <div className="sec-eyebrow">{content.projects.eyebrow}</div>
              <h2 className="sec-h2">{content.projects.title}</h2>
              <p className="sec-sub">{content.projects.subtitle}</p>
            </div>
            {landingProjects.length > 0 && (
            <div className="proj-g">
              {landingProjects.slice(0, 4).map((p, index) => {
                const cover = p.images?.[0]?.trim() || ''
                const gradientIndex = (index % 6) + 1
                const days = p.deliveryDays ? `${p.deliveryDays} days` : ''
                const cost = formatProjectCost(p.costInLakhs)
                return (
                  <div key={p.id} className="proj-c">
                    <div
                      className={`proj-img proj-img-${gradientIndex}${cover ? ' has-photo' : ''}`}
                      style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                    >
                      {!cover && <HomeIcon size={60} color="rgba(255,255,255,0.4)" />}
                      {p.package && <span className="proj-pkg">{p.package}</span>}
                      {days && <span className="proj-days">{days}</span>}
                    </div>
                    <div className="proj-body">
                      <div className="proj-meta">{formatProjectMeta(p)}</div>
                      <h3>{p.title}</h3>
                      <div className="proj-loc">
                        <PinIcon />
                        {p.location}
                      </div>
                      {cost && (
                        <div className="proj-cost">
                          {cost} <span>final invoice</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            )}
            <div className="proj-more-wrap">
              <Link href="/projects" className="proj-more-btn">
                See more projects
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="mw">
            <div className="sec-head">
              <div className="sec-eyebrow">{content.whyUs.eyebrow}</div>
              <h2 className="sec-h2">{content.whyUs.title}</h2>
              <p className="sec-sub">{content.whyUs.subtitle}</p>
            </div>
            <div className="why-g">
              {content.whyUs.items.map((w, i) => {
                const iconMeta = WHY_US_ICONS[i] ?? WHY_US_ICONS[0]
                return (
                <div key={`${w.title}-${i}`} className="why-c">
                  <div className="why-ic">
                    <WhyIcon type={iconMeta.icon} />
                  </div>
                  <h3>{w.title}</h3>
                  <p>{w.desc}</p>
                </div>
              )})}
            </div>
          </div>
        </section>

        <section className="sec test-bg">
          <div className="mw">
            <div className="sec-head">
              <div className="sec-eyebrow">{content.testimonials.eyebrow}</div>
              <h2 className="sec-h2">{content.testimonials.title}</h2>
              <p className="sec-sub">{content.testimonials.subtitle}</p>
            </div>
            <div className="test-g">
              {content.testimonials.items.map((t) => (
                <div key={t.name} className="test-c">
                  <div className="test-stars">★★★★★</div>
                  <p className="test-q">{t.q}</p>
                  <div className="test-author">
                    <div className="test-av">{t.initial}</div>
                    <div>
                      <div className="test-name">{t.name}</div>
                      <div className="test-info">{t.info}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sec">
          <div className="mw">
            <div className="sec-head">
              <div className="sec-eyebrow">{content.faq.eyebrow}</div>
              <h2 className="sec-h2">{content.faq.title}</h2>
              <p className="sec-sub">{content.faq.subtitle}</p>
            </div>
            <div className="faq-l">
              {content.faq.items.map((faq, i) => (
                <div key={faq.q} className={`faq-i${openFaq === i ? ' open' : ''}`}>
                  <button
                    type="button"
                    className="faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                  >
                    {faq.q}
                    <div className="faq-q-ic">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </button>
                  <div className="faq-a">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-final">
          <div className="mw">
            <h2>{content.cta.title}</h2>
            <p>{content.cta.subtitle}</p>
            <div className="cta-ctas">
              <a href={content.cta.whatsappUrl} className="btn-wa" target="_blank" rel="noopener noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.1 5.1 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
                  <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654A11.882 11.882 0 0012.05 23.784h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.49 11.815 11.815 0 0012.05 0z" />
                </svg>
                Chat on WhatsApp
              </a>
              <a href="#consultation" className="btn-pri" onClick={(e) => { e.preventDefault(); scrollToConsultation() }}>
                Book free consultation
              </a>
            </div>
          </div>
        </section>

        <footer className="ft">
          <div className="mw">
            <div className="ft-g">
              <div>
                <div className="ft-brand">
                  Houznext <span>Interiors</span>
                </div>
                <p>{content.footerDescription}</p>
              </div>
              <div>
                <h4>Services</h4>
                <ul>
                  <li><Link href="/interiors">Home Interiors</Link></li>
                  <li><Link href="/projects">Our Projects</Link></li>
                  <li><Link href="/pricing">Pricing Packages</Link></li>
                  <li><Link href="/design-ideas">Design Ideas</Link></li>
                  <li><Link href="/buildlive">LiveBuild Tracking</Link></li>
                </ul>
              </div>
              <div>
                <h4>Cities</h4>
                <ul>
                  {CITY_LINKS.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        className={c.slug === citySlug ? 'ft-city-active' : undefined}
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Company</h4>
                <ul>
                  <li><Link href="/about-us">About Us</Link></li>
                  <li><Link href="/contact-us">Contact</Link></li>
                  <li><Link href="/blog">Blog</Link></li>
                  <li><Link href="/careers">Careers</Link></li>
                  <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="ft-bot">
              © {new Date().getFullYear()} Houznext Group PVT. LTD. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
