'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import type { WhyCard, WhyHouznextContent } from '@/lib/homepageCmsTypes';

export default function WhyHouznextCmsPage() {
  const [form, setForm] = useState<WhyHouznextContent>({ eyebrow: '', title: '', cards: [] });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<WhyHouznextContent>('/admin/site-config/why-houznext');
      setForm(res.data);
    } catch {
      toast.error('Failed to load Why Houznext CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateCard = (idx: number, patch: Partial<WhyCard>) => {
    setForm((f) => ({
      ...f,
      cards: f.cards.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/why-houznext', form);
      toast.success('Why Houznext section saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Why Houznext Infra">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 640 }}>
        Six benefit cards — icons stay fixed on the website; edit titles, body copy, featured styling, and badge text.
      </p>

      <div className="acard" style={{ padding: 16, maxWidth: 640, marginBottom: 16 }}>
        <label className="label">Eyebrow</label>
        <input className="fi" value={form.eyebrow} onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))} style={{ width: '100%', marginBottom: 12 }} />
        <label className="label">Title</label>
        <input className="fi" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={{ width: '100%' }} />
      </div>

      <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        {form.cards.map((card, idx) => (
          <div key={idx} className="acard" style={{ padding: 14 }}>
            <div className="label" style={{ marginBottom: 8 }}>
              Card {idx + 1}
            </div>
            <label className="label">Title</label>
            <input className="fi" value={card.title} onChange={(e) => updateCard(idx, { title: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
            <label className="label">Body</label>
            <textarea className="fi" rows={2} value={card.body} onChange={(e) => updateCard(idx, { body: e.target.value })} style={{ width: '100%', marginBottom: 8, resize: 'vertical' }} />
            <label className="label">Badge label (featured cards only)</label>
            <input className="fi" value={card.badgeLabel} onChange={(e) => updateCard(idx, { badgeLabel: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <input type="checkbox" checked={card.featured} onChange={(e) => updateCard(idx, { featured: e.target.checked })} />
              Featured (dark gradient card)
            </label>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save section'}
      </button>
    </AdminLayout>
  );
}
