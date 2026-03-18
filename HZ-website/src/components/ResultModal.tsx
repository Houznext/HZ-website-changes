import { useEffect } from 'react'
import { CalcState, PRICING, computeEstimate } from './InteriorCalculator'

interface ResultModalProps {
  state: CalcState
  onClose: () => void
}

const PACKAGE_FEATURES: Record<string, string[]> = {
  essential: [
    'Modular kitchen (acrylic finish)',
    'Wardrobes in all bedrooms',
    'False ceiling (living + master)',
    'TV unit & shoe rack',
    '1-year workmanship warranty',
    'BuildLive daily tracking',
  ],
  premium: [
    'Modular kitchen (lacquered glass)',
    'Wardrobes with lofts & drawers',
    'False ceiling in all rooms',
    'TV unit + crockery unit + study',
    'Wall panelling in living & master',
    '1-year workmanship warranty',
  ],
  luxury: [
    'Italian lacquer / veneer kitchen',
    'Walk-in wardrobe with lighting',
    'POP false ceiling with cove lights',
    'Complete furniture package',
    'Imported bathroom fittings',
    '2-year comprehensive warranty',
  ],
}

const STYLE_LABEL: Record<string, string> = {
  essential: 'Essential',
  premium: 'Premium',
  luxury: 'Luxury',
}

const BHK_LABEL: Record<string, string> = {
  '2bhk': '2BHK',
  '3bhk': '3BHK',
  villa: 'Villa / 4BHK+',
}

const ALL_STYLES: Array<'essential' | 'premium' | 'luxury'> = ['essential', 'premium', 'luxury']

export default function ResultModal({ state, onClose }: ResultModalProps) {
  const [lo, hi] = computeEstimate(state)
  const features  = PACKAGE_FEATURES[state.style] ?? PACKAGE_FEATURES.premium
  const otherPkgs = ALL_STYLES.filter((s) => s !== state.style)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const waMsg = encodeURIComponent(
    `Hi Houznext! I just used your calculator.\n` +
    `Property: ${BHK_LABEL[state.bhk]}\n` +
    `Package: ${STYLE_LABEL[state.style]}\n` +
    `Rooms: ${state.rooms.join(', ')}\n` +
    `Name: ${state.name} | Phone: ${state.phone}`
  )

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(4px)', background: 'rgba(10,20,35,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full overflow-y-auto rounded-2xl bg-white shadow-2xl"
        style={{ maxWidth: 680, maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: '#e8f1fd' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed'; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#e8f1fd'; (e.currentTarget as HTMLButtonElement).style.color = '#1f2933' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1L11 11M11 1L1 11" />
          </svg>
        </button>

        {/* Dark header */}
        <div className="p-6 pb-5" style={{ background: '#0f2a44' }}>
          <span
            className="inline-block text-[11px] font-head font-bold px-3 py-1 rounded-full mb-3"
            style={{ background: 'rgba(242,153,74,0.15)', color: '#f2994a' }}
          >
            ✦ Your estimate is ready
          </span>
          <h2 className="font-head font-bold text-white text-[22px] mb-1">
            Hi {state.name || 'there'} 👋
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Based on your {BHK_LABEL[state.bhk]} · {state.rooms.length} rooms ·{' '}
            {STYLE_LABEL[state.style]} package
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Recommended package card */}
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#dde8f5' }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#2f80ed' }}>
              <div>
                <p className="text-xs font-[500] text-white/70 uppercase tracking-wider mb-0.5">Recommended</p>
                <h3 className="font-head font-bold text-white text-[18px]">
                  {STYLE_LABEL[state.style]} Package
                </h3>
              </div>
              <span
                className="text-[11px] font-head font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#f2994a', color: '#fff' }}
              >
                Best match
              </span>
            </div>

            <div className="p-5">
              {/* Price */}
              <div className="mb-4">
                <p className="text-[11px] font-[500] uppercase tracking-wider mb-1" style={{ color: '#5a6a7e' }}>
                  Estimated range
                </p>
                <p className="font-head font-bold text-[28px]" style={{ color: '#1f2933' }}>
                  ₹{lo}L – ₹{hi}L
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <svg className="mt-0.5 flex-shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="7" fill="#e8f1fd" />
                      <path d="M4 7l2 2 4-4" stroke="#2f80ed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[12px]" style={{ color: '#1f2933' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Delivery + total row */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl" style={{ background: '#e8f1fd' }}>
                <div>
                  <p className="text-[10px] font-[500] uppercase tracking-wider mb-0.5" style={{ color: '#5a6a7e' }}>Delivery</p>
                  <p className="text-sm font-bold" style={{ color: '#2f80ed' }}>42–48 days</p>
                </div>
                <div>
                  <p className="text-[10px] font-[500] uppercase tracking-wider mb-0.5" style={{ color: '#5a6a7e' }}>Fixed price</p>
                  <p className="text-sm font-bold" style={{ color: '#2f80ed' }}>No hidden costs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Other options */}
          <div>
            <p className="text-[12px] font-[600] uppercase tracking-wider mb-3" style={{ color: '#5a6a7e' }}>
              Other options
            </p>
            <div className="grid grid-cols-2 gap-3">
              {otherPkgs.map((pkg) => {
                const [plo, phi] = PRICING[pkg][state.bhk]
                return (
                  <div key={pkg} className="p-4 rounded-xl border" style={{ borderColor: '#dde8f5' }}>
                    <p className="font-head font-bold text-[13px] mb-1" style={{ color: '#1f2933' }}>
                      {STYLE_LABEL[pkg]}
                    </p>
                    <p className="text-[12px] font-[600]" style={{ color: '#2f80ed' }}>
                      ₹{plo}L – ₹{phi}L
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Next step info */}
          <div className="p-4 rounded-xl" style={{ background: '#f5f7fa', border: '1px solid #dde8f5' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#e8f1fd' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.59A2 2 0 012 .11h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-[600]" style={{ color: '#1f2933' }}>Design advisor will call you</p>
                <p className="text-[12px] mt-0.5" style={{ color: '#5a6a7e' }}>
                  Our team will call you within 2 hours to discuss your project in detail and arrange a free site visit.
                </p>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <a
              href={`https://wa.me/918498823043?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-head font-bold text-white transition-all hover:-translate-y-px"
              style={{ background: '#25D366' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
            <button
              onClick={onClose}
              className="flex items-center justify-center py-3 rounded-xl text-[13px] font-head font-bold text-white transition-all hover:-translate-y-px"
              style={{ background: '#2f80ed' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed' }}
            >
              Book free site visit →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
