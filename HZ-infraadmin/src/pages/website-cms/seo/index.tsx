'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CloudUpload, Plus, Trash2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { uploadHeroImage } from '@/lib/uploadMedia';
import type { InfraSeoGeo } from '@/lib/homepageCmsTypes';

const API_PUBLIC = (process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://localhost:4001').replace(/\/$/, '');

type PageSeoRow = {
  id: string;
  path: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string | null;
  hasStructuredData: boolean;
  noIndex: boolean;
  keywords: string | null;
};

function previewSrc(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? `${API_PUBLIC}${url}` : `${API_PUBLIC}/${url}`;
}

const TITLE_IDEAL = 60;
const DESC_IDEAL = 160;

export default function WebsiteSeoCmsPage() {
  const [tab, setTab] = useState<'pages' | 'geo'>('pages');
  const [rows, setRows] = useState<PageSeoRow[]>([]);
  const [selectedPath, setSelectedPath] = useState('/');
  const [label, setLabel] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [hasStructuredData, setHasStructuredData] = useState(false);
  const [noIndex, setNoIndex] = useState(false);
  const [busy, setBusy] = useState(false);

  const [geo, setGeo] = useState<InfraSeoGeo | null>(null);

  const loadRows = useCallback(async () => {
    try {
      const res = await adminApi.get<PageSeoRow[]>('/page-seo');
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Failed to load page SEO');
    }
  }, []);

  const loadGeo = useCallback(async () => {
    try {
      const res = await adminApi.get<InfraSeoGeo>('/admin/site-config/seo-geo');
      setGeo(res.data);
    } catch {
      toast.error('Failed to load GEO settings');
    }
  }, []);

  useEffect(() => {
    void loadRows();
    void loadGeo();
  }, [loadRows, loadGeo]);

  const selectedRow = useMemo(() => rows.find((r) => r.path === selectedPath) ?? null, [rows, selectedPath]);

  useEffect(() => {
    if (!selectedRow) return;
    setLabel(selectedRow.label);
    setMetaTitle(selectedRow.metaTitle);
    setMetaDescription(selectedRow.metaDescription);
    setOgImageUrl(selectedRow.ogImageUrl ?? '');
    setKeywords(selectedRow.keywords ?? '');
    setHasStructuredData(selectedRow.hasStructuredData);
    setNoIndex(selectedRow.noIndex);
  }, [selectedRow]);

  const savePage = async () => {
    if (!metaTitle.trim() || !metaDescription.trim()) {
      toast.error('Meta title and description are required');
      return;
    }
    setBusy(true);
    try {
      await adminApi.put('/page-seo', {
        path: selectedPath,
        label: label.trim() || selectedPath,
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        ogImageUrl: ogImageUrl.trim() || null,
        hasStructuredData,
        noIndex,
        keywords: keywords.trim() || null,
      });
      toast.success('Page SEO saved');
      await loadRows();
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  const saveGeo = async () => {
    if (!geo) return;
    setBusy(true);
    try {
      await adminApi.patch('/admin/site-config/seo-geo', geo);
      toast.success('GEO & organization settings saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setBusy(false);
    }
  };

  const pickOg = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = () => {
      const f = input.files?.[0];
      if (!f) return;
      setBusy(true);
      void uploadHeroImage(f)
        .then((r) => {
          if (r.url) setOgImageUrl(r.url);
          toast.success('OG image uploaded');
        })
        .catch(() => toast.error('Upload failed'))
        .finally(() => setBusy(false));
    };
    input.click();
  };

  const updateGeo = (patch: Partial<InfraSeoGeo>) => {
    setGeo((g) => (g ? { ...g, ...patch } : g));
  };

  const updateFaq = (idx: number, patch: { question?: string; answer?: string }) => {
    setGeo((g) => {
      if (!g) return g;
      const items = g.faqItems.map((item, i) => (i === idx ? { ...item, ...patch } : item));
      return { ...g, faqItems: items };
    });
  };

  return (
    <AdminLayout title="SEO & GEO">
      <p style={{ fontSize: 13, color: 'var(--mu)', marginBottom: 16, maxWidth: 720 }}>
        Manage search meta tags per page and global geographic / organization data for Google, social previews, and AI
        discovery (JSON-LD).
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={`btn${tab === 'pages' ? ' btn-blue' : ''}`}
          onClick={() => setTab('pages')}
        >
          Page SEO
        </button>
        <button type="button" className={`btn${tab === 'geo' ? ' btn-blue' : ''}`} onClick={() => setTab('geo')}>
          GEO & organization
        </button>
      </div>

      {tab === 'pages' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 260px) 1fr', gap: 16, alignItems: 'start' }}>
          <div className="acard" style={{ padding: 12 }}>
            <div className="label" style={{ marginBottom: 8 }}>
              Pages
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 480, overflowY: 'auto' }}>
              {rows.map((r) => (
                <button
                  key={r.path}
                  type="button"
                  onClick={() => setSelectedPath(r.path)}
                  style={{
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedPath === r.path ? '#e8f1fd' : 'transparent',
                    fontSize: 12,
                    fontWeight: selectedPath === r.path ? 700 : 500,
                  }}
                >
                  {r.label}
                  <div style={{ fontSize: 10, color: 'var(--mu)', marginTop: 2 }}>{r.path}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="acard" style={{ padding: 16, maxWidth: 640 }}>
            <div className="label" style={{ marginBottom: 12 }}>
              {selectedPath}
            </div>
            <label className="label">Admin label</label>
            <input className="fi" value={label} onChange={(e) => setLabel(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
            <label className="label">Meta title ({metaTitle.length}/{TITLE_IDEAL})</label>
            <input className="fi" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
            <label className="label">Meta description ({metaDescription.length}/{DESC_IDEAL})</label>
            <textarea
              className="fi"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              style={{ width: '100%', marginBottom: 12, resize: 'vertical' }}
            />
            <label className="label">Keywords (optional)</label>
            <input className="fi" value={keywords} onChange={(e) => setKeywords(e.target.value)} style={{ width: '100%', marginBottom: 12 }} />
            <label className="label">OG image</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              {ogImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewSrc(ogImageUrl)} alt="" style={{ height: 48, borderRadius: 6, objectFit: 'cover' }} />
              ) : null}
              <button type="button" className="btn" onClick={pickOg} disabled={busy}>
                <CloudUpload size={14} /> Upload
              </button>
              {ogImageUrl ? (
                <button type="button" className="btn" onClick={() => setOgImageUrl('')}>
                  Clear
                </button>
              ) : null}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <input type="checkbox" checked={hasStructuredData} onChange={(e) => setHasStructuredData(e.target.checked)} />
                Include structured data (WebPage + FAQ on this route)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <input type="checkbox" checked={noIndex} onChange={(e) => setNoIndex(e.target.checked)} />
                No index (hide from search engines)
              </label>
            </div>
            <button type="button" className="btn btn-blue" disabled={busy} onClick={() => void savePage()}>
              {busy ? 'Saving…' : 'Save page SEO'}
            </button>
          </div>
        </div>
      ) : geo ? (
        <div style={{ maxWidth: 720 }}>
          <div className="acard" style={{ padding: 16, marginBottom: 16 }}>
            <div className="label" style={{ marginBottom: 8 }}>
              Site & organization
            </div>
            <label className="label">Site name</label>
            <input className="fi" value={geo.siteName} onChange={(e) => updateGeo({ siteName: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
            <label className="label">Site URL (canonical base)</label>
            <input className="fi" value={geo.siteUrl} onChange={(e) => updateGeo({ siteUrl: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
            <label className="label">Default OG image URL</label>
            <input className="fi" value={geo.defaultOgImage} onChange={(e) => updateGeo({ defaultOgImage: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
            <label className="label">Organization name</label>
            <input className="fi" value={geo.organizationName} onChange={(e) => updateGeo({ organizationName: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
            <label className="label">Organization description</label>
            <textarea className="fi" rows={2} value={geo.organizationDescription} onChange={(e) => updateGeo({ organizationDescription: e.target.value })} style={{ width: '100%', marginBottom: 8, resize: 'vertical' }} />
            <label className="label">Telephone</label>
            <input className="fi" value={geo.telephone} onChange={(e) => updateGeo({ telephone: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
            <label className="label">Default keywords</label>
            <input className="fi" value={geo.defaultKeywords} onChange={(e) => updateGeo({ defaultKeywords: e.target.value })} style={{ width: '100%', marginBottom: 8 }} />
            <label className="label">Twitter @site</label>
            <input className="fi" value={geo.twitterSite} onChange={(e) => updateGeo({ twitterSite: e.target.value })} style={{ width: '100%' }} />
          </div>

          <div className="acard" style={{ padding: 16, marginBottom: 16 }}>
            <div className="label" style={{ marginBottom: 8 }}>
              Geographic meta (local SEO)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label className="label">geo.region</label>
                <input className="fi" value={geo.geoRegion} onChange={(e) => updateGeo({ geoRegion: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">geo.placename</label>
                <input className="fi" value={geo.geoPlacename} onChange={(e) => updateGeo({ geoPlacename: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">geo.position (lat;lng)</label>
                <input className="fi" value={geo.geoPosition} onChange={(e) => updateGeo({ geoPosition: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">ICBM</label>
                <input className="fi" value={geo.icbm} onChange={(e) => updateGeo({ icbm: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Latitude</label>
                <input className="fi" type="number" step="any" value={geo.latitude} onChange={(e) => updateGeo({ latitude: Number(e.target.value) })} style={{ width: '100%' }} />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input className="fi" type="number" step="any" value={geo.longitude} onChange={(e) => updateGeo({ longitude: Number(e.target.value) })} style={{ width: '100%' }} />
              </div>
            </div>
            <label className="label" style={{ marginTop: 12 }}>
              Cities served (one per line)
            </label>
            <textarea
              className="fi"
              rows={3}
              value={geo.areaServed.join('\n')}
              onChange={(e) => updateGeo({ areaServed: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
              style={{ width: '100%', resize: 'vertical' }}
            />
            <label className="label" style={{ marginTop: 8 }}>
              Address locality / region / postal
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <input className="fi" placeholder="Locality" value={geo.addressLocality} onChange={(e) => updateGeo({ addressLocality: e.target.value })} />
              <input className="fi" placeholder="Region" value={geo.addressRegion} onChange={(e) => updateGeo({ addressRegion: e.target.value })} />
              <input className="fi" placeholder="Postal" value={geo.postalCode} onChange={(e) => updateGeo({ postalCode: e.target.value })} />
            </div>
          </div>

          <div className="acard" style={{ padding: 16, marginBottom: 16 }}>
            <div className="label" style={{ marginBottom: 8 }}>
              GEO — AI / generative discovery
            </div>
            <label className="label">AI summary (abstract meta + schema)</label>
            <textarea className="fi" rows={3} value={geo.aiSummary} onChange={(e) => updateGeo({ aiSummary: e.target.value })} style={{ width: '100%', resize: 'vertical' }} />
            <p style={{ fontSize: 11, color: 'var(--mu)', marginTop: 8 }}>
              FAQ items power FAQPage JSON-LD on pages with structured data enabled.
            </p>
            {geo.faqItems.map((item, idx) => (
              <div key={idx} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span className="label">FAQ {idx + 1}</span>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      setGeo((g) =>
                        g ? { ...g, faqItems: g.faqItems.filter((_, i) => i !== idx) } : g,
                      )
                    }
                    aria-label="Remove FAQ"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <input className="fi" placeholder="Question" value={item.question} onChange={(e) => updateFaq(idx, { question: e.target.value })} style={{ width: '100%', marginBottom: 6 }} />
                <textarea className="fi" rows={2} placeholder="Answer" value={item.answer} onChange={(e) => updateFaq(idx, { answer: e.target.value })} style={{ width: '100%', resize: 'vertical' }} />
              </div>
            ))}
            <button
              type="button"
              className="btn"
              style={{ marginTop: 10 }}
              onClick={() =>
                setGeo((g) =>
                  g ? { ...g, faqItems: [...g.faqItems, { question: '', answer: '' }] } : g,
                )
              }
            >
              <Plus size={14} /> Add FAQ
            </button>
          </div>

          <button type="button" className="btn btn-blue" disabled={busy} onClick={() => void saveGeo()}>
            {busy ? 'Saving…' : 'Save GEO settings'}
          </button>
        </div>
      ) : (
        <p style={{ color: 'var(--mu)' }}>Loading GEO settings…</p>
      )}
    </AdminLayout>
  );
}
