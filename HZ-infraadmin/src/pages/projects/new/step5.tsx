'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { Check, Rocket } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProjectStepProgress } from '@/components/projects/ProjectStepProgress';
import { ProjectWizardHeader } from '@/components/projects/ProjectWizardHeader';
import { ToggleRow } from '@/components/projects/ToggleRow';
import { useProjectForm } from '@/context/ProjectFormContext';
import { TYPE_LABELS } from '@/lib/projects/constants';

const ic = { size: 14, strokeWidth: 1.8, fill: 'none' as const };

export default function NewProjectStep5() {
  const router = useRouter();
  const { form, setField, saveDraft } = useProjectForm();
  const [saving, setSaving] = useState(false);

  const publish = async (published: boolean) => {
    setSaving(true);
    try {
      if (!form.name.trim()) {
        toast.error('Project name is required');
        return;
      }
      setField('visibility', published ? 'published' : 'draft');
      const id = await saveDraft(published);
      if (published) {
        toast.success('Project published ✓');
      } else {
        toast.success('Draft saved ✓');
        if (id) void router.push(`/projects/${id}`);
      }
    } catch {
      toast.error(published ? 'Publish failed' : 'Save draft failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      hideSearch
      header={
        <ProjectWizardHeader
          backHref="/projects/new/step4"
          centerTitle="Publish project"
          primaryLabel="Review & publish →"
          onPrimary={() => void publish(true)}
          saving={saving}
        />
      }
    >
      <ProjectStepProgress step={5} type={form.projectType} />

      <div className="g2">
        <div className="acard">
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f0f4f8' }}>
            Review summary
          </div>
          <div className="g3" style={{ gap: 8 }}>
            {[
              { lbl: 'Name', val: form.name || '—' },
              { lbl: 'Type', val: TYPE_LABELS[form.projectType] },
              { lbl: 'Status', val: form.status },
              { lbl: 'City', val: form.city || '—' },
              { lbl: 'Developer', val: form.developerName || '—' },
              { lbl: 'Banks', val: String(form.approvedBanks.length) },
            ].map((item) => (
              <div key={item.lbl} className="review-cell">
                <div className="review-lbl">{item.lbl}</div>
                <div className="review-val">{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="acard">
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--ch)', marginBottom: 14 }}>Publish settings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label className="label">Visibility</label>
              <select
                className="fi"
                value={form.visibility}
                onChange={(e) => setField('visibility', e.target.value)}
              >
                <option value="published">Published — visible on website</option>
                <option value="draft">Draft — not visible</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <ToggleRow label="Featured project" sub="Show in homepage featured section" checked={form.isFeatured} onChange={(v) => setField('isFeatured', v)} />
            <ToggleRow label="RERA verified badge" sub="Show RERA trust badge" checked={form.reraVerified} onChange={(v) => setField('reraVerified', v)} />
            <ToggleRow label="Show in search results" sub="Appear alongside individual listings" checked={form.showInSearch} onChange={(v) => setField('showInSearch', v)} />
            <button type="button" className="btn btn-tl btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={saving} onClick={() => void publish(true)}>
              <Check {...ic} color="currentColor" />
              Publish project
            </button>
            <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} disabled={saving} onClick={() => void publish(false)}>
              <Rocket {...ic} color="currentColor" />
              Save as draft
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
