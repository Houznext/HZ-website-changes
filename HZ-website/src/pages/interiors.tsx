import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import InteriorCalculator from '@/components/InteriorCalculator'
import { useQuoteModal } from '@/components/QuoteModal'
import { interiorServiceSchema } from '@/lib/schemas'
import Reveal from '@/components/ui/Reveal'
import { getCmsContent } from '@/lib/cms'

interface ApiPackage {
  id?: string;
  name: string;
  price: string;
  suffix: string;
  color: string;
  features: string[];
  highlighted: boolean;
  sortOrder: number;
  isActive: boolean;
  bhkType?: string | null;
}

const HARDCODED_PACKAGES: ApiPackage[] = [
  {
    name: 'Essential',
    price: '₹4.5L',
    suffix: 'onwards',
    color: '#5a6a7e',
    features: ['Modular kitchen', 'Wardrobes', 'False ceiling', 'TV unit', '1-yr warranty'],
    highlighted: false,
    sortOrder: 0,
    isActive: true,
  },
  {
    name: 'Premium',
    price: '₹7.5L',
    suffix: 'onwards',
    color: '#2f80ed',
    features: ['Everything in Essential', 'Wall panelling', 'Study unit', 'Crockery unit', 'LiveBuild tracking'],
    highlighted: true,
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Luxury',
    price: '₹13L',
    suffix: 'onwards',
    color: '#f2994a',
    features: ['Italian lacquer finishes', 'Walk-in wardrobe', 'Smart lighting', 'Full furniture package', '2-yr warranty'],
    highlighted: false,
    sortOrder: 2,
    isActive: true,
  },
]

function mergeDisplayPackages(cms: ApiPackage[] | null): ApiPackage[] {
  const fallback = HARDCODED_PACKAGES
  if (!cms || !Array.isArray(cms) || cms.length === 0) return fallback
  const active = [...cms]
    .filter((p) => p.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  if (active.length === 0) return fallback
  return active.map((row) => {
    const fb = fallback.find((f) => f.name === row.name)
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      suffix: row.suffix ?? 'onwards',
      color: row.color || fb?.color || '#5a6a7e',
      features: row.features?.length ? row.features : (fb?.features ?? []),
      highlighted: row.highlighted,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    }
  })
}

type InteriorsPageProps = {
  cmsPackages: ApiPackage[] | null
  cms: Record<string, any> | null
}

