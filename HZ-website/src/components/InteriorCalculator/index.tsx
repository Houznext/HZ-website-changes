import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  Fragment,
} from 'react'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import apiClient from '@/utils/apiClient'

// ─── Legacy exports (ResultModal.tsx) — keep API stable ───────────────────────

export type BHK = '2bhk' | '3bhk' | 'villa'
export type Style = 'essential' | 'premium' | 'luxury'

/** ResultModal + legacy calculator API */
export interface CalcState {
  bhk: BHK
  style: Style
  rooms: string[]
  budget: number
  name: string
  phone: string
  city: string
  callTime: string
  currentStep: 1 | 2 | 3 | 4
}

export const PRICING: Record<
  Style,
  Record<BHK, [number, number]>
> = {
  essential: { '2bhk': [4.5, 5.5], '3bhk': [6.5, 8], villa: [9, 12] },
  premium: { '2bhk': [7.5, 9], '3bhk': [11, 14], villa: [16, 22] },
  luxury: { '2bhk': [13, 18], '3bhk': [18, 25], villa: [28, 40] },
}

export function computeEstimate(state: CalcState): [number, number] {
  const [lo, hi] = PRICING[state.style][state.bhk]
  const factor = Math.max(0.5, state.rooms.length / 3)
  return [
    Math.round(lo * factor * 10) / 10,
    Math.round(hi * factor * 10) / 10,
  ]
}

// ─── New calculator state ─────────────────────────────────────────────────────

interface InteriorCalcState {
  propType: '2BHK' | '3BHK' | '4BHK+' | ''
  sqft: number
  rooms: Record<string, number>
  style: string
  pkg: 'Essential' | 'Premium' | 'Luxury'
  budget: number
  furniture: boolean
  name: string
  phone: string
  email: string
  timeline: string
}

const INITIAL_STATE: InteriorCalcState = {
  propType: '',
  sqft: 0,
  rooms: {},
  style: '',
  pkg: 'Premium',
  budget: 12,
  furniture: true,
  name: '',
  phone: '',
  email: '',
  timeline: '',
}

const SQFT_DATA = {
  '2BHK': [
    { label: 'Small', val: 'Under 800 sqft', sqft: 750 },
    { label: 'Large', val: '800–1100 sqft', sqft: 950 },
  ],
  '3BHK': [
    { label: 'Small', val: '1100–1400 sqft', sqft: 1250 },
    { label: 'Large', val: '1400–1800 sqft', sqft: 1600 },
  ],
  '4BHK+': [
    { label: 'Standard', val: '2000–2500 sqft', sqft: 2200 },
    { label: 'Large', val: '2500 sqft+', sqft: 3000 },
  ],
} as const

const ROOMS = [
  {
    id: 'living',
    name: 'Living room',
    sub: 'TV unit, sofa wall, ceiling',
    base: 180000,
  },
  {
    id: 'master',
    name: 'Master bedroom',
    sub: 'Wardrobe, study, ceiling',
    base: 160000,
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    sub: 'Modular cabinets, countertop',
    base: 220000,
  },
  {
    id: 'bed2',
    name: 'Bedroom 2',
    sub: 'Wardrobe, ceiling',
    base: 130000,
  },
  {
    id: 'bed3',
    name: 'Bedroom 3',
    sub: 'Wardrobe, ceiling',
    base: 130000,
  },
  {
    id: 'bathroom',
    name: 'Bathrooms',
    sub: 'Vanity, tiles, accessories',
    base: 80000,
  },
  {
    id: 'pooja',
    name: 'Pooja room',
    sub: 'Unit, mandir, ceiling',
    base: 60000,
  },
  {
    id: 'office',
    name: 'Home office',
    sub: 'Workstation, storage wall',
    base: 100000,
  },
]

const STYLES = [
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Clean lines, neutral tones',
    color: '#dbeafe',
    stroke: '#1e40af',
    path: 'M4 12h16M4 6h10M4 18h12',
  },
  {
    id: 'warm',
    name: 'Warm / Scandi',
    desc: 'Wood tones, cozy textures',
    color: '#fef3c7',
    stroke: '#92400e',
    path: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  },
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Rich details, timeless look',
    color: '#f3e8ff',
    stroke: '#6b21a8',
    path: 'M3 21h18M5 21V7l7-4 7 4v14',
  },
  {
    id: 'boho',
    name: 'Bohemian',
    desc: 'Layered textures, plants',
    color: '#dcfce7',
    stroke: '#166534',
    path: 'M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    desc: 'Exposed elements, raw finish',
    color: '#f1f5f9',
    stroke: '#334155',
    path: 'M2 20h20M6 20V9M18 20V9M4 9h16M9 9V5h6v4',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    desc: 'Italian finishes, premium',
    color: '#fef9ee',
    stroke: '#92400e',
    path: 'M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z',
  },
]

