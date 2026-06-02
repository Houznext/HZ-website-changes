'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import type { TestimonialItem, TestimonialsContent } from '@/lib/homepageCmsTypes';

export default function TestimonialsCmsPage() {
  const [form, setForm] = useState<TestimonialsContent>({ eyebrow: '', title: '', items: [] });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<TestimonialsContent>('/admin/site-config/testimonials');
      setForm(res.data);
    } catch {
      toast.error('Failed to load testimonials CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateItem = (idx: number, patch: Partial<TestimonialItem>) => {
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === idx ? { ...item, ...patch } : item)),
    }));
  };

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/testimonials', form);
      toast.success('Testimonials saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Customer stories">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 640 }}>
        Eyebrow, title, and testimonial card content for the home page.
      </p>

      <div className="acard" style={{ padding: 16, maxWidth: 640, marginBottom: 16 }}>
        <label className="label">Eyebrow</label>
        <input
          className="fi"
          value={form.eyebrow}
          onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <label className="label">Title</label>
        <input
          className="fi"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        {form.items.map((item, idx) => (
          <div key={idx} className="acard" style={{ padding: 14 }}>
            <div className="label" style={{ marginBottom: 8 }}>
              Testimonial {idx + 1}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="label">Initials</label>
                <input className="fi" value={item.initials} onChange={(e) => updateItem(idx, { initials: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Avatar color</label>
                <input className="fi" value={item.avatarBg} onChange={(e) => updateItem(idx, { avatarBg: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Name</label>
                <input className="fi" value={item.name} onChange={(e) => updateItem(idx, { name: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Role / location</label>
                <input className="fi" value={item.role} onChange={(e) => updateItem(idx, { role: e.target.value })} style={{ width: '100%' }} />
              </div>
            </div>
            <label className="label" style={{ marginTop: 8 }}>
              Quote
            </label>
            <textarea
              className="fi"
              rows={3}
              value={item.text}
              onChange={(e) => updateItem(idx, { text: e.target.value })}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save testimonials'}
      </button>
    </AdminLayout>
  );
}
