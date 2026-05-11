import { useState, useMemo, type ChangeEvent, type FormEvent } from 'react'
import type { GetStaticProps } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Reveal from '@/components/ui/Reveal'
import apiClient from '@/utils/apiClient'
import toast from 'react-hot-toast'
import { fetchPageSeo, type PageSeoPublic } from '@/lib/fetchPageSeo'

const SERVICES = [
  { key: 'interiors',   label: 'Home Interiors',   icon: '🏠' },
  { key: 'store',       label: 'Houznext Store',   icon: '🛒' },
  { key: 'buildlive',   label: 'BuildLive Tracking',icon: '📲' },
  { key: 'other',       label: 'Something else',    icon: '💬' },
]

export default function ContactUs({ pageSeo }: { pageSeo: PageSeoPublic | null }) {
  const [service, setService] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = (k: string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const valid = useMemo(() =>
    form.firstName.length >= 2 &&
    /^\d{10}$/.test(form.phone) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    [form]
  )

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!valid || loading) return
    setLoading(true)
    try {
      const res = await apiClient.post(apiClient.URLS.contact_us, {
        firstName: form.firstName,
        lastName: form.lastName,
        contactNumber: form.phone,
        emailAddress: form.email,
        tellUsMore: form.message,
        serviceType: SERVICES.find((s) => s.key === service)?.label || 'General Inquiry',
      })
      if (res.status === 201) { setDone(true) }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SeoHead
        title={
          pageSeo?.metaTitle ??
          'Contact Houznext | Free Interior Design Consultation | Hyderabad'
        }
        description={
          pageSeo?.metaDescription ??
          'Get in touch with Houznext for fixed-price home interiors, design ideas, the Houznext Store, and BuildLive project tracking in Hyderabad, Telangana. Free consultation, same-day callback.'
        }
        canonical="/contact-us"
        ogImage={pageSeo?.ogImageUrl ?? undefined}
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>

        {/* Hero */}
        <section className="py-20 px-4" style={{ background: '#0f2a44' }}>
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Left */}
              <Reveal variant="fade">
                <EyebrowLabel className="mb-4">Contact Us</EyebrowLabel>
                <h1 className="font-head font-black text-[40px] md:text-[50px] leading-[1.1] text-white mb-5">
                  Let's build your<br />
                  <span style={{ color: '#2f80ed' }}>dream home.</span>
                </h1>
                <p className="text-[16px] mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Whether it's interiors, the Store, or tracking your project —
                  our team responds within 24 hours.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: '📞', label: '+91 97597 50770', href: 'tel:+919759750770' },
                    { icon: '✉️', label: 'business@houznext.com', href: 'mailto:business@houznext.com' },
                    { icon: '💬', label: 'WhatsApp us', href: 'https://wa.me/919759750770' },
                    { icon: '📍', label: 'Hyderabad, Telangana, India', href: null },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-3">
                      <span className="text-[20px]">{c.icon}</span>
                      {c.href ? (
                        <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
                           rel="noopener noreferrer"
                           className="text-[14px] font-[500] hover:underline"
                           style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {c.label}
                        </a>
                      ) : (
                        <span className="text-[14px] font-[500]"
                              style={{ color: 'rgba(255,255,255,0.8)' }}>{c.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Right: Form */}
              <Reveal variant="up" delay={100}>
                {done ? (
                  <div className="bg-white rounded-2xl p-8 text-center"
                       style={{ border: '1px solid #dde8f5' }}>
                    <div className="text-[48px] mb-4">✅</div>
                    <h2 className="font-head font-bold text-[22px] mb-2"
                        style={{ color: '#1f2933' }}>We got your message!</h2>
                    <p className="text-[14px] mb-6" style={{ color: '#5a6a7e' }}>
                      Our team will call you back within 24 hours.
                    </p>
                    <button onClick={() => setDone(false)}
                            className="px-6 py-2.5 rounded-xl font-head font-bold text-white text-[13px]"
                            style={{ background: '#2f80ed' }}>
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-white rounded-2xl overflow-hidden"
                        style={{ border: '1px solid #dde8f5' }}>
                    <div className="px-6 py-4 font-head font-bold text-white text-[15px]"
                         style={{ background: '#2f80ed' }}>
                      Get a free consultation
                    </div>
                    <div className="p-6 space-y-4">
                      {/* Service selector */}
                      <div>
                        <p className="text-[12px] font-[600] mb-2 uppercase tracking-wider"
                           style={{ color: '#5a6a7e' }}>I'm interested in</p>
                        <div className="grid grid-cols-2 gap-2">
                          {SERVICES.map((s) => (
                            <button key={s.key} type="button"
                                    onClick={() => setService(s.key)}
                                    className="flex items-center gap-2 p-2.5 rounded-xl text-[13px] font-[500] transition-all text-left"
                                    style={{
                                      border: service === s.key ? '1.5px solid #2f80ed' : '1.5px solid #dde8f5',
                                      background: service === s.key ? '#eaf1fd' : '#f5f7fa',
                                      color: service === s.key ? '#2f80ed' : '#5a6a7e',
                                    }}>
                              <span>{s.icon}</span>{s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'firstName', label: 'First name *', placeholder: 'Ravi' },
                          { key: 'lastName',  label: 'Last name',    placeholder: 'Reddy' },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="block text-[11.5px] font-[500] mb-1"
                                   style={{ color: '#5a6a7e' }}>{f.label}</label>
                            <input type="text" placeholder={f.placeholder}
                                   value={(form as Record<string, string>)[f.key]}
                                   onChange={set(f.key)}
                                   className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all"
                                   style={{ border: '1.5px solid #dde8f5', color: '#1f2933' }}
                                   onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
                                   onBlur={(e)  => { e.currentTarget.style.borderColor = '#dde8f5' }} />
                          </div>
                        ))}
                      </div>

                      {/* Phone + Email */}
                      {[
                        { key: 'phone', label: 'Mobile number *', placeholder: '10-digit number', type: 'tel' as const },
                        { key: 'email', label: 'Email address *',  placeholder: 'you@example.com', type: 'email' as const },
                      ].map((f) => (
                        <div key={f.key}>
                          <label className="block text-[11.5px] font-[500] mb-1"
                                 style={{ color: '#5a6a7e' }}>{f.label}</label>
                          <input type={f.type} placeholder={f.placeholder}
                                 value={(form as Record<string, string>)[f.key]}
                                 onChange={set(f.key)}
                                 className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all"
                                 style={{ border: '1.5px solid #dde8f5', color: '#1f2933' }}
                                 onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
                                 onBlur={(e)  => { e.currentTarget.style.borderColor = '#dde8f5' }} />
                        </div>
                      ))}

                      {/* Message */}
                      <div>
                        <label className="block text-[11.5px] font-[500] mb-1"
                               style={{ color: '#5a6a7e' }}>Tell us about your requirement</label>
                        <textarea rows={3} placeholder="e.g. 3BHK interior in Kondapur, budget ₹12L"
                                  value={form.message}
                                  onChange={set('message')}
                                  className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none resize-none transition-all"
                                  style={{ border: '1.5px solid #dde8f5', color: '#1f2933' }}
                                  onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
                                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#dde8f5' }} />
                      </div>

                      <button type="submit" disabled={loading || !valid}
                              className="w-full py-3 rounded-xl font-head font-bold text-white text-[14px] transition-all disabled:opacity-60"
                              style={{ background: '#2f80ed' }}
                              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#1a6dd6' }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = '#2f80ed' }}>
                        {loading ? 'Sending…' : 'Send message →'}
                      </button>

                      <p className="text-center text-[11.5px]" style={{ color: '#8fa3b8' }}>
                        🔒 Your information is private and never shared.
                      </p>
                    </div>
                  </form>
                )}
              </Reveal>
            </div>
          </div>
        </section>

        {/* Contact strip */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <Reveal variant="fade" className="text-center mb-10">
              <h2 className="font-head font-bold text-[24px] md:text-[30px]"
                  style={{ color: '#1f2933' }}>Other ways to reach us</h2>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '📞', title: 'Call us', detail: '+91 97597 50770', sub: 'Mon–Sat, 9 AM – 7 PM', href: 'tel:+919759750770' },
                { icon: '💬', title: 'WhatsApp', detail: 'Chat with our team', sub: 'Typically replies in 30 min', href: 'https://wa.me/919759750770' },
                { icon: '✉️', title: 'Email', detail: 'business@houznext.com', sub: 'We reply within 24 hours', href: 'mailto:business@houznext.com' },
              ].map((c, i) => (
                <Reveal key={c.title} delay={i * 100} variant="up">
                  <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined}
                     rel="noopener noreferrer"
                     className="flex flex-col items-center text-center p-6 rounded-2xl transition-all hover:-translate-y-1"
                     style={{ border: '1px solid #dde8f5', background: '#f5f7fa', textDecoration: 'none' }}>
                    <span className="text-[36px] mb-3">{c.icon}</span>
                    <h3 className="font-head font-bold text-[15px] mb-1" style={{ color: '#1f2933' }}>{c.title}</h3>
                    <p className="text-[13px] font-[500]" style={{ color: '#2f80ed' }}>{c.detail}</p>
                    <p className="text-[12px] mt-1" style={{ color: '#5a6a7e' }}>{c.sub}</p>
                  </a>
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

export const getStaticProps: GetStaticProps<{ pageSeo: PageSeoPublic | null }> = async () => {
  let pageSeo: PageSeoPublic | null = null
  try {
    pageSeo = await fetchPageSeo('/contact-us')
  } catch {
    pageSeo = null
  }
  return { props: { pageSeo }, revalidate: 60 }
}
