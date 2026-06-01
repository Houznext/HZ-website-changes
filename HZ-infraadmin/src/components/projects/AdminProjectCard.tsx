'use client';

import Link from 'next/link';
import { Building2, MapPin, Shield, Trash2 } from 'lucide-react';
import type { ProjectRecord } from '@/lib/projects/types';
import { TYPE_ICONS, TYPE_LABELS, type ProjectTypeKey } from '@/lib/projects/constants';
import { formatDate, formatPrice } from '@/lib/utils';
import { priceRangeLabel } from '@/lib/projects/payload';
import { ProjectStatusBadge, ProjectTypeBadge } from './ProjectBadges';

const ic = { size: 12, strokeWidth: 1.8, fill: 'none' as const };

type Props = {
  project: ProjectRecord;
  onDelete?: (project: ProjectRecord) => void;
};

export function AdminProjectCard({ project, onDelete }: Props) {
  const type = (project.projectType || 'apartment') as ProjectTypeKey;
  const gradient = project.gradientBg || 'linear-gradient(135deg, #1a3d5c, #0f2a44)';

  return (
    <div className="admin-proj-card">
      <Link href={`/projects/${project.projectId}`} className="admin-proj-card-link">
      <div className="admin-proj-card-hd" style={{ background: gradient }}>
        <span className="admin-proj-type-pill">
          {TYPE_ICONS[type]} {TYPE_LABELS[type]}
        </span>
        <div className="admin-proj-card-actions">
          {project.reraVerified ? (
            <span className="bdg b-teal" style={{ backdropFilter: 'blur(4px)' }}>
              <Shield {...ic} color="currentColor" />
              RERA
            </span>
          ) : null}
          {!project.published ? <span className="bdg b-amber">Draft</span> : null}
        </div>
        <Building2 size={48} strokeWidth={0.8} color="rgba(255,255,255,0.12)" style={{ position: 'absolute', right: 16, bottom: 12 }} />
      </div>
      <div className="admin-proj-card-bd">
        <div className="admin-proj-ref">{project.refCode || project.projectId.slice(0, 8).toUpperCase()}</div>
        <div className="admin-proj-name">{project.name}</div>
        <div className="admin-proj-loc">
          <MapPin {...ic} color="var(--mu)" />
          {[project.locality, project.city].filter(Boolean).join(', ') || '—'}
        </div>
        <div className="admin-proj-meta">
          <div>
            <div className="admin-proj-meta-lbl">Developer</div>
            <div className="admin-proj-meta-val">{project.developerName || '—'}</div>
          </div>
          <div>
            <div className="admin-proj-meta-lbl">Units</div>
            <div className="admin-proj-meta-val">{project.unitsLabel || project.totalUnits || '—'}</div>
          </div>
        </div>
        <div className="admin-proj-chips">
          <ProjectTypeBadge type={type} />
          <ProjectStatusBadge status={project.status} />
        </div>
        <div className="admin-proj-foot">
          <div>
            <div className="admin-proj-price">{priceRangeLabel(project.minPrice, project.maxPrice, formatPrice)}</div>
            {project.pricePerUnitLabel ? <div className="admin-proj-psf">{project.pricePerUnitLabel}</div> : null}
          </div>
          <div className="admin-proj-stats">
            <span className="bdg b-blue">{project.enquiryCount ?? 0} enq</span>
            <span className="bdg b-teal">{project.bankCount ?? 0} banks</span>
          </div>
        </div>
        <div className="admin-proj-added">Added {formatDate(project.createdAt)}</div>
      </div>
      </Link>
      {onDelete ? (
        <div className="admin-proj-card-ft">
          <Link href={`/projects/${project.projectId}`} className="btn btn-ghost btn-xs">
            View
          </Link>
          <button type="button" className="btn btn-danger btn-xs" onClick={() => onDelete(project)}>
            <Trash2 size={12} strokeWidth={1.8} />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
