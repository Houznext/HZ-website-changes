'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import adminApi from '@/lib/axios';
import { useListingForm } from '@/context/ListingFormContext';
import { mapApiPropertyToListingDraft } from '@/lib/mapApiPropertyToListingDraft';

export default function EditListingLoaderPage() {
  const router = useRouter();
  const { id } = router.query;
  const { setFields, setEditingPropertyId } = useListingForm();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !id || typeof id !== 'string') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.get(`/admin/properties/${id}`);
        const raw = res.data as Record<string, unknown>;
        if (cancelled) return;
        const draft = mapApiPropertyToListingDraft(raw);
        setFields(draft);
        setEditingPropertyId(id);
        void router.replace('/new-property');
      } catch {
        if (!cancelled) {
          setErr('Could not load this property.');
          toast.error('Failed to load property for edit');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, id, setFields, setEditingPropertyId]);

  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--mu)' }}>
      {err ? (
        <>
          <p style={{ marginBottom: 16 }}>{err}</p>
          <button type="button" className="btn btn-ghost" onClick={() => void router.push('/listings')}>
            Back to listings
          </button>
        </>
      ) : (
        <p>Loading property…</p>
      )}
    </div>
  );
}
