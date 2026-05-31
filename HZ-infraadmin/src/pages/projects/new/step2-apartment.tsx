'use client';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Building2, Calendar, Layers } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AmenityChipPicker } from '@/components/projects/AmenityChipPicker';
import { ProjectStepProgress } from '@/components/projects/ProjectStepProgress';
import { ProjectWizardHeader } from '@/components/projects/ProjectWizardHeader';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useProjectForm } from '@/context/ProjectFormContext';
import { AMENITIES_APT, BHK_OPTIONS } from '@/lib/projects/constants';
import type { ProjectConfigDraft, ProjectMilestoneDraft } from '@/lib/projects/types';

const ic = { size: 16, strokeWidth: 1.8, fill: 'none' as const };

export default function NewProjectStep2Apartment() {
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

  const toggleBhk = (bhk: string) => {
    const nextTypes = form.bhkTypes.includes(bhk) ? form.bhkTypes.filter((b) => b !== bhk) : [...form.bhkTypes, bhk];
    setField('bhkTypes', nextTypes);
  };

  const addConfig = () => {
    setField('configurations', [...form.configurations, { type: '2 BHK', area: '', basePrice: '', allInclusive: '', units: '' }]);
  };

  const updateConfig = (idx: number, patch: Partial<ProjectConfigDraft>) => {
    setField(
      'configurations',
      form.configurations.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    );
  };

  const addMilestone = () => {
    setField('milestones', [...form.milestones, { label: '', date: '', isCompleted: false, isCurrent: false }]);
  };

  const updateMilestone = (idx: number, patch: Partial<ProjectMilestoneDraft>) => {
    setField(
      'milestones',
      form.milestones.map((m, i) => (i === idx ? { ...m, ...patch } : m)),
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
              Project details — <span style={{ color: 'var(--blue)' }}>Apartment</span>
            </>
          }
          onSaveDraft={() => void onDraft()}
          primaryLabel="Next: Pricing & Legal →"
          onPrimary={next}
        />
      }
    >
      <ProjectStepProgress step={2} type="apartment" />

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <SectionDivider icon={<Building2 {...ic} color="var(--blue)" />} title="Units & configuration" subtitle="" iconBackground="var(--blue-l)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div className="g3">
                <div>
                  <label className="label">Total units</label>
                  <input className="fi" type="number" value={form.totalUnits} onChange={(e) => setField('totalUnits', e.target.value)} placeholder="e.g. 248" />
                </div>
                <div>
                  <label className="label">No. of towers</label>
                  <input className="fi" type="number" value={form.towers} onChange={(e) => setField('towers', e.target.value)} placeholder="e.g. 3" />
                </div>
                <div>
                  <label className="label">Floors per tower</label>
                  <input className="fi" value={form.maxFloors} onChange={(e) => setField('maxFloors', e.target.value)} placeholder="e.g. G+18" />
                </div>
              </div>
              <div className="g2">
                <div>
                  <label className="label">Project area (acres)</label>
                  <input className="fi" type="number" value={form.projectAreaAcres} onChange={(e) => setField('projectAreaAcres', e.target.value)} placeholder="e.g. 4.2" />
                </div>
                <div>
                  <label className="label">Open area %</label>
                  <input className="fi" type="number" value={form.openAreaPercent} onChange={(e) => setField('openAreaPercent', e.target.value)} placeholder="e.g. 68" />
                </div>
              </div>
              <div>
                <label className="label">Configurations available</label>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 4 }}>
                  {BHK_OPTIONS.map((b) => (
                    <button key={b} type="button" className={`am-chip${form.bhkTypes.includes(b) ? ' sel' : ''}`} onClick={() => toggleBhk(b)}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="config-box">
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Add configuration details</div>
                {form.configurations.map((row, idx) => (
                  <div key={idx} className="config-row">
                    <input className="fi" value={row.type} onChange={(e) => updateConfig(idx, { type: e.target.value })} placeholder="Type" style={{ fontSize: 12 }} />
                    <input className="fi" value={row.area || ''} onChange={(e) => updateConfig(idx, { area: e.target.value })} placeholder="Carpet sqft" style={{ fontSize: 12 }} />
                    <input className="fi" value={row.units || ''} onChange={(e) => updateConfig(idx, { units: e.target.value })} placeholder="Units" style={{ fontSize: 12 }} />
                    <input className="fi" value={row.basePrice || ''} onChange={(e) => updateConfig(idx, { basePrice: e.target.value })} placeholder="Base price ₹" style={{ fontSize: 12 }} />
                    <input className="fi" value={row.allInclusive || ''} onChange={(e) => updateConfig(idx, { allInclusive: e.target.value })} placeholder="All-incl ₹" style={{ fontSize: 12 }} />
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addConfig}>
                  + Add config row
                </button>
              </div>
            </div>
          </div>

          <div className="acard">
            <SectionDivider icon={<Calendar {...ic} color="var(--am)" />} title="Construction timeline" subtitle="" iconBackground="#fef3c7" />
            <div className="g2" style={{ marginBottom: 12 }}>
              <div>
                <label className="label">Launch date</label>
                <input className="fi" type="month" value={form.launchDate} onChange={(e) => setField('launchDate', e.target.value)} />
              </div>
              <div>
                <label className="label req">Possession date</label>
                <input className="fi" type="month" value={form.possessionDate} onChange={(e) => setField('possessionDate', e.target.value)} />
              </div>
            </div>
            <label className="label">Construction milestones</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 5 }}>
              {form.milestones.map((m, idx) => (
                <div key={idx} className="ms-edit-row">
                  <input className="fi" value={m.label} onChange={(e) => updateMilestone(idx, { label: e.target.value })} placeholder="Milestone" style={{ fontSize: 12 }} />
                  <input className="fi" type="month" value={m.date || ''} onChange={(e) => updateMilestone(idx, { date: e.target.value })} style={{ fontSize: 12 }} />
                  <select
                    className="fi"
                    style={{ fontSize: 12 }}
                    value={m.isCompleted ? 'done' : m.isCurrent ? 'in_progress' : 'upcoming'}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateMilestone(idx, { isCompleted: v === 'done', isCurrent: v === 'in_progress' });
                    }}
                  >
                    <option value="done">Done</option>
                    <option value="in_progress">In progress</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addMilestone}>
              + Add milestone
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <SectionDivider icon={<Layers {...ic} color="#7c3aed" />} title="Specifications" subtitle="" iconBackground="#f3e8ff" />
            {['structure', 'flooring', 'kitchen', 'bathroom', 'doors', 'electrical', 'security'].map((key) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <label className="label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input
                  className="fi"
                  value={form.specifications[key] || ''}
                  onChange={(e) => setField('specifications', { ...form.specifications, [key]: e.target.value })}
                  placeholder={`e.g. ${key}`}
                />
              </div>
            ))}
          </div>
          <div className="acard">
            <SectionDivider icon={<Building2 {...ic} color="#16a34a" />} title="Amenities" subtitle="" iconBackground="#f0fdf4" />
            <AmenityChipPicker options={AMENITIES_APT} selected={form.amenities} onChange={(a) => setField('amenities', a)} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
