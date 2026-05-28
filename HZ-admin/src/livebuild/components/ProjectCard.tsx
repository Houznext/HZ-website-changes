import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from './Badge';
import { ProgressRing } from './ProgressRing';
import { LB_PROGRESS_METHOD_LABEL, LB_STATUS_HEADER_BG } from '../lib/constants';
import type { LbProjectSummary } from '../lib/types';

type Props = {
  project: LbProjectSummary;
  onClick: () => void;
  onDpr?: () => void;
  onDelete?: () => void;
  index?: number;
};

function statusBadge(status: string) {
  const s = status?.toLowerCase?.() ?? '';
  if (s.includes('hold')) {
    return (
      <span className="lb-bdg lb-bdg-amber" style={{ fontSize: 8.5 }}>
        On Hold
      </span>
    );
  }
  if (s.includes('complete')) {
    return (
      <span className="lb-bdg lb-bdg-tl" style={{ fontSize: 8.5 }}>
        ✓ Completed
      </span>
    );
  }
  return (
    <span
      className="lb-bdg"
      style={{ background: 'rgba(47,128,237,.25)', color: '#93c5fd', fontSize: 8.5 }}
    >
      ● In Progress
    </span>
  );
}

function headerBg(status: string) {
  const s = status?.toLowerCase?.() ?? '';
  if (s.includes('hold')) return LB_STATUS_HEADER_BG.on_hold;
  if (s.includes('complete')) return LB_STATUS_HEADER_BG.completed;
  if (s.includes('cancel')) return LB_STATUS_HEADER_BG.cancelled;
  return LB_STATUS_HEADER_BG.in_progress;
}

export function ProjectCard({ project, onClick, onDpr, onDelete, index = 0 }: Props) {
  const method = project.progressMethod ?? 'hybrid';
  const methodLabel = LB_PROGRESS_METHOD_LABEL[method] ?? method;

  return (
    <div
      className="lb-proj-card lb-proj-card-item"
      style={{ animationDelay: `${index * 0.07}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="lb-proj-card-header" style={{ background: headerBg(project.status) }}>
        <ProgressRing pct={project.progressPct} size={82} strokeWidth={6} light />
        <div className="lb-proj-card-header-tl">{statusBadge(project.status)}</div>
        <div className="lb-proj-card-header-tr">
          <span
            className="lb-bdg"
            style={{
              background: 'rgba(255,255,255,.1)',
              color: 'rgba(255,255,255,.65)',
              fontSize: 8,
            }}
          >
            {methodLabel}
          </span>
        </div>
        <div className="lb-proj-card-progress-bar">
          <div style={{ width: `${project.progressPct}%` }} />
        </div>
      </div>
      <div className="lb-proj-card-body">
        <div className="lb-proj-card-title">{project.name}</div>
        <div className="lb-proj-card-customer">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {project.customerName}
        </div>
        <div className="lb-g2" style={{ gap: 8, marginBottom: 12 }}>
          <div className="lb-mini-stat">
            <div className="lb-mini-stat-lbl">Phase</div>
            <div className="lb-mini-stat-val">{project.phase ?? '—'}</div>
          </div>
          <div className="lb-mini-stat">
            <div className="lb-mini-stat-lbl">Day</div>
            <div className="lb-mini-stat-val">{project.days ?? '—'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {onDpr ? (
            <button
              type="button"
              className="lb-btn lb-btn-sm"
              style={{
                background: 'linear-gradient(135deg, var(--lb-accent), #e8751a)',
                color: '#fff',
                fontWeight: 800,
                flex: 1,
                justifyContent: 'center',
                fontSize: 12,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDpr();
              }}
            >
              DPR
            </button>
          ) : null}
          <button
            type="button"
            className="lb-btn lb-btn-ghost lb-btn-sm"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Pencil size={11} strokeWidth={1.8} />
            Edit
          </button>
          {onDelete ? (
            <button
              type="button"
              className="lb-btn lb-btn-ghost lb-btn-sm"
              style={{ justifyContent: 'center', color: 'var(--lb-rd)' }}
              aria-label="Delete project"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={11} strokeWidth={1.8} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
