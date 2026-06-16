'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { CreditCard, FileText, IndianRupee, Info, ShieldCheck } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ListingStepProgress } from '@/components/listing/ListingStepProgress';
import { ListingWizardHeader } from '@/components/listing/ListingWizardHeader';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useListingForm } from '@/context/ListingFormContext';
import { formatPrice } from '@/lib/utils';
import { uploadPropertyDocument } from '@/lib/uploadMedia';

export default function NewPropertyStep3() {
  const router = useRouter();
  const { form, setField } = useListingForm();
  const base = Number(form.basePrice) || 0;
  const gst = Number(form.gstPercent) || 0;
  const reg = Number(form.registrationPercent) || 0;
  const maint = Number(form.maintenanceDeposit) || 0;
  const other = Number(form.otherCharges) || 0;
  const carpet = Number(form.carpetArea) || Number(form.builtUpArea) || 0;

  const total = base + (base * gst) / 100 + (base * reg) / 100 + maint + other;

  const ppsf = useMemo(() => (carpet > 0 && base ? base / carpet : 0), [carpet, base]);
  const gstAmt = base * (gst / 100);
  const regAmt = base * (reg / 100);

  const removeDoc = (key: 'reraCertUrl' | 'ecCertUrl' | 'floorPlanUrl' | 'brochureUrl', label: string) => {
    setField(key, undefined);
    toast.success(`${label} removed`);
  };

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

  const ecSub = String(form.ecCertUrl ?? '').trim()
    ? '✓ uploaded — Encumbrance certificate — title verification'
    : 'Encumbrance certificate — title verification';
  const docs: { key: 'reraCertUrl' | 'ecCertUrl' | 'floorPlanUrl' | 'brochureUrl'; title: string; sub: string }[] = [
    { key: 'reraCertUrl', title: 'RERA certificate', sub: 'PDF required for RERA verified badge' },
    { key: 'ecCertUrl', title: 'EC certificate', sub: ecSub },
    { key: 'floorPlanUrl', title: 'Floor plans', sub: '2BHK, 3BHK, 4BHK plans (optional)' },
    { key: 'brochureUrl', title: 'Brochure (optional)', sub: 'Property brochure PDF' },
  ];

  return (
    <AdminLayout
      hideSearch
      header={
        <ListingWizardHeader
          backHref="/new-property/step2"
          centerTitle="Pricing & documents"
          onSaveDraft={() => toast.success('Draft saved')}
          primaryLabel="Next: Photos & Publish →"
          onPrimary={() => void router.push('/new-property/step4')}
        />
      }
    >
      <ListingStepProgress step={3} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
        <div>
          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider icon={<IndianRupee size={16} strokeWidth={1.8} color="var(--blue)" />} title="Base pricing" iconBackground="var(--blue-l)" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label req">Base price (₹)</label>
                <input id="base-price" type="number" className="fi" value={String(form.basePrice ?? '')} onChange={(e) => setField('basePrice', e.target.value ? Number(e.target.value) : undefined)} />
              </div>
              <div>
                <label className="label">Price per sqft (₹)</label>
                <input id="psf-field" readOnly className="fi" style={{ background: '#f8fafc' }} value={ppsf ? String(Math.round(ppsf)) : ''} placeholder="Auto-calculated" />
              </div>
            </div>
            <div className="info-box" style={{ marginTop: 12 }}>
              <Info size={16} strokeWidth={1.8} color="var(--blue)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#0c4a6e' }}>
                Enter base price in full (₹). Price-per-sqft auto-calculates based on carpet area entered in Step 2.
              </span>
            </div>
          </div>

          <div className="acard">
            <SectionDivider
              icon={<CreditCard size={16} strokeWidth={1.8} color="var(--am)" />}
              title="Price breakdown components"
              subtitle="Shown on property detail page for buyers"
              iconBackground="#fef3c7"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">GST (%)</label>
                <input type="number" className="fi" value={String(form.gstPercent ?? 5)} onChange={(e) => setField('gstPercent', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Registration cost (%)</label>
                <input type="number" className="fi" value={String(form.registrationPercent ?? 1)} onChange={(e) => setField('registrationPercent', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Maintenance deposit (₹)</label>
                <input type="number" className="fi" value={String(form.maintenanceDeposit ?? 0)} onChange={(e) => setField('maintenanceDeposit', Number(e.target.value))} />
              </div>
              <div>
                <label className="label">Other charges (₹)</label>
                <input type="number" className="fi" value={String(form.otherCharges ?? 0)} onChange={(e) => setField('otherCharges', Number(e.target.value))} placeholder="e.g. car park, corpus" />
              </div>
            </div>
            <div style={{ background: 'var(--off)', borderRadius: 10, padding: 14, marginTop: 14 }}>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Cost breakdown preview</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span>Base price</span>
                <span id="bd-base" style={{ fontWeight: 600 }}>
                  {formatPrice(Math.round(base))}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span>GST ({gst}%)</span>
                <span id="bd-gst">{formatPrice(Math.round(gstAmt))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span>Registration ({reg}%)</span>
                <span id="bd-reg">{formatPrice(Math.round(regAmt))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                <span>Maintenance deposit</span>
                <span id="bd-maint">{formatPrice(Math.round(maint))}</span>
              </div>
              <div style={{ height: 1, background: 'var(--brd)', margin: '8px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                <span>Total cost</span>
                <span id="bd-total" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, color: 'var(--blue)' }}>
                  {formatPrice(Math.round(total))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="acard" style={{ marginBottom: 18 }}>
            <SectionDivider icon={<ShieldCheck size={16} strokeWidth={1.8} color="var(--tl)" />} title="RERA & legal details" iconBackground="#ccfbf1" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">RERA number</label>
                <input className="fi" value={String(form.reraNumber ?? '')} onChange={(e) => setField('reraNumber', e.target.value)} placeholder="P01400003456" />
              </div>
              <div>
                <label className="label">RERA expiry</label>
                <input type="date" className="fi" value={String(form.reraExpiry ?? '')} onChange={(e) => setField('reraExpiry', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Promoter / builder name</label>
              <input className="fi" value={String(form.promoterName ?? '')} onChange={(e) => setField('promoterName', e.target.value)} placeholder="e.g. Houznext Properties Pvt Ltd" />
            </div>
          </div>

          <div className="acard">
            <SectionDivider icon={<FileText size={16} strokeWidth={1.8} color="#7c3aed" />} title="Documents" subtitle="PDFs · Max 10MB each" iconBackground="#f3e8ff" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {docs.map((d) => {
                const hasDoc = Boolean(String(form[d.key] ?? '').trim());
                return (
                  <div key={d.key} className="doc-upload-row" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', gap: 9, alignItems: 'center', minWidth: 0 }}>
                      <FileText size={18} strokeWidth={1.8} color="var(--mu)" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ch)' }}>{d.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--mu)' }}>{d.sub}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                      {hasDoc ? (
                        <>
                          <button type="button" className="btn btn-ghost btn-xs" style={{ color: 'var(--blue)' }} onClick={() => void uploadRow(d.key, d.title)}>
                            Replace
                          </button>
                          <button type="button" className="btn btn-danger btn-xs" onClick={() => removeDoc(d.key, d.title)}>
                            Delete
                          </button>
                        </>
                      ) : (
                        <button type="button" className="btn btn-ghost btn-xs" style={{ color: 'var(--blue)' }} onClick={() => void uploadRow(d.key, d.title)}>
                          + Upload
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void router.push('/new-property/step2')}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast.success('Draft saved')}>
            Save draft
          </button>
          <button type="button" className="btn btn-blue btn-sm" onClick={() => void router.push('/new-property/step4')}>
            Next: Photos & Publish →
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
