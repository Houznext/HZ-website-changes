'use client';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { DollarSign, Shield } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProjectStepProgress } from '@/components/projects/ProjectStepProgress';
import { ProjectWizardHeader } from '@/components/projects/ProjectWizardHeader';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useProjectForm } from '@/context/ProjectFormContext';
import { step2Path } from '@/lib/projects/constants';
import { formatPrice } from '@/lib/utils';

const ic = { size: 16, strokeWidth: 1.8, fill: 'none' as const };

export default function NewProjectStep3() {
  const router = useRouter();
  const { form, setField, saveDraft } = useProjectForm();

  const backHref = step2Path(form.projectType);

  const next = () => void router.push('/projects/new/step4');
  const onDraft = async () => {
    try {
      await saveDraft(false);
      toast.success('Draft saved ✓');
    } catch {
      toast.error('Save draft failed');
    }
  };

  const min = Number(form.minPrice) || 0;

  return (
    <AdminLayout
      hideSearch
      header={
        <ProjectWizardHeader
          backHref={backHref}
          centerTitle="Pricing & legal"
          onSaveDraft={() => void onDraft()}
          primaryLabel="Next: Media & Banks →"
          onPrimary={next}
        />
      }
    >
      <ProjectStepProgress step={3} type={form.projectType} />

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <SectionDivider icon={<DollarSign {...ic} color="var(--blue)" />} title="Pricing details" subtitle="" iconBackground="var(--blue-l)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div className="g2">
                <div>
                  <label className="label req">Starting price (₹)</label>
                  <input className="fi" type="number" value={form.minPrice} onChange={(e) => setField('minPrice', e.target.value)} placeholder="e.g. 4800000" />
                </div>
                <div>
                  <label className="label">Max price (₹)</label>
                  <input className="fi" type="number" value={form.maxPrice} onChange={(e) => setField('maxPrice', e.target.value)} placeholder="e.g. 9450000" />
                </div>
              </div>
              <div className="g2">
                <div>
                  <label className="label">Price per sqft / sqyd label</label>
                  <input className="fi" value={form.pricePerUnitLabel} onChange={(e) => setField('pricePerUnitLabel', e.target.value)} placeholder="e.g. ₹4,200/sqft onwards" />
                </div>
                <div>
                  <label className="label">Units / config label</label>
                  <input className="fi" value={form.configLabel} onChange={(e) => setField('configLabel', e.target.value)} placeholder="e.g. 2, 3 & 4 BHK" />
                </div>
              </div>
              <div className="g3">
                <div>
                  <label className="label">GST (%)</label>
                  <input className="fi" type="number" value={form.gstPercent} onChange={(e) => setField('gstPercent', e.target.value)} />
                </div>
                <div>
                  <label className="label">Registration (%)</label>
                  <input className="fi" type="number" value={form.registrationPercent} onChange={(e) => setField('registrationPercent', e.target.value)} />
                </div>
                <div>
                  <label className="label">Maintenance deposit</label>
                  <input className="fi" value={form.maintenanceDeposit} onChange={(e) => setField('maintenanceDeposit', e.target.value)} placeholder="e.g. ₹50,000" />
                </div>
              </div>
              <div>
                <label className="label">Payment plan type</label>
                <select className="fi" value={form.paymentPlan} onChange={(e) => setField('paymentPlan', e.target.value)}>
                  <option>Construction linked plan</option>
                  <option>Time-linked payment plan</option>
                  <option>Down payment offer</option>
                  <option>Subvention scheme</option>
                </select>
              </div>
              {min > 0 ? (
                <div className="config-box">
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11.5, fontWeight: 700, marginBottom: 8 }}>Payment plan summary</div>
                  <div style={{ fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--mu)' }}>On booking (10%)</span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(min * 0.1)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--mu)' }}>During construction (70%)</span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(min * 0.7)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--mu)' }}>On possession (20%)</span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(min * 0.2)}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="acard">
          <SectionDivider icon={<Shield {...ic} color="#16a34a" />} title="RERA & legal details" subtitle="" iconBackground="#f0fdf4" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="g2">
              <div>
                <label className="label">RERA number</label>
                <input className="fi" value={form.reraNumber} onChange={(e) => setField('reraNumber', e.target.value)} placeholder="e.g. P02400012345" />
              </div>
              <div>
                <label className="label">RERA expiry date</label>
                <input className="fi" type="date" value={form.reraExpiry} onChange={(e) => setField('reraExpiry', e.target.value)} />
              </div>
            </div>
            <div className="g2">
              <div>
                <label className="label">RERA state authority</label>
                <select className="fi" value={form.reraAuthority} onChange={(e) => setField('reraAuthority', e.target.value)}>
                  <option>TSRERA (Telangana)</option>
                  <option>APRERA (Andhra Pradesh)</option>
                  <option>KRERA (Karnataka)</option>
                  <option>TNRERA (Tamil Nadu)</option>
                  <option>MahaRERA</option>
                </select>
              </div>
              <div>
                <label className="label">Reference code</label>
                <input className="fi" value={form.refCode} onChange={(e) => setField('refCode', e.target.value)} placeholder="e.g. HZI-PR-0014" />
              </div>
            </div>
            <div>
              <label className="label">EC / Title clearance notes</label>
              <textarea className="fi" rows={2} value={form.legal.ecNotes || ''} onChange={(e) => setField('legal', { ...form.legal, ecNotes: e.target.value })} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
