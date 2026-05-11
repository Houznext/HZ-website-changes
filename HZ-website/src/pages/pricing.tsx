import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import InteriorCalculator from '@/components/InteriorCalculator'
import { useQuoteModal } from '@/components/QuoteModal'
import { pricingFaqSchema } from '@/lib/schemas'
import { fetchPageSeo, type PageSeoPublic } from '@/lib/fetchPageSeo'

import Reveal from '@/components/ui/Reveal'

type BHKType = '2bhk' | '3bhk'

type CmsInteriorPackage = {
  name: string
  price: string
  suffix?: string
  color?: string
  features?: string[]
  highlighted?: boolean
  sortOrder?: number
  isActive?: boolean
  bhkType?: string | null
}

const PACKAGES = {
  '2bhk': [
    { name: 'Essential', lo: 4.5, hi: 5.5,  color: '#5a6a7e', popular: false },
    { name: 'Premium',   lo: 7.5, hi: 9,    color: '#2f80ed', popular: true },
    { name: 'Luxury',    lo: 13,  hi: 18,   color: '#f2994a', popular: false },
  ],
  '3bhk': [
    { name: 'Essential', lo: 6.5, hi: 8,    color: '#5a6a7e', popular: false },
    { name: 'Premium',   lo: 11,  hi: 14,   color: '#2f80ed', popular: true },
    { name: 'Luxury',    lo: 18,  hi: 25,   color: '#f2994a', popular: false },
  ],
}

const FEATURES: Record<string, string[]> = {
  Essential: ['Modular kitchen (acrylic)', 'Wardrobes all bedrooms', 'False ceiling (2 rooms)', 'TV unit & shoe rack', 'LiveBuild tracking', '1-year warranty'],
  Premium:   ['Modular kitchen (lacquered)', 'Wardrobes + lofts + drawers', 'False ceiling all rooms', 'TV unit + study + crockery', 'Wall panelling', '1-year warranty'],
  Luxury:    ['Italian lacquer / veneer kitchen', 'Walk-in wardrobe with lighting', 'POP false ceiling cove lights', 'Full furniture package', 'Imported fittings', '2-year warranty'],
}

const COMPARISON_ROWS = [
  { feature: 'Kitchen finish',        essential: 'Acrylic',   premium: 'Lacquered glass',    luxury: 'Italian lacquer' },
  { feature: 'Wardrobe type',         essential: 'Standard',  premium: 'With lofts & drawers', luxury: 'Walk-in wardrobe' },
  { feature: 'False ceiling',         essential: '2 rooms',   premium: 'All rooms',           luxury: 'POP with cove lights' },
  { feature: 'Study / crockery unit', essential: '—',         premium: 'Yes',                 luxury: 'Yes' },
  { feature: 'Wall panelling',        essential: '—',         premium: '1 wall',              luxury: 'Multiple rooms' },
  { feature: 'Warranty',              essential: '1 year',    premium: '1 year',              luxury: '2 years' },
  { feature: 'LiveBuild tracking',    essential: 'Yes',       premium: 'Yes',                 luxury: 'Yes' },
  { feature: 'Delivery guarantee',    essential: '45 days',   premium: '45 days',             luxury: '50 days' },
]

function parseLakhRange(price: string, loFallback: number, hiFallback: number) {
  const cleaned = price.replace(/[₹,\s]/gi, '')
  const range = cleaned.match(/([\d.]+)\s*[-–]\s*([\d.]+)\s*l/i)
  if (range) {
    const lo = parseFloat(range[1])
    const hi = parseFloat(range[2])
    if (Number.isFinite(lo) && Number.isFinite(hi)) return { lo, hi }
  }
  const single = cleaned.match(/([\d.]+)\s*l/i)
  if (single) {
    const v = parseFloat(single[1])
    if (Number.isFinite(v)) return { lo: v, hi: v }
  }
  return { lo: loFallback, hi: hiFallback }
}

