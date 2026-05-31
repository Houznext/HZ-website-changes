'use client';

import { TYPE_BGS, TYPE_COLORS, TYPE_ICONS, TYPE_LABELS, STATUS_CLASS, STATUS_LABELS, type ProjectTypeKey } from '@/lib/projects/constants';

export function ProjectTypeBadge({ type }: { type: ProjectTypeKey }) {
  return (
    <span className="bdg" style={{ background: TYPE_BGS[type], color: TYPE_COLORS[type] }}>
      {TYPE_ICONS[type]} {TYPE_LABELS[type]}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: string }) {
  const cls = STATUS_CLASS[status] || 'b-gray';
  const label = STATUS_LABELS[status] || status;
  return <span className={`bdg ${cls}`}>{label}</span>;
}

export function PublishedBadge({ published, visibility }: { published: boolean; visibility?: string | null }) {
  if (visibility === 'archived') return <span className="bdg b-gray">Archived</span>;
  if (!published) return <span className="bdg b-amber">Draft</span>;
  return <span className="bdg b-green">Active</span>;
}
