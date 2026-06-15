import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useCustomerAuth } from '@/context/CustomerAuthContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  /** When true, render only the card (no full-screen backdrop). For /login page. */
  embedded?: boolean
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  const existing = document.querySelector(
    'script[src="https://accounts.google.com/gsi/client"]',
  ) as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      const finish = () => {
        if (window.google?.accounts?.oauth2) resolve()
        else reject(new Error('Google sign-in script did not initialize.'))
      }
      if (existing.dataset.loaded === '1') {
        finish()
        return
      }
      existing.addEventListener('load', finish, { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true })
    })
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      script.dataset.loaded = '1'
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Google script'))
    document.body.appendChild(script)
  })
}

type CustomerResp = {
  id: string
  fullName: string | null
  mobile: string | null
  email: string | null
}

type GoogleTokenResponse = {
  access_token?: string
  error?: string
  error_description?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (resp: GoogleTokenResponse) => void
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void }
        }
      }
    }
  }
}

export default function LoginModal({
  isOpen,
  onClose,
  onSuccess,
  embedded = false,
}: LoginModalProps) {
  const router = useRouter()
  const { loginSuccess } = useCustomerAuth()
  const [contactMethod, setContactMethod] = useState<'mobile' | 'email'>('mobile')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [welcomeName, setWelcomeName] = useState('Customer')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(42)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const mobileInputRef = useRef<HTMLInputElement | null>(null)
  const emailInputRef = useRef<HTMLInputElement | null>(null)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const modalRef = useRef<HTMLDivElement | null>(null)

  const title = useMemo(() => {
    if (step === 1) return authMode === 'login' ? 'Login to your account' : 'Create your account'
    if (step === 2) return 'Verify OTP'
    return 'Success'
  }, [step, authMode])

  const subtitle = useMemo(() => {
    if (step === 1) {
      if (contactMethod === 'email') {
        return authMode === 'login'
          ? 'Sign in with your email and password.'
          : 'Create your account with email and password.'
      }
      return authMode === 'login'
        ? 'Access quotations, invoices, saved designs and LiveBuild.'
        : 'Sign up with your mobile number to create your Houznext account.'
    }
    if (step === 2) return 'Enter the 6-digit OTP sent to your mobile number.'
    return 'Your account is now ready.'
  }, [step, authMode, contactMethod])

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startTimer = () => {
    stopTimer()
    setSeconds(42)
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          stopTimer()
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const applyCustomerSession = useCallback((data: { token: string; customer: CustomerResp }, nameOverride?: string) => {
    const c = data.customer
    const finalName = nameOverride?.trim()
      || (c.fullName && c.fullName.trim())
      || (c.email ? c.email.split('@')[0] : '')
      || 'Customer'
    setWelcomeName(finalName)
    loginSuccess({
      id: c.id,
      name: finalName,
      token: data.token,
      mobile: c.mobile && String(c.mobile).trim() ? String(c.mobile).trim() : null,
      email: c.email && String(c.email).trim() ? String(c.email).trim().toLowerCase() : null,
    })
    setStep(3)
  }, [loginSuccess])

  const sendOtp = async () => {
    if (authMode === 'signup' && !name.trim()) {
      setError('Full name is required.')
      return
    }
    const digits = mobile.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/interiors/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: digits, mode: authMode }),
      })
      if (!res.ok) {
        let msg = 'Failed to send OTP. Try again.'
        try {
          const err = await res.json() as { message?: string | string[] }
          const raw = Array.isArray(err?.message) ? err.message[0] : err?.message
          const low = typeof raw === 'string' ? raw.toLowerCase() : ''
          if (low.includes('not registered') || low.includes('sign up')) {
            setAuthMode('signup')
            setError('This number is not registered yet. Complete sign up below.')
            setLoading(false)
            setTimeout(() => nameInputRef.current?.focus(), 80)
            return
          }
          if (typeof raw === 'string' && raw.trim()) {
            msg = raw
          }
        } catch {
          // ignore JSON parsing errors
        }
        throw new Error(msg)
      }
      setStep(2)
      startTimer()
      setTimeout(() => otpRefs.current[0]?.focus(), 120)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Enter all 6 digits.')
      return
    }
    setLoading(true)
    setError('')
    const digits = mobile.replace(/\D/g, '')
    try {
      const res = await fetch(`${API}/interiors/auth/login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: digits, otp: code }),
      })
      if (!res.ok) throw new Error('Invalid or expired OTP.')
      const data = await res.json() as { token: string; customer: CustomerResp }
      if (authMode === 'signup' && name.trim() && name.trim() !== (data.customer.fullName ?? '')) {
        await fetch(`${API}/interiors/customers/${data.customer.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ fullName: name.trim() }),
        }).catch(() => {})
      }
      const finalName = authMode === 'signup'
        ? (name.trim() || data.customer.fullName || 'Customer')
        : (data.customer.fullName || 'Customer')
      stopTimer()
      applyCustomerSession(data, finalName)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (seconds > 0) return
    const digits = mobile.replace(/\D/g, '')
    setError('')
    try {
      const res = await fetch(`${API}/interiors/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: digits, mode: authMode }),
      })
      if (!res.ok) throw new Error('Failed to resend')
      startTimer()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend OTP')
    }
  }

  const submitEmailAuth = async () => {
    const em = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (authMode === 'signup' && password !== passwordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      if (authMode === 'login') {
        const res = await fetch(`${API}/interiors/auth/login-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: em, password }),
        })
        if (res.status === 404) {
          setAuthMode('signup')
          setPasswordConfirm('')
          setError('No account for this email. Confirm a password below to create your account.')
          return
        }
        if (!res.ok) {
          let msg = 'Could not sign in.'
          try {
            const err = await res.json() as { message?: string | string[] }
            const raw = Array.isArray(err?.message) ? err.message[0] : err?.message
            if (typeof raw === 'string' && raw.trim()) msg = raw
          } catch {
            // ignore
          }
          throw new Error(msg)
        }
        const data = await res.json() as { token: string; customer: CustomerResp }
        applyCustomerSession(data)
      } else {
        const res = await fetch(`${API}/interiors/auth/register-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: em, password }),
        })
        if (!res.ok) {
          let msg = 'Could not create account.'
          try {
            const err = await res.json() as { message?: string | string[] }
            const raw = Array.isArray(err?.message) ? err.message[0] : err?.message
            if (typeof raw === 'string' && raw.trim()) msg = raw
          } catch {
            // ignore
          }
          if (res.status === 409) {
            setAuthMode('login')
            setError(`${msg} Use Login below.`)
            return
          }
          throw new Error(msg)
        }
        const data = await res.json() as { token: string; customer: CustomerResp }
        applyCustomerSession(data)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  /** Opens Google’s account picker (Gmail profiles on this device), then logs in or signs up the customer. */
  const continueWithGoogleGmail = useCallback(async () => {
    const cid = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim()
    if (!cid) {
      setError(
        'Google sign-in is not configured. Set GOOGLE_CLIENT_ID or NEXT_PUBLIC_GOOGLE_CLIENT_ID in HZ-website .env, then restart `npm run dev` (same Web client ID as in Google Cloud Console).',
      )
      return
    }
    setError('')
    setLoading(true)
    try {
      await loadGsiScript()
      const oauth2 = window.google?.accounts?.oauth2
      if (!oauth2?.initTokenClient) {
        throw new Error('Google sign-in is not available in this browser.')
      }
      const tokenClient = oauth2.initTokenClient({
        client_id: cid,
        scope: 'openid email profile',
        callback: (tokenResponse: GoogleTokenResponse) => {
          void (async () => {
            try {
              if (tokenResponse.error) {
                const msg = [tokenResponse.error, tokenResponse.error_description].filter(Boolean).join(' — ')
                setError(msg || 'Google sign-in was cancelled.')
                return
              }
              const at = tokenResponse.access_token
              if (!at) {
                setError('No token returned from Google. Try again.')
                return
              }
              const res = await fetch(`${API}/interiors/auth/google-access-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: at }),
              })
              if (!res.ok) {
                let msg = 'Google sign-in failed.'
                try {
                  const err = await res.json() as { message?: string | string[] }
                  const raw = Array.isArray(err?.message) ? err.message[0] : err?.message
                  if (typeof raw === 'string' && raw.trim()) msg = raw
                } catch {
                  // ignore
                }
                throw new Error(msg)
              }
              const data = (await res.json()) as { token: string; customer: CustomerResp }
              applyCustomerSession(data)
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Google sign-in failed.')
            } finally {
              setLoading(false)
            }
          })()
        },
      })
      tokenClient.requestAccessToken({ prompt: 'select_account' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start Google sign-in.')
      setLoading(false)
    }
  }, [applyCustomerSession])

  const resolvePostLoginPath = useCallback((): string => {
    const fromQuery =
      typeof router.query.callbackUrl === 'string' ? router.query.callbackUrl.trim() : ''
    const fromStorage =
      typeof window !== 'undefined' ? sessionStorage.getItem('hz_login_redirect')?.trim() : ''
    const candidate = fromQuery || fromStorage || ''
    if (candidate.startsWith('/') && !candidate.startsWith('//')) {
      if (typeof window !== 'undefined') sessionStorage.removeItem('hz_login_redirect')
      return candidate
    }
    return '/livebuild/dashboard'
  }, [router.query.callbackUrl])

  const handleFinish = () => {
    const dest = resolvePostLoginPath()
    onClose()
    onSuccess?.()
    void router.push(dest)
  }

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[idx] = val
    setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  useEffect(() => () => stopTimer(), [])

  useEffect(() => {
    if (isOpen) {
      setContactMethod('mobile')
      setAuthMode('login')
      setStep(1)
      setName('')
      setWelcomeName('Customer')
      setMobile('')
      setEmail('')
      setPassword('')
      setPasswordConfirm('')
      setOtp(['', '', '', '', '', ''])
      setError('')
      setLoading(false)
      stopTimer()
      if (!embedded) {
        document.body.style.overflow = 'hidden'
      }
      setTimeout(() => mobileInputRef.current?.focus(), 150)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, embedded])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !embedded) onClose()
      if (e.key === 'Tab' && isOpen && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose, embedded])

  if (!isOpen) return null

  const firstName = welcomeName.trim().split(' ')[0] || 'Customer'
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  const panel = (
      <div
        ref={modalRef}
        role="dialog"
        aria-modal={!embedded}
        className="w-full max-w-[400px] overflow-hidden"
        style={{
          background: '#fff',
          borderRadius: 20,
          transition: 'all 0.3s cubic-bezier(.16,1,.3,1)',
          transform: 'translateY(0)',
          opacity: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-[26px] pt-[26px] pb-[22px]" style={{ background: '#0f2a44' }}>
          <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #2f80ed, #f2994a, #2f80ed)' }} />
          {!embedded && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-[14px] right-[14px] h-[30px] w-[30px] rounded-full border text-white transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.22)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
            aria-label="Close login modal"
          >
            ×
          </button>
          )}
          <div className="font-head text-[17px] font-extrabold"><span className="text-white">Houz</span><span style={{ color: '#f2994a' }}>next</span></div>
          <h3 className="mt-2 text-[15px] font-bold text-white">{title}</h3>
          <p className="text-[12px] leading-[1.5]" style={{ color: 'rgba(255,255,255,0.5)' }}>{subtitle}</p>
        </div>

        <div className="px-[26px] pt-[22px] pb-[26px]">
          <div className="mb-[18px] flex justify-center gap-[6px]">
            {[1, 2, 3].map((d) => (
              <span key={d} className="h-[6px] rounded-[3px] transition-all duration-200" style={{ width: step === d ? 18 : 6, background: step === d ? '#2f80ed' : '#dde8f5' }} />
            ))}
          </div>

          {step === 1 && (
            <div className="mb-4 flex rounded-[10px] border p-0.5" style={{ borderColor: '#dde8f5', background: '#f5f7fa' }}>
              {(['mobile', 'email'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className="flex-1 rounded-[8px] py-2 text-[12px] font-bold font-head transition-all duration-200"
                  style={{
                    background: contactMethod === m ? '#fff' : 'transparent',
                    color: contactMethod === m ? '#0f2a44' : '#5a6a7e',
                    boxShadow: contactMethod === m ? '0 1px 3px rgba(15,42,68,0.12)' : 'none',
                  }}
                  onClick={() => {
                    setContactMethod(m)
                    setError('')
                    setTimeout(() => {
                      if (m === 'mobile') mobileInputRef.current?.focus()
                      else emailInputRef.current?.focus()
                    }, 50)
                  }}
                >
                  {m === 'mobile' ? 'Mobile' : 'Email'}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-3 rounded-[8px] border px-3 py-[9px] text-[12px]" style={{ background: '#fff1f2', borderColor: '#fca5a5', color: '#dc2626' }}>
              {error}
            </div>
          )}

          {step === 1 && contactMethod === 'mobile' && (
            <>
              {authMode === 'signup' && (
                <>
                  <label className="mb-[5px] block text-[10px] font-bold uppercase tracking-[.06em]" style={{ color: '#5a6a7e' }}>Full name</label>
                  <input ref={nameInputRef} value={name} onChange={(e) => setName(e.target.value)} className="mb-3 w-full rounded-[9px] border px-3 py-[10px] text-[14px] outline-none transition-all duration-200" style={{ borderColor: '#dde8f5', color: '#1f2933' }} />
                </>
              )}
              <label className="mb-[5px] block text-[10px] font-bold uppercase tracking-[.06em]" style={{ color: '#5a6a7e' }}>Mobile number</label>
              <input ref={mobileInputRef} value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full rounded-[9px] border px-3 py-[10px] text-[14px] outline-none transition-all duration-200" style={{ borderColor: '#dde8f5', color: '#1f2933' }} />
              <p className="mt-1 mb-3 text-[11px]" style={{ color: '#5a6a7e' }}>We will send a 6-digit OTP to your mobile.</p>
              <button disabled={loading} onClick={sendOtp} className="mb-[9px] w-full rounded-[10px] py-3 text-[14px] font-bold text-white transition-all duration-200 font-head disabled:cursor-not-allowed" style={{ background: '#2f80ed', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Sending...' : authMode === 'login' ? 'Login →' : 'Sign up →'}
              </button>
              {authMode === 'login' ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup')
                    setError('')
                    setOtp(['', '', '', '', '', ''])
                    setTimeout(() => nameInputRef.current?.focus(), 80)
                  }}
                  className="mb-[9px] w-full rounded-[10px] border py-3 text-[14px] font-bold transition-all duration-200 font-head"
                  style={{ borderColor: '#2f80ed', color: '#2f80ed' }}
                >
                  Signup
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    setError('')
                    setOtp(['', '', '', '', '', ''])
                    setTimeout(() => mobileInputRef.current?.focus(), 80)
                  }}
                  className="mb-[9px] w-full rounded-[10px] border py-3 text-[14px] font-bold transition-all duration-200 font-head"
                  style={{ borderColor: '#2f80ed', color: '#2f80ed' }}
                >
                  Back to Login
                </button>
              )}
            </>
          )}

          {step === 1 && contactMethod === 'email' && (
            <>
              <label className="mb-[5px] block text-[10px] font-bold uppercase tracking-[.06em]" style={{ color: '#5a6a7e' }}>Email</label>
              <input ref={emailInputRef} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-3 w-full rounded-[9px] border px-3 py-[10px] text-[14px] outline-none transition-all duration-200" style={{ borderColor: '#dde8f5', color: '#1f2933' }} />
              <label className="mb-[5px] block text-[10px] font-bold uppercase tracking-[.06em]" style={{ color: '#5a6a7e' }}>Password</label>
              <input type="password" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-[9px] border px-3 py-[10px] text-[14px] outline-none transition-all duration-200" style={{ borderColor: '#dde8f5', color: '#1f2933' }} />
              {authMode === 'signup' && (
                <>
                  <label className="mb-[5px] mt-3 block text-[10px] font-bold uppercase tracking-[.06em]" style={{ color: '#5a6a7e' }}>Confirm password</label>
                  <input type="password" autoComplete="new-password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="w-full rounded-[9px] border px-3 py-[10px] text-[14px] outline-none transition-all duration-200" style={{ borderColor: '#dde8f5', color: '#1f2933' }} />
                </>
              )}
              <p className="mt-2 mb-3 text-[11px]" style={{ color: '#5a6a7e' }}>{authMode === 'login' ? 'Use the password you set for this email.' : 'At least 6 characters.'}</p>
              <button disabled={loading} onClick={() => void submitEmailAuth()} className="mb-[9px] w-full rounded-[10px] py-3 text-[14px] font-bold text-white transition-all duration-200 font-head disabled:cursor-not-allowed" style={{ background: '#2f80ed', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Please wait...' : authMode === 'login' ? 'Login →' : 'Create account →'}
              </button>
              {authMode === 'login' ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup')
                    setError('')
                    setPasswordConfirm('')
                  }}
                  className="mb-[9px] w-full rounded-[10px] border py-3 text-[14px] font-bold transition-all duration-200 font-head"
                  style={{ borderColor: '#2f80ed', color: '#2f80ed' }}
                >
                  Signup
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    setError('')
                    setPasswordConfirm('')
                  }}
                  className="mb-[9px] w-full rounded-[10px] border py-3 text-[14px] font-bold transition-all duration-200 font-head"
                  style={{ borderColor: '#2f80ed', color: '#2f80ed' }}
                >
                  Back to Login
                </button>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#dde8f5' }} />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.08em]">
                  <span className="bg-white px-2" style={{ color: '#5a6a7e' }}>
                    or
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => void continueWithGoogleGmail()}
                className="mb-1 flex w-full flex-col items-center justify-center gap-1 rounded-[10px] border py-3 text-[14px] font-bold transition-all duration-200 font-head disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: '#dde8f5', background: '#fff', color: '#1f2933' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Image src="/icons/google-icon.svg" alt="" width={18} height={18} className="shrink-0" />
                  Continue with Google
                </span>
                <span className="text-center text-[11px] font-semibold normal-case" style={{ color: '#5a6a7e' }}>
                  Gmail login — choose the Google account on this device
                </span>
              </button>
              <p className="mt-2 text-center text-[11px] leading-[1.55]" style={{ color: '#5a6a7e' }}>By continuing, you agree to our terms and privacy policy.</p>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-center text-[14px] font-bold" style={{ color: '#1f2933' }}>Enter OTP</p>
              <p className="mb-2 text-center text-[12px]" style={{ color: '#5a6a7e' }}>
                Sent to {mobile}{' '}
                <button type="button" className="text-[12px] font-bold transition-all duration-200" style={{ color: '#2f80ed' }} onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']) }}>
                  Change
                </button>
              </p>
              <div className="mb-2 grid grid-cols-6 gap-1.5 sm:gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el }}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    maxLength={1}
                    className="h-[48px] w-full min-w-0 rounded-[9px] border text-center text-[18px] font-bold outline-none transition-all duration-200"
                    style={{ borderColor: '#dde8f5', color: '#1f2933' }}
                  />
                ))}
              </div>
              <div className="mb-3 mt-1 text-center text-[12px]" style={{ color: '#5a6a7e' }}>
                {seconds > 0 ? (
                  <>Resend OTP in {mm}:{ss}</>
                ) : (
                  <button type="button" className="font-bold transition-all duration-200" style={{ color: '#2f80ed' }} onClick={resendOtp}>
                    Resend OTP
                  </button>
                )}
              </div>
              <button disabled={loading} onClick={verifyOtp} className="mb-2 w-full rounded-[10px] py-3 text-[14px] font-bold text-white transition-all duration-200 font-head disabled:cursor-not-allowed" style={{ background: '#2f80ed', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Verifying...' : 'Verify OTP →'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full rounded-[10px] border py-3 text-[14px] font-bold transition-all duration-200 font-head" style={{ borderColor: '#2f80ed', color: '#2f80ed' }}>
                Back
              </button>
            </>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-[54px] w-[54px] items-center justify-center rounded-full border-2" style={{ background: '#dcfce7', borderColor: '#86efac' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h4 className="font-head text-[17px] font-extrabold" style={{ color: '#1f2933' }}>Welcome, {firstName}!</h4>
              <p className="mb-4 text-[13px] leading-[1.6]" style={{ color: '#5a6a7e' }}>You are now signed in to your Houznext account.</p>
              <button onClick={handleFinish} className="w-full rounded-[10px] py-3 text-[14px] font-bold text-white transition-all duration-200 font-head" style={{ background: '#2f80ed' }}>
                Go to my account →
              </button>
            </div>
          )}
        </div>
      </div>
  )

  if (embedded) {
    return <div className="w-full rounded-[20px] shadow-xl">{panel}</div>
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: 'rgba(8,18,30,0.82)', transition: 'all 0.22s', opacity: 1 }}
      onClick={onClose}
    >
      {panel}
    </div>
  )
}
