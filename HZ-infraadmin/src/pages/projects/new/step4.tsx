'use client';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Image, Shield, Video } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { BankChipPicker } from '@/components/projects/BankChipPicker';
import { ProjectStepProgress } from '@/components/projects/ProjectStepProgress';
import { ProjectWizardHeader } from '@/components/projects/ProjectWizardHeader';
import { SectionDivider } from '@/components/listing/SectionDivider';
import { useProjectForm } from '@/context/ProjectFormContext';

const ic = { size: 16, strokeWidth: 1.8, fill: 'none' as const };

export default function NewProjectStep4() {
  const router = useRouter();
  const { form, setField, saveDraft } = useProjectForm();

  const next = () => void router.push('/projects/new/step5');
  const onDraft = async () => {
    try {
      await saveDraft(false);
      toast.success('Draft saved ✓');
    } catch {
      toast.error('Save draft failed');
    }
  };

  return (
    <AdminLayout
      hideSearch
      header={
        <ProjectWizardHeader
          backHref="/projects/new/step3"
          centerTitle="Media & banks"
          onSaveDraft={() => void onDraft()}
          primaryLabel="Next: Publish →"
          onPrimary={next}
        />
      }
    >
      <ProjectStepProgress step={4} type={form.projectType} />

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="acard">
            <SectionDivider icon={<Image {...ic} color="#7c3aed" />} title="Project photos" subtitle="Min 5 · Max 30 · Cover shown first" iconBackground="#f3e8ff" />
            <div className="upzone" onClick={() => toast('Photo upload — connect storage API')}>
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>Drop project photos here</div>
              <div style={{ fontSize: 12, color: 'var(--mu)' }}>Aerial, entrance, amenities, floor plans, 3D renders</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="label">Hero image URL</label>
              <input className="fi" value={form.heroImageUrl} onChange={(e) => setField('heroImageUrl', e.target.value)} placeholder="https://…" />
            </div>
          </div>

          <div className="acard">
            <SectionDivider icon={<Video {...ic} color="#7c3aed" />} title="Video & brochure" subtitle="" iconBackground="#f3e8ff" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="label">Project video URL (YouTube / Vimeo)</label>
                <input className="fi" type="url" value={form.videoUrl} onChange={(e) => setField('videoUrl', e.target.value)} placeholder="https://youtube.com/…" />
              </div>
              <div>
                <label className="label">Drone / walkthrough video URL</label>
                <input className="fi" type="url" value={form.droneVideoUrl} onChange={(e) => setField('droneVideoUrl', e.target.value)} />
              </div>
              <div>
                <label className="label">Virtual tour URL (360°)</label>
                <input className="fi" type="url" value={form.virtualTourUrl} onChange={(e) => setField('virtualTourUrl', e.target.value)} />
              </div>
              <div>
                <label className="label">Brochure PDF URL</label>
                <input className="fi" type="url" value={form.brochureUrl} onChange={(e) => setField('brochureUrl', e.target.value)} />
              </div>
              <div>
                <label className="label">Master plan URL</label>
                <input className="fi" type="url" value={form.masterPlanUrl} onChange={(e) => setField('masterPlanUrl', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BankChipPicker selected={form.approvedBanks} onChange={(banks) => setField('approvedBanks', banks)} />

          <div className="acard">
            <SectionDivider icon={<Shield {...ic} color="#16a34a" />} title="Floor plan uploads" subtitle="" iconBackground="#f0fdf4" />
            <p style={{ fontSize: 12, color: 'var(--mu)' }}>Upload floor plans per configuration on the project detail page after publishing.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
