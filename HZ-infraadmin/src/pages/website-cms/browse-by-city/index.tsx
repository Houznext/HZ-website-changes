'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import type { BrowseCityContent, CityCard } from '@/lib/homepageCmsTypes';

export default function BrowseByCityCmsPage() {
  const [form, setForm] = useState<BrowseCityContent>({
    title: '',
    subtitle: '',
    defaultCity: 'Hyderabad',
    cityOptions: [],
    cities: [],
  });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adminApi.get<BrowseCityContent>('/admin/site-config/browse-by-city');
      setForm(res.data);
    } catch {
      toast.error('Failed to load browse-by-city CMS');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateCity = (idx: number, patch: Partial<CityCard>) => {
    setForm((f) => ({
      ...f,
      cities: f.cities.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };

  const addCityOption = () => {
    setForm((f) => ({ ...f, cityOptions: [...f.cityOptions, 'New city'] }));
  };

  const save = async () => {
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/browse-by-city', form);
      toast.success('Browse by city saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Browse by city">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 720 }}>
        Section copy, city dropdown options, default selection, and each city card&apos;s text and styling.
      </p>

      <div className="acard" style={{ padding: 16, maxWidth: 720, marginBottom: 16 }}>
        <label className="label">Section title</label>
        <input
          className="fi"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <label className="label">Section subtitle</label>
        <input
          className="fi"
          value={form.subtitle}
          onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
          style={{ width: '100%', marginBottom: 12 }}
        />
        <label className="label">Default city (dropdown pre-select)</label>
        <select
          className="fi"
          value={form.defaultCity}
          onChange={(e) => setForm((f) => ({ ...f, defaultCity: e.target.value }))}
          style={{ width: '100%', marginBottom: 12 }}
        >
          {form.cityOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="label">City dropdown options</label>
        {form.cityOptions.map((opt, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              className="fi"
              value={opt}
              onChange={(e) => {
                const next = [...form.cityOptions];
                next[idx] = e.target.value;
                setForm((f) => ({ ...f, cityOptions: next }));
              }}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn"
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  cityOptions: f.cityOptions.filter((_, i) => i !== idx),
                }))
              }
              aria-label="Remove option"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button type="button" className="btn" onClick={addCityOption} style={{ marginTop: 4 }}>
          <Plus size={14} /> Add city option
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        {form.cities.map((city, idx) => (
          <div key={idx} className="acard" style={{ padding: 14 }}>
            <div className="label" style={{ marginBottom: 8 }}>
              City card — {city.name || `Card ${idx + 1}`}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="label">Name</label>
                <input className="fi" value={city.name} onChange={(e) => updateCity(idx, { name: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Link (href)</label>
                <input className="fi" value={city.href} onChange={(e) => updateCity(idx, { href: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Count label</label>
                <input className="fi" value={city.count} onChange={(e) => updateCity(idx, { count: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Areas / subtitle line</label>
                <input className="fi" value={city.areas} onChange={(e) => updateCity(idx, { areas: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Gradient CSS</label>
                <input className="fi" value={city.gradient} onChange={(e) => updateCity(idx, { gradient: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Title size class</label>
                <input className="fi" value={city.titleSize} onChange={(e) => updateCity(idx, { titleSize: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Badge label (wide cards)</label>
                <input className="fi" value={city.badgeLabel} onChange={(e) => updateCity(idx, { badgeLabel: e.target.value })} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <input type="checkbox" checked={city.showBadge} onChange={(e) => updateCity(idx, { showBadge: e.target.checked })} />
                Show count badge
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <input type="checkbox" checked={city.wide} onChange={(e) => updateCity(idx, { wide: e.target.checked })} />
                Wide banner card
              </label>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-blue" style={{ marginTop: 16 }} disabled={busy} onClick={() => void save()}>
        {busy ? 'Saving…' : 'Save browse by city'}
      </button>
    </AdminLayout>
  );
}
