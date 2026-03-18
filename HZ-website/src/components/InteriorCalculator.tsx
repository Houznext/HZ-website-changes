import { useState } from 'react'
import ResultModal from './ResultModal'

// ─── Types ───────────────────────────────────────────────────────────────────

type BHK   = '2bhk' | '3bhk' | 'villa'
type Style = 'essential' | 'premium' | 'luxury'

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

const INITIAL_STATE: CalcState = {
  bhk: '2bhk',
  style: 'premium',
  rooms: ['Living room', 'Kitchen', 'Master bedroom'],
  budget: 10,
  name: '', phone: '', city: '', callTime: '',
  currentStep: 1,
}

// ─── Pricing logic (not shown in UI until ResultModal) ────────────────────────

export const PRICING: Record<Style, Record<BHK, [number, number]>> = {
  essential: { '2bhk': [4.5, 5.5], '3bhk': [6.5, 8],  villa: [9,  12] },
  premium:   { '2bhk': [7.5, 9],   '3bhk': [11,  14],  villa: [16, 22] },
  luxury:    { '2bhk': [13,  18],  '3bhk': [18,  25],  villa: [28, 40] },
}

export function computeEstimate(state: CalcState): [number, number] {
  const [lo, hi] = PRICING[state.style][state.bhk]
  const factor = Math.max(0.5, state.rooms.length / 3)
  return [
    Math.round(lo * factor * 10) / 10,
    Math.round(hi * factor * 10) / 10,
  ]
}

// ─── Step data ────────────────────────────────────────────────────────────────

const BHK_OPTIONS: { value: BHK; label: string; sub: string }[] = [
  { value: '2bhk',  label: '2BHK',         sub: '800–1100 sqft' },
  { value: '3bhk',  label: '3BHK',         sub: '1200–1600 sqft' },
  { value: 'villa', label: 'Villa / 4BHK+', sub: '2000+ sqft' },
]

const STYLE_OPTIONS: { value: Style; label: string; sub: string; icon: string }[] = [
  { value: 'essential', label: 'Simple & functional',   sub: 'Clean, practical interiors',    icon: '🪑' },
  { value: 'premium',   label: 'Modern & stylish',      sub: 'Trendy with quality finishes',  icon: '✨' },
  { value: 'luxury',    label: 'Premium & luxurious',   sub: 'Top-tier materials & design',   icon: '💎' },
  { value: 'essential', label: 'Not sure yet',          sub: 'We\'ll help you decide',        icon: '🤔' },
]

const ROOM_OPTIONS: { label: string; range: string }[] = [
  { label: 'Living room',    range: '₹1.2L–₹1.8L' },
  { label: 'Kitchen',        range: '₹1.5L–₹2.5L' },
  { label: 'Master bedroom', range: '₹0.8L–₹1.4L' },
  { label: 'Bedroom 2',      range: '₹0.6L–₹1.2L' },
  { label: 'Bedroom 3',      range: '₹0.6L–₹1.2L' },
  { label: 'Dining',         range: '₹0.4L–₹0.8L' },
  { label: 'Pooja unit',     range: '₹0.3L–₹0.6L' },
  { label: 'Bathroom',       range: '₹0.5L–₹0.9L' },
  { label: 'Balcony',        range: '₹0.2L–₹0.5L' },
]

const CITIES = ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Other']
const CALL_TIMES = ['9 AM – 11 AM', '11 AM – 1 PM', '1 PM – 3 PM', '3 PM – 6 PM', 'Evening 6 PM+']
const STEP_LABELS = ['Property', 'Style', 'Rooms', 'Details']

// ─── Component ───────────────────────────────────────────────────────────────

