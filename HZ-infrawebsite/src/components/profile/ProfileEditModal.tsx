'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

type Props = {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
  phone: string;
  onSaved: () => void;
};

export function ProfileEditModal({ open, onClose, name: initialName, email, phone: initialPhone, onSaved }: Props) {
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [pendingPhone, setPendingPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setPendingPhone(initialPhone);
      setOtp('');
    }
  }, [open, initialName, initialPhone]);

  if (!open) return null;

  const saveName = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setBusy(true);
    try {
      await api.patch('/customers/me', { name: name.trim() });
      await update({ name: name.trim() });
      toast.success('Profile updated');
      onSaved();
      onClose();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Could not update profile');
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    const d = pendingPhone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(d)) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setBusy(true);
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
      setBusy(false);
    }
  };

  const verifyPhone = async () => {
    const d = pendingPhone.replace(/\D/g, '').slice(-10);
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Enter the 6-digit OTP');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post('/customers/me/phone/verify', { phone: d, otp });
      await update({ phone: data.phone });
      toast.success('Mobile number saved');
      onSaved();
      onClose();
    } catch (e: unknown) {
      const msg =
        typeof e === 'object' && e !== null && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(msg || 'Invalid OTP');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="infra-profile-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="infra-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="edit-profile-title" className="font-montserrat text-lg font-bold text-charcoal">
          Edit profile
        </h2>
        <p className="mt-1 font-inter text-xs text-muted">{email || '—'}</p>

        <label className="mt-4 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
          Full name
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-inter text-sm outline-none focus:border-hz-blue focus:ring-2 focus:ring-hz-blue/10"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="mt-3 block font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
          Mobile (OTP)
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-border px-3 py-2 font-inter text-sm outline-none focus:border-hz-blue focus:ring-2 focus:ring-hz-blue/10"
          placeholder="10-digit mobile"
          value={pendingPhone}
          onChange={(e) => setPendingPhone(e.target.value)}
        />
        <button
          type="button"
          className="infra-btn infra-btn-ghost mt-2 px-3 py-2 text-xs"
          disabled={busy}
          onClick={() => void sendOtp()}
        >
          Send OTP
        </button>
        <input
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 font-inter text-sm tracking-widest outline-none focus:border-hz-blue focus:ring-2 focus:ring-hz-blue/10"
          placeholder="6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="infra-btn infra-btn-blue px-4 py-2 text-xs" disabled={busy} onClick={() => void saveName()}>
            Save name
          </button>
          <button type="button" className="infra-btn infra-btn-blue px-4 py-2 text-xs" disabled={busy} onClick={() => void verifyPhone()}>
            Verify mobile
          </button>
          <button type="button" className="infra-btn infra-btn-ghost px-4 py-2 text-xs" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
