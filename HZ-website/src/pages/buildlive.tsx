import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Reveal from '@/components/ui/Reveal'
import { buildliveSchema } from '@/lib/schemas'

export default function BuildLivePage() {
  return (
    <>
      <SeoHead
        title="BuildLive — Track Your Interior Live Daily | Houznext"
        description="Room-by-room live photo updates, design approvals, milestone payments and snag management. Know exactly what's happening at your site every day — from your phone."
        canonical="/buildlive"
        schema={buildliveSchema}
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        <BuildLiveHero />
        <FeaturesGrid />
        <WaBar />
      </main>
      <Footer />
    </>
  )
}

function BuildLiveHero() {
  const router = useRouter()

  return (
    <section className="py-20 px-4" style={{ background: '#0f2a44' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal variant="right">
            <div>
              <EyebrowLabel className="mb-4">Live Tracking</EyebrowLabel>
              <h1 className="font-head font-black text-[40px] md:text-[52px] leading-[1.1] text-white mb-4">
                Your home.{' '}
                <span style={{ color: '#2f80ed' }}>Live.</span>
              </h1>
              <p className="text-[16px] mb-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                BuildLive is Houznext&apos;s proprietary project tracking system.
                Know exactly what&apos;s happening at your site — every single day.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Daily photo updates by room',
                  'Design approval workflow',
                  'Milestone-based payments',
                  'Snag & punch list management',
                  'Chat directly with your project manager',
                ].map((f, i) => (
                  <Reveal key={f} delay={i * 70} variant="right">
                    <li className="flex items-center gap-2.5 text-[14px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#2f80ed' }} />
                      {f}
                    </li>
                  </Reveal>
                ))}
              </ul>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 rounded-xl font-head font-bold text-white text-[15px] transition-all hover:-translate-y-0.5"
                style={{ background: '#2f80ed' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed' }}
              >
                Login to My Home →
              </button>
            </div>
          </Reveal>

          {/* Floating dashboard card */}
          <Reveal variant="left" delay={200}>
            <div className="flex justify-center animate-float">
              <div
                className="w-full max-w-sm rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(47,128,237,0.3)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="font-head font-bold text-white text-[14px]">Ravi&apos;s Home</p>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>3BHK · Kondapur, Hyderabad</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: '#f2994a' }} />
                    <span className="text-[10px] font-[500]" style={{ color: '#f2994a' }}>LIVE</span>
                  </div>
                </div>

                {/* Overall progress */}
                <div className="mb-5 p-3 rounded-xl" style={{ background: 'rgba(47,128,237,0.1)' }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[12px] font-[600] text-white">Overall progress</span>
                    <span className="text-[12px] font-bold" style={{ color: '#2f80ed' }}>76%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <div className="h-full rounded-full" style={{ width: '76%', background: 'linear-gradient(90deg, #2f80ed, #1a6dd6)' }} />
                  </div>
                </div>

                {[
                  { room: 'Living room',    pct: 90 },
                  { room: 'Kitchen',        pct: 100 },
                  { room: 'Master bedroom', pct: 65 },
                  { room: 'Bedroom 2',      pct: 55 },
                ].map((item) => (
                  <div key={item.room} className="mb-3 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-white/70">{item.room}</span>
                      <span className="text-[11px]" style={{ color: item.pct === 100 ? '#4ade80' : '#2f80ed' }}>{item.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.pct === 100 ? '#4ade80' : '#2f80ed' }} />
                    </div>
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

const FEATURES = [
  { icon: '📸', title: 'Daily photo updates', desc: 'Site photos uploaded every day, organised by room. Never miss a day of progress.' },
  { icon: '🎨', title: 'Design approvals',    desc: 'Review and approve 3D designs and material samples directly in the app.' },
  { icon: '💳', title: 'Milestone payments',  desc: 'Pay only when milestones are hit. All transactions visible and receipted.' },
  { icon: '🐛', title: 'Snag management',     desc: 'Raise issues with photos, track resolution, get confirmations — all in one place.' },
  { icon: '💬', title: 'Direct chat',          desc: 'Message your project manager and designer directly. No middlemen.' },
  { icon: '📊', title: 'Progress reports',    desc: 'Weekly PDF reports summarising progress, materials used, and upcoming milestones.' },
]

function FeaturesGrid() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">Features</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[34px] text-charcoal">
            Everything you need to stay in control
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 90} variant="up">
              <div className="p-6 rounded-2xl border h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-blue-muted" style={{ borderColor: '#dde8f5' }}>
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="font-head font-bold text-[15px] text-charcoal mb-2">{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: '#5a6a7e' }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function WaBar() {
  const router = useRouter()
  return (
    <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
      <Reveal variant="zoom" className="max-w-3xl mx-auto text-center">
        <h2 className="font-head font-bold text-[24px] md:text-[32px] text-white mb-3">
          Already a Houznext customer?
        </h2>
        <p className="text-[15px] mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Log in to My Home portal to track your project live
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 rounded-xl font-head font-bold text-white text-[15px] transition-all hover:-translate-y-0.5"
            style={{ background: '#2f80ed' }}
          >
            Login to My Home →
          </button>
          <a
            href="https://wa.me/918498823043?text=Hi%20Houznext%2C%20I%20want%20to%20know%20more%20about%20BuildLive"
            target="_blank" rel="noopener noreferrer"
            className="px-8 py-4 rounded-xl font-head font-bold text-white text-[15px] transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
            style={{ background: '#25D366' }}
          >
            Chat on WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  )
}