export default function InteriorCalculator() {
  const [state, setState] = useState<CalcState>(INITIAL_STATE)
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(false)

  const update = (patch: Partial<CalcState>) => setState((s) => ({ ...s, ...patch }))
  const step = state.currentStep

  const nextStep = () => {
    if (step < 4) update({ currentStep: (step + 1) as CalcState['currentStep'] })
  }
  const prevStep = () => {
    if (step > 1) update({ currentStep: (step - 1) as CalcState['currentStep'] })
  }

  const toggleRoom = (room: string) => {
    update({
      rooms: state.rooms.includes(room)
        ? state.rooms.filter((r) => r !== room)
        : [...state.rooms, room],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    setShowResult(true)
  }

  const progress = ((step - 1) / 3) * 100

  return (
    <>
      <div className="rounded-2xl overflow-hidden shadow-xl border" style={{ borderColor: '#dde8f5', maxWidth: 560, width: '100%' }}>
        {/* Header */}
        <div className="px-6 py-4" style={{ background: '#0f2a44' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-head font-bold text-white text-[15px]">Interior Cost Calculator</h3>
            <span className="text-xs font-[500]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Step {step} of 4
            </span>
          </div>
          {/* Step pills */}
          <div className="flex items-center gap-2 mb-3">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const done = n < step
              const active = n === step
              return (
                <div key={label} className="flex items-center gap-1 flex-1">
                  <div
                    className="flex items-center gap-1.5 text-[11px] font-[500] whitespace-nowrap"
                    style={{ color: active ? '#fff' : done ? '#2f80ed' : 'rgba(255,255,255,0.4)' }}
                  >
                    {done ? (
                      <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#2f80ed' }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 4l2 2 4-4" />
                        </svg>
                      </span>
                    ) : (
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px]"
                        style={{
                          background: active ? '#2f80ed' : 'rgba(255,255,255,0.15)',
                          color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {n}
                      </span>
                    )}
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < 3 && <div className="flex-1 h-px mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />}
                </div>
              )
            })}
          </div>
          {/* Progress bar */}
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#2f80ed' }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6" style={{ background: '#fff' }}>
          {step === 1 && (
            <Step1
              bhk={state.bhk}
              budget={state.budget}
              onBhk={(bhk) => update({ bhk })}
              onBudget={(budget) => update({ budget })}
            />
          )}
          {step === 2 && (
            <Step2
              style={state.style}
              onStyle={(s) => update({ style: s })}
            />
          )}
          {step === 3 && (
            <Step3
              rooms={state.rooms}
              onToggle={toggleRoom}
            />
          )}
          {step === 4 && (
            <Step4
              state={state}
              onChange={update}
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}
        </div>

        {/* Footer nav (steps 1–3) */}
        {step < 4 && (
          <div className="px-6 pb-5 flex items-center justify-between" style={{ background: '#fff' }}>
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-5 py-2 rounded-lg text-sm font-[500] border transition-colors disabled:opacity-30"
              style={{ borderColor: '#dde8f5', color: '#5a6a7e' }}
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="px-5 py-2 rounded-lg text-sm font-head font-bold text-white transition-all hover:-translate-y-px"
              style={{ background: '#2f80ed' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {showResult && (
        <ResultModal state={state} onClose={() => setShowResult(false)} />
      )}
    </>
  )
}

// ─── Steps ───────────────────────────────────────────────────────────────────

function Step1({
  bhk, budget, onBhk, onBudget,
}: {
  bhk: BHK; budget: number; onBhk: (b: BHK) => void; onBudget: (n: number) => void
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-[600] text-charcoal mb-3">Select property type</p>
        <div className="grid grid-cols-3 gap-2">
          {BHK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onBhk(opt.value)}
              className="p-3 rounded-xl border-2 text-left transition-all"
              style={{
                borderColor: bhk === opt.value ? '#2f80ed' : '#dde8f5',
                background: bhk === opt.value ? '#e8f1fd' : '#fff',
              }}
            >
              <p className="font-head font-bold text-[13px]" style={{ color: bhk === opt.value ? '#2f80ed' : '#1f2933' }}>
                {opt.label}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: '#5a6a7e' }}>{opt.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-[600] text-charcoal">Budget range</p>
          <span className="text-sm font-bold" style={{ color: '#2f80ed' }}>₹{budget}L</span>
        </div>
        <input
          type="range"
          min={4}
          max={40}
          step={0.5}
          value={budget}
          onChange={(e) => onBudget(parseFloat(e.target.value))}
          className="w-full accent-[#2f80ed]"
          style={{ accentColor: '#2f80ed' }}
        />
        <div className="flex justify-between text-[11px] mt-1" style={{ color: '#5a6a7e' }}>
          <span>₹4L</span><span>₹40L</span>
        </div>
      </div>
    </div>
  )
}

function Step2({ style, onStyle }: { style: Style; onStyle: (s: Style) => void }) {
  return (
    <div>
      <p className="text-sm font-[600] text-charcoal mb-3">What style are you looking for?</p>
      <div className="space-y-2">
        {STYLE_OPTIONS.map((opt, i) => (
          <button
            key={i}
            onClick={() => onStyle(opt.value)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
            style={{
              borderColor: style === opt.value && opt.label !== "Not sure yet" ? '#2f80ed' : '#dde8f5',
              background: style === opt.value && opt.label !== "Not sure yet" ? '#e8f1fd' : '#fff',
            }}
          >
            <span className="text-xl">{opt.icon}</span>
            <div>
              <p className="text-[13px] font-[600]" style={{ color: '#1f2933' }}>{opt.label}</p>
              <p className="text-[11px]" style={{ color: '#5a6a7e' }}>{opt.sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Step3({ rooms, onToggle }: { rooms: string[]; onToggle: (r: string) => void }) {
  return (
    <div>
      <p className="text-sm font-[600] text-charcoal mb-3">Which rooms to include?</p>
      <div className="grid grid-cols-3 gap-2">
        {ROOM_OPTIONS.map((opt) => {
          const on = rooms.includes(opt.label)
          return (
            <button
              key={opt.label}
              onClick={() => onToggle(opt.label)}
              className="p-2.5 rounded-xl border-2 text-left transition-all"
              style={{
                borderColor: on ? '#2f80ed' : '#dde8f5',
                background: on ? '#e8f1fd' : '#fff',
              }}
            >
              <p className="text-[12px] font-[600]" style={{ color: on ? '#2f80ed' : '#1f2933' }}>
                {opt.label}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: '#5a6a7e' }}>{opt.range}</p>
            </button>
          )
        })}
      </div>
      {rooms.length > 0 && (
        <div className="mt-4 p-3 rounded-xl" style={{ background: '#f5f7fa', border: '1px solid #dde8f5' }}>
          <p className="text-[12px] font-[500]" style={{ color: '#5a6a7e' }}>
            <span className="font-bold" style={{ color: '#2f80ed' }}>{rooms.length} rooms</span> selected
            {' '}· Your personalised estimate will be ready in the next step
          </p>
        </div>
      )}
    </div>
  )
}

function Step4({
  state, onChange, onSubmit, loading,
}: {
  state: CalcState
  onChange: (p: Partial<CalcState>) => void
  onSubmit: (e: React.FormEvent) => void
  loading: boolean
}) {
  const styleLabel = { essential: 'Essential', premium: 'Premium', luxury: 'Luxury' }[state.style]
  const bhkLabel   = { '2bhk': '2BHK', '3bhk': '3BHK', villa: 'Villa / 4BHK+' }[state.bhk]

  const inputCls = "w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
  const inputStyle = { borderColor: '#dde8f5' }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#2f80ed' }
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = '#dde8f5' }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Pre-summary */}
      <div className="p-3 rounded-xl" style={{ background: '#f5f7fa', border: '1px solid #dde8f5' }}>
        <p className="text-[12px]" style={{ color: '#5a6a7e' }}>
          <span className="font-[600] text-charcoal">{bhkLabel}</span>
          {' · '}
          <span className="font-[600] text-charcoal">{styleLabel} package</span>
          {' · '}
          <span className="font-[600]" style={{ color: '#2f80ed' }}>{state.rooms.length} rooms</span>
        </p>
      </div>

      <div>
        <label className="block text-xs font-[500] text-charcoal mb-1">Full name *</label>
        <input
          required
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className={inputCls} style={inputStyle}
          onFocus={focus} onBlur={blur}
          placeholder="Ravi Kumar"
        />
      </div>
      <div>
        <label className="block text-xs font-[500] text-charcoal mb-1">Phone *</label>
        <input
          required type="tel"
          value={state.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className={inputCls} style={inputStyle}
          onFocus={focus} onBlur={blur}
          placeholder="+91 98765 43210"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-[500] text-charcoal mb-1">City *</label>
          <select
            required
            value={state.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={`${inputCls} bg-white appearance-none`} style={inputStyle}
            onFocus={focus} onBlur={blur}
          >
            <option value="">Select…</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-[500] text-charcoal mb-1">Best time to call</label>
          <select
            value={state.callTime}
            onChange={(e) => onChange({ callTime: e.target.value })}
            className={`${inputCls} bg-white appearance-none`} style={inputStyle}
            onFocus={focus} onBlur={blur}
          >
            <option value="">Any time</option>
            {CALL_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-lg font-head font-bold text-white text-[15px] transition-all duration-200 disabled:opacity-60"
        style={{ background: '#2f80ed' }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed' }}
      >
        {loading ? 'Calculating…' : 'Get my personalised estimate →'}
      </button>
    </form>
  )
}
