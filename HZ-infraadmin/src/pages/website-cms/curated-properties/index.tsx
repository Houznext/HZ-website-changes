'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import type { CuratedContent, CuratedRow } from '@/lib/homepageCmsTypes';

export default function CuratedPropertiesCmsPage() {
  const [form, setForm] = useState<CuratedContent>({
    title: '',
    defaultSubtitle: '',
    viewAllLabel: '',
    rows: [],
  });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<CuratedContent>('/admin/site-config/curated-properties');
      setForm(res.data);
    } catch {
      toast.error('Failed to load curated section CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateRow = (idx: number, patch: Partial<CuratedRow>) => {
    setForm((f) => ({
      ...f,
      rows: f.rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/curated-properties', form);
      toast.success('Curated section saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Properties curated for you">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 640 }}>
        Section heading and row titles for the personalized property feeds. Listings still come from live inventory.
      </p>
      <div className="acard" style={{ padding: 16, maxWidth: 640, marginBottom: 16 }}>
        <label className="label">Section title</label>
        <input
          className="fi"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <label className="label">Default subtitle (before personalization)</label>
        <textarea
          className="fi"
          rows={2}
          value={form.defaultSubtitle}
          onChange={(e) => setForm((f) => ({ ...f, defaultSubtitle: e.target.value }))}
          style={{ width: '100%', marginBottom: 12, resize: 'vertical' }}
        />
        <label className="label">View all button label</label>
        <input
          className="fi"
          value={form.viewAllLabel}
          onChange={(e) => setForm((f) => ({ ...f, viewAllLabel: e.target.value }))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        {form.rows.map((row, idx) => (
          <div key={idx} className="acard" style={{ padding: 14 }}>
            <div className="label" style={{ marginBottom: 8 }}>
              Row {idx + 1} — {row.type}
            </div>
            <label className="label">Row title</label>
            <input
              className="fi"
              value={row.title}
              onChange={(e) => updateRow(idx, { title: e.target.value })}
              style={{ width: '100%', marginBottom: 8 }}
            />
            <label className="label">Grid columns (3 or 5)</label>
            <select
              className="fi"
              value={row.cols}
              onChange={(e) => updateRow(idx, { cols: Number(e.target.value) as 3 | 5 })}
              style={{ width: '100%' }}
            >
              <option value={3}>3 columns</option>
              <option value={5}>5 columns</option>
            </select>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save section'}
      </button>
    </AdminLayout>
  );
}
