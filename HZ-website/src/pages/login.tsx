import { useState } from 'react'
import { useRouter } from 'next/router'
import { signIn } from 'next-auth/react'
import SeoHead from '@/components/SeoHead'
import { useQuoteModal } from '@/components/QuoteModal'
import {
  IconCamera,
  IconLayers,
  IconCreditCard,
  IconBug,
  IconMessageCircle,
} from '@/components/ui/Icons'
import type { IconProps } from '@/components/ui/Icons'

type Tab = 'otp' | 'email'
type OtpStep = 'phone' | 'verify'

// ─── Feature items for the left panel ────────────────────────────────────────

interface FeatureDef {
  Icon: React.ComponentType<IconProps>
  label: string
  desc: string
  color: string
}

const FEATURES: FeatureDef[] = [
  {
    Icon: IconCamera,
    label: 'Daily site photo updates',
    desc: 'Every room, every day. Never miss a moment of progress.',
    color: '#2f80ed',
  },
  {
    Icon: IconLayers,
    label: 'Approve 3D designs online',
    desc: 'Review photorealistic designs and approve from your phone.',
    color: '#2f80ed',
  },
  {
    Icon: IconCreditCard,
    label: 'Milestone payment tracking',
    desc: 'Pay only when milestones are hit. Fully transparent.',
    color: '#f2994a',
  },
  {
    Icon: IconBug,
    label: 'Raise & track snags',
    desc: 'Log issues with photos, get them resolved and confirmed.',
    color: '#2f80ed',
  },
  {
    Icon: IconMessageCircle,
    label: 'Chat with your designer',
    desc: 'Direct line to your project manager and design team.',
    color: '#2f80ed',
  },
]