function mergePricingForBhk(
  bhk: BHKType,
  cms: CmsInteriorPackage[] | null,
  basePackages: typeof PACKAGES,
  baseFeatures: typeof FEATURES,
) {
  const features = { ...baseFeatures }
  const rows = (cms || []).filter((r) => r.isActive !== false)
  const byName = new Map(rows.map((r) => [r.name.trim(), r]))

  const pkgs = basePackages[bhk].map((pkg) => {
    const row = byName.get(pkg.name)
    if (!row) return pkg
    if (row.bhkType && row.bhkType !== bhk) return pkg
    const { lo, hi } = parseLakhRange(row.price, pkg.lo, pkg.hi)
    return {
      ...pkg,
      lo,
      hi,
      color: row.color || pkg.color,
      popular: typeof row.highlighted === 'boolean' ? row.highlighted : pkg.popular,
    }
  })

  rows.forEach((row) => {
    if (!row.name) return
    if (row.bhkType && row.bhkType !== bhk) return
    if (row.features && row.features.length > 0) {
      features[row.name] = row.features
    }
  })

  return { pkgs, features }
}

type PricingPageProps = {
  cmsPackages: CmsInteriorPackage[] | null
  pageSeo: PageSeoPublic | null
}

export default function PricingPage({ cmsPackages, pageSeo }: PricingPageProps) {
  const [bhk, setBhk] = useState<BHKType>('2bhk')

  return (
    <>
      <SeoHead
        title={
          pageSeo?.metaTitle ??
          'Interior Design Cost in Hyderabad 2025 | Houznext Pricing'
        }
        description={
          pageSeo?.metaDescription ??
          'Houznext interior packages: Essential from ₹4.5L, Premium from ₹7.5L, Luxury from ₹13L for 2BHK. All-inclusive fixed price — materials, labour, and 1-year warranty included.'
        }
        canonical="/pricing"
        schema={pricingFaqSchema}
        ogImage={pageSeo?.ogImageUrl ?? undefined}
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        {/* Hero */}
        <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <Reveal variant="right">
                <div>
                  <EyebrowLabel className="mb-4">Pricing</EyebrowLabel>
                  <h1 className="font-head font-black text-[36px] md:text-[48px] leading-[1.1] text-white mb-4">
                    Transparent. Fixed.{' '}
                    <span style={{ color: '#2f80ed' }}>Guaranteed.</span>
                  </h1>
                  <p className="text-[15px] mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    All-inclusive packages with zero hidden costs. Materials, labour, project
                    management, and warranty — everything is in the price.
                  </p>

                  {/* BHK toggle */}
                  <div className="flex items-center gap-2">
                    {(['2bhk', '3bhk'] as BHKType[]).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBhk(b)}
                        className="px-5 py-2 rounded-xl text-[13px] font-head font-bold transition-all"
                        style={{
                          background: bhk === b ? '#2f80ed' : 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          border: bhk === b ? 'none' : '1px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {b.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal variant="left" delay={200} className="flex justify-center">
                <InteriorCalculator />
              </Reveal>
            </div>
          </div>
        </section>

        <PricingGrid bhk={bhk} cmsPackages={cmsPackages} />
        <ComparisonTable />
        <WaBar />
      </main>
      <Footer />
    </>
  )
}

function PricingGrid({
  bhk,
  cmsPackages,
}: {
  bhk: BHKType
  cmsPackages: CmsInteriorPackage[] | null
}) {
  const { openModal } = useQuoteModal()
  const { pkgs, features } = mergePricingForBhk(bhk, cmsPackages, PACKAGES, FEATURES)

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Packages</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">
            {bhk.toUpperCase()} interior packages
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pkgs.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 130} variant="zoom">
              <div
                className="rounded-2xl overflow-hidden relative h-full transition-all duration-300 hover:-translate-y-1"
                style={{
                  border: pkg.popular ? `2px solid ${pkg.color}` : '1px solid #dde8f5',
                  background: '#fff',
                  boxShadow: pkg.popular ? '0 8px 40px rgba(47,128,237,0.15)' : undefined,
                  transform: pkg.popular ? 'scale(1.03)' : 'scale(1)',
                }}
              >
                {pkg.popular && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#f2994a' }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-6 pb-4" style={{ borderBottom: '1px solid #f5f7fa' }}>
                  <p className="font-head font-bold text-[12px] uppercase tracking-wider mb-2" style={{ color: pkg.color }}>
                    {pkg.name}
                  </p>
                  <p className="font-head font-black text-[30px]" style={{ color: '#1f2933' }}>
                    ₹{pkg.lo}L <span className="text-[16px] font-[600]">– ₹{pkg.hi}L</span>
                  </p>
                  <p className="text-[12px]" style={{ color: '#5a6a7e' }}>for {bhk.toUpperCase()}, all-inclusive</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2.5 mb-5">
                    {(features[pkg.name] ?? FEATURES[pkg.name]).map((f) => (
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
                    onClick={() => openModal('Pricing page')}
                    className="w-full py-2.5 rounded-xl text-[13px] font-head font-bold transition-all hover:-translate-y-px"
                    style={pkg.popular
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

function ComparisonTable() {
  return (
    <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
      <div className="max-w-5xl mx-auto">
        <Reveal variant="fade" className="text-center mb-10">
          <EyebrowLabel className="justify-center mb-3">Comparison</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">What&apos;s included</h2>
        </Reveal>
        <Reveal variant="up" delay={100}>
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde8f5' }}>
            <div className="grid grid-cols-4 gap-0" style={{ borderBottom: '1px solid #dde8f5' }}>
              <div className="p-4" />
              {['Essential', 'Premium', 'Luxury'].map((h) => (
                <div key={h} className="p-4 text-center" style={{ borderLeft: '1px solid #dde8f5' }}>
                  <p className="font-head font-bold text-[13px] text-charcoal">{h}</p>
                </div>
              ))}
            </div>
            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-4 gap-0"
                style={{
                  borderBottom: i < COMPARISON_ROWS.length - 1 ? '1px solid #f5f7fa' : 'none',
                  background: i % 2 === 0 ? '#fff' : '#fafcff',
                }}
              >
                <div className="p-4 text-[13px] font-[500] text-charcoal">{row.feature}</div>
                {[row.essential, row.premium, row.luxury].map((val, j) => (
                  <div key={j} className="p-4 text-center text-[12px]" style={{ borderLeft: '1px solid #f5f7fa', color: val === '—' ? '#c5d9f5' : '#1f2933' }}>
                    {val === 'Yes' ? (
                      <svg className="mx-auto" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#e8f1fd" />
                        <path d="M5 8l2 2 4-4" stroke="#2f80ed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function WaBar() {
  return (
    <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
      <Reveal variant="zoom" className="max-w-3xl mx-auto text-center">
        <h2 className="font-head font-bold text-[24px] md:text-[32px] text-white mb-3">
          Not sure which package is right for you?
        </h2>
        <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Chat with our design advisor — free consultation, no obligation
        </p>
        <a
          href="https://wa.me/919759750770?text=Hi%20Houznext%2C%20I%20want%20help%20choosing%20a%20package"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-head font-bold text-white text-[15px] hover:-translate-y-0.5 transition-all"
          style={{ background: '#25D366' }}
        >
          Chat on WhatsApp
        </a>
      </Reveal>
    </section>
  )
}

export async function getStaticProps() {
  const raw =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT
  let cmsPackages: CmsInteriorPackage[] | null = null
  let pageSeo: PageSeoPublic | null = null
  try {
    pageSeo = await fetchPageSeo('/pricing')
  } catch {
    pageSeo = null
  }
  if (raw) {
    const base = String(raw).replace(/\/$/, '')
    try {
      const res = await fetch(`${base}/interior-packages?activeOnly=true`)
      if (res.ok) {
        cmsPackages = await res.json()
      }
    } catch {
      cmsPackages = null
    }
  }
  return {
    props: { cmsPackages, pageSeo },
    revalidate: 30,
  }
}
