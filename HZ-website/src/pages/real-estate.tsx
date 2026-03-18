import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import { useQuoteModal } from '@/components/QuoteModal'
import { realEstateAgentSchema, realEstateSchema } from '@/lib/schemas'
import Reveal from '@/components/ui/Reveal'

export default function RealEstatePage() {
  return (
    <>
      <SeoHead
        title="Buy Plots & Flats in Telangana | RERA Verified | Houznext"
        description="RERA-verified plots, flats and villas in Hyderabad, Warangal, Karimnagar. Free legal due diligence, bank loan assistance, free site visit. 500+ transactions done."
        canonical="/real-estate"
        schema={realEstateSchema}
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <RealEstateHero />
        <WhyBuyWithUs />
        <BuyingProcess />
        <PropertyListings />
        <WaBar />
      </main>
      <Footer />
    </>
  )
}

function RealEstateHero() {
  const [search, setSearch] = useState({ city: '', type: '', budget: '' })
  const set = (k: keyof typeof search) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    setSearch((s) => ({ ...s, [k]: e.target.value }))

  return (
    <section className="py-20 px-4" style={{ background: '#0f2a44' }}>
      <div className="max-w-7xl mx-auto text-center">
        <Reveal variant="fade">
          <EyebrowLabel className="justify-center mb-4">Real Estate</EyebrowLabel>
          <h1 className="font-head font-black text-[40px] md:text-[52px] leading-[1.1] text-white mb-4">
            Buy Right in{' '}
            <span style={{ color: '#2f80ed' }}>Telangana.</span>
          </h1>
          <p className="text-[16px] mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
            RERA-verified plots, flats and villas. Legal due diligence, bank loan support,
            and free site visit — all included.
          </p>
        </Reveal>

        {/* Search bar */}
        <Reveal variant="up" delay={200}>
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-4 flex flex-col md:flex-row gap-3">
            <select value={search.city} onChange={set('city')} className="flex-1 border rounded-xl px-4 py-3 text-sm outline-none bg-white" style={{ borderColor: '#dde8f5' }}>
              <option value="">City / District</option>
              {['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={search.type} onChange={set('type')} className="flex-1 border rounded-xl px-4 py-3 text-sm outline-none bg-white" style={{ borderColor: '#dde8f5' }}>
              <option value="">Property type</option>
              {['Plot', 'Flat / Apartment', 'Villa', 'Independent House'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select value={search.budget} onChange={set('budget')} className="flex-1 border rounded-xl px-4 py-3 text-sm outline-none bg-white" style={{ borderColor: '#dde8f5' }}>
              <option value="">Budget</option>
              {['Under ₹30L', '₹30L–₹60L', '₹60L–₹1Cr', 'Above ₹1Cr'].map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <button className="px-6 py-3 rounded-xl font-head font-bold text-white text-[13px] flex-shrink-0" style={{ background: '#2f80ed' }}>
              Search →
            </button>
          </div>
        </Reveal>

        {/* Trust badges */}
        <Reveal variant="up" delay={320}>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {['RERA Verified', 'Bank Loan Support', 'Free Site Visit', 'Legal Due Diligence'].map((b) => (
              <div key={b} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: '#2f80ed' }} />
                <span className="text-[13px] font-[500]" style={{ color: 'rgba(255,255,255,0.75)' }}>{b}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function WhyBuyWithUs() {
  const cards = [
    { icon: '📜', title: 'Title clearance',   desc: 'Every property undergoes thorough legal due diligence by our empanelled lawyers.' },
    { icon: '✅', title: 'RERA compliance',    desc: 'All projects are RERA-registered. Your investment is legally protected.' },
    { icon: '🏦', title: 'Bank loan support', desc: 'We work with leading banks to get you the best home loan rates with minimal paperwork.' },
  ]
  return (
    <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Why buy with us</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-white">Buy with confidence</h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 130} variant="up">
              <div className="p-6 rounded-2xl text-center h-full transition-all duration-300 hover:-translate-y-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(47,128,237,0.2)' }}>
                <span className="text-3xl mb-4 block">{c.icon}</span>
                <h3 className="font-head font-bold text-white text-[16px] mb-2">{c.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function BuyingProcess() {
  const steps = [
    { n: '1', label: 'Browse listings', desc: 'Filter by city, type, and budget' },
    { n: '2', label: 'Schedule visit',  desc: 'Free site visit arranged within 24 hours' },
    { n: '3', label: 'Legal check',     desc: 'Title clearance and RERA verification' },
    { n: '4', label: 'Loan support',    desc: 'Bank tie-up and documentation' },
    { n: '5', label: 'Registration',    desc: 'We assist end-to-end at the sub-registrar office' },
  ]
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">The Process</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">Buying made simple</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100} variant="up">
              <div className="text-center relative flex flex-col items-center px-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-head font-black text-[15px] text-white mb-3 relative z-10 transition-transform duration-300 hover:scale-110"
                  style={{ background: '#2f80ed' }}
                >
                  {s.n}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-1/2 w-full h-0.5" style={{ background: '#e8f1fd', zIndex: 0 }} />
                )}
                <h4 className="font-head font-bold text-[13px] text-charcoal mb-1">{s.label}</h4>
                <p className="text-[11px]" style={{ color: '#5a6a7e' }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function PropertyListings() {
  const { openModal } = useQuoteModal()
  const listings = [
    { type: 'Plot',      city: 'Warangal',   area: '200 sq yd', price: '₹24L',   badge: 'RERA Verified' },
    { type: 'Apartment', city: 'Hyderabad',  area: '1250 sqft', price: '₹58L',   badge: 'Ready to move' },
    { type: 'Villa',     city: 'Karimnagar', area: '2400 sqft', price: '₹1.2Cr', badge: 'Premium' },
    { type: 'Plot',      city: 'Nizamabad',  area: '150 sq yd', price: '₹16L',   badge: 'RERA Verified' },
    { type: 'Apartment', city: 'Khammam',    area: '1100 sqft', price: '₹38L',   badge: 'Under construction' },
    { type: 'Apartment', city: 'Hyderabad',  area: '1650 sqft', price: '₹85L',   badge: 'Ready to move' },
  ]
  return (
    <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Listings</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">Featured properties</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {listings.map((l, i) => (
            <Reveal key={i} delay={i * 90} variant="up">
              <div className="rounded-2xl bg-white border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full" style={{ borderColor: '#dde8f5' }}>
                <div className="h-40 flex items-end p-4" style={{ background: 'linear-gradient(135deg, #1a3a5c, #0f2a44)' }}>
                  <span className="text-[10px] font-head font-bold px-2 py-0.5 rounded-full text-white" style={{ background: 'rgba(47,128,237,0.6)' }}>
                    {l.badge}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-head font-bold text-[14px] text-charcoal">{l.type} · {l.city}</span>
                  </div>
                  <p className="text-[12px] mb-3" style={{ color: '#5a6a7e' }}>{l.area}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-head font-black text-[20px]" style={{ color: '#2f80ed' }}>{l.price}</span>
                    <button onClick={openModal} className="text-[12px] font-[600] px-3 py-1.5 rounded-lg transition-all hover:bg-blue-light" style={{ background: '#e8f1fd', color: '#2f80ed' }}>
                      Enquire →
                    </button>
                  </div>
                </div>
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
          Looking for a specific property?
        </h2>
        <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Chat with our property advisor on WhatsApp for a free site visit
        </p>
        <a
          href="https://wa.me/918498823043?text=Hi%20Houznext%2C%20I%20am%20looking%20for%20a%20property"
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
