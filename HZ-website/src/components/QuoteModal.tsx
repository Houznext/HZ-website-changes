import { useState, useCallback, useEffect, createContext, useContext } from 'react'

// ─── Hook ────────────────────────────────────────────────────────────────────

interface QuoteModalContextValue {
  open: boolean
  openModal: () => void
  closeModal: () => void
}

const QuoteModalContext = createContext<QuoteModalContextValue>({
  open: false,
  openModal: () => undefined,
  closeModal: () => undefined,
})

export function QuoteModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const openModal  = useCallback(() => setOpen(true), [])
  const closeModal = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <QuoteModalContext.Provider value={{ open, openModal, closeModal }}>
      {children}
      {open && <QuoteModal onClose={closeModal} />}
    </QuoteModalContext.Provider>
  )
}

export function useQuoteModal() {
  return useContext(QuoteModalContext)
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuoteFormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  propertyType: string
  city: string
  service: string
  budget: string
  requirements: string
}

const INITIAL: QuoteFormData = {
  firstName: '', lastName: '', phone: '', email: '',
  propertyType: '', city: '', service: '', budget: '', requirements: '',
}

// ─── Component ───────────────────────────────────────────────────────────────

function QuoteModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<QuoteFormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof QuoteFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Replace with actual API call once backend endpoint is ready
      await new Promise((r) => setTimeout(r, 800))
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', background: 'rgba(10,20,35,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] max-h-[92vh] overflow-y-auto rounded-[18px] bg-white shadow-2xl"
        style={{ padding: '36px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: '#e8f1fd' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#e8f1fd'; (e.currentTarget as HTMLButtonElement).style.color = '#1f2933' }}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1L11 11M11 1L1 11" />
          </svg>
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#e8f1fd' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="font-head font-bold text-xl text-charcoal mb-2">Quote request sent!</h3>
            <p className="text-sm text-muted">Our design advisor will call you within 2 hours.</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-lg text-sm font-head font-bold text-white"
              style={{ background: '#2f80ed' }}
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-head font-bold text-[22px] text-charcoal mb-1">Get a free quote</h2>
            <p className="text-sm text-muted mb-6">Our design advisor will call you within 2 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                {(['firstName', 'lastName'] as const).map((k) => (
                  <div key={k}>
                    <label className="block text-xs font-[500] text-charcoal mb-1">
                      {k === 'firstName' ? 'First name' : 'Last name'} *
                    </label>
                    <input
                      required
                      value={form[k]}
                      onChange={set(k)}
                      className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ borderColor: '#dde8f5' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#dde8f5' }}
                      placeholder={k === 'firstName' ? 'Ravi' : 'Kumar'}
                    />
                  </div>
                ))}
              </div>

              {/* Phone + Email */}
              {([
                { k: 'phone' as const, label: 'Phone *', type: 'tel', placeholder: '+91 98765 43210' },
                { k: 'email' as const, label: 'Email', type: 'email', placeholder: 'ravi@example.com' },
              ]).map(({ k, label, type, placeholder }) => (
                <div key={k}>
                  <label className="block text-xs font-[500] text-charcoal mb-1">{label}</label>
                  <input
                    required={k === 'phone'}
                    type={type}
                    value={form[k]}
                    onChange={set(k)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{ borderColor: '#dde8f5' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#dde8f5' }}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              {/* Selects */}
              {([
                {
                  k: 'propertyType' as const, label: 'Property type *',
                  opts: ['2BHK Apartment', '3BHK Apartment', 'Villa / 4BHK+', 'Independent House', 'Studio / 1BHK'],
                },
                {
                  k: 'city' as const, label: 'City *',
                  opts: ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Other'],
                },
                {
                  k: 'service' as const, label: 'Service *',
                  opts: ['Full Home Interiors', 'Modular Kitchen', 'Wardrobe & Storage', 'False Ceiling', 'Real Estate', 'BuildLive Tracking'],
                },
                {
                  k: 'budget' as const, label: 'Budget range',
                  opts: ['Under ₹5L', '₹5L – ₹10L', '₹10L – ₹20L', '₹20L – ₹35L', 'Above ₹35L'],
                },
              ]).map(({ k, label, opts }) => (
                <div key={k}>
                  <label className="block text-xs font-[500] text-charcoal mb-1">{label}</label>
                  <select
                    required={['propertyType', 'city', 'service'].includes(k)}
                    value={form[k]}
                    onChange={set(k)}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors bg-white appearance-none"
                    style={{ borderColor: '#dde8f5' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#dde8f5' }}
                  >
                    <option value="">Select…</option>
                    {opts.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}

              {/* Requirements */}
              <div>
                <label className="block text-xs font-[500] text-charcoal mb-1">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={set('requirements')}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                  style={{ borderColor: '#dde8f5' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#dde8f5' }}
                  placeholder="Tell us about your project…"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg font-head font-bold text-white text-[15px] transition-all duration-200 disabled:opacity-60"
                style={{ background: '#2f80ed' }}
                onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed' }}
              >
                {loading ? 'Sending…' : 'Get my free quote →'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default QuoteModal
