'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';
import { useListingForm } from '@/context/ListingFormContext';
import { formatPrice } from '@/lib/utils';
import { uploadPropertyDocument } from '@/lib/uploadMedia';
import toast from 'react-hot-toast';

export default function NewPropertyStep3() {
  const router = useRouter();
  const { form, setField } = useListingForm();
  const [total, setTotal] = useState(0);

  const base = Number(form.basePrice) || 0;
  const gst = Number(form.gstPercent) || 0;
  const reg = Number(form.registrationPercent) || 0;
  const maint = Number(form.maintenanceDeposit) || 0;
  const other = Number(form.otherCharges) || 0;
  const carpet = Number(form.carpetArea) || Number(form.builtUpArea) || 0;

  useEffect(() => {
    setTotal(base + (base * gst) / 100 + (base * reg) / 100 + maint + other);
  }, [base, gst, reg, maint, other]);

  const ppsf = useMemo(() => (carpet > 0 && base ? base / carpet : 0), [carpet, base]);

  const uploadRow = async (key: 'reraCertUrl' | 'ecCertUrl' | 'floorPlanUrl' | 'brochureUrl', label: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,image/*';
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      try {
        const r = await uploadPropertyDocument(f);
        if (r.url) {
          setField(key, r.url);
          toast.success(`${label} uploaded`);
        }
      } catch {
        toast.error('Upload failed');
      }
    };
    input.click();
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 22 }}>
      <ListingStepProgress step={3} />
      <h2 style={{ fontFamily: 'Montserrat, sans-serif', marginBottom: 12 }}>Step 3 — Pricing & documents</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="acard">
          <div>
            <label className="label req">Base price (₹)</label>
            <input type="number" className="fi" value={String(form.basePrice ?? '')} onChange={(e) => setField('basePrice', e.target.value ? Number(e.target.value) : undefined)} />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>
            Price / sqft: <strong>{formatPrice(Math.round(ppsf))}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label className="label">GST %</label>
              <input type="number" className="fi" value={String(form.gstPercent ?? 5)} onChange={(e) => setField('gstPercent', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Registration %</label>
              <input type="number" className="fi" value={String(form.registrationPercent ?? 1)} onChange={(e) => setField('registrationPercent', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Maintenance deposit</label>
              <input type="number" className="fi" value={String(form.maintenanceDeposit ?? 0)} onChange={(e) => setField('maintenanceDeposit', Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Other charges</label>
              <input type="number" className="fi" value={String(form.otherCharges ?? 0)} onChange={(e) => setField('otherCharges', Number(e.target.value))} />
            </div>
          </div>
          <div className="info-box" style={{ marginTop: 14 }}>
            <div>
              <strong>Total estimated</strong>
              <div style={{ fontSize: 18, marginTop: 4 }}>{formatPrice(Math.round(total))}</div>
            </div>
          </div>
        </div>
        <div className="acard">
          <div>
            <label className="label">RERA number</label>
            <input className="fi" value={String(form.reraNumber ?? '')} onChange={(e) => setField('reraNumber', e.target.value)} />
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="label">RERA expiry</label>
            <input type="date" className="fi" value={String(form.reraExpiry ?? '')} onChange={(e) => setField('reraExpiry', e.target.value)} />
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="label">Promoter name</label>
            <input className="fi" value={String(form.promoterName ?? '')} onChange={(e) => setField('promoterName', e.target.value)} />
          </div>
          {(['RERA cert', 'EC cert', 'Floor plans', 'Brochure'] as const).map((label, i) => {
            const keys = ['reraCertUrl', 'ecCertUrl', 'floorPlanUrl', 'brochureUrl'] as const;
            const k = keys[i];
            return (
              <div key={label} className="upzone" style={{ marginTop: 12 }} onClick={() => void uploadRow(k, label)}>
                <div style={{ fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Click to upload PDF</div>
                {String(form[k] ?? '') ? <div style={{ marginTop: 6, fontSize: 11 }}>✓ Saved</div> : null}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-ghost" onClick={() => void router.push('/new-property/step2')}>
          ← Back
        </button>
        <button type="button" className="btn btn-blue" onClick={() => void router.push('/new-property/step4')}>
          Next →
        </button>
      </div>
    </div>
  );
}
