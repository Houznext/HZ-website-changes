'use client';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Building2, Calendar, Home } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AmenityChipPicker } from '@/components/projects/AmenityChipPicker';
import { ProjectStepProgress } from '@/components/projects/ProjectStepProgress';
import { ProjectWizardHeader } from '@/components/projects/ProjectWizardHeader';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useProjectForm } from '@/context/ProjectFormContext';
import { AMENITIES_VILLA, BHK_OPTIONS } from '@/lib/projects/constants';
import type { ProjectConfigDraft } from '@/lib/projects/types';

const ic = { size: 16, strokeWidth: 1.8, fill: 'none' as const };

export default function NewProjectStep2Villa() {
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

  const addConfig = () => {
    setField('configurations', [...form.configurations, { type: '3 BHK Villa', area: '', basePrice: '', allInclusive: '', availability: 'Available' }]);
  };

  const updateConfig = (idx: number, patch: Partial<ProjectConfigDraft>) => {
    setField(
      'configurations',
      form.configurations.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
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
              Project details — <span style={{ color: '#be185d' }}>Villa</span>
            </>
          }
          onSaveDraft={() => void onDraft()}
          primaryLabel="Next: Pricing & Legal →"
          onPrimary={next}
        />
      }
    >
      <ProjectStepProgress step={2} type="villa" />

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <SectionDivider icon={<Home {...ic} color="#be185d" />} title="Villa units & layout" subtitle="" iconBackground="#fce7f3" />
            <div className="g3" style={{ marginBottom: 12 }}>
              <div>
                <label className="label">Total villas</label>
                <input className="fi" type="number" value={form.totalUnits} onChange={(e) => setField('totalUnits', e.target.value)} placeholder="e.g. 64" />
              </div>
              <div>
                <label className="label">Plot area range</label>
                <input className="fi" value={form.unitsLabel} onChange={(e) => setField('unitsLabel', e.target.value)} placeholder="e.g. 200–300 sqyds" />
              </div>
              <div>
                <label className="label">Possession</label>
                <input className="fi" type="month" value={form.possessionDate} onChange={(e) => setField('possessionDate', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Villa types</label>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 4 }}>
                {BHK_OPTIONS.filter((b) => b.includes('BHK')).map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`am-chip${form.bhkTypes.includes(b) ? ' sel' : ''}`}
                    onClick={() =>
                      setField('bhkTypes', form.bhkTypes.includes(b) ? form.bhkTypes.filter((x) => x !== b) : [...form.bhkTypes, b])
                    }
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="config-box" style={{ marginTop: 12 }}>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Villa configurations</div>
              {form.configurations.map((row, idx) => (
                <div key={idx} className="config-row villa">
                  <input className="fi" value={row.type} onChange={(e) => updateConfig(idx, { type: e.target.value })} placeholder="Type" style={{ fontSize: 12 }} />
                  <input className="fi" value={row.area || ''} onChange={(e) => updateConfig(idx, { area: e.target.value })} placeholder="Plot sqyds" style={{ fontSize: 12 }} />
                  <input className="fi" value={row.basePrice || ''} onChange={(e) => updateConfig(idx, { basePrice: e.target.value })} placeholder="Built-up sqft" style={{ fontSize: 12 }} />
                  <input className="fi" value={row.allInclusive || ''} onChange={(e) => updateConfig(idx, { allInclusive: e.target.value })} placeholder="Price range" style={{ fontSize: 12 }} />
                </div>
              ))}
              <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={addConfig}>
                + Add villa config
              </button>
            </div>
          </div>

          <div className="acard">
            <SectionDivider icon={<Calendar {...ic} color="var(--am)" />} title="Timeline" subtitle="" iconBackground="#fef3c7" />
            <div className="g2">
              <div>
                <label className="label">Launch date</label>
                <input className="fi" type="month" value={form.launchDate} onChange={(e) => setField('launchDate', e.target.value)} />
              </div>
              <div>
                <label className="label">Possession date</label>
                <input className="fi" type="month" value={form.possessionDate} onChange={(e) => setField('possessionDate', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <SectionDivider icon={<Building2 {...ic} color="#be185d" />} title="Villa specifications" subtitle="" iconBackground="#fce7f3" />
            {['structure', 'flooring', 'externalFinish', 'constructionBy'].map((key) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <label className="label">{key.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  className="fi"
                  value={form.specifications[key] || ''}
                  onChange={(e) => setField('specifications', { ...form.specifications, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="acard">
            <SectionDivider icon={<Home {...ic} color="#16a34a" />} title="Gated community features" subtitle="" iconBackground="#f0fdf4" />
            <AmenityChipPicker options={AMENITIES_VILLA} selected={form.amenities} onChange={(a) => setField('amenities', a)} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
