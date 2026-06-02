'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import type { ForSellersContent } from '@/lib/homepageCmsTypes';

export default function ForSellersCmsPage() {
  const [form, setForm] = useState<ForSellersContent>({
    eyebrow: '',
    title: '',
    subtitle: '',
    primaryCta: '',
    primaryHref: '/sell',
    secondaryCta: '',
    perks: [],
  });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<ForSellersContent>('/admin/site-config/for-sellers');
      setForm(res.data);
    } catch {
      toast.error('Failed to load for-sellers CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/for-sellers', form);
      toast.success('For sellers section saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="For sellers">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 640 }}>
        Copy for the list-your-property CTA band on the home page.
      </p>
      <div className="acard" style={{ padding: 16, maxWidth: 640 }}>
        <label className="label">Eyebrow</label>
        <input className="fi" value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} style={{ width: '100%', marginBottom: 12 }} />
        <label className="label">Title</label>
        <input className="fi" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={{ width: '100%', marginBottom: 12 }} />
        <label className="label">Subtitle</label>
        <textarea className="fi" rows={3} value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} style={{ width: '100%', marginBottom: 12, resize: 'vertical' }} />
        <label className="label">Primary CTA label</label>
        <input className="fi" value={form.primaryCta} onChange={(e) => setForm((f) => ({ ...f, primaryCta: e.target.value }))} style={{ width: '100%', marginBottom: 12 }} />
        <label className="label">Primary CTA link</label>
        <input className="fi" value={form.primaryHref} onChange={(e) => setForm((f) => ({ ...f, primaryHref: e.target.value }))} style={{ width: '100%', marginBottom: 12 }} />
        <label className="label">Secondary CTA label (WhatsApp)</label>
        <input className="fi" value={form.secondaryCta} onChange={(e) => setForm((f) => ({ ...f, secondaryCta: e.target.value }))} style={{ width: '100%', marginBottom: 12 }} />
        <label className="label">Perks (one per line)</label>
        <textarea
          className="fi"
          rows={4}
          value={form.perks.join('\n')}
          onChange={(e) => setForm((f) => ({ ...f, perks: e.target.value.split('\n').filter(Boolean) }))}
          style={{ width: '100%', resize: 'vertical' }}
        />
      </div>
      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save section'}
      </button>
    </AdminLayout>
  );
}
