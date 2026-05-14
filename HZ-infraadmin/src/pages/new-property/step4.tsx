'use client';

import { useRouter } from 'next/router';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';
import { useListingForm } from '@/context/ListingFormContext';
import { uploadPropertyImage } from '@/lib/uploadMedia';
import toast from 'react-hot-toast';

const HIGHLIGHTS = ['3BHK', 'East facing', 'Pool', 'Lift', 'RERA', 'Vastu', 'Power backup', 'Gym', 'Gated', 'Smart home'] as const;

export default function NewPropertyStep4() {
  const router = useRouter();
  const { form, setField } = useListingForm();
  const photos = (form.photoUrls as string[]) ?? [];
  const highlights = (form.highlights as string[]) ?? [];

  const addPhoto = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async () => {
      const files = input.files;
      if (!files?.length) return;
      for (let i = 0; i < files.length; i++) {
        try {
          const r = await uploadPropertyImage(files[i]);
          if (r.url) {
            const next = [...photos, r.url];
            setField('photoUrls', next);
            if (!form.coverImageUrl) setField('coverImageUrl', r.url);
          }
        } catch {
          toast.error('Image upload failed');
        }
      }
    };
    input.click();
  };

  const toggleHl = (h: string) => {
    if (highlights.includes(h)) setField('highlights', highlights.filter((x) => x !== h));
    else if (highlights.length < 4) setField('highlights', [...highlights, h]);
    else toast.error('Max 4 highlights');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 22 }}>
      <ListingStepProgress step={4} />
      <h2 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}>Step 4 — Photos & publish</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        <div>
          <div className="upzone" onClick={() => void addPhoto()}>
            <div style={{ fontWeight: 600 }}>Drag & drop or click to upload images</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>First image becomes cover unless set below.</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
            {photos.map((url, idx) => (
              <div key={url + idx} style={{ position: 'relative', width: 80, height: 64, borderRadius: 8, overflow: 'hidden', border: url === form.coverImageUrl ? '2px solid var(--blue)' : '1px solid #e2e8f0' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {url === form.coverImageUrl ? (
                  <span className="bdg b-blue" style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 8 }}>
                    COVER
                  </span>
                ) : null}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ position: 'absolute', top: 2, right: 2, padding: '2px 6px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setField(
                      'photoUrls',
                      photos.filter((u) => u !== url),
                    );
                  }}
                >
                  ×
                </button>
                <button type="button" className="btn btn-ghost btn-sm" style={{ position: 'absolute', bottom: 2, right: 2, padding: '2px 6px', fontSize: 10 }} onClick={() => setField('coverImageUrl', url)}>
                  Set cover
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="label">Highlights (max 4)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {HIGHLIGHTS.map((h) => (
                <button key={h} type="button" className={`chip ${highlights.includes(h) ? 'sel-tl' : ''}`} onClick={() => toggleHl(h)}>
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="acard" style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
          <label className="label">Approval status</label>
          <select className="fi" value={String(form.approvalStatus ?? 'pending')} onChange={(e) => setField('approvalStatus', e.target.value)}>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
          <label className="tgl" style={{ marginTop: 14 }}>
            <input type="checkbox" checked={!!form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} style={{ display: 'none' }} />
            <span className="tgl-track">
              <span className="tgl-thumb" />
            </span>
            Featured listing
          </label>
          <label className="tgl" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={!!form.isZeroBrokerage} onChange={(e) => setField('isZeroBrokerage', e.target.checked)} style={{ display: 'none' }} />
            <span className="tgl-track">
              <span className="tgl-thumb" />
            </span>
            Zero brokerage badge
          </label>
          <label className="tgl" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={form.enableWhatsappEnquiry !== false} onChange={(e) => setField('enableWhatsappEnquiry', e.target.checked)} style={{ display: 'none' }} />
            <span className="tgl-track">
              <span className="tgl-thumb" />
            </span>
            WhatsApp enquiry
          </label>
          <button type="button" className="btn btn-tl btn-lg" style={{ width: '100%', marginTop: 18 }} onClick={() => void router.push('/new-property/review')}>
            Review & submit →
          </button>
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <button type="button" className="btn btn-ghost" onClick={() => void router.push('/new-property/step3')}>
          ← Back
        </button>
      </div>
    </div>
  );
}
