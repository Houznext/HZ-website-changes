'use client';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Building2, Briefcase, FileText } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProjectStepProgress } from '@/components/projects/ProjectStepProgress';
import { ProjectWizardHeader } from '@/components/projects/ProjectWizardHeader';
import { StepChecklist } from '@/components/projects/StepChecklist';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useProjectForm } from '@/context/ProjectFormContext';
import {
  CITIES,
  CONSTRUCTION_STATUSES,
  TYPE_BGS,
  TYPE_COLORS,
  TYPE_ICONS,
  TYPE_LABELS,
  step2Path,
  type ProjectTypeKey,
} from '@/lib/projects/constants';

const ic = { size: 16, strokeWidth: 1.8, fill: 'none' as const };

export default function NewProjectStep1() {
  const router = useRouter();
  const { form, setField, saveDraft } = useProjectForm();

  const next = () => {
    if (!form.projectType) {
      toast.error('Select a project type');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Project name is required');
      return;
    }
    if (!form.city || !form.locality) {
      toast.error('City and locality are required');
      return;
    }
    if (!form.developerName.trim()) {
      toast.error('Developer name is required');
      return;
    }
    void router.push(step2Path(form.projectType));
  };

  const onDraft = async () => {
    try {
      await saveDraft(false);
      toast.success('Draft saved ✓');
    } catch {
      toast.error('Save draft failed');
    }
  };

  const checklist = [
    { label: 'Project type selected', done: !!form.projectType },
    { label: 'Project name entered', done: !!form.name.trim() },
    { label: 'City & locality set', done: !!(form.city && form.locality) },
    { label: 'Developer name entered', done: !!form.developerName.trim() },
    { label: 'Project description written', done: !!form.description.trim() },
  ];

  return (
    <AdminLayout
      hideSearch
      header={
        <ProjectWizardHeader
          backHref="/projects"
          centerTitle="Add new project"
          onSaveDraft={() => void onDraft()}
          primaryLabel="Next: Project details →"
          onPrimary={next}
        />
      }
    >
      <ProjectStepProgress step={1} type={form.projectType} />

      <div className="project-wizard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f0f4f8' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--blue-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 {...ic} color="var(--blue)" />
              </div>
              <div>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 700 }}>Project type</div>
                <div style={{ fontSize: 12, color: 'var(--mu)' }}>Select type — form fields will change accordingly</div>
              </div>
            </div>
            <div className="proj-type-tiles">
              {(['apartment', 'villa', 'venture', 'villaplot'] as ProjectTypeKey[]).map((t) => {
                const sel = form.projectType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`proj-type-tile${sel ? ' sel' : ''}`}
                    style={sel ? { borderColor: TYPE_COLORS[t], background: TYPE_BGS[t] } : undefined}
                    onClick={() => setField('projectType', t)}
                  >
                    <span style={{ fontSize: 22 }}>{TYPE_ICONS[t]}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: sel ? TYPE_COLORS[t] : 'var(--mu)' }}>
                      {TYPE_LABELS[t]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="acard">
            <SectionDivider icon={<FileText {...ic} color="var(--blue)" />} title="Project information" subtitle="" iconBackground="var(--blue-l)" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label req">Project name</label>
                <input className="fi" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder="e.g. Skyline Heights" />
              </div>
              <div className="g2">
                <div>
                  <label className="label req">Developer / Promoter name</label>
                  <input className="fi" value={form.developerName} onChange={(e) => setField('developerName', e.target.value)} placeholder="e.g. Vertex Developers" />
                </div>
                <div>
                  <label className="label">Developer website</label>
                  <input className="fi" type="url" value={form.developerWebsite} onChange={(e) => setField('developerWebsite', e.target.value)} placeholder="https://…" />
                </div>
              </div>
              <div className="g2">
                <div>
                  <label className="label req">City</label>
                  <select className="fi" value={form.city} onChange={(e) => setField('city', e.target.value)}>
                    <option value="">Select city</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label req">Locality / Area</label>
                  <input className="fi" value={form.locality} onChange={(e) => setField('locality', e.target.value)} placeholder="e.g. Gachibowli" />
                </div>
              </div>
              <div>
                <label className="label">Full address</label>
                <textarea className="fi" rows={2} value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Street address, landmark…" />
              </div>
              <div className="g2">
                <div>
                  <label className="label">Google Maps link</label>
                  <input className="fi" type="url" value={form.mapsUrl} onChange={(e) => setField('mapsUrl', e.target.value)} placeholder="https://maps.google.com/…" />
                </div>
                <div>
                  <label className="label req">Project status</label>
                  <select className="fi" value={form.status} onChange={(e) => setField('status', e.target.value)}>
                    {CONSTRUCTION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Project description</label>
                <textarea className="fi" rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} placeholder="Describe the project…" />
              </div>
            </div>
          </div>

          <div className="acard">
            <SectionDivider icon={<Briefcase {...ic} color="var(--blue)" />} title="Developer details" subtitle="" iconBackground="var(--blue-l)" />
            <div className="g3">
              <div>
                <label className="label">Founded year</label>
                <input className="fi" type="number" value={form.developerFounded} onChange={(e) => setField('developerFounded', e.target.value)} placeholder="e.g. 2009" />
              </div>
              <div>
                <label className="label">Projects delivered</label>
                <input className="fi" type="number" value={form.developerProjectsDelivered} onChange={(e) => setField('developerProjectsDelivered', e.target.value)} placeholder="e.g. 18" />
              </div>
              <div>
                <label className="label">Total homes delivered</label>
                <input className="fi" type="number" value={form.developerHomesDelivered} onChange={(e) => setField('developerHomesDelivered', e.target.value)} placeholder="e.g. 4200" />
              </div>
            </div>
          </div>
        </div>

        <div className="project-wizard-side">
          <StepChecklist items={checklist} />
        </div>
      </div>
    </AdminLayout>
  );
}