const PKG_MULTIPLIER = { Essential: 0.72, Premium: 1, Luxury: 1.65 } as const

const PKG_DATA = {
  Essential: {
    price: '₹4.5L+',
    sub: 'onwards for 2BHK',
    feats: [
      'Modular kitchen',
      'Wardrobes',
      'False ceiling',
      'TV unit',
      '1-yr warranty',
    ],
  },
  Premium: {
    price: '₹7.5L+',
    sub: 'onwards for 2BHK',
    feats: [
      'Everything in Essential',
      'Wall panelling',
      'Study unit',
      'Crockery unit',
      'LiveBuild tracking',
    ],
    popular: true,
  },
  Luxury: {
    price: '₹13L+',
    sub: 'onwards for 2BHK',
    feats: [
      'Italian lacquer finishes',
      'Walk-in wardrobe',
      'Smart lighting',
      'Full furniture package',
      '2-yr warranty',
    ],
  },
}

const STEPPER_LABELS = ['Property', 'Rooms', 'Style', 'Quality', 'Details']

type PropKey = '2BHK' | '3BHK' | '4BHK+'

function StrokeIcon({
  path,
  stroke = '#64748b',
  size = 22,
  className = '',
}: {
  path: string
  stroke?: string
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}

function CheckIcon({ color = '#fff', size = 10 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M1.5 5l2.5 2.5 4.5-4.5" />
    </svg>
  )
}

function calcEstimate(state: InteriorCalcState): {
  breakdown: { name: string; lo: number; hi: number }[]
  lo: number
  hi: number
} {
  const mul = PKG_MULTIPLIER[state.pkg]
  let base = 0
  const breakdown: { name: string; lo: number; hi: number }[] = []

  ROOMS.forEach((r) => {
    const q = state.rooms[r.id] || 0
    if (q > 0) {
      const lo = Math.round((r.base * mul * q) / 10000) / 10
      const hi = Math.round((r.base * mul * q * 1.38) / 10000) / 10
      breakdown.push({
        name: r.name + (q > 1 ? ` ×${q}` : ''),
        lo,
        hi,
      })
      base += r.base * mul * q
    }
  })

  if (state.furniture && base > 0) {
    const fl = Math.round((base * 0.18) / 10000) / 10
    const fh = Math.round((base * 0.28) / 10000) / 10
    breakdown.push({ name: 'Furniture package', lo: fl, hi: fh })
    base += base * 0.22
  }

  const lo = Math.round(base / 10000) / 10
  const hi = Math.round((base * 1.38) / 10000) / 10
  return { breakdown, lo, hi }
}

function isStepValid(step: number, state: InteriorCalcState): boolean {
  if (step === 1) return !!(state.propType && state.sqft)
  if (step === 2) return Object.values(state.rooms).some((v) => v > 0)
  if (step === 3) return !!state.style
  if (step === 4) return true
  if (step === 5)
    return (
      state.name.trim().length >= 2 && /^\d{10}$/.test(state.phone.trim())
    )
  return true
}

function RightArrow() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 7h10M7 2l5 5-5 5" />
    </svg>
  )
}

function LeftArrow() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 7H2M7 2L2 7l5 5" />
    </svg>
  )
}

