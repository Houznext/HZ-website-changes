'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CloudUpload, Plus, Trash2, X } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { uploadBrowseCityImage } from '@/lib/uploadMedia';
import type { BrowseCityContent, CityCard } from '@/lib/homepageCmsTypes';

const API_PUBLIC = (process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://localhost:4001').replace(/\/$/, '');

const EMPTY_CARD = (): CityCard => ({
  name: '',
  href: '',
  count: '',
  areas: '',
  gradient: 'linear-gradient(135deg,#0f2a44,#1a4060)',
  titleSize: 'text-xl',
  showBadge: false,
  wide: false,
  badgeLabel: '',
  parentCity: '',
  imageUrl: null,
  overlayOpacity: 60,
});

function previewSrc(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? `${API_PUBLIC}${url}` : `${API_PUBLIC}/${url}`;
}

function overlayPreview(opacity?: number): number {
  const v = Math.min(90, Math.max(10, opacity ?? 60));
  return 0.78 - ((v - 10) / 80) * 0.58;
}

function CityCardEditor({
  city,
  idx,
  cityOptions,
  busy,
  onChange,
  onRemove,
  onUpload,
}: {
  city: CityCard;
  idx: number;
  cityOptions: string[];
  busy: boolean;
  onChange: (patch: Partial<CityCard>) => void;
  onRemove: () => void;
  onUpload: (file: File) => void;
}) {
  const [drag, setDrag] = useState(false);
  const isArea = Boolean(city.parentCity?.trim());

  const pickFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) onUpload(f);
    };
    input.click();
  };

  return (
    <div className="acard" style={{ padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div className="label" style={{ margin: 0 }}>
          {isArea ? `Area card — ${city.name || `Card ${idx + 1}`}` : `City card — ${city.name || `Card ${idx + 1}`}`}
        </div>
        <button type="button" className="btn btn-danger btn-xs" onClick={onRemove} aria-label="Remove card">
          <Trash2 size={12} />
          Remove
        </button>
      </div>

      <div
        className={`upzone${drag ? ' drag' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onUpload(f);
        }}
        style={{
          position: 'relative',
          minHeight: 120,
          borderRadius: 12,
          border: '2px dashed #cbd5e1',
          background: '#f8fafc',
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        {city.imageUrl ? (
          <>
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onChange({ imageUrl: null })}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 3,
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: 4,
                cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc(city.imageUrl)} alt="" style={{ width: '100%', height: 120, objectFit: 'cover' }} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: city.gradient,
                opacity: overlayPreview(city.overlayOpacity),
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: 10,
                bottom: 8,
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              {city.name || 'Preview'}
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={pickFile}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              minHeight: 120,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--mu)',
              fontSize: 12,
            }}
          >
            <CloudUpload size={24} strokeWidth={1.5} />
            <span>Drop or click to upload background</span>
          </button>
        )}
      </div>

      <label className="label">
        Image overlay ({city.overlayOpacity ?? 60}) — higher = more image visible
      </label>
      <input
        type="range"
        min={10}
        max={90}
        value={city.overlayOpacity ?? 60}
        onChange={(e) => onChange({ overlayOpacity: Number(e.target.value) })}
        style={{ width: '100%', marginBottom: 12 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label className="label">Name</label>
          <input className="fi" value={city.name} onChange={(e) => onChange({ name: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div>
          <label className="label">Parent city (area cards)</label>
          <select
            className="fi"
            value={city.parentCity ?? ''}
            onChange={(e) => onChange({ parentCity: e.target.value })}
            style={{ width: '100%' }}
          >
            <option value="">— Main city card —</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">Link (href)</label>
          <input className="fi" value={city.href} onChange={(e) => onChange({ href: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div>
          <label className="label">Count label</label>
          <input className="fi" value={city.count} onChange={(e) => onChange({ count: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div>
          <label className="label">Areas / subtitle (white on site)</label>
          <input className="fi" value={city.areas} onChange={(e) => onChange({ areas: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label className="label">Gradient CSS (overlay tint)</label>
          <input className="fi" value={city.gradient} onChange={(e) => onChange({ gradient: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div>
          <label className="label">Title size class</label>
          <input className="fi" value={city.titleSize} onChange={(e) => onChange({ titleSize: e.target.value })} style={{ width: '100%' }} />
        </div>
        <div>
          <label className="label">Badge label (wide cards)</label>
          <input className="fi" value={city.badgeLabel} onChange={(e) => onChange({ badgeLabel: e.target.value })} style={{ width: '100%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input type="checkbox" checked={city.showBadge} onChange={(e) => onChange({ showBadge: e.target.checked })} />
          Show count badge
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <input type="checkbox" checked={city.wide} onChange={(e) => onChange({ wide: e.target.checked })} />
          Wide banner card
        </label>
      </div>
    </div>
  );
}

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

  const grouped = useMemo(() => {
    const groups: { city: string; cards: { card: CityCard; idx: number }[] }[] = [];
    for (const opt of form.cityOptions) {
      const cards = form.cities
        .map((card, idx) => ({ card, idx }))
        .filter(({ card }) => card.name === opt && !card.parentCity?.trim());
      const areas = form.cities
        .map((card, idx) => ({ card, idx }))
        .filter(({ card }) => card.parentCity === opt);
      const combined = [...cards, ...areas];
      if (combined.length) groups.push({ city: opt, cards: combined });
    }
    const other = form.cities
      .map((card, idx) => ({ card, idx }))
      .filter(({ card }) => !form.cityOptions.includes(card.name) && !form.cityOptions.includes(card.parentCity ?? ''));
    if (other.length) groups.push({ city: 'Other cards', cards: other });
    return groups;
  }, [form.cities, form.cityOptions]);

  const updateCity = (idx: number, patch: Partial<CityCard>) => {
    setForm((f) => ({
      ...f,
      cities: f.cities.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    }));
  };

  const uploadFor = async (idx: number, file: File) => {
    if (!/image\/(jpeg|png|webp)/i.test(file.type)) {
      toast.error('Use JPG, PNG, or WebP');
      return;
    }
    setBusy(true);
    try {
      const r = await uploadBrowseCityImage(file);
      if (!r.url) throw new Error('No URL');
      updateCity(idx, { imageUrl: r.url });
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const addCityOption = () => {
    setForm((f) => ({ ...f, cityOptions: [...f.cityOptions, 'New city'] }));
  };

  const addMainCard = (cityName: string) => {
    setForm((f) => ({
      ...f,
      cities: [
        ...f.cities,
        {
          ...EMPTY_CARD(),
          name: cityName,
          parentCity: '',
          href: `/buy?city=${encodeURIComponent(cityName)}`,
          titleSize: 'text-[22px]',
        },
      ],
    }));
  };

  const addAreaCard = (parentCity: string) => {
    setForm((f) => ({
      ...f,
      cities: [
        ...f.cities,
        {
          ...EMPTY_CARD(),
          parentCity,
          href: `/buy?city=${encodeURIComponent(parentCity)}`,
        },
      ],
    }));
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
        Section copy, city dropdown, and cards grouped by city. Upload a background image per card and adjust overlay so the photo shows through.
        Area cards (Vikarabad, Shadnagar, etc.) use <strong>Parent city</strong> so they appear beside the matching city on the home page.
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
                const old = next[idx];
                next[idx] = e.target.value;
                setForm((f) => ({
                  ...f,
                  cityOptions: next,
                  cities: f.cities.map((c) => ({
                    ...c,
                    parentCity: c.parentCity === old ? e.target.value : c.parentCity,
                    name: c.name === old && !c.parentCity ? e.target.value : c.name,
                  })),
                }));
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
        {grouped.map((group) => (
          <div key={group.city}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, margin: 0 }}>{group.city}</h3>
              {group.city !== 'Other cards' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={() => addAreaCard(group.city)}>
                    <Plus size={12} /> Add area card
                  </button>
                  {!group.cards.some(({ card }) => card.name === group.city && !card.parentCity) ? (
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => addMainCard(group.city)}>
                      <Plus size={12} /> Add city card
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.cards.map(({ card, idx }) => (
                <CityCardEditor
                  key={idx}
                  city={card}
                  idx={idx}
                  cityOptions={form.cityOptions}
                  busy={busy}
                  onChange={(patch) => updateCity(idx, patch)}
                  onRemove={() => setForm((f) => ({ ...f, cities: f.cities.filter((_, i) => i !== idx) }))}
                  onUpload={(file) => void uploadFor(idx, file)}
                />
              ))}
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
