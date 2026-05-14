'use client';

import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import adminApi from '@/lib/axios';
import { useListingForm } from '@/context/ListingFormContext';
import { buildCreatePropertyPayload } from '@/lib/buildListingPayload';
import { formatPrice } from '@/lib/utils';
import { getPropertyGradient } from '@/lib/utils';

export default function NewPropertyReview() {
  const router = useRouter();
  const { form, resetForm } = useListingForm();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const payload = buildCreatePropertyPayload(form);
      const res = await adminApi.post('/admin/properties', payload);
      const code = res.data?.propertyCode ?? res.data?.propertyId ?? 'new';
      resetForm();
      void router.push(`/new-property/success?code=${encodeURIComponent(String(code))}`);
    } catch (e: unknown) {
      console.error(e);
      toast.error('Submit failed — check required fields');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 22 }}>
      <h2 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}>Review & confirm</h2>
      <div className="acard" style={{ marginBottom: 12 }}>
        <div className="label">Basic</div>
        <p>
          <strong>{String(form.title)}</strong> — {String(form.propertyType)} · {String(form.listingFor)}
        </p>
        <p style={{ color: '#64748b', marginTop: 6 }}>
          {String(form.city)} · {String(form.locality)}
        </p>
      </div>
      <div className="acard" style={{ marginBottom: 12, border: '1px solid #fde68a' }}>
        <span className="admin-only">Admin only</span>
        <p style={{ marginTop: 8 }}>
          Owner: {String(form.ownerName)} · {String(form.ownerPhone)}
        </p>
      </div>
      <div className="acard" style={{ marginBottom: 12 }}>
        <div className="label">Pricing</div>
        <p>{formatPrice(Number(form.basePrice))}</p>
      </div>
      <div className="acard" style={{ padding: 16, background: getPropertyGradient(String(form.propertyType)) }}>
        <div className="label">Website preview card</div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 14, marginTop: 8 }}>
          <div style={{ fontWeight: 700 }}>{String(form.title)}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{formatPrice(Number(form.basePrice))}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
        <button type="button" className="btn btn-ghost" onClick={() => void router.push('/new-property/step4')}>
          ← Back
        </button>
        <button type="button" className="btn btn-tl btn-lg" disabled={busy} onClick={() => void submit()}>
          {busy ? 'Submitting…' : 'Submit listing'}
        </button>
      </div>
    </div>
  );
}
