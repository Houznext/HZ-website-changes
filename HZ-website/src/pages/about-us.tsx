import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Reveal from '@/components/ui/Reveal'
import { useQuoteModal } from '@/components/QuoteModal'

export default function AboutUs() {
  const { openModal } = useQuoteModal()

  return (
    <>
      <SeoHead
        title="About Houznext | Home Interiors & Real Estate Company in Hyderabad"
        description="Houznext is Hyderabad's trusted home interiors, real estate and BuildLive project tracking company. Fixed-price packages, RERA-verified properties, 500+ delivered projects across Telangana."
        canonical="/about-us"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>

        {/* Hero */}
        <section className="py-20 px-4" style={{ background: '#0f2a44' }}>
          <div className="max-w-7xl mx-auto text-center">
            <Reveal variant="fade">
              <EyebrowLabel className="justify-center mb-4">About Us</EyebrowLabel>
              <h1 className="font-head font-black text-[40px] md:text-[52px] leading-[1.1] text-white mb-5">
                Building homes.<br />
                <span style={{ color: '#2f80ed' }}>Building trust.</span>
              </h1>
              <p className="text-[16px] max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Houznext is Telangana's end-to-end home company — fixed-price interiors,
                RERA-verified real estate, and live project tracking through BuildLive.
                Everything under one roof, built around you.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Stats */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: '500+', label: 'Projects delivered' },
                { value: '10+', label: 'Years experience' },
                { value: '4.8★', label: 'Customer rating' },
                { value: '3', label: 'Cities active' },
              ].map((s) => (
                <Reveal key={s.label} variant="zoom">
                  <div className="text-center">
                    <p className="font-head font-black text-[36px] md:text-[44px]"
                       style={{ color: '#2f80ed' }}>{s.value}</p>
                    <p className="text-[13px] font-[500] mt-1" style={{ color: '#5a6a7e' }}>{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
          <div className="max-w-7xl mx-auto">
            <Reveal variant="fade" className="text-center mb-12">
              <EyebrowLabel className="justify-center mb-3">Our Mission</EyebrowLabel>
              <h2 className="font-head font-bold text-[28px] md:text-[36px]"
                  style={{ color: '#1f2933' }}>
                Why Houznext exists
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🏠',
                  title: 'Fixed-price interiors',
                  body: 'No hidden costs. Your interior package price is locked from day one — Essential, Premium, or Luxury — with 40+ quality checks built in.',
                },
                {
                  icon: '📍',
                  title: 'RERA-verified real estate',
                  body: 'Every plot and flat we list is RERA-registered. Free legal due diligence, bank loan support, and site visits included at zero extra cost.',
                },
                {
                  icon: '📲',
                  title: 'Live project tracking',
                  body: 'Our BuildLive portal gives you daily photo updates, design approvals, milestone payments, and direct chat with your project manager.',
                },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 120} variant="up">
                  <div className="bg-white rounded-2xl p-7 h-full"
                       style={{ border: '1px solid #dde8f5' }}>
                    <div className="text-[32px] mb-4">{item.icon}</div>
                    <h3 className="font-head font-bold text-[17px] mb-2"
                        style={{ color: '#1f2933' }}>{item.title}</h3>
                    <p className="text-[14px] leading-relaxed"
                       style={{ color: '#5a6a7e' }}>{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <Reveal variant="fade" className="text-center mb-12">
              <EyebrowLabel className="justify-center mb-3">Our Values</EyebrowLabel>
              <h2 className="font-head font-bold text-[28px] md:text-[36px]"
                  style={{ color: '#1f2933' }}>How we operate</h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Transparency', body: 'Fixed prices, open timelines, live tracking. No surprises.' },
                { title: 'Quality', body: '40+ checkpoint quality process on every interior project.' },
                { title: 'Speed', body: 'Projects start within 7 days of confirmation. No delays.' },
                { title: 'Accountability', body: 'Dedicated project manager. Daily updates. You stay in control.' },
              ].map((v, i) => (
                <Reveal key={v.title} delay={i * 100} variant="up">
                  <div className="rounded-xl p-5" style={{ background: '#f5f7fa', border: '1px solid #dde8f5' }}>
                    <div className="w-8 h-1 rounded-full mb-4" style={{ background: '#2f80ed' }} />
                    <h4 className="font-head font-bold text-[15px] mb-2" style={{ color: '#1f2933' }}>{v.title}</h4>
                    <p className="text-[13px]" style={{ color: '#5a6a7e' }}>{v.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
          <Reveal variant="zoom" className="max-w-2xl mx-auto text-center">
            <h2 className="font-head font-bold text-[26px] md:text-[32px] text-white mb-3">
              Ready to start your project?
            </h2>
            <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Get a free consultation and fixed-price quote in 24 hours.
            </p>
            <button
              onClick={() => openModal('About us page')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-head font-bold text-white text-[15px]"
              style={{ background: '#2f80ed' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1a6dd6' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#2f80ed' }}
            >
              Request free consultation →
            </button>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  )
}