export default function InteriorCalculator() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState<InteriorCalcState>(INITIAL_STATE)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openDd, setOpenDd] = useState<PropKey | null>(null)
  const [modalPkg, setModalPkg] = useState<'Essential' | 'Premium' | 'Luxury'>(
    'Premium',
  )
  const [showValidation, setShowValidation] = useState(false)
  const TOTAL_STEPS = 5
  const ddRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) {
        setOpenDd(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showModal])

  const handleSubmit = useCallback(async () => {
    if (!isStepValid(5, state)) return
    setSubmitting(true)

    const selectedRooms = ROOMS.filter((r) => (state.rooms[r.id] || 0) > 0)
      .map((r) =>
        `${r.name}${
          (state.rooms[r.id] || 0) > 1 ? ` ×${state.rooms[r.id]}` : ''
        }`,
      )
      .join(', ')

    const styleName = STYLES.find((s) => s.id === state.style)?.name || ''

    const est = calcEstimate(state)

    const normalizedName = state.name.trim().replace(/\s+/g, ' ')
    const [firstPart, ...restParts] = normalizedName.split(' ')
    const firstName = firstPart || 'Customer'
    const lastName = restParts.join(' ').trim() || 'Customer'
    const digits = state.phone.trim().replace(/\D/g, '').slice(-10)
    const fallbackEmail = `noreply+calc${digits}@houznext.com`
    const emailAddress = state.email.trim() || fallbackEmail

    const payload = {
      firstName,
      lastName,
      contactNumber: state.phone.trim(),
      emailAddress,
      serviceType: 'Home Interiors - Calculator',
      city: '',
      tellUsMore: JSON.stringify({
        propertyType: state.propType,
        sqft: state.sqft,
        rooms: selectedRooms,
        style: styleName,
        package: state.pkg,
        budget: `₹${state.budget}L`,
        furniture: state.furniture ? 'Yes' : 'No',
        timeline: state.timeline,
        estimateLow: `₹${est.lo}L`,
        estimateHigh: `₹${est.hi}L`,
      }),
    }

    try {
      await apiClient.post(apiClient.URLS.contact_us, payload)
      setSubmitted(true)
    } catch (err) {
      console.error('Calculator submit error:', err)
      setSubmitted(false)
      toast.error(
        'We could not save your details right now. Your estimate is still shown below — please try again or WhatsApp us.',
        { duration: 6000 },
      )
    } finally {
      setModalPkg('Premium')
      setShowModal(true)
      setSubmitting(false)
    }
  }, [state])

  const goNext = useCallback(() => {
    if (!isStepValid(step, state)) {
      setShowValidation(true)
      return
    }
    setShowValidation(false)
    if (step === TOTAL_STEPS) {
      void handleSubmit()
      return
    }
    setStep((s) => s + 1)
  }, [step, state, handleSubmit])

  const goBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1)
  }, [step])

  const valid = isStepValid(step, state)

  const modalEst = useMemo(
    () => calcEstimate({ ...state, pkg: modalPkg }),
    [state, modalPkg],
  )

  const baseSubmittedEst = useMemo(() => calcEstimate(state), [state])

  const styleName = STYLES.find((s) => s.id === state.style)?.name || ''

  const roomCount = ROOMS.filter((r) => (state.rooms[r.id] || 0) > 0).length

  const propButtons: { key: PropKey; title: string; sub: string; path: string }[] =
    [
      {
        key: '2BHK',
        title: '2BHK',
        sub: 'Compact homes',
        path: 'M3 21h18M5 21V7l7-4 7 4v14M9 21V12h6v9',
      },
      {
        key: '3BHK',
        title: '3BHK',
        sub: 'Family homes',
        path: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10',
      },
      {
        key: '4BHK+',
        title: '4BHK+',
        sub: 'Spacious / villa',
        path: 'M1 22h22M3 10l9-7 9 7M5 10v12M19 10v12',
      },
    ]

  const navPrimaryClick = () => {
    if (submitting) return
    if (valid) {
      setShowValidation(false)
      goNext()
    } else {
      setShowValidation(true)
    }
  }

  const renderStepBody = () => {
    if (step === 1) {
      return (
        <div>
          <p
            className="mb-3"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: '#0f2a44',
            }}
          >
            What type of property is this?
          </p>
          <div ref={ddRef} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {propButtons.map((b) => {
              const sel = state.propType === b.key
              const stroke = sel ? '#2f80ed' : '#64748b'
              return (
                <div key={b.key} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setState((prev) => ({
                        ...prev,
                        propType: b.key,
                        sqft: 0,
                      }))
                      setOpenDd(b.key)
                    }}
                    className="relative w-full text-left transition-all duration-200 ease-in-out"
                    style={{
                      border: `2px solid ${sel ? '#2f80ed' : '#e2e8f0'}`,
                      borderRadius: 12,
                      padding: '14px 16px',
                      background: sel ? '#f0f7ff' : '#fff',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#93c5fd'
                        e.currentTarget.style.background = '#f0f7ff'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow =
                          '0 4px 16px rgba(47,128,237,.12)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    {sel && (
                      <span
                        className="absolute flex items-center justify-center"
                        style={{
                          top: 8,
                          right: 8,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: '#2f80ed',
                        }}
                      >
                        <CheckIcon color="#fff" size={10} />
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <StrokeIcon path={b.path} stroke={stroke} size={28} />
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: '#0f2a44',
                          }}
                        >
                          {b.title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: '#64748b',
                            marginTop: 2,
                          }}
                        >
                          {b.sub}
                        </div>
                      </div>
                    </div>
                  </button>
                  {openDd === b.key && (
                    <div
                      className="absolute left-0 right-0 z-50 bg-white"
                      style={{
                        top: 'calc(100% + 8px)',
                        border: '2px solid #2f80ed',
                        borderRadius: 12,
                        padding: 10,
                        boxShadow: '0 8px 32px rgba(15,42,68,.15)',
                        animation: 'houznext-dd .2s ease forwards',
                      }}
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <style>{`@keyframes houznext-dd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#0f2a44',
                          marginBottom: 8,
                        }}
                      >
                        Select size
                      </p>
                      <div
                        className="grid grid-cols-2 gap-2"
                        style={{ gap: 8 }}
                      >
                        {SQFT_DATA[b.key].map((o) => {
                          const s2 = state.sqft === o.sqft
                          return (
                            <button
                              key={o.label}
                              type="button"
                              onClick={(ev) => {
                                ev.stopPropagation()
                                setState((prev) => ({
                                  ...prev,
                                  sqft: o.sqft,
                                }))
                                setOpenDd(null)
                              }}
                              className="text-center transition-all duration-200"
                              style={{
                                border: `1.5px solid ${s2 ? '#2f80ed' : '#e2e8f0'}`,
                                borderRadius: 9,
                                padding: 10,
                                background: s2 ? '#f0f7ff' : '#fff',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#2f80ed'
                                e.currentTarget.style.background = '#f0f7ff'
                                e.currentTarget.style.transform = 'scale(1.02)'
                              }}
                              onMouseLeave={(e) => {
                                if (!s2) {
                                  e.currentTarget.style.borderColor = '#e2e8f0'
                                  e.currentTarget.style.background = '#fff'
                                  e.currentTarget.style.transform = 'scale(1)'
                                }
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: '#0f2a44',
                                }}
                              >
                                {o.label}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: '#64748b',
                                  marginTop: 2,
                                }}
                              >
                                {o.val}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {state.propType && state.sqft ? (
            <div
              className="mt-3 flex items-center gap-2"
              style={{
                background: '#f0f7ff',
                borderRadius: 9,
                padding: '10px 14px',
              }}
            >
              <CheckIcon color="#2f80ed" size={15} />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#0f2a44',
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {state.propType} · {state.sqft} sqft selected
              </span>
            </div>
          ) : (
            <p
              className="mt-2 text-center"
              style={{ fontSize: 12, color: '#94a3b8' }}
            >
              Click a property type, then choose your size
            </p>
          )}
          {showValidation && step === 1 && !valid && (
            <p className="mt-2 text-center" style={{ fontSize: 12, color: '#e11d48' }}>
              Please select property type and size to continue.
            </p>
          )}
        </div>
      )
    }

    if (step === 2) {
      return (
        <div>
          <p
            className="mb-3"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: '#0f2a44',
            }}
          >
            Which rooms do you want interiors for?
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ROOMS.map((r) => {
              const q = state.rooms[r.id] || 0
              const active = q > 0
              return (
                <div
                  key={r.id}
                  className="flex flex-row items-center justify-between transition-all duration-200"
                  style={{
                    border: `1.5px solid ${active ? '#2f80ed' : '#e2e8f0'}`,
                    borderRadius: 10,
                    padding: '11px 13px',
                    background: active ? '#f0f7ff' : '#fff',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: '#0f2a44',
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#64748b',
                        marginTop: 2,
                      }}
                    >
                      {r.sub}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease"
                      disabled={q === 0}
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          rooms: {
                            ...prev.rooms,
                            [r.id]: Math.max(0, (prev.rooms[r.id] || 0) - 1),
                          },
                        }))
                      }
                      className="flex items-center justify-center transition-all duration-200"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        border: '1.5px solid #e2e8f0',
                        background: '#fff',
                        cursor: q === 0 ? 'default' : 'pointer',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0f2a44',
                        opacity: q === 0 ? 0.4 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (q === 0) return
                        e.currentTarget.style.borderColor = '#2f80ed'
                        e.currentTarget.style.color = '#2f80ed'
                        e.currentTarget.style.background = '#f0f7ff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.color = '#0f2a44'
                        e.currentTarget.style.background = '#fff'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.88)'
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        minWidth: 18,
                        textAlign: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#0f2a44',
                      }}
                    >
                      {q}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() =>
                        setState((prev) => ({
                          ...prev,
                          rooms: {
                            ...prev.rooms,
                            [r.id]: (prev.rooms[r.id] || 0) + 1,
                          },
                        }))
                      }
                      className="flex items-center justify-center transition-all duration-200"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        border: '1.5px solid #e2e8f0',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0f2a44',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2f80ed'
                        e.currentTarget.style.color = '#2f80ed'
                        e.currentTarget.style.background = '#f0f7ff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.color = '#0f2a44'
                        e.currentTarget.style.background = '#fff'
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.88)'
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <p
            className="mt-3 text-center"
            style={{
              fontSize: 12,
              color: roomCount > 0 ? '#64748b' : '#94a3b8',
            }}
          >
            {roomCount > 0
              ? `${roomCount} room${roomCount > 1 ? 's' : ''} selected`
              : 'Select at least one room'}
          </p>
          {showValidation && step === 2 && !valid && (
            <p className="mt-2 text-center" style={{ fontSize: 12, color: '#e11d48' }}>
              Pick at least one room to continue.
            </p>
          )}
        </div>
      )
    }

    if (step === 3) {
      return (
        <div>
          <p
            className="mb-3"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: '#0f2a44',
            }}
          >
            What interior style do you like?
          </p>
          <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-3">
            {STYLES.map((s) => {
              const sel = state.style === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, style: s.id }))
                  }
                  className="relative overflow-hidden text-left transition-all duration-200"
                  style={{
                    border: `2px solid ${sel ? '#2f80ed' : '#e2e8f0'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!sel) {
                      e.currentTarget.style.borderColor = '#93c5fd'
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow =
                        '0 6px 20px rgba(47,128,237,.13)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!sel) {
                      e.currentTarget.style.borderColor = '#e2e8f0'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  <div
                    className="relative flex items-center justify-center"
                    style={{ height: 72, background: s.color }}
                  >
                    <StrokeIcon path={s.path} stroke={s.stroke} size={30} />
                    {sel && (
                      <span
                        className="absolute flex items-center justify-center"
                        style={{
                          top: 6,
                          right: 8,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#2f80ed',
                        }}
                      >
                        <CheckIcon color="#fff" size={9} />
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#0f2a44',
                      }}
                    >
                      {s.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: '#64748b',
                        marginTop: 2,
                        lineHeight: 1.4,
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {showValidation && step === 3 && !valid && (
            <p className="mt-3 text-center" style={{ fontSize: 12, color: '#e11d48' }}>
              Please choose a style.
            </p>
          )}
        </div>
      )
    }

    if (step === 4) {
      return (
        <div className="space-y-6">
          <div>
            <p
              className="mb-3"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: '#0f2a44',
              }}
            >
              Choose your package
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(Object.keys(PKG_DATA) as (keyof typeof PKG_DATA)[]).map((p) => {
                const d = PKG_DATA[p]
                const sel = state.pkg === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setState((prev) => ({ ...prev, pkg: p }))
                    }
                    className="relative text-center transition-all duration-200"
                    style={{
                      border: `2px solid ${sel ? '#2f80ed' : '#e2e8f0'}`,
                      borderRadius: 12,
                      padding: '16px 12px',
                      background: sel ? '#f0f7ff' : '#fff',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#93c5fd'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow =
                          '0 6px 20px rgba(47,128,237,.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    {'popular' in d && d.popular && (
                      <span
                        className="absolute whitespace-nowrap font-bold text-white"
                        style={{
                          top: -11,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#2f80ed',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 20,
                        }}
                      >
                        Most popular
                      </span>
                    )}
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: '#0f2a44',
                        marginTop: 4,
                      }}
                    >
                      {p}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: '#2f80ed',
                        marginTop: 4,
                      }}
                    >
                      {d.price}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: '#64748b',
                        marginTop: 2,
                      }}
                    >
                      {d.sub}
                    </div>
                    <ul className="mt-3 space-y-1.5 text-left">
                      {d.feats.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2"
                          style={{ fontSize: 11, color: '#64748b' }}
                        >
                          <span className="mt-0.5 flex-shrink-0">
                            <StrokeIcon
                              path="M4 12l4 4 8-8"
                              stroke={sel ? '#2f80ed' : '#94a3b8'}
                              size={12}
                            />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p
              className="mb-1"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: '#0f2a44',
              }}
            >
              Your overall budget
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: '#2f80ed',
                marginBottom: 8,
              }}
            >
              ₹{state.budget}L
            </p>
            <input
              type="range"
              min={4}
              max={50}
              step={1}
              value={state.budget}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  budget: parseInt(e.target.value, 10),
                }))
              }
              style={{ accentColor: '#2f80ed', width: '100%' }}
            />
            <div
              className="flex justify-between"
              style={{ marginTop: 5, fontSize: 12, color: '#64748b' }}
            >
              <span>₹4L</span>
              <span>₹50L+</span>
            </div>
          </div>
          <div>
            <p
              className="mb-2"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: '#0f2a44',
              }}
            >
              Include furniture?
            </p>
            <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2">
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({ ...prev, furniture: true }))
                }
                className="flex items-center gap-[10px] text-left transition-all duration-200"
                style={{
                  border: `2px solid ${state.furniture ? '#2f80ed' : '#e2e8f0'}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  background: state.furniture ? '#f0f7ff' : '#fff',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!state.furniture) {
                    e.currentTarget.style.borderColor = '#93c5fd'
                    e.currentTarget.style.background = '#f0f7ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!state.furniture) {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.background = '#fff'
                  }
                }}
              >
                <StrokeIcon
                  path="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 0H4m16 0l-2 8H6l-2-8"
                  stroke={state.furniture ? '#2f80ed' : '#64748b'}
                  size={22}
                />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0f2a44',
                    }}
                  >
                    Yes, include furniture
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Sofas, beds, dining, storage
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((prev) => ({ ...prev, furniture: false }))
                }
                className="flex items-center gap-[10px] text-left transition-all duration-200"
                style={{
                  border: `2px solid ${!state.furniture ? '#2f80ed' : '#e2e8f0'}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  background: !state.furniture ? '#f0f7ff' : '#fff',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (state.furniture) {
                    e.currentTarget.style.borderColor = '#93c5fd'
                    e.currentTarget.style.background = '#f0f7ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (state.furniture) {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.background = '#fff'
                  }
                }}
              >
                <StrokeIcon
                  path="M4 6h16M4 10h16M4 14h16M4 18h16"
                  stroke={!state.furniture ? '#2f80ed' : '#64748b'}
                  size={22}
                />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#0f2a44',
                    }}
                  >
                    No, just interiors
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    Modular, ceiling, walls only
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )
    }

    /* step 5 */
    return (
      <div>
        <div
          className="mb-[14px] grid grid-cols-1 gap-3 sm:grid-cols-2"
          style={{ gap: 12 }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              FULL NAME *
            </label>
            <input
              type="text"
              placeholder="e.g. Ravi Reddy"
              value={state.name}
              onChange={(e) =>
                setState((prev) => ({ ...prev, name: e.target.value }))
              }
              style={{
                width: '100%',
                padding: '10px 13px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 9,
                fontSize: 13.5,
                color: '#0f2a44',
                outline: 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'all 0.18s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2f80ed'
                e.currentTarget.style.background = '#f0f7ff'
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(47,128,237,.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              PHONE NUMBER *
            </label>
            <input
              type="tel"
              placeholder="10-digit mobile"
              value={state.phone}
              onChange={(e) =>
                setState((prev) => ({ ...prev, phone: e.target.value }))
              }
              style={{
                width: '100%',
                padding: '10px 13px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 9,
                fontSize: 13.5,
                color: '#0f2a44',
                outline: 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'all 0.18s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2f80ed'
                e.currentTarget.style.background = '#f0f7ff'
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(47,128,237,.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="optional"
              value={state.email}
              onChange={(e) =>
                setState((prev) => ({ ...prev, email: e.target.value }))
              }
              style={{
                width: '100%',
                padding: '10px 13px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 9,
                fontSize: 13.5,
                color: '#0f2a44',
                outline: 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'all 0.18s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2f80ed'
                e.currentTarget.style.background = '#f0f7ff'
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(47,128,237,.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              WHEN TO START?
            </label>
            <select
              value={state.timeline}
              onChange={(e) =>
                setState((prev) => ({ ...prev, timeline: e.target.value }))
              }
              style={{
                width: '100%',
                padding: '10px 13px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 9,
                fontSize: 13.5,
                color: '#0f2a44',
                outline: 'none',
                fontFamily: "'Inter', system-ui, sans-serif",
                transition: 'all 0.18s',
                background: '#fff',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2f80ed'
                e.currentTarget.style.background = '#f0f7ff'
                e.currentTarget.style.boxShadow =
                  '0 0 0 3px rgba(47,128,237,.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="" disabled>
                Select timeline
              </option>
              <option value="1m">Within 1 month</option>
              <option value="3m">1–3 months</option>
              <option value="6m">3–6 months</option>
              <option value="exp">Just exploring</option>
            </select>
          </div>
        </div>
        <div
          className="flex flex-row items-start gap-[9px]"
          style={{
            background: '#f8fafc',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <StrokeIcon
            path="M12 22s-8-4.5-8-11V5l8-3 8 3v6c0 6.5-8 11-8 11z"
            stroke="#2f80ed"
            size={16}
            className="mt-0.5 flex-shrink-0"
          />
          <p
            style={{
              fontSize: 12,
              color: '#64748b',
              lineHeight: 1.55,
              margin: 0,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Our design advisor will call within 2 hours with a detailed
            breakdown and free 3D design mock-up. No commitment required.
          </p>
        </div>
        <div
          className="mt-[10px] flex flex-row items-center gap-[7px]"
          style={{ marginTop: 10 }}
        >
          <StrokeIcon
            path="M12 22s-8-4.5-8-11V5l8-3 8 3v6c0 6.5-8 11-8 11z"
            stroke="#94a3b8"
            size={13}
          />
          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
            Private & secure — no spam, ever
          </span>
        </div>
        {showValidation && step === 5 && !valid && (
          <p className="mt-3 text-center" style={{ fontSize: 12, color: '#e11d48' }}>
            Enter your full name (2+ letters) and a valid 10-digit mobile number.
          </p>
        )}
      </div>
    )
  }

  const modalContent = (
    <div
      role="presentation"
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 9999,
        background: 'rgba(10,20,35,.72)',
        padding: 20,
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setShowModal(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full overflow-y-auto bg-white"
        style={{
          maxWidth: 580,
          maxHeight: '90vh',
          borderRadius: 20,
          animation: 'houznext-modal .3s cubic-bezier(.34,1.56,.64,1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes houznext-modal {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
        <div
          className="flex flex-row items-center justify-between"
          style={{
            background: '#0f2a44',
            borderRadius: '20px 20px 0 0',
            padding: '18px 24px',
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Your personalised estimate
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setShowModal(false)}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,.5)',
              background: 'rgba(255,255,255,.12)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              lineHeight: 1,
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,.25)'
              e.currentTarget.style.borderColor = '#fff'
              e.currentTarget.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,.12)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,.5)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 22 }}>
          <div
            className="mb-[18px] text-center"
            style={{
              background: '#0f2a44',
              borderRadius: 14,
              padding: 22,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(255,255,255,.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 6,
                margin: '0 0 6px',
              }}
            >
              ESTIMATED COST RANGE
            </p>
            <p
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: '#fff',
                margin: '0 0 8px',
              }}
            >
              ₹{modalEst.lo}L – ₹{modalEst.hi}L
            </p>
            <p
              style={{
                fontSize: 12,
                color: '#f2994a',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {modalPkg} · {state.propType} · {styleName} style
            </p>
          </div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0f2a44',
              margin: '0 0 10px',
            }}
          >
            Choose your package
          </p>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {(Object.keys(PKG_MULTIPLIER) as (keyof typeof PKG_MULTIPLIER)[]).map(
              (p) => {
                const sel = modalPkg === p
                const ratio =
                  PKG_MULTIPLIER[p] / PKG_MULTIPLIER[state.pkg]
                const lo = Math.round(baseSubmittedEst.lo * ratio * 10) / 10
                const hi = Math.round(baseSubmittedEst.hi * ratio * 10) / 10
                const d = PKG_DATA[p]
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setModalPkg(p)}
                    className="relative text-center transition-all duration-200"
                    style={{
                      border: `2px solid ${sel ? '#2f80ed' : '#e2e8f0'}`,
                      borderRadius: 10,
                      padding: '12px 10px',
                      background: sel ? '#f0f7ff' : '#fff',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#93c5fd'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
                    }}
                  >
                    {p === 'Premium' && (
                      <span
                        className="absolute whitespace-nowrap font-bold text-white"
                        style={{
                          top: -11,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#2f80ed',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 20,
                        }}
                      >
                        Best value
                      </span>
                    )}
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#0f2a44',
                        marginTop: 6,
                      }}
                    >
                      {p}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: '#2f80ed',
                        marginTop: 4,
                      }}
                    >
                      ₹{lo}L – ₹{hi}L
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                      {d.sub}
                    </div>
                  </button>
                )
              },
            )}
          </div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#0f2a44',
              margin: '0 0 10px',
            }}
          >
            Cost breakdown
          </p>
          <div>
            {modalEst.breakdown.map((row) => (
              <div
                key={row.name}
                className="flex flex-row justify-between"
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: 13,
                }}
              >
                <span style={{ color: '#64748b' }}>{row.name}</span>
                <span style={{ fontWeight: 700, color: '#0f2a44' }}>
                  ₹{row.lo}L – ₹{row.hi}L
                </span>
              </div>
            ))}
            <div
              className="mt-1 flex flex-row justify-between"
              style={{
                padding: '14px 16px',
                background: '#f0f7ff',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f2a44' }}>
                Total estimate
              </span>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#2f80ed' }}>
                ₹{modalEst.lo}L – ₹{modalEst.hi}L
              </span>
            </div>
          </div>
          <div
            style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: '12px 14px',
              marginBottom: 16,
              marginTop: 16,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: '#64748b',
                lineHeight: 1.55,
                margin: 0,
              }}
            >
              Our design advisor will call you within 2 hours with a detailed
              breakdown and free 3D design mock-up. No commitment required.
            </p>
          </div>
          <div
            className="flex flex-row flex-wrap gap-[10px]"
            style={{ gap: 10 }}
          >
            <a
              href="https://wa.me/919759750770?text=Hi%20Houznext%2C%20I%20want%20a%20free%20interior%20consultation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-row items-center justify-center gap-2 font-bold text-white transition-all duration-150"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#25D366',
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                minWidth: 140,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#128C7E'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#25D366'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="tel:+919759750770"
              className="flex flex-1 flex-row items-center justify-center font-bold transition-all duration-150"
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #0f2a44',
                color: '#0f2a44',
                background: '#fff',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 140,
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0f2a44'
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff'
                e.currentTarget.style.color = '#0f2a44'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Call +91 97597 50770
            </a>
          </div>
          <p
            style={{
              fontSize: 11,
              color: '#94a3b8',
              textAlign: 'center',
              marginTop: 12,
              lineHeight: 1.5,
              marginBottom: 0,
            }}
          >
            Indicative estimate only. Final price is fixed after site
            measurement. All Houznext quotes are zero hidden costs.
          </p>
          {submitted && (
            <p
              className="mt-2 text-center"
              style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}
            >
              Thanks — we received your details.
            </p>
          )}
        </div>
      </div>
    </div>
  )

  const nextBtnReady = valid
  const isLast = step === TOTAL_STEPS

  return (
    <div
      className="mx-auto w-full"
      style={{ maxWidth: 700, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes houznext-fade {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="overflow-hidden bg-white"
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: 18,
          boxShadow: '0 2px 12px rgba(15,42,68,.06)',
        }}
      >
        <div
          className="flex flex-row items-center justify-between"
          style={{ background: '#0f2a44', padding: '16px 24px' }}
        >
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
            Interior Cost Calculator
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
        <div style={{ padding: '18px 24px 0', background: '#fff' }}>
          <div className="flex w-full flex-row items-start">
            {STEPPER_LABELS.map((label, idx) => {
              const i = idx + 1
              const past = i < step
              const active = i === step
              return (
                <Fragment key={label}>
                  {idx > 0 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: step > idx ? '#0f2a44' : '#e2e8f0',
                        marginTop: 14,
                      }}
                    />
                  )}
                  <div className="flex flex-shrink-0 flex-col items-center">
                    <div
                      className="flex items-center justify-center text-[11px] font-bold"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: past
                          ? '#0f2a44'
                          : active
                            ? '#2f80ed'
                            : '#fff',
                        border: `2px solid ${
                          past || active ? (active ? '#2f80ed' : '#0f2a44') : '#e2e8f0'
                        }`,
                        color:
                          past || active
                            ? '#fff'
                            : '#94a3b8',
                        boxShadow: active
                          ? '0 0 0 4px rgba(47,128,237,.15)'
                          : 'none',
                        fontWeight: active ? 800 : 600,
                      }}
                    >
                      {past ? (
                        <CheckIcon color="#fff" size={10} />
                      ) : (
                        i
                      )}
                    </div>
                    <span
                      style={{
                        marginTop: 6,
                        fontSize: 11,
                        fontWeight: past
                          ? 600
                          : active
                            ? 700
                            : 500,
                        color: past
                          ? '#0f2a44'
                          : active
                            ? '#2f80ed'
                            : '#94a3b8',
                        textAlign: 'center',
                        maxWidth: 72,
                        lineHeight: 1.2,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                </Fragment>
              )
            })}
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div key={step} style={{ animation: 'houznext-fade .28s ease' }}>
            {renderStepBody()}
          </div>
        </div>
        <div
          className="flex flex-row items-center justify-between"
          style={{
            borderTop: '1px solid #e2e8f0',
            padding: '16px 24px',
          }}
        >
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="flex flex-row items-center gap-[6px] transition-all duration-200"
            style={{
              padding: '10px 20px',
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              background: '#fff',
              fontSize: 13,
              fontWeight: 600,
              color: '#64748b',
              cursor: step === 1 ? 'not-allowed' : 'pointer',
              opacity: step === 1 ? 0.35 : 1,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
            onMouseEnter={(e) => {
              if (step === 1) return
              e.currentTarget.style.borderColor = '#94a3b8'
              e.currentTarget.style.color = '#0f2a44'
              e.currentTarget.style.background = '#f8fafc'
            }}
            onMouseLeave={(e) => {
              if (step === 1) return
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.color = '#64748b'
              e.currentTarget.style.background = '#fff'
            }}
          >
            <LeftArrow />
            Back
          </button>
          <button
            type="button"
            onClick={navPrimaryClick}
            className="flex flex-row items-center gap-2 transition-all duration-300"
            style={{
              padding: isLast ? '12px 32px' : '11px 28px',
              border: 'none',
              borderRadius: 10,
              fontSize: isLast ? 14 : 13,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: nextBtnReady
                ? isLast
                  ? '#0f2a44'
                  : '#2f80ed'
                : '#cbd5e1',
              color: nextBtnReady ? '#fff' : '#94a3b8',
              boxShadow: nextBtnReady
                ? isLast
                  ? '0 2px 8px rgba(15,42,68,.2)'
                  : '0 2px 8px rgba(47,128,237,.2)'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (!nextBtnReady) return
              if (isLast) {
                e.currentTarget.style.background = '#1e3a5c'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow =
                  '0 6px 20px rgba(15,42,68,.3)'
              } else {
                e.currentTarget.style.background = '#1a6dd6'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow =
                  '0 6px 20px rgba(47,128,237,.4)'
              }
            }}
            onMouseLeave={(e) => {
              if (!nextBtnReady) return
              e.currentTarget.style.transform = 'translateY(0)'
              if (isLast) {
                e.currentTarget.style.background = '#0f2a44'
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(15,42,68,.2)'
              } else {
                e.currentTarget.style.background = '#2f80ed'
                e.currentTarget.style.boxShadow =
                  '0 2px 8px rgba(47,128,237,.2)'
              }
            }}
            onMouseDown={(e) => {
              if (nextBtnReady) e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {submitting && isLast
              ? 'Submitting…'
              : isLast
                ? 'Get my estimate'
                : 'Next'}
            <RightArrow />
          </button>
        </div>
      </div>
      {typeof document !== 'undefined' &&
        showModal &&
        createPortal(modalContent, document.body)}
    </div>
  )
}
