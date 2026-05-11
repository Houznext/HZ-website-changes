import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function LoginPage() {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailValid = /^\S+@\S+\.\S+$/.test(contact.trim());

  const send = async () => {
    setLoading(true);
    try {
      await api.post('/otp/send', { phone: contact.replace(/\D/g, '').slice(-10) });
      toast.success('OTP sent');
      setSent(true);
    } catch {
      toast.error('Could not send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    try {
      const phone = contact.replace(/\D/g, '').slice(-10);
      const res = await api.post('/otp/verify', { otp, phone });
      const token = res.data.accessToken as string;
      if (typeof window !== 'undefined') localStorage.setItem('infra_token', token);
      const r = await signIn('credentials', {
        redirect: false,
        token,
      });
      if (r?.ok) {
        toast.success('Signed in');
        window.location.href = '/profile';
      } else toast.error('Session error');
    } catch {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const submitEmail = async () => {
    if (!emailValid) {
      toast.error('Enter a valid email');
      return;
    }
    if (!password || password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) {
        const reg = await api.post('/auth/customer/register-email', {
          email: contact.trim(),
          password,
        });
        const token = reg.data.accessToken as string;
        if (typeof window !== 'undefined') localStorage.setItem('infra_token', token);
        const r = await signIn('credentials', { redirect: false, token });
        if (r?.ok) {
          toast.success('Account created');
          window.location.href = '/profile';
        } else toast.error('Session error');
      } else {
        const r = await signIn('credentials', {
          redirect: false,
          email: contact.trim(),
          password,
        });
        if (r?.ok) {
          toast.success('Signed in');
          window.location.href = '/profile';
        } else toast.error('Invalid email or password');
      }
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Login to Infra</h1>
        <p className="mt-2 font-inter text-sm text-muted">
          Use your mobile (OTP), email & password, or Google.
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 font-montserrat text-xs font-bold ${mode === 'phone' ? 'bg-hz-blue text-white' : 'bg-border text-charcoal'}`}
            onClick={() => {
              setMode('phone');
              setSent(false);
              setOtp('');
              setPassword('');
              setConfirmPassword('');
              setIsRegister(false);
            }}
          >
            Mobile
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 font-montserrat text-xs font-bold ${mode === 'email' ? 'bg-hz-blue text-white' : 'bg-border text-charcoal'}`}
            onClick={() => {
              setMode('email');
              setSent(false);
              setOtp('');
              setPassword('');
              setConfirmPassword('');
            }}
          >
            Email
          </button>
        </div>

        {mode === 'phone' ? (
          <>
            <input
              className="mt-4 w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
              placeholder="+91…"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            {!sent ? (
              <Button className="mt-4 w-full" variant="primary" disabled={loading} onClick={() => void send()}>
                Send OTP
              </Button>
            ) : (
              <div className="mt-4 space-y-3">
                <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                <Button
                  className="w-full"
                  variant="accent"
                  disabled={loading || otp.length !== 6}
                  onClick={() => void verify()}
                >
                  Verify & continue
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
              placeholder="you@email.com"
              type="email"
              autoComplete="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            {emailValid && (
              <>
                <input
                  className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
                  placeholder="Password"
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {isRegister && (
                  <input
                    className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
                    placeholder="Confirm password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                )}
                <Button className="w-full" variant="primary" disabled={loading} onClick={() => void submitEmail()}>
                  {loading ? 'Please wait…' : isRegister ? 'Create account' : 'Log in'}
                </Button>
                <button
                  type="button"
                  className="w-full text-center font-inter text-sm text-hz-blue hover:underline"
                  onClick={() => {
                    setIsRegister((v) => !v);
                    setConfirmPassword('');
                  }}
                >
                  {isRegister ? 'Already have an account? Log in' : 'New user? Create account with email'}
                </button>
              </>
            )}
          </div>
        )}

        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs font-montserrat font-bold uppercase text-muted">
            <span className="bg-offwhite px-2">or</span>
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          className="flex w-full items-center justify-center gap-2 bg-white text-charcoal ring-1 ring-border hover:bg-border/30"
          onClick={() => void signIn('google', { callbackUrl: '/profile' })}
        >
          <Image src="/icons/google-icon.svg" alt="" width={18} height={18} />
          Continue with Google
        </Button>

        <p className="mt-6 text-center font-inter text-xs text-muted">
          <Link href="/" className="text-hz-blue hover:underline">
            Back to home
          </Link>
        </p>
      </div>
      <Footer />
    </div>
  );
}
