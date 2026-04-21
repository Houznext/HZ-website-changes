import { useState, type CSSProperties, type FocusEvent, type FormEvent } from 'react'
import toast from 'react-hot-toast'
import apiClient from '@/utils/apiClient'
import { IconHome, IconLock } from '@/components/ui/Icons'
import HeroCityDropdown from './HeroCityDropdown'

const PROPERTY_TYPES = ['2BHK', '3BHK', 'Villa / 4BHK+']

export interface HeroConsultationFormCardProps {
  /** First line in tellUsMore for lead source tracking */
  tellUsMoreSourceLine: string
  /** Called after successful API submit (parent may open success modal) */
  onSuccess?: (submittedName: string) => void
  /** Lets parent read live name (e.g. homepage hero “Get free estimate” CTA) */
  onNameChange?: (name: string) => void
}

export default function HeroConsultationFormCard({
  tellUsMoreSourceLine,
  onSuccess,
  onNameChange,
}: HeroConsultationFormCardProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [propType, setPropType] = useState('')
  const [city, setCity] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isValid = name.trim().length >= 2 && /^\d{10}$/.test(phone.trim())

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      const res = await apiClient.post(apiClient.URLS.contact_us, {
        firstName: name.trim(),
        lastName: '-',
        contactNumber: phone.trim(),
        emailAddress: 'noreply+hero@houznext.com',
        tellUsMore: [
          tellUsMoreSourceLine,
          propType ? `Property: ${propType}` : '',
          city ? `City: ${city}` : '',
        ]
          .filter(Boolean)
          .join(' | '),
        serviceType: 'Home Interiors',
        city: city || undefined,
      })
      if (res.status === 201 || res.status === 200) {
        const trimmed = name.trim()
        setName('')
        onNameChange?.('')
        setPhone('')
        setPropType('')
        setCity('')
        toast.success('We will call you back shortly!')
        onSuccess?.(trimmed)
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputBase: CSSProperties = {
    width: '100%',
    padding: '8px 11px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.055)',
    color: '#fff',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: 8,
    transition: 'border-color 0.18s, background 0.18s',
  }

  const handleInputFocus = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(47,128,237,0.7)'
    e.currentTarget.style.background = 'rgba(47,128,237,0.08)'
  }
  const handleInputBlur = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
    e.currentTarget.style.background = 'rgba(255,255,255,0.055)'
  }

  return (
    <div
      className="rounded-[18px] overflow-visible w-full"
      style={{
        background: 'rgba(6,16,30,0.92)',
        border: '1px solid rgba(47,128,237,0.38)',
        borderRadius: 18,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(47,128,237,0.22) 0%, rgba(47,128,237,0.08) 100%)',
          borderBottom: '1px solid rgba(47,128,237,0.2)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderRadius: '18px 18px 0 0',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: 'rgba(47,128,237,0.2)',
            border: '1px solid rgba(47,128,237,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconHome size={14} stroke="#2f80ed" strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Free Consultation</p>
          <p
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.45)',
              marginTop: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#4ade80',
                display: 'inline-block',
                animation: 'hz-ring-pulse 2s ease-in-out infinite',
              }}
            />
            Team online · responds in {'<'}2 hrs
          </p>
        </div>
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <form onSubmit={handleSubmit} noValidate>
          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 4,
              letterSpacing: '0.03em',
            }}
          >
            Full name *
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(47,128,237,0.12)',
                border: '1px solid rgba(47,128,237,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="#2f80ed" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="6.5" cy="4" r="2.5" />
                <path d="M1 12c0-3 2.5-4.5 5.5-4.5S12 9 12 12" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="e.g. Ravi Kumar"
              value={name}
              onChange={(e) => {
                const v = e.target.value
                setName(v)
                onNameChange?.(v)
              }}
              style={{ ...inputBase, marginBottom: 0, flex: 1 }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 4,
              letterSpacing: '0.03em',
            }}
          >
            Phone number *
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'rgba(47,128,237,0.12)',
                border: '1px solid rgba(47,128,237,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="#2f80ed" strokeWidth="1.6" strokeLinecap="round">
                <rect x="3" y="1" width="7" height="11" rx="1.5" />
                <circle cx="6.5" cy="9.5" r="0.7" fill="#2f80ed" />
              </svg>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{ ...inputBase, marginBottom: 0, flex: 1 }}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </div>

          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 5,
              letterSpacing: '0.03em',
            }}
          >
            Property type
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {PROPERTY_TYPES.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setPropType(pt === propType ? '' : pt)}
                style={{
                  padding: '5px 11px',
                  borderRadius: 18,
                  fontSize: 11,
                  fontWeight: propType === pt ? 700 : 600,
                  border: `1px solid ${propType === pt ? '#2f80ed' : 'rgba(255,255,255,0.14)'}`,
                  background: propType === pt ? 'rgba(47,128,237,0.18)' : 'rgba(255,255,255,0.05)',
                  color: propType === pt ? '#fff' : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (propType !== pt) {
                    e.currentTarget.style.borderColor = 'rgba(47,128,237,0.5)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                    e.currentTarget.style.background = 'rgba(47,128,237,0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (propType !== pt) {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                {pt}
              </button>
            ))}
          </div>

          <p
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 4,
              letterSpacing: '0.03em',
            }}
          >
            Your city
          </p>
          <HeroCityDropdown value={city} onChange={setCity} />

          <button
            type="submit"
            disabled={submitting || !isValid}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 9,
              border: 'none',
              background: '#2f80ed',
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              cursor: !isValid || submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              marginTop: 0,
              marginBottom: 6,
              opacity: !isValid ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => {
              if (!isValid || submitting) return
              const el = e.currentTarget
              el.style.background = '#1a6dd6'
              el.style.transform = 'translateY(-3px)'
              el.style.boxShadow = '0 10px 28px rgba(47,128,237,0.55)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = '#2f80ed'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            {submitting ? (
              'Sending…'
            ) : (
              <>
                Request free consultation
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  style={{ transition: 'transform 0.2s' }}
                >
                  <path d="M2 7h10M7 2l5 5-5 5" />
                </svg>
              </>
            )}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              fontSize: 10,
              color: 'rgba(255,255,255,0.28)',
            }}
          >
            <IconLock size={10} stroke="rgba(255,255,255,0.28)" strokeWidth={1.6} />
            Private &amp; secure — no spam, ever.
          </div>
        </form>
      </div>
    </div>
  )
}
