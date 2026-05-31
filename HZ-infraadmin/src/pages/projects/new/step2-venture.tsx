'use client';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Map, Route, Shield } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AmenityChipPicker } from '@/components/projects/AmenityChipPicker';
import { ProjectStepProgress } from '@/components/projects/ProjectStepProgress';
import { ProjectWizardHeader } from '@/components/projects/ProjectWizardHeader';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useProjectForm } from '@/context/ProjectFormContext';
import { INFRA_FEATURES } from '@/lib/projects/constants';
import type { InfraStatusDraft, PlotSizeDraft } from '@/lib/projects/types';

const ic = { size: 16, strokeWidth: 1.8, fill: 'none' as const };

export default function NewProjectStep2Venture() {
  const router = useRouter();
  const { form, setField, saveDraft } = useProjectForm();

  const next = () => void router.push('/projects/new/step3');
  const onDraft = async () => {
    try {
      await saveDraft(false);
      toast.success('Draft saved ✓');
    } catch {
      toast.error('Save draft failed');
    }
  };

  const addPlot = () => {
    setField('plotSizes', [...form.plotSizes, { dimensions: '', sqyds: '', ratePerSqyd: '', totalPrice: '' }]);
  };

  const updatePlot = (idx: number, patch: Partial<PlotSizeDraft>) => {
    setField(
      'plotSizes',
      form.plotSizes.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    );
  };

  const addInfra = (label: string) => {
    if (form.infrastructure.some((i) => i.label === label)) return;
    setField('infrastructure', [...form.infrastructure, { label, status: 'upcoming' }]);
  };

  const updateInfra = (idx: number, patch: Partial<InfraStatusDraft>) => {
    setField(
      'infrastructure',
      form.infrastructure.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  };

  return (
    <AdminLayout
      hideSearch
      header={
        <ProjectWizardHeader
          backHref="/projects/new"
          centerTitle={
            <>
              Project details — <span style={{ color: 'var(--am)' }}>Venture / Plotted</span>
            </>
          }
          onSaveDraft={() => void onDraft()}
          primaryLabel="Next: Pricing & Legal →"
          onPrimary={next}
        />
      }
    >
      <ProjectStepProgress step={2} type={form.projectType === 'villaplot' ? 'villaplot' : 'venture'} />

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <SectionDivider icon={<Map {...ic} color="var(--am)" />} title="Land & plot details" subtitle="" iconBackground="#fef3c7" />
            <div className="g3" style={{ marginBottom: 12 }}>
              <div>
                <label className="label req">Total land area</label>
                <input className="fi" type="number" value={form.landArea} onChange={(e) => setField('landArea', e.target.value)} placeholder="e.g. 22" />
              </div>
              <div>
                <label className="label">Unit</label>
                <select className="fi" value={form.landUnit} onChange={(e) => setField('landUnit', e.target.value)}>
                  <option>Acres</option>
                  <option>Guntas</option>
                  <option>Sqyds</option>
                </select>
              </div>
              <div>
                <label className="label req">Total plots</label>
                <input className="fi" type="number" value={form.totalPlots} onChange={(e) => setField('totalPlots', e.target.value)} placeholder="e.g. 249" />
              </div>
            </div>
            <div className="g2" style={{ marginBottom: 12 }}>
              <div>
                <label className="label">Available plots</label>
                <input className="fi" type="number" value={form.availableUnits} onChange={(e) => setField('availableUnits', e.target.value)} placeholder="e.g. 84" />
              </div>
              <div>
                <label className="label">Phases</label>
                <input className="fi" value={form.phases} onChange={(e) => setField('phases', e.target.value)} placeholder="e.g. Phase 1 of 3" />
              </div>
            </div>
            <div className="config-box">
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Plot sizes offered</div>
              {form.plotSizes.map((row, idx) => (
                <div key={idx} className="plot-row">
                  <input className="fi" value={row.dimensions} onChange={(e) => updatePlot(idx, { dimensions: e.target.value })} placeholder="30×40 ft" style={{ fontSize: 12 }} />
                  <input className="fi" value={row.sqyds} onChange={(e) => updatePlot(idx, { sqyds: e.target.value })} placeholder="133 sqyds" style={{ fontSize: 12 }} />
                  <input className="fi" value={row.ratePerSqyd || ''} onChange={(e) => updatePlot(idx, { ratePerSqyd: e.target.value })} placeholder="Rate/sqyd ₹" style={{ fontSize: 12 }} />
                  <input className="fi" value={row.totalPrice || ''} onChange={(e) => updatePlot(idx, { totalPrice: e.target.value })} placeholder="Total price ₹" style={{ fontSize: 12 }} />
                  <button type="button" className="btn btn-ghost btn-xs" onClick={() => setField('plotSizes', form.plotSizes.filter((_, i) => i !== idx))}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 9 }} onClick={addPlot}>
                + Add plot size
              </button>
            </div>
          </div>

          <div className="acard">
            <SectionDivider icon={<Route {...ic} color="var(--am)" />} title="Roads & infrastructure" subtitle="" iconBackground="#fef3c7" />
            <div className="g3" style={{ marginBottom: 12 }}>
              <div>
                <label className="label">Main road (ft)</label>
                <input className="fi" type="number" value={form.mainRoadFt} onChange={(e) => setField('mainRoadFt', e.target.value)} placeholder="e.g. 60" />
              </div>
              <div>
                <label className="label">Internal roads (ft)</label>
                <input className="fi" type="number" value={form.internalRoadFt} onChange={(e) => setField('internalRoadFt', e.target.value)} placeholder="e.g. 40" />
              </div>
              <div>
                <label className="label">Lane roads (ft)</label>
                <input className="fi" type="number" value={form.laneRoadFt} onChange={(e) => setField('laneRoadFt', e.target.value)} placeholder="e.g. 30" />
              </div>
            </div>
            <label className="label">Infrastructure status</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 5 }}>
              {form.infrastructure.map((row, idx) => (
                <div key={idx} className="infra-row-edit">
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{row.label}</span>
                  <select className="fi fi-select-auto" value={row.status} onChange={(e) => updateInfra(idx, { status: e.target.value })} style={{ fontSize: 12 }}>
                    <option value="done">✓ Done</option>
                    <option value="in_progress">In progress</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <SectionDivider icon={<Shield {...ic} color="var(--am)" />} title="Legal & approval details" subtitle="" iconBackground="#fef3c7" />
            <div className="g2" style={{ marginBottom: 10 }}>
              <div>
                <label className="label">Layout approval no.</label>
                <input className="fi" value={form.legal.layoutApproval || ''} onChange={(e) => setField('legal', { ...form.legal, layoutApproval: e.target.value })} />
              </div>
              <div>
                <label className="label">DTCP / HMDA ref</label>
                <input className="fi" value={form.legal.authorityRef || ''} onChange={(e) => setField('legal', { ...form.legal, authorityRef: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="acard">
            <SectionDivider icon={<Map {...ic} color="#16a34a" />} title="Infrastructure features" subtitle="" iconBackground="#f0fdf4" />
            <AmenityChipPicker
              options={INFRA_FEATURES}
              selected={form.infrastructure.map((i) => i.label)}
              onChange={(labels) => {
                labels.forEach((l) => addInfra(l));
                setField(
                  'infrastructure',
                  form.infrastructure.filter((i) => labels.includes(i.label)),
                );
              }}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
