import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { PropertyCard } from '@/components/property/PropertyCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const { items } = useSavedProperties();
  const [me, setMe] = useState<{ phone?: string | null; email?: string | null; name?: string | null } | null>(null);
  const [pendingPhone, setPendingPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneBusy, setPhoneBusy] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const t = (session as { accessToken?: string }).accessToken;
      if (t && typeof window !== 'undefined') localStorage.setItem('infra_token', t);
    }
  }, [session, status]);

  const loadMe = async () => {
    try {
      const { data } = await api.get('/customers/me');
      setMe(data);
      setPendingPhone(data?.phone || '');
    } catch {
      setMe(null);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') void loadMe();
    else setMe(null);
  }, [status]);

  const sendPhoneOtp = async () => {
    const d = pendingPhone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(d)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setPhoneBusy(true);
    try {
      await api.post('/customers/me/phone/send-otp', { phone: d });
      toast.success('OTP sent');
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Could not send OTP');
    } finally {
      setPhoneBusy(false);
    }
  };

  const verifyPhoneOtp = async () => {
    const d = pendingPhone.replace(/\D/g, '').slice(-10);
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setPhoneBusy(true);
    try {
      const { data } = await api.post('/customers/me/phone/verify', { phone: d, otp });
      setMe(data);
      setOtp('');
      await update({ phone: data.phone });
      toast.success('Mobile number saved');
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Invalid OTP');
    } finally {
      setPhoneBusy(false);
    }
  };

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-offwhite">
        <Navbar />
        <div className="mx-auto max-w-infra px-4 py-16 text-center">
          <p className="font-inter text-muted">Please sign in to view saved properties.</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button variant="primary">Go to login</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">Profile</h1>

        {me && !me.phone && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-inter text-sm text-amber-950">
            <p className="font-montserrat font-bold">Add your mobile number</p>
            <p className="mt-1 text-amber-900/90">
              Saved properties and enquiries are tied to your account. Add and verify a mobile number below so we can
              match your quotations, invoices, and CRM activity to this profile where applicable.
            </p>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-border bg-white p-5 shadow-sm">
          <h2 className="font-montserrat text-lg font-bold text-charcoal">Account & mobile</h2>
          <p className="mt-1 font-inter text-sm text-muted">
            {me?.email ? me.email : (session?.user?.email ?? '—')} ·{' '}
            {me?.name || session?.user?.name || '—'}
          </p>
          <div className="mt-4 grid gap-3 sm:max-w-md">
            <label className="font-inter text-xs font-semibold text-charcoal">Mobile (OTP)</label>
            <input
              className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
              placeholder="10-digit mobile"
              value={pendingPhone}
              onChange={(e) => setPendingPhone(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="primary" disabled={phoneBusy} onClick={() => void sendPhoneOtp()}>
                Send OTP
              </Button>
            </div>
            <input
              className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm tracking-widest"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
            <Button type="button" variant="accent" disabled={phoneBusy} onClick={() => void verifyPhoneOtp()}>
              {phoneBusy ? 'Please wait…' : 'Verify & save mobile'}
            </Button>
          </div>
        </div>

        <h2 className="mt-10 font-montserrat text-lg font-bold text-charcoal">Saved properties</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.propertyId} property={p} />
          ))}
        </div>
        <h2 className="mt-10 font-montserrat text-lg font-bold text-charcoal">My enquiries</h2>
        <p className="mt-2 font-inter text-sm text-muted">Track enquiry responses via your assigned rep (CRM).</p>
      </div>
      <Footer />
    </div>
  );
}