function FeatureItem({ item }: { item: FeatureDef }) {
  const [hovered, setHovered] = useState(false)
  return (
    <li
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-default transition-all duration-250"
      style={{
        background: hovered ? `${item.color}15` : 'transparent',
        border: `1px solid ${hovered ? `${item.color}35` : 'transparent'}`,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon box */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-250"
        style={{
          background: hovered ? item.color : `${item.color}20`,
          boxShadow: hovered ? `0 4px 14px ${item.color}50` : 'none',
          transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        <item.Icon
          size={17}
          stroke={hovered ? '#fff' : item.color}
          strokeWidth={1.7}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-[600] leading-tight transition-colors duration-200"
          style={{ color: hovered ? '#fff' : 'rgba(255,255,255,0.85)' }}
        >
          {item.label}
        </p>
        <p
          className="text-[11px] mt-0.5 leading-snug transition-all duration-200 overflow-hidden"
          style={{
            color: 'rgba(255,255,255,0.5)',
            maxHeight: hovered ? '2rem' : '0',
            opacity: hovered ? 1 : 0,
          }}
        >
          {item.desc}
        </p>
      </div>

      {/* Arrow indicator */}
      <span
        className="text-[14px] flex-shrink-0 transition-all duration-200"
        style={{
          color: item.color,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
        }}
      >
        →
      </span>
    </li>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { openModal } = useQuoteModal()
  const [tab, setTab] = useState<Tab>('otp')

  return (
    <>
      <SeoHead
        title="Login | My Home Portal | Houznext"
        description="Login to your Houznext portal. Track your interior project live, approve designs, view payments, and manage snags from your phone."
        canonical="/login"
        noIndex
      />
      <div className="min-h-screen flex" style={{ background: '#f5f7fa' }}>
        {/* Left brand panel */}
        <div
          className="hidden md:flex flex-col justify-between p-12 w-[420px] flex-shrink-0"
          style={{ background: '#0f2a44' }}
        >
          <div>
            <button onClick={() => router.push('/')} className="font-head font-extrabold text-[26px] leading-none mb-8">
              <span className="text-white">Houz</span>
              <span style={{ color: '#f2994a' }}>next</span>
            </button>
            <h2 className="font-head font-bold text-[24px] text-white leading-tight mb-3">
              Your home. Live.
            </h2>
            <p className="text-[14px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Log in to track your interior project, approve designs, and manage everything
              from your phone.
            </p>
            <ul className="space-y-1">
              {FEATURES.map((f) => (
                <FeatureItem key={f.label} item={f} />
              ))}
            </ul>
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Houznext. All rights reserved.
          </p>
        </div>

        {/* Right login card */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <button onClick={() => router.push('/')} className="md:hidden font-head font-extrabold text-[22px] leading-none mb-8 block">
              <span style={{ color: '#0f2a44' }}>Houz</span>
              <span style={{ color: '#f2994a' }}>next</span>
            </button>

            <div className="bg-white rounded-2xl shadow-xl border" style={{ borderColor: '#dde8f5' }}>
              <div className="p-6 pb-4" style={{ borderBottom: '1px solid #f5f7fa' }}>
                <h1 className="font-head font-bold text-[22px] text-charcoal mb-1">Welcome back</h1>
                <p className="text-[13px]" style={{ color: '#5a6a7e' }}>Log in to your Houznext account</p>

                {/* Tabs */}
                <div className="flex mt-5 rounded-xl overflow-hidden border" style={{ borderColor: '#dde8f5' }}>
                  {(['otp', 'email'] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className="flex-1 py-2 text-[13px] font-head font-bold transition-colors"
                      style={tab === t
                        ? { background: '#2f80ed', color: '#fff' }
                        : { background: '#fff', color: '#5a6a7e' }
                      }
                    >
                      {t === 'otp' ? 'Mobile OTP' : 'Email'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {tab === 'otp' ? (
                  <OtpFlow onSuccess={() => router.push('/portal/dashboard')} />
                ) : (
                  <EmailFlow onSuccess={() => router.push('/portal/dashboard')} />
                )}

                {/* Google SSO */}
                <div className="mt-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px" style={{ background: '#dde8f5' }} />
                    <span className="text-[11px]" style={{ color: '#5a6a7e' }}>or continue with</span>
                    <div className="flex-1 h-px" style={{ background: '#dde8f5' }} />
                  </div>
                  <button
                    onClick={() => signIn('google', { callbackUrl: '/portal/dashboard' })}
                    className="w-full py-2.5 rounded-xl border text-[13px] font-[600] flex items-center justify-center gap-2 transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#dde8f5', color: '#1f2933' }}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                </div>

                {/* New customer */}
                <p className="text-center text-[12px] mt-5" style={{ color: '#5a6a7e' }}>
                  New customer?{' '}
                  <button onClick={openModal} className="font-[600]" style={{ color: '#2f80ed' }}>
                    Get a free quote
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── OTP Flow ─────────────────────────────────────────────────────────────────

/** Strip country code, spaces, dashes — return last 10 digits */
function sanitizePhone(raw: string): string {
  return raw.replace(/\D/g, '').slice(-10)
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

function OtpFlow({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<OtpStep>('phone')
  const [phone, setPhone] = useState('')
  const [cleanPhone, setCleanPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setPhone(raw)
    setCleanPhone(sanitizePhone(raw))
  }

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })

      if (res.ok) {
        setStep('verify')
      } else {
        let msg = 'Failed to send OTP. Please try again.'
        try {
          const data = await res.json()
          if (data?.message) msg = Array.isArray(data.message) ? data.message[0] : data.message
        } catch { /* ignore parse errors */ }
        setError(msg)
      }
    } catch (err) {
      setError(
        `Could not reach the server (${API_BASE}). Check your connection and try again.`
      )
      if (process.env.NODE_ENV === 'development') console.error('[sendOtp]', err)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const otpString = otp.join('')
    try {
      const result = await signIn('otp-login', {
        redirect: false,
        identifier: cleanPhone,
        otp: otpString,
      })
      if (result?.ok) {
        onSuccess()
      } else {
        setError('Invalid or expired OTP. Please try again.')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
      if (process.env.NODE_ENV === 'development') console.error('[verifyOtp]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus()
    }
  }

  if (step === 'verify') {
    return (
      <form onSubmit={verifyOtp}>
        <p className="text-[13px] mb-4 text-charcoal">
          Enter the 6-digit OTP sent to{' '}
          <span className="font-[600]">+91 {cleanPhone}</span>
        </p>
        <div className="flex gap-2 mb-4">
          {otp.map((d, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              value={d}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="w-10 h-12 rounded-xl border-2 text-center text-[18px] font-bold outline-none transition-colors"
              style={{ borderColor: d ? '#2f80ed' : '#dde8f5', color: '#1f2933' }}
            />
          ))}
        </div>
        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading || otp.join('').length < 6}
          className="w-full py-3 rounded-xl font-head font-bold text-white text-[14px] disabled:opacity-60 transition-all hover:-translate-y-0.5"
          style={{ background: '#2f80ed' }}
        >
          {loading ? 'Verifying…' : 'Verify & Login →'}
        </button>
        <button
          type="button"
          onClick={() => { setStep('phone'); setOtp(['','','','','','']); setError('') }}
          className="w-full mt-2 text-[12px]"
          style={{ color: '#5a6a7e' }}
        >
          ← Change number
        </button>
      </form>
    )
  }

  return (
    <form onSubmit={sendOtp}>
      <label className="block text-xs font-[500] text-charcoal mb-1">
        Mobile number *
      </label>
      <div className="relative mb-4">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-[500] select-none pointer-events-none"
          style={{ color: '#5a6a7e' }}
        >
          +91
        </span>
        <input
          required
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={handlePhoneChange}
          className="w-full border rounded-xl pl-12 pr-4 py-3 text-sm outline-none transition-colors"
          style={{ borderColor: '#dde8f5' }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#2f80ed' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#dde8f5' }}
          placeholder="98765 43210"
          maxLength={14}
        />
      </div>
      {cleanPhone.length > 0 && cleanPhone.length !== 10 && (
        <p className="text-xs mb-2" style={{ color: '#f2994a' }}>
          Enter the last 10 digits of your number
        </p>
      )}
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <button
        type="submit"
        disabled={loading || cleanPhone.length !== 10}
        className="w-full py-3 rounded-xl font-head font-bold text-white text-[14px] disabled:opacity-60 transition-all hover:-translate-y-0.5"
        style={{ background: '#2f80ed' }}
      >
        {loading ? 'Sending OTP…' : 'Send OTP →'}
      </button>
    </form>
  )
}

// ─── Email Flow ───────────────────────────────────────────────────────────────

function EmailFlow({ onSuccess }: { onSuccess: () => void }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        redirect: false,
        identifier,
        password,
      })
      if (result?.ok) {
        onSuccess()
      } else {
        setError('Invalid credentials. Please check your email/phone and password.')
      }
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors"
  const inputStyle = { borderColor: '#dde8f5' }
  const focus = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#2f80ed' }
  const blur  = (e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = '#dde8f5' }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-[500] text-charcoal mb-1">Email or phone *</label>
          <input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={inputCls} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-xs font-[500] text-charcoal mb-1">Password *</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} style={inputStyle} onFocus={focus} onBlur={blur} placeholder="••••••••" />
        </div>
      </div>
      <button type="button" className="text-[12px] mb-4" style={{ color: '#2f80ed' }}>
        Forgot password?
      </button>
      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl font-head font-bold text-white text-[14px] disabled:opacity-60 transition-all"
        style={{ background: '#2f80ed' }}
      >
        {loading ? 'Logging in…' : 'Login →'}
      </button>
    </form>
  )
}

// ─── Google Icon ──────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
