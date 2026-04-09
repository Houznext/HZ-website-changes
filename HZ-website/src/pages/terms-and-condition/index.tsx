import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import Reveal from '@/components/ui/Reveal'

const SECTIONS = [
  {
    title: '1. Acceptance of terms',
    body: `By accessing or using the Houznext website, requesting a consultation, or engaging our services,
you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of our services.`,
  },
  {
    title: '2. Services provided',
    body: `Houznext provides: fixed-price home interior design and execution services; real estate
facilitation for buying, selling, and renting RERA-registered properties; BuildLive project
tracking portal for active construction and interior projects.
Services are currently available in Hyderabad, Telangana, and select cities in India.`,
  },
  {
    title: '3. Quotations and pricing',
    body: `Quotations provided by Houznext are valid for 15 days from the date of issue.
Fixed-price interior packages are locked at the time of confirmation subject to the scope of work agreed.
Any changes to scope, materials, or design after confirmation may result in a revised quote.
All prices are exclusive of GST unless explicitly stated otherwise.`,
  },
  {
    title: '4. Payments',
    body: `Project execution begins only after receipt of the advance payment as per the agreed payment schedule.
Milestone-based payments apply to interior and construction projects. Delayed payments may
affect project timelines. All payments are non-refundable once work on the corresponding milestone has begun.`,
  },
  {
    title: '5. Project timelines',
    body: `Timelines shared during consultation are estimates based on scope, material availability, and site readiness.
Delays caused by factors outside Houznext's control — including client approvals, site conditions,
or force majeure events — do not constitute a breach of agreement.`,
  },
  {
    title: '6. Intellectual property',
    body: `All designs, drawings, 3D renders, and project plans created by Houznext remain our
intellectual property until the project is confirmed and the design fee is paid in full.
You may not share, reproduce, or use these materials without written consent.`,
  },
  {
    title: '7. Warranty',
    body: `Houznext provides a warranty of up to 10 years on selected interior components as per
our company warranty policy, subject to terms outlined in your project agreement.
Warranty does not cover damage caused by misuse, natural wear, or third-party modifications.`,
  },
  {
    title: '8. Limitation of liability',
    body: `Houznext's liability is limited to the value of services agreed in the project contract.
We are not liable for indirect, incidental, or consequential damages arising from use of our services.`,
  },
  {
    title: '9. Governing law',
    body: `These terms are governed by the laws of India. Any disputes shall be subject to the
jurisdiction of the courts in Hyderabad, Telangana, India.`,
  },
  {
    title: '10. Contact',
    body: `For questions about these terms: Email: business@houznext.com | Phone: +91 84988 23043`,
  },
]

export default function TermsAndConditions() {
  return (
    <>
      <SeoHead
        title="Terms & Conditions | Houznext"
        description="Houznext's terms and conditions for home interior design, real estate, and BuildLive project tracking services in Hyderabad, Telangana."
        canonical="/terms-and-condition"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>

        <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal variant="fade">
              <h1 className="font-head font-black text-[36px] md:text-[44px] text-white mb-3">
                Terms &amp; Conditions
              </h1>
              <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </Reveal>
          </div>
        </section>

        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <Reveal variant="fade">
              <p className="text-[15px] leading-relaxed mb-10" style={{ color: '#5a6a7e' }}>
                These terms govern your use of Houznext's website and services.
                Please read them carefully before engaging with us.
              </p>
            </Reveal>
            <div className="space-y-8">
              {SECTIONS.map((s, i) => (
                <Reveal key={s.title} delay={i * 50} variant="up">
                  <div className="bg-white rounded-2xl p-7" style={{ border: '1px solid #dde8f5' }}>
                    <h2 className="font-head font-bold text-[17px] mb-3" style={{ color: '#1f2933' }}>
                      {s.title}
                    </h2>
                    <p className="text-[14px] leading-relaxed whitespace-pre-line"
                       style={{ color: '#5a6a7e' }}>{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
