import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { OTPInput } from '@/components/ui/OTPInput';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    try {
      await api.post('/otp/send', mode === 'phone' ? { phone: contact } : { email: contact });
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
      const res = await api.post('/otp/verify', {
        otp,
        ...(mode === 'phone' ? { phone: contact } : { email: contact }),
      });
      const token = res.data.accessToken as string;
      if (typeof window !== 'undefined') localStorage.setItem('infra_token', token);
      const r = await signIn('credentials', {
        redirect: false,
        phone: contact,
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

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-md px-4 py-14">
        <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">Login to Infra</h1>
        <p className="mt-2 font-inter text-sm text-muted">Separate account from houznext.com — OTP only.</p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 font-montserrat text-xs font-bold ${mode === 'phone' ? 'bg-hz-blue text-white' : 'bg-border text-charcoal'}`}
            onClick={() => setMode('phone')}
          >
            Phone
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 font-montserrat text-xs font-bold ${mode === 'email' ? 'bg-hz-blue text-white' : 'bg-border text-charcoal'}`}
            onClick={() => setMode('email')}
          >
            Email
          </button>
        </div>
        <input
          className="mt-4 w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
          placeholder={mode === 'phone' ? '+91…' : 'you@email.com'}
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
            <Button className="w-full" variant="accent" disabled={loading || otp.length !== 6} onClick={() => void verify()}>
              Verify & continue
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
