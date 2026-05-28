import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import api from '@/lib/axios';

function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  const existing = document.querySelector(
    'script[src="https://accounts.google.com/gsi/client"]',
  ) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      const finish = () => {
        if (window.google?.accounts?.oauth2) resolve();
        else reject(new Error('Google sign-in script did not initialize.'));
      };
      if (existing.dataset.loaded === '1') {
        finish();
        return;
      }
      existing.addEventListener('load', finish, { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), {
        once: true,
      });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      script.dataset.loaded = '1';
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.body.appendChild(script);
  });
}

type CustomerResp = {
  customerId: string;
  name: string | null;
  phone: string | null;
  email: string | null;
};

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: GoogleTokenResponse) => void;
          }) => { requestAccessToken: (overrideConfig?: { prompt?: string }) => void };
        };
      };
    };
  }
}

function apiMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = (err as { response?: { status?: number; data?: { message?: string | string[] } } }).response;
    const raw = Array.isArray(res?.data?.message) ? res?.data?.message[0] : res?.data?.message;
    if (typeof raw === 'string' && raw.trim()) return raw;
    if (res?.status === 500) {
      return 'Infra API is unavailable. Start HZ-infrabackend on port 4001 (npm run start:dev).';
    }
  }
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = String((err as { code?: string }).code ?? '');
    if (code === 'ERR_NETWORK' || code === 'ECONNREFUSED') {
      return 'Cannot reach Infra API. Start HZ-infrabackend on port 4001 (npm run start:dev).';
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function InfraLoginPanel() {
  const router = useRouter();
  const callbackUrl =
    typeof router.query.callbackUrl === 'string' && router.query.callbackUrl.startsWith('/')
      ? router.query.callbackUrl
      : '/profile';

  const [contactMethod, setContactMethod] = useState<'mobile' | 'email'>('mobile');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [welcomeName, setWelcomeName] = useState('Customer');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(42);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const title = useMemo(() => {
    if (step === 1) return authMode === 'login' ? 'Login to Infra' : 'Create your account';
    if (step === 2) return 'Verify OTP';
    return 'Success';
  }, [step, authMode]);

  const subtitle = useMemo(() => {
    if (step === 1) {
      if (contactMethod === 'email') {
        return authMode === 'login'
          ? 'Sign in with your email and password.'
          : 'We will email you a 6-digit code to confirm your account.';
      }
      return authMode === 'login'
        ? 'Use your registered mobile number to receive an OTP.'
        : 'Sign up with your mobile number and full name.';
    }
    if (step === 2) {
      return contactMethod === 'email'
        ? 'Enter the 6-digit OTP sent to your email.'
        : 'Enter the 6-digit OTP sent to your mobile.';
    }
    return 'Your Houznext Infra account is ready.';
  }, [step, authMode, contactMethod]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    setSeconds(42);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          stopTimer();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const finishSession = useCallback(
    async (accessToken: string, customer: CustomerResp, nameOverride?: string) => {
      const finalName =
        nameOverride?.trim() ||
        (customer.name && customer.name.trim()) ||
        (customer.email ? customer.email.split('@')[0] : '') ||
        'Customer';
      setWelcomeName(finalName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('infra_token', accessToken);
      }
      const r = await signIn('credentials', { redirect: false, token: accessToken });
      if (!r?.ok) {
        throw new Error('Session error. Check INFRA_JWT_SECRET matches the backend.');
      }
      setStep(3);
    },
    [],
  );

  const sendOtp = async () => {
    if (authMode === 'signup' && contactMethod === 'mobile' && !name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (contactMethod === 'email' && authMode === 'signup') {
      const em = email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        setError('Enter a valid email address.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== passwordConfirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    const digits = mobile.replace(/\D/g, '').slice(-10);
    if (contactMethod === 'mobile' && digits.length < 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (contactMethod === 'email') {
        await api.post('/otp/send', {
          email: email.trim().toLowerCase(),
          mode: 'signup',
        });
      } else {
        await api.post('/otp/send', {
          phone: digits,
          mode: authMode,
          fullName: authMode === 'signup' ? name.trim() : undefined,
        });
      }
      setStep(2);
      startTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 120);
    } catch (e) {
      const msg = apiMessage(e, 'Failed to send OTP');
      const low = msg.toLowerCase();
      if (
        contactMethod === 'mobile' &&
        authMode === 'login' &&
        (low.includes('not registered') || low.includes('sign up'))
      ) {
        setAuthMode('signup');
        setError('You are not registered. Sign up below with your full name and mobile number.');
        setTimeout(() => nameInputRef.current?.focus(), 80);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Enter all 6 digits.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (contactMethod === 'email') {
        const res = await api.post<{ accessToken: string; customer: CustomerResp }>('/otp/verify', {
          email: email.trim().toLowerCase(),
          otp: code,
          password,
          mode: 'signup',
        });
        stopTimer();
        await finishSession(res.data.accessToken, res.data.customer);
      } else {
        const digits = mobile.replace(/\D/g, '').slice(-10);
        const res = await api.post<{ accessToken: string; customer: CustomerResp }>('/otp/verify', {
          phone: digits,
          otp: code,
          mode: authMode,
          fullName: authMode === 'signup' ? name.trim() : undefined,
        });
        const finalName =
          authMode === 'signup'
            ? name.trim() || res.data.customer.name || 'Customer'
            : res.data.customer.name || 'Customer';
        stopTimer();
        await finishSession(res.data.accessToken, res.data.customer, finalName);
      }
    } catch (e) {
      setError(apiMessage(e, 'Invalid or expired OTP.'));
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (seconds > 0) return;
    setError('');
    setLoading(true);
    try {
      if (contactMethod === 'email') {
        await api.post('/otp/send', {
          email: email.trim().toLowerCase(),
          mode: 'signup',
        });
      } else {
        const digits = mobile.replace(/\D/g, '').slice(-10);
        await api.post('/otp/send', {
          phone: digits,
          mode: authMode,
          fullName: authMode === 'signup' ? name.trim() : undefined,
        });
      }
      startTimer();
    } catch (e) {
      setError(apiMessage(e, 'Failed to resend OTP'));
    } finally {
      setLoading(false);
    }
  };

  const submitEmailAuth = async () => {
    const em = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ accessToken: string; customer: CustomerResp }>(
        '/auth/customer/login-email',
        { email: em, password },
      );
      await finishSession(res.data.accessToken, res.data.customer);
    } catch (e) {
      const msg = apiMessage(e, 'Could not sign in.');
      const low = msg.toLowerCase();
      if (low.includes('no account') || low.includes('sign up')) {
        setAuthMode('signup');
        setPasswordConfirm('');
        setError('No account for this email. Sign up with email OTP below.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const continueWithGoogleGmail = useCallback(async () => {
    const cid =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
      process.env.NEXT_PUBLIC_INFRA_GOOGLE_CLIENT_ID?.trim();
    if (!cid) {
      setError(
        'Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in HZ-infrawebsite .env.',
      );
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loadGsiScript();
      const oauth2 = window.google?.accounts?.oauth2;
      if (!oauth2?.initTokenClient) {
        throw new Error('Google sign-in is not available in this browser.');
      }
      const tokenClient = oauth2.initTokenClient({
        client_id: cid,
        scope: 'openid email profile',
        callback: (tokenResponse: GoogleTokenResponse) => {
          void (async () => {
            try {
              if (tokenResponse.error) {
                const msg = [tokenResponse.error, tokenResponse.error_description]
                  .filter(Boolean)
                  .join(' — ');
                setError(msg || 'Google sign-in was cancelled.');
                return;
              }
              const at = tokenResponse.access_token;
              if (!at) {
                setError('No token returned from Google. Try again.');
                return;
              }
              const res = await api.post<{ accessToken: string; customer: CustomerResp }>(
                '/auth/customer/google-access-token',
                { accessToken: at },
              );
              await finishSession(res.data.accessToken, res.data.customer);
            } catch (err) {
              setError(apiMessage(err, 'Google sign-in failed.'));
            } finally {
              setLoading(false);
            }
          })();
        },
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      setError(apiMessage(err, 'Could not start Google sign-in.'));
      setLoading(false);
    }
  }, [finishSession]);

  const handleFinish = () => {
    void router.push(callbackUrl);
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  useEffect(() => () => stopTimer(), []);

  useEffect(() => {
    setTimeout(() => mobileInputRef.current?.focus(), 150);
  }, []);

  const firstName = welcomeName.trim().split(' ')[0] || 'Customer';
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="w-full max-w-[400px] overflow-hidden rounded-[20px] bg-white shadow-xl">
      <div className="relative px-[26px] pt-[26px] pb-[22px]" style={{ background: '#0f2a44' }}>
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: 'linear-gradient(90deg, #2f80ed, #f2994a, #2f80ed)' }}
        />
        <div className="font-montserrat text-[17px] font-extrabold">
          <span className="text-white">Houz</span>
          <span style={{ color: '#f2994a' }}>next</span>
          <span className="ml-1 text-[11px] font-bold text-white/60">Infra</span>
        </div>
        <h1 className="mt-2 font-montserrat text-[15px] font-bold text-white">{title}</h1>
        <p className="text-[12px] leading-[1.5] text-white/50">{subtitle}</p>
      </div>

      <div className="px-[26px] pt-[22px] pb-[26px]">
        <div className="mb-[18px] flex justify-center gap-[6px]">
          {[1, 2, 3].map((d) => (
            <span
              key={d}
              className="h-[6px] rounded-[3px] transition-all duration-200"
              style={{ width: step === d ? 18 : 6, background: step === d ? '#2f80ed' : '#dde8f5' }}
            />
          ))}
        </div>

        {step === 1 && (
          <div
            className="mb-4 flex rounded-[10px] border p-0.5"
            style={{ borderColor: '#dde8f5', background: '#f5f7fa' }}
          >
            {(['mobile', 'email'] as const).map((m) => (
              <button
                key={m}
                type="button"
                className="flex-1 rounded-[8px] py-2 font-montserrat text-[12px] font-bold transition-all duration-200"
                style={{
                  background: contactMethod === m ? '#fff' : 'transparent',
                  color: contactMethod === m ? '#0f2a44' : '#5a6a7e',
                  boxShadow: contactMethod === m ? '0 1px 3px rgba(15,42,68,0.12)' : 'none',
                }}
                onClick={() => {
                  setContactMethod(m);
                  setError('');
                  setStep(1);
                  setOtp(['', '', '', '', '', '']);
                }}
              >
                {m === 'mobile' ? 'Mobile' : 'Email'}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div
            className="mb-3 rounded-[8px] border px-3 py-[9px] text-[12px]"
            style={{ background: '#fff1f2', borderColor: '#fca5a5', color: '#dc2626' }}
          >
            {error}
          </div>
        )}

        {step === 1 && contactMethod === 'mobile' && (
          <>
            {authMode === 'signup' && (
              <>
                <label className="mb-[5px] block font-montserrat text-[10px] font-bold uppercase tracking-[.06em] text-[#5a6a7e]">
                  Full name
                </label>
                <input
                  ref={nameInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-3 w-full rounded-[9px] border border-[#dde8f5] px-3 py-[10px] text-[14px] text-[#1f2933] outline-none"
                />
              </>
            )}
            <label className="mb-[5px] block font-montserrat text-[10px] font-bold uppercase tracking-[.06em] text-[#5a6a7e]">
              Mobile number
            </label>
            <input
              ref={mobileInputRef}
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile"
              className="w-full rounded-[9px] border border-[#dde8f5] px-3 py-[10px] text-[14px] text-[#1f2933] outline-none"
            />
            <p className="mt-1 mb-3 text-[11px] text-[#5a6a7e]">We will send a 6-digit OTP to your mobile.</p>
            <button
              type="button"
              disabled={loading}
              onClick={() => void sendOtp()}
              className="mb-[9px] w-full rounded-[10px] py-3 font-montserrat text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: '#2f80ed' }}
            >
              {loading ? 'Sending…' : authMode === 'login' ? 'Send OTP' : 'Sign up →'}
            </button>
            {authMode === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                  setOtp(['', '', '', '', '', '']);
                  setTimeout(() => nameInputRef.current?.focus(), 80);
                }}
                className="mb-[9px] w-full rounded-[10px] border border-[#2f80ed] py-3 font-montserrat text-[14px] font-bold text-[#2f80ed]"
              >
                Signup
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setTimeout(() => mobileInputRef.current?.focus(), 80);
                }}
                className="mb-[9px] w-full rounded-[10px] border border-[#2f80ed] py-3 font-montserrat text-[14px] font-bold text-[#2f80ed]"
              >
                Back to Login
              </button>
            )}
          </>
        )}

        {step === 1 && contactMethod === 'email' && (
          <>
            <label className="mb-[5px] block font-montserrat text-[10px] font-bold uppercase tracking-[.06em] text-[#5a6a7e]">
              Email
            </label>
            <input
              ref={emailInputRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-3 w-full rounded-[9px] border border-[#dde8f5] px-3 py-[10px] text-[14px] text-[#1f2933] outline-none"
            />
            <label className="mb-[5px] block font-montserrat text-[10px] font-bold uppercase tracking-[.06em] text-[#5a6a7e]">
              Password
            </label>
            <input
              type="password"
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[9px] border border-[#dde8f5] px-3 py-[10px] text-[14px] text-[#1f2933] outline-none"
            />
            {authMode === 'signup' && (
              <>
                <label className="mb-[5px] mt-3 block font-montserrat text-[10px] font-bold uppercase tracking-[.06em] text-[#5a6a7e]">
                  Confirm password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full rounded-[9px] border border-[#dde8f5] px-3 py-[10px] text-[14px] text-[#1f2933] outline-none"
                />
              </>
            )}
            <p className="mt-2 mb-3 text-[11px] text-[#5a6a7e]">
              {authMode === 'login' ? 'Use the password you set for this email.' : 'At least 8 characters. OTP will be emailed.'}
            </p>
            <button
              type="button"
              disabled={loading}
              onClick={() => void (authMode === 'login' ? submitEmailAuth() : sendOtp())}
              className="mb-[9px] w-full rounded-[10px] py-3 font-montserrat text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: '#2f80ed' }}
            >
              {loading
                ? 'Please wait…'
                : authMode === 'login'
                  ? 'Login →'
                  : 'Send OTP to email →'}
            </button>
            {authMode === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                  setPasswordConfirm('');
                }}
                className="mb-[9px] w-full rounded-[10px] border border-[#2f80ed] py-3 font-montserrat text-[14px] font-bold text-[#2f80ed]"
              >
                Signup
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                  setPasswordConfirm('');
                }}
                className="mb-[9px] w-full rounded-[10px] border border-[#2f80ed] py-3 font-montserrat text-[14px] font-bold text-[#2f80ed]"
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
                <div className="w-full border-t border-[#dde8f5]" />
              </div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.08em] text-[#5a6a7e]">
                <span className="bg-white px-2">or</span>
              </div>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => void continueWithGoogleGmail()}
              className="mb-1 flex w-full flex-col items-center justify-center gap-1 rounded-[10px] border border-[#dde8f5] bg-white py-3 font-montserrat text-[14px] font-bold text-[#1f2933] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center justify-center gap-2">
                <Image src="/icons/google-icon.svg" alt="" width={18} height={18} className="shrink-0" />
                Continue with Google
              </span>
              <span className="text-center text-[11px] font-semibold normal-case text-[#5a6a7e]">
                Choose your Gmail account on this device
              </span>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-center text-[14px] font-bold text-[#1f2933]">Enter OTP</p>
            <div className="mb-2 text-center text-[12px] text-[#5a6a7e]">
              Sent to {contactMethod === 'email' ? email : mobile}{' '}
              <button
                type="button"
                className="text-[12px] font-bold text-[#2f80ed]"
                onClick={() => {
                  setStep(1);
                  setOtp(['', '', '', '', '', '']);
                }}
              >
                Change
              </button>
            </div>
            <div className="mb-2 grid grid-cols-6 gap-1.5 sm:gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  maxLength={1}
                  className="h-[48px] w-full min-w-0 rounded-[9px] border border-[#dde8f5] text-center text-[18px] font-bold text-[#1f2933] outline-none"
                />
              ))}
            </div>
            <div className="mb-3 mt-1 text-center text-[12px] text-[#5a6a7e]">
              {seconds > 0 ? (
                <>Resend OTP in {mm}:{ss}</>
              ) : (
                <button type="button" className="font-bold text-[#2f80ed]" onClick={() => void resendOtp()}>
                  Resend OTP
                </button>
              )}
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => void verifyOtp()}
              className="mb-2 w-full rounded-[10px] py-3 font-montserrat text-[14px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: '#2f80ed' }}
            >
              {loading ? 'Verifying…' : 'Verify OTP →'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full rounded-[10px] border border-[#2f80ed] py-3 font-montserrat text-[14px] font-bold text-[#2f80ed]"
            >
              Back
            </button>
          </>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-[54px] w-[54px] items-center justify-center rounded-full border-2 border-[#86efac] bg-[#dcfce7]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-montserrat text-[17px] font-extrabold text-[#1f2933]">Welcome, {firstName}!</h2>
            <p className="mb-4 text-[13px] leading-[1.6] text-[#5a6a7e]">You are signed in to Houznext Infra.</p>
            <button
              type="button"
              onClick={handleFinish}
              className="w-full rounded-[10px] py-3 font-montserrat text-[14px] font-bold text-white"
              style={{ background: '#2f80ed' }}
            >
              Go to my profile →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