export default function InteriorsPage({ cmsPackages, cms }: InteriorsPageProps) {
  const packages = mergeDisplayPackages(cmsPackages)

  const defaultDesc =
    'Modular kitchen, wardrobes, false ceiling, TV unit — fixed-price interior packages from ₹4.5L for 2BHK. 45-day delivery in Hyderabad, Warangal, Karimnagar. Free 3D design.'

  return (
    <>
      <SeoHead
        title={
          cms?.seo?.metaTitle ??
          'Home Interiors Hyderabad | Fixed-Price Packages | Houznext'
        }
        description={cms?.seo?.metaDescription ?? defaultDesc}
        canonical={cms?.seo?.canonical ?? '/interiors'}
        schema={interiorServiceSchema}
        ogImage={cms?.seo?.ogImage || 'https://houznext.com/og-interiors.jpg'}
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <InteriorsHero cms={cms} />
        <WhyChooseUs />
        <PackagesSection packages={packages} />
        <RoomCategories cms={cms} />
        <ProcessTimeline />
        <ServiceBanner />
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <Reveal variant="fade" className="text-center mb-10">
              <EyebrowLabel className="justify-center mb-3">Cost Calculator</EyebrowLabel>
              <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">
                How much will your interiors cost?
              </h2>
            </Reveal>
            <Reveal variant="zoom" delay={150} className="flex justify-center">
              <InteriorCalculator />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function InteriorsHero({ cms }: { cms: any }) {
  const { openModal } = useQuoteModal()
  const router = useRouter()

  const eyebrow = cms?.hero?.eyebrow ?? 'Home Interiors'
  const rawHeadline = cms?.hero?.headline ?? 'Spaces that feel {like} {you.}'
  const subheading =
    cms?.hero?.subheading ??
    'Fixed-price interior design for 2BHK, 3BHK and villas. 45-day delivery, photorealistic 3D designs, and live LiveBuild tracking.'
  const primaryCta = cms?.hero?.primaryCta ?? {
    label: 'Request free consultation →',
    href: '/contact-us',
  }
  const secondaryCta = cms?.hero?.secondaryCta ?? {
    label: 'View packages',
    href: '/pricing',
  }

  const headlineParts = rawHeadline.split(/(\{[^}]+\})/g)
  const headlineJsx = headlineParts.map((part: string, i: number) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      return (
        <span key={i} style={{ color: '#2f80ed' }}>
          {part.slice(1, -1)}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })

  const defaultHeroCards = [
    { slot: 'living', label: 'Living Room', imageUrl: '', action: 'tab', actionValue: 'living' },
    { slot: 'kitchen', label: 'Kitchen', imageUrl: '', action: 'tab', actionValue: 'kitchen' },
    { slot: 'bedroom', label: 'Master Bedroom', imageUrl: '', action: 'tab', actionValue: 'bedroom' },
  ]
  const heroCards = cms?.heroCards ?? defaultHeroCards

  const slotBg: Record<string, string> = {
    living: '#1a3a5c',
    kitchen: '#1a4a5c',
    bedroom: '#1c3a6c',
  }

  function handleCardClick(card: any) {
    if (card.action === 'tab') {
      void router.push(`/design-ideas?tab=${card.actionValue}`)
    } else if (card.action === 'url' && card.actionValue) {
      void router.push(card.actionValue)
    } else if (card.action === 'cta') {
      openModal('Interiors page — hero card')
    }
  }

  return (
    <section className="py-20 px-4" style={{ background: '#0f2a44' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal variant="right">
            <div>
              <EyebrowLabel className="mb-4">{eyebrow}</EyebrowLabel>
              <h1 className="font-head font-black text-[40px] md:text-[52px] leading-[1.1] text-white mb-4">
                {headlineJsx}
              </h1>
              <p className="text-[16px] mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {subheading}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!primaryCta?.href || primaryCta.href === '#') {
                      openModal('Interiors page — hero')
                    } else {
                      void router.push(primaryCta.href)
                    }
                  }}
                  className="px-6 py-3 rounded-xl font-head font-bold text-white text-[15px] transition-all hover:-translate-y-0.5"
                  style={{ background: '#2f80ed' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed' }}
                >
                  {primaryCta.label}
                </button>
                <button
                  type="button"
                  onClick={() => void router.push(secondaryCta.href)}
                  className="px-6 py-3 rounded-xl font-head font-bold text-white text-[15px] hover:bg-white/10 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  {secondaryCta.label}
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal variant="left" delay={200}>
            <div className="grid grid-cols-2 gap-3">
              {heroCards.map((card: any, i: number) => (
                <div
                  key={card.slot}
                  role={card.action !== 'none' ? 'button' : undefined}
                  tabIndex={card.action !== 'none' ? 0 : undefined}
                  onKeyDown={card.action !== 'none' ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(card) } : undefined}
                  onClick={() => handleCardClick(card)}
                  className={`
                    group rounded-2xl flex items-end p-4 relative overflow-hidden
                    transition-all duration-300
                    ${card.action !== 'none' ? 'cursor-pointer hover:scale-[1.015]' : 'cursor-default'}
                    ${i === 2 ? 'col-span-2' : ''}
                  `}
                  style={{
                    background: card.imageUrl
                      ? `linear-gradient(0deg, rgba(10,25,40,0.75) 0%, transparent 60%), url(${card.imageUrl}) center/cover no-repeat`
                      : slotBg[card.slot] ?? '#1a3a5c',
                    height: i === 2 ? 140 : 180,
                    border: '1px solid rgba(47,128,237,0.2)',
                  }}
                  onMouseEnter={(e) => {
                    if (card.action !== 'none') { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(47,128,237,0.6)' }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(47,128,237,0.2)'
                  }}
                >
                  {card.action !== 'none' && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 items-center justify-center hidden group-hover:flex">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  )}
                  <span
                    className="relative z-10 text-[12px] font-head font-bold px-3 py-1 rounded-full text-white transition-colors duration-200 group-hover:!bg-[#2f80ed]"
                    style={{ background: 'rgba(15,42,68,0.75)' }}
                  >
                    {card.label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function WhyChooseUs() {
  const cards = [
    { icon: '🎨', title: '3D design first', desc: 'Photorealistic 3D design for every room before work begins. Free revisions.' },
    { icon: '🔒', title: 'Fixed price',      desc: 'Your quote is your final price. No escalations, no hidden charges.' },
    { icon: '⚡', title: '45-day delivery',  desc: 'We commit to delivery timelines backed by a written guarantee.' },
    { icon: '🛡️', title: '1-year warranty',  desc: 'All workmanship is covered for 12 months after handover.' },
  ]
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Why choose us</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">The Houznext difference</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 110} variant="up">
              <div className="p-6 rounded-2xl border text-center h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md" style={{ borderColor: '#dde8f5' }}>
                <span className="text-3xl mb-4 block">{c.icon}</span>
                <h3 className="font-head font-bold text-[15px] text-charcoal mb-2">{c.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#5a6a7e' }}>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function PackagesSection({ packages }: { packages: ApiPackage[] }) {
  const { openModal } = useQuoteModal()
  const openConsultation = () => openModal('Interiors page — packages section')
  const display = packages

  return (
    <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Packages</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[36px] text-charcoal">
            Pick the right package
          </h2>
          <p className="text-muted mt-2 text-sm">
            All packages are fixed-price with no hidden costs
          </p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {display.map((pkg, i) => (
            <Reveal key={pkg.id || pkg.name} delay={i * 120} variant="zoom">
              <div
                className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: pkg.highlighted ? `2px solid ${pkg.color}` : '1px solid #dde8f5',
                  background: '#fff',
                  boxShadow: pkg.highlighted ? '0 8px 40px rgba(47,128,237,0.15)' : undefined,
                  transform: pkg.highlighted ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {pkg.highlighted && (
                  <div className="absolute top-3 right-3">
                    <span
                      className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: '#f2994a' }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-6 pb-4" style={{ borderBottom: '1px solid #f5f7fa' }}>
                  <p className="font-head font-bold text-[13px] uppercase tracking-wider mb-2" style={{ color: pkg.color }}>
                    {pkg.name}
                  </p>
                  <p className="font-head font-black text-[32px]" style={{ color: '#1f2933' }}>
                    {pkg.price}
                  </p>
                  <p className="text-[12px]" style={{ color: '#5a6a7e' }}>
                    {pkg.suffix} for 2BHK
                  </p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2.5 mb-5">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: '#1f2933' }}>
                        <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="7" fill={`${pkg.color}20`} />
                          <path d="M4 7l2 2 4-4" stroke={pkg.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={openConsultation}
                    className="w-full py-2.5 rounded-xl text-[13px] font-head font-bold
                               transition-all hover:-translate-y-px"
                    style={
                      pkg.highlighted
                        ? { background: '#2f80ed', color: '#fff' }
                        : { background: '#f5f7fa', color: '#2f80ed', border: '1px solid #dde8f5' }
                    }
                  >
                    Free Consultation
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

export async function getStaticProps() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT
  const base = raw ? String(raw).replace(/\/$/, '') : null
  let cmsPackages: ApiPackage[] | null = null
  const cms: Record<string, any> | null = await getCmsContent('interiors_page')
  if (base) {
    try {
      const pRes = await fetch(`${base}/interior-packages?activeOnly=true`)
      if (pRes.ok) {
        cmsPackages = await pRes.json()
      }
    } catch {
      cmsPackages = null
    }
  }
  return {
    props: { cmsPackages, cms },
    revalidate: 60,
  }
}

function RoomCategories({ cms }: { cms: any }) {
  const router = useRouter()
  const { openModal } = useQuoteModal()
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const rbrData = cms?.roomByRoom
  const eyebrow = rbrData?.eyebrow ?? 'Room categories'
  const heading = rbrData?.heading ?? 'Room by room excellence'
  const defaultCards = [
    { slug: 'living', title: 'Living Room', description: 'Sofas, TV units, entertainment walls, accent lighting', imageUrl: '', action: 'tab', actionValue: 'living', visible: true },
    { slug: 'bedroom', title: 'Bedroom', description: 'Wardrobes, study units, cove ceilings, wall panels', imageUrl: '', action: 'tab', actionValue: 'bedroom', visible: true },
    { slug: 'kitchen', title: 'Kitchen', description: 'Modular kitchens, hob, chimney, storage solutions', imageUrl: '', action: 'tab', actionValue: 'kitchen', visible: true },
    { slug: 'office', title: 'Home Office', description: 'Ergonomic workstations, storage walls, acoustic panels', imageUrl: '', action: 'tab', actionValue: 'office', visible: true },
  ]
  const cards = rbrData?.cards ?? defaultCards
  const visibleCards = (cards as any[]).filter((c) => c.visible !== false)

  const slotBg: Record<string, string> = {
    living: '#1a3a5c',
    bedroom: '#1a4a5c',
    kitchen: '#1c3a6c',
    office: '#1a3a50',
  }

  function handleClick(card: any) {
    if (card.action === 'none') return
    if (card.action === 'tab') {
      void router.push(`/design-ideas?tab=${card.actionValue}`)
    } else if (card.action === 'url' && card.actionValue) {
      void router.push(card.actionValue)
    } else if (card.action === 'cta') {
      openModal('Interiors page — room card')
    }
  }

  return (
    <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="mb-3 justify-center">{eyebrow}</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-white">{heading}</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {visibleCards.map((card: any, i: number) => (
            <Reveal key={card.slug} delay={i * 110} variant="up">
              <div
                role={card.action !== 'none' ? 'button' : undefined}
                tabIndex={card.action !== 'none' ? 0 : undefined}
                onKeyDown={card.action !== 'none' ? (e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(card) } : undefined}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => handleClick(card)}
                className={`
                  relative rounded-2xl overflow-hidden p-6 flex flex-col justify-end h-full
                  transition-all duration-300
                  ${card.action !== 'none' ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : 'cursor-default'}
                `}
                style={{
                  minHeight: 220,
                  background: card.imageUrl
                    ? `linear-gradient(0deg, rgba(10,25,40,0.82) 0%, rgba(15,40,65,0.3) 100%), url(${card.imageUrl}) center/cover no-repeat`
                    : `linear-gradient(135deg, ${slotBg[card.slug] ?? '#1a3a5c'} 0%, #0f2a44 100%)`,
                  border: '1px solid rgba(47,128,237,0.25)',
                }}
              >
                {card.action !== 'none' && (
                  <div
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all"
                    style={{
                      opacity: hoveredIdx === i ? 1 : 0,
                      background: hoveredIdx === i ? '#2f80ed' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                )}
                <h3 className="font-head font-bold text-white text-[16px] mb-1" style={{ position: 'relative', zIndex: 1 }}>
                  {card.title}
                </h3>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)', position: 'relative', zIndex: 1 }}>
                  {card.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProcessTimeline() {
  const steps = [
    { n: '1', label: 'Consultation',   desc: 'Free call to understand your vision and budget' },
    { n: '2', label: '3D Design',       desc: 'Photorealistic designs for every room' },
    { n: '3', label: 'Approval',        desc: 'Review, revise and approve online' },
    { n: '4', label: 'Execution',       desc: 'Our team builds with LiveBuild tracking' },
    { n: '5', label: 'Handover',        desc: 'Keys + 1-year warranty document' },
  ]
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">How we work</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">From idea to handover</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-0 relative">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100} variant="up">
              <div className="relative text-center px-3 flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-head font-black text-[15px] text-white mb-3 relative z-10 transition-transform duration-300 hover:scale-110"
                  style={{ background: '#2f80ed' }}
                >
                  {s.n}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="hidden sm:block absolute top-5 left-1/2 w-full h-0.5"
                    style={{ background: '#e8f1fd', zIndex: 0 }}
                  />
                )}
                <h4 className="font-head font-bold text-[13px] text-charcoal mb-1">{s.label}</h4>
                <p className="text-[11px] leading-relaxed" style={{ color: '#5a6a7e' }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceBanner() {
  const [form, setForm] = useState({ name: '', phone: '', city: '', property: '' })
  const [sent, setSent] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await new Promise((r) => setTimeout(r, 500))
    setSent(true)
  }

  return (
    <section className="py-16 px-4" style={{ background: '#2f80ed' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal variant="right">
            <div>
              <h2 className="font-head font-bold text-[28px] md:text-[34px] text-white mb-4">
                Get a free interior design consultation
              </h2>
              <ul className="space-y-3">
                {['Free 3D design mock-up', 'Fixed-price quote — no surprises', 'Dedicated project manager', '45-day delivery guarantee'].map((f, i) => (
                  <Reveal key={f} delay={i * 80} variant="right">
                    <li className="flex items-center gap-2.5 text-[14px] text-white/90">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-white/60" />
                      {f}
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal variant="left" delay={150}>
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              {sent ? (
                <div className="text-center py-8">
                  <p className="font-head font-bold text-xl text-charcoal mb-2">We&apos;ll call you soon!</p>
                  <p className="text-sm text-muted">Our advisor will call within 2 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input required value={form.name} onChange={set('name')} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#dde8f5' }} placeholder="Full name *" onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#dde8f5' }} />
                  <input required type="tel" value={form.phone} onChange={set('phone')} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none" style={{ borderColor: '#dde8f5' }} placeholder="Phone *" onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }} onBlur={(e) => { e.currentTarget.style.borderColor = '#dde8f5' }} />
                  <select value={form.city} onChange={set('city')} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white" style={{ borderColor: '#dde8f5' }}>
                    <option value="">City</option>
                    {['Hyderabad','Warangal','Karimnagar','Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={form.property} onChange={set('property')} className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none bg-white" style={{ borderColor: '#dde8f5' }}>
                    <option value="">Property type</option>
                    {['2BHK','3BHK','Villa / 4BHK+'].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button type="submit" className="w-full py-3 rounded-xl font-head font-bold text-white text-[14px] transition-all hover:-translate-y-0.5" style={{ background: '#2f80ed' }}>
                    Request free consultation →
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
