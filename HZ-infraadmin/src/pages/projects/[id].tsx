'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { ChevronLeft, ExternalLink, Pencil } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProjectStatusBadge, ProjectTypeBadge, PublishedBadge } from '@/components/projects/ProjectBadges';
import adminApi from '@/lib/axios';
import type { ProjectTypeKey } from '@/lib/projects/constants';
import type { ProjectRecord } from '@/lib/projects/types';
import { priceRangeLabel } from '@/lib/projects/payload';
import { formatDate, formatPrice } from '@/lib/utils';

const TABS = ['Overview', 'Configuration', 'Milestones', 'Bank Approvals', 'Enquiries', 'Media', 'Legal'] as const;
type Tab = (typeof TABS)[number];

const ic = { size: 14, strokeWidth: 1.8, fill: 'none' as const };

export default function ProjectDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [tab, setTab] = useState<Tab>('Overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await adminApi.get(`/admin/projects/${id}`);
        setProject(res.data);
      } catch {
        toast.error('Failed to load project');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !project) {
    return (
      <AdminLayout title="Project detail">
        <div className="acard" style={{ padding: 40, textAlign: 'center', color: 'var(--mu)' }}>
          {loading ? 'Loading…' : 'Project not found'}
        </div>
      </AdminLayout>
    );
  }

  const type = project.projectType as ProjectTypeKey;
  const banks = project.approvedBanks ?? [];
  const configs = project.configurations ?? [];
  const milestones = project.milestones ?? [];

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: '100%' }}>
      <Link href="/projects" className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
        <ChevronLeft size={15} strokeWidth={1.8} />
        Back
      </Link>
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700 }}>{project.name}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <Link href="/projects/new" className="btn btn-ghost btn-sm">
          <Pencil {...ic} />
          Edit project
        </Link>
        <button type="button" className="btn btn-blue btn-sm" onClick={() => toast('Preview on website — coming soon')}>
          <ExternalLink {...ic} />
          View on website
        </button>
      </div>
    </div>
  );

  return (
    <AdminLayout hideSearch header={header}>
      <div className="admin-proj-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="acard stat-card">
          <div className="stat-lbl">Project type</div>
          <ProjectTypeBadge type={type} />
        </div>
        <div className="acard stat-card">
          <div className="stat-lbl">Status</div>
          <ProjectStatusBadge status={project.status} />
        </div>
        <div className="acard stat-card">
          <div className="stat-lbl">Total units</div>
          <div className="stat-val" style={{ fontSize: 18 }}>
            {project.totalUnits ?? project.unitsLabel ?? '—'}
          </div>
        </div>
        <div className="acard stat-card">
          <div className="stat-lbl">Enquiries</div>
          <div className="stat-val" style={{ fontSize: 18, color: 'var(--blue)' }}>
            {project.enquiryCount ?? 0}
          </div>
        </div>
        <div className="acard stat-card">
          <div className="stat-lbl">Bank approvals</div>
          <div className="stat-val" style={{ fontSize: 18, color: 'var(--tl)' }}>
            {project.bankCount ?? banks.length}
          </div>
        </div>
      </div>

      <div className="proj-detail-tabs">
        {TABS.map((t) => (
          <button key={t} type="button" className={`proj-tab${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="project-detail-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tab === 'Overview' ? (
            <div className="acard">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <ProjectTypeBadge type={type} />
                    <ProjectStatusBadge status={project.status} />
                    <PublishedBadge published={project.published} visibility={project.visibility} />
                    {project.reraVerified ? <span className="bdg b-teal">RERA ✓</span> : null}
                  </div>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{project.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--mu)', marginBottom: 4 }}>
                    {[project.locality, project.city].filter(Boolean).join(', ')} · By {project.developerName || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mu)' }}>
                    RERA: {project.reraNumber || '—'} · Ref: {project.refCode || project.projectId.slice(0, 8)} · Added {formatDate(project.createdAt)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 22, fontWeight: 800 }}>
                    {priceRangeLabel(project.minPrice, project.maxPrice, formatPrice)}
                  </div>
                  {project.pricePerUnitLabel ? <div style={{ fontSize: 12, color: 'var(--mu)' }}>{project.pricePerUnitLabel}</div> : null}
                </div>
              </div>
              {project.description ? <p style={{ marginTop: 14, fontSize: 13.5, color: 'var(--mu)', lineHeight: 1.7 }}>{project.description}</p> : null}
            </div>
          ) : null}

          {tab === 'Configuration' ? (
            <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
              <table className="atbl">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Area</th>
                    <th>Base price</th>
                    <th>All-inclusive</th>
                    <th>Units / Status</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--mu)' }}>
                        No configurations added
                      </td>
                    </tr>
                  ) : (
                    configs.map((c, i) => (
                      <tr key={i}>
                        <td>
                          <span className="chip">{c.type}</span>
                        </td>
                        <td>{c.area || '—'}</td>
                        <td>{c.basePrice || '—'}</td>
                        <td style={{ color: 'var(--tl)', fontWeight: 600 }}>{c.allInclusive || '—'}</td>
                        <td>{c.units || c.availability || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {tab === 'Milestones' ? (
            <div className="acard">
              {project.constructionProgress != null ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: 'var(--mu)' }}>Overall completion</span>
                    <span className="bdg b-amber">{project.constructionProgress}%</span>
                  </div>
                  <div className="prog-bar">
                    <div className="prog-fill" style={{ width: `${project.constructionProgress}%`, background: 'var(--am)' }} />
                  </div>
                </div>
              ) : null}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {milestones.length === 0 ? (
                  <p style={{ color: 'var(--mu)', fontSize: 13 }}>No milestones recorded</p>
                ) : (
                  milestones.map((m) => (
                    <div key={m.milestoneId || m.label} className={`ms-row${m.isCurrent ? ' ms-current' : ''}`}>
                      <div className="ms-dot" style={{ background: m.isCompleted ? '#16a34a' : m.isCurrent ? 'var(--am)' : '#e2e8f0' }} />
                      <div className="ms-label">{m.label}</div>
                      <div className="ms-date">{m.date || '—'}</div>
                      <span className={`bdg ${m.isCompleted ? 'b-green' : m.isCurrent ? 'b-amber' : 'b-gray'}`}>
                        {m.isCompleted ? 'Done' : m.isCurrent ? 'In progress' : 'Upcoming'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {tab === 'Bank Approvals' ? (
            <div className="acard">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {banks.length === 0 ? (
                  <span style={{ color: 'var(--mu)' }}>No bank approvals listed</span>
                ) : (
                  banks.map((b) => (
                    <span key={b} className="bdg b-teal">
                      {b}
                    </span>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {tab === 'Enquiries' ? (
            <div className="acard" style={{ padding: 0, overflow: 'auto' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700 }}>Recent enquiries</span>
                <Link href="/enquiries" className="btn btn-ghost btn-sm">
                  View all {project.enquiryCount ?? 0} →
                </Link>
              </div>
              <table className="atbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Interested in</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--mu)', padding: 24 }}>
                      Enquiry details are managed in CRM · {project.enquiryCount ?? 0} total for this project
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : null}

          {tab === 'Media' ? (
            <div className="acard">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                <div className="infra-row">
                  <span>Hero image</span>
                  <span className={`bdg ${project.heroImageUrl ? 'b-teal' : 'b-amber'}`}>{project.heroImageUrl ? 'Uploaded' : 'Missing'}</span>
                </div>
                <div className="infra-row">
                  <span>Photos</span>
                  <span className={`bdg ${project.heroImageUrl ? 'b-teal' : 'b-gray'}`}>{project.heroImageUrl ? '1+' : '0'} uploaded</span>
                </div>
                <div className="infra-row">
                  <span>Brochure PDF</span>
                  <span className={`bdg ${project.legal?.brochureUrl ? 'b-teal' : 'b-amber'}`}>{project.legal?.brochureUrl ? 'Uploaded' : 'Missing'}</span>
                </div>
                <div className="infra-row">
                  <span>Floor plans</span>
                  <span className="bdg b-amber">{configs.filter((c) => c.type).length} configs</span>
                </div>
              </div>
            </div>
          ) : null}

          {tab === 'Legal' ? (
            <div className="acard">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="infra-row">
                  <span>RERA number</span>
                  <span style={{ fontWeight: 600 }}>{project.reraNumber || '—'}</span>
                </div>
                {Object.entries(project.legal ?? {}).map(([k, v]) => (
                  <div key={k} className="infra-row">
                    <span>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                {!project.reraNumber && !Object.keys(project.legal ?? {}).length ? (
                  <p style={{ color: 'var(--mu)' }}>No legal documents on file</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="project-wizard-side">
          <div className="acard">
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>Quick actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Link href="/projects/new/step4" className="btn btn-blue btn-sm" style={{ justifyContent: 'center' }}>
                Update bank approvals
              </Link>
              <button type="button" className="btn btn-ghost btn-sm" style={{ justifyContent: 'center' }} onClick={() => setTab('Milestones')}>
                Update milestones
              </button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ justifyContent: 'center' }} onClick={() => toast('Preview on website')}>
                Preview on website
              </button>
            </div>
          </div>
          <div className="acard">
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>Amenities</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(project.amenities ?? []).length === 0 ? (
                <span style={{ fontSize: 12, color: 'var(--mu)' }}>None listed</span>
              ) : (
                project.amenities!.map((a) => (
                  <span key={a} className="chip">
                    {a}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
