import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import Reveal from '@/components/ui/Reveal'

const SECTIONS = [
  {
    title: '1. Information we collect',
    body: `When you use Houznext — whether through our website, interior design consultations,
real estate inquiries, or the BuildLive customer portal — we may collect: your name, phone number,
email address, property address, project requirements, and communication history.
We collect only what is necessary to deliver our services to you.`,
  },
  {
    title: '2. How we use your information',
    body: `Your information is used to: respond to your inquiries and provide consultations;
assign a designer or project manager to your project; send project updates and milestone notifications
through BuildLive; send periodic service communications you can opt out of at any time.
We do not sell, rent, or trade your personal data to any third party.`,
  },
  {
    title: '3. Data sharing',
    body: `We share your information only with our internal team members directly working on your project.
We do not share your data with advertisers, data brokers, or unrelated third parties.
Service providers who help us operate our platform (such as cloud storage) are bound by
confidentiality agreements.`,
  },
  {
    title: '4. Data security',
    body: `We use industry-standard security practices including HTTPS encryption, access controls,
and secure cloud infrastructure to protect your personal information.
While no system is perfectly secure, we take every reasonable step to keep your data safe.`,
  },
  {
    title: '5. Your rights',
    body: `You have the right to access, correct, or request deletion of your personal data held by Houznext.
To exercise these rights, email us at business@houznext.com. We will respond within 7 business days.`,
  },
  {
    title: '6. Cookies',
    body: `Our website uses essential cookies for functionality and analytics cookies to understand
how visitors use our site. You can disable non-essential cookies in your browser settings at any time.`,
  },
  {
    title: '7. Changes to this policy',
    body: `We may update this policy from time to time. Material changes will be communicated via
our website or email. Continued use of our services after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '8. Contact',
    body: `For any privacy-related questions or concerns, contact us at:
Email: business@houznext.com | Phone: +91 97597 50770 | Address: Hyderabad, Telangana, India`,
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <SeoHead
        title="Privacy Policy | Houznext"
        description="Houznext's privacy policy — how we collect, use, and protect your personal information when you use our interior design, real estate, and BuildLive services."
        canonical="/privacy-policy"
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>

        <section className="py-16 px-4" style={{ background: '#0f2a44' }}>
          <div className="max-w-3xl mx-auto text-center">
            <Reveal variant="fade">
              <h1 className="font-head font-black text-[36px] md:text-[44px] text-white mb-3">
                Privacy Policy
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
                At Houznext, we respect your privacy and are committed to protecting your personal information.
                This policy explains what data we collect, why we collect it, and how we use it.
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
