import type { GetStaticProps } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Reveal from '@/components/ui/Reveal'
import { fetchPageSeo, type PageSeoPublic } from '@/lib/fetchPageSeo'

const OPEN_ROLES = [
  { title: 'Interior Design Consultant', type: 'Full-time', location: 'Hyderabad', dept: 'Interiors' },
  { title: 'Site Project Manager', type: 'Full-time', location: 'Hyderabad', dept: 'BuildLive' },
  { title: 'Customer Success Manager', type: 'Full-time', location: 'Hyderabad', dept: 'Operations' },
  { title: 'Digital Marketing Executive', type: 'Full-time', location: 'Hyderabad', dept: 'Marketing' },
]

const PERKS = [
  { icon: '💰', title: 'Competitive salary', body: 'Market-competitive pay with performance bonuses.' },
  { icon: '📈', title: 'Fast growth', body: 'Rapid promotions in a scaling startup environment.' },
  { icon: '🏠', title: 'Work you can see', body: 'Your work directly impacts real homes and families.' },
  { icon: '🤝', title: 'Great culture', body: 'Collaborative, transparent, and people-first team.' },
]

export default function Careers({ pageSeo }: { pageSeo: PageSeoPublic | null }) {
  return (
    <>
      <SeoHead
        title={
          pageSeo?.metaTitle ??
          'Careers at Houznext | Interior Design & BuildLive Jobs in Hyderabad'
        }
        description={
          pageSeo?.metaDescription ??
          "Join Houznext — Hyderabad's fastest-growing home interiors company. Open roles in interior design, project management, operations, and more. Apply now."
        }
        canonical="/careers"
        ogImage={pageSeo?.ogImageUrl ?? undefined}
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>

        {/* Hero */}
        <section className="py-20 px-4" style={{ background: '#0f2a44' }}>
          <div className="max-w-7xl mx-auto text-center">
            <Reveal variant="fade">
              <EyebrowLabel className="justify-center mb-4">Careers</EyebrowLabel>
              <h1 className="font-head font-black text-[40px] md:text-[52px] leading-[1.1] text-white mb-5">
                Build homes.<br />
                <span style={{ color: '#2f80ed' }}>Build your career.</span>
              </h1>
              <p className="text-[16px] max-w-xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Join a team that's redefining how Telangana families design and
                track their homes. Fast growth. Real impact.
              </p>
              <a href="mailto:business@houznext.com?subject=Job Application – Houznext"
                 className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-head font-bold text-white text-[15px]"
                 style={{ background: '#2f80ed', textDecoration: 'none' }}
                 onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1a6dd6' }}
                 onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#2f80ed' }}>
                Apply now →
              </a>
            </Reveal>
          </div>
        </section>

        {/* Perks */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <Reveal variant="fade" className="text-center mb-12">
              <EyebrowLabel className="justify-center mb-3">Why Houznext</EyebrowLabel>
              <h2 className="font-head font-bold text-[28px] md:text-[34px]"
                  style={{ color: '#1f2933' }}>What you get here</h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PERKS.map((p, i) => (
                <Reveal key={p.title} delay={i * 100} variant="up">
                  <div className="rounded-2xl p-6" style={{ border: '1px solid #dde8f5', background: '#f5f7fa' }}>
                    <div className="text-[32px] mb-3">{p.icon}</div>
                    <h3 className="font-head font-bold text-[15px] mb-2" style={{ color: '#1f2933' }}>{p.title}</h3>
                    <p className="text-[13px]" style={{ color: '#5a6a7e' }}>{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Open roles */}
        <section className="py-16 px-4" style={{ background: '#f5f7fa' }}>
          <div className="max-w-4xl mx-auto">
            <Reveal variant="fade" className="text-center mb-10">
              <EyebrowLabel className="justify-center mb-3">Open Roles</EyebrowLabel>
              <h2 className="font-head font-bold text-[28px] md:text-[34px]"
                  style={{ color: '#1f2933' }}>Current openings</h2>
            </Reveal>
            <div className="space-y-3">
              {OPEN_ROLES.map((role, i) => (
                <Reveal key={role.title} delay={i * 60} variant="up">
                  <div className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4"
                       style={{ border: '1px solid #dde8f5' }}>
                    <div>
                      <h3 className="font-head font-bold text-[15px]" style={{ color: '#1f2933' }}>{role.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[12px] font-[500] px-2.5 py-0.5 rounded-full"
                              style={{ background: '#eaf1fd', color: '#2f80ed' }}>{role.dept}</span>
                        <span className="text-[12px]" style={{ color: '#5a6a7e' }}>{role.type}</span>
                        <span className="text-[12px]" style={{ color: '#5a6a7e' }}>📍 {role.location}</span>
                      </div>
                    </div>
                    <a href={`mailto:business@houznext.com?subject=Application – ${role.title}`}
                       className="flex-shrink-0 px-4 py-2 rounded-xl font-head font-bold text-white text-[12px]"
                       style={{ background: '#2f80ed', textDecoration: 'none' }}>
                      Apply
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal variant="fade" className="mt-8 text-center">
              <p className="text-[14px]" style={{ color: '#5a6a7e' }}>
                Don't see a fit?{' '}
                <a href="mailto:business@houznext.com?subject=Open Application – Houznext"
                   className="font-[600]" style={{ color: '#2f80ed' }}>
                  Send us an open application
                </a>
              </p>
            </Reveal>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

export const getStaticProps: GetStaticProps<{ pageSeo: PageSeoPublic | null }> = async () => {
  let pageSeo: PageSeoPublic | null = null
  try {
    pageSeo = await fetchPageSeo('/careers')
  } catch {
    pageSeo = null
  }
  return { props: { pageSeo }, revalidate: 120 }
}
