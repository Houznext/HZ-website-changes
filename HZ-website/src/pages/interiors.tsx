import { useRouter } from 'next/router'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import InteriorCalculator from '@/components/InteriorCalculator'
import { useQuoteModal } from '@/components/QuoteModal'
import { interiorServiceSchema } from '@/lib/schemas'

import Reveal from '@/components/ui/Reveal'

export default function InteriorsPage() {
  return (
    <>
      <SeoHead
        title="Home Interiors Hyderabad | Fixed-Price Packages | Houznext"
        description="Modular kitchen, wardrobes, false ceiling, TV unit — fixed-price interior packages from ₹4.5L for 2BHK. 45-day delivery in Hyderabad, Warangal, Karimnagar. Free 3D design."
        canonical="/interiors"
        schema={interiorServiceSchema}
        ogImage="https://houznext.com/og-interiors.jpg"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <InteriorsHero />
        <WhyChooseUs />
        <RoomCategories />
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

function InteriorsHero() {
  const { openModal } = useQuoteModal()
  const router = useRouter()

  return (
    <section className="py-20 px-4" style={{ background: '#0f2a44' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal variant="right">
            <div>
              <EyebrowLabel className="mb-4">Home Interiors</EyebrowLabel>
              <h1 className="font-head font-black text-[40px] md:text-[52px] leading-[1.1] text-white mb-4">
                Spaces that feel{' '}
                <span style={{ color: '#2f80ed' }}>like you.</span>
              </h1>
              <p className="text-[16px] mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Fixed-price interior design for 2BHK, 3BHK and villas. 45-day delivery,
                photorealistic 3D designs, and live BuildLive tracking.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={openModal}
                  className="px-6 py-3 rounded-xl font-head font-bold text-white text-[15px] transition-all hover:-translate-y-0.5"
                  style={{ background: '#2f80ed' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed' }}
                >
                  Get free quote →
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-3 rounded-xl font-head font-bold text-white text-[15px] hover:bg-white/10 transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.25)' }}
                >
                  View packages
                </button>
              </div>
            </div>
          </Reveal>

          {/* Gallery grid */}
          <Reveal variant="left" delay={200}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Living Room',    bg: '#1a3a5c' },
                { label: 'Kitchen',        bg: '#1a4a5c' },
                { label: 'Master Bedroom', bg: '#1c3a6c' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className={`rounded-2xl flex items-end p-4 ${i === 2 ? 'col-span-2' : ''}`}
                  style={{ background: item.bg, height: i === 2 ? 140 : 180, border: '1px solid rgba(47,128,237,0.2)' }}
                >
                  <span
                    className="text-[12px] font-head font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: 'rgba(15,42,68,0.7)' }}
                  >
                    {item.label}
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

function RoomCategories() {
  const rooms = [
    { label: 'Living Room',  desc: 'Sofas, TV units, entertainment walls, accent lighting' },
    { label: 'Bedroom',      desc: 'Wardrobes, study units, cove ceilings, wall panels' },
    { label: 'Kitchen',      desc: 'Modular kitchens, hob, chimney, storage solutions' },
    { label: 'Home Office',  desc: 'Ergonomic workstations, storage walls, acoustic panels' },
  ]
  return (
    <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="mb-3 justify-center">Room categories</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-white">Room by room excellence</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {rooms.map((r, i) => (
            <Reveal key={r.label} delay={i * 110} variant="up">
              <div
                className="relative rounded-2xl overflow-hidden p-6 flex flex-col justify-end h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  minHeight: 220,
                  background: `linear-gradient(135deg, ${['#1a3a5c','#1a4a5c','#1c3a6c','#1a3a50'][i]} 0%, #0f2a44 100%)`,
                  border: '1px solid rgba(47,128,237,0.25)',
                }}
              >
                <h3 className="font-head font-bold text-white text-[16px] mb-1">{r.label}</h3>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.desc}</p>
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
    { n: '4', label: 'Execution',       desc: 'Our team builds with BuildLive tracking' },
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
