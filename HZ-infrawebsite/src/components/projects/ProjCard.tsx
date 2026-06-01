'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { clsx } from 'clsx';
import { Heart, MapPin, MessageCircle } from 'lucide-react';
import type { InfraProject } from '@/types/infra.types';
import { resolveCmsAssetUrl } from '@/lib/cmsAssetUrl';
import { useSaveProject } from '@/hooks/useSaveProject';
import {
  projectLocation,
  projectPriceRange,
  projectSlug,
  projectStartingPrice,
  projectStatusClass,
  projectStatusLabel,
  projectTypeBg,
  projectTypeColor,
  projectTypeKey,
  projectTypeLabel,
} from '@/lib/projects/utils';

type Props = {
  project: InfraProject;
  mini?: boolean;
  onEnquire?: (p: InfraProject) => void;
};

export function ProjCard({ project, mini = false, onEnquire }: Props) {
  const router = useRouter();
  const slug = projectSlug(project);
  const typeKey = projectTypeKey(project);
  const typeColor = projectTypeColor(project);
  const typeLabel = projectTypeLabel(project);
  const loc = projectLocation(project);
  const statusCls = projectStatusClass(project.status);
  const statusLabel = projectStatusLabel(project.status);
  const bg = projectTypeBg(project);
  const img = project.heroImageUrl ? resolveCmsAssetUrl(project.heroImageUrl, '') : '';
  const units = project.unitsLabel || (project.totalUnits ? `${project.totalUnits} units` : '');
  const config = project.configLabel || '';
  const banks = project.bankCount ?? project.approvedBanks?.length ?? 0;

  const { saved, toggle: toggleSave } = useSaveProject({
    projectId: project.projectId,
    slug,
    name: project.name,
    city: project.city,
    locality: project.locality,
  });

  const handleEnquire = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEnquire) onEnquire(project);
  };

  const goToProject = () => {
    void router.push(`/projects/${slug}`);
  };

  const imageBlock = img ? (
    <>
      <Image src={img} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 25vw" unoptimized={img.includes('127.0.0.1') || img.includes('localhost')} />
      {!mini ? <div className="absolute inset-0 bg-gradient-to-t from-[#0f2a44]/50 to-transparent" /> : null}
    </>
  ) : (
    <div className="proj-img-ph flex h-full w-full items-center justify-center" style={{ background: bg }}>
      {units ? (
        <div className="font-montserrat text-[11px] font-semibold text-black/35">{units}</div>
      ) : null}
    </div>
  );

  if (mini) {
    return (
      <div
        className="proj-card"
        role="link"
        tabIndex={0}
        onClick={goToProject}
        onKeyDown={(e) => {
          if (e.key === 'Enter') goToProject();
        }}
      >
        <div className="proj-img relative" style={{ height: 130 }}>
          {imageBlock}
        </div>
        <div className="proj-body" style={{ padding: '10px 12px' }}>
          <div className="proj-name truncate text-[13px]">{project.name}</div>
          <div className="mb-1.5 font-inter text-[11px] text-muted">{loc}</div>
          <div className="flex items-center justify-between">
            <span className="font-montserrat text-[13px] font-extrabold text-charcoal">{projectStartingPrice(project)}</span>
            <span className={`infra-proj-badge ${statusCls}`}>{statusLabel}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {project.reraVerified ? <span className="infra-proj-badge b-teal">RERA ✓</span> : null}
            {banks > 0 ? <span className="infra-proj-badge b-green">{banks} banks</span> : null}
          </div>
        </div>
      </div>
    );
  }

  const priceParts = projectPriceRange(project).split(' – ');

  return (
    <div
      className="proj-card"
      role="link"
      tabIndex={0}
      onClick={goToProject}
      onKeyDown={(e) => {
        if (e.key === 'Enter') goToProject();
      }}
    >
      <div className="proj-img relative">
        {imageBlock}
        <button
          type="button"
          className="proj-save"
          onClick={toggleSave}
          aria-label={saved ? 'Remove from saved projects' : 'Save project'}
          aria-pressed={saved}
        >
          <Heart
            size={13}
            strokeWidth={1.8}
            className={clsx(saved ? 'fill-[#f2994a] text-[#f2994a]' : 'text-muted')}
          />
        </button>
        <div className="proj-badge-row">
          <span className={`infra-proj-badge ${statusCls}`}>{statusLabel}</span>
          {project.reraVerified ? <span className="infra-proj-badge b-teal">RERA ✓</span> : null}
        </div>
      </div>
      <div className="proj-body">
        <div className="proj-label" style={{ color: typeColor }}>
          {typeLabel} · {project.developerName || 'Developer'}
        </div>
        <div className="proj-name">{project.name}</div>
        <div className="proj-loc">
          <MapPin size={11} strokeWidth={1.8} />
          {loc}
        </div>
        <div className="proj-stats">
          <div>
            <div className="proj-stat-label">
              {typeKey === 'apartment' || typeKey === 'villa' ? 'Configuration' : 'Plot sizes'}
            </div>
            <div className="proj-stat-val">{config || '—'}</div>
          </div>
          <div>
            <div className="proj-stat-label">
              {typeKey === 'apartment' || typeKey === 'villa' ? 'Total units' : 'Total plots'}
            </div>
            <div className="proj-stat-val">{units || '—'}</div>
          </div>
        </div>
        <div className="proj-price">
          {priceParts[0]}
          {priceParts[1] ? <span className="text-sm font-bold"> – {priceParts[1]}</span> : null}
        </div>
        <div className="proj-chips">
          {banks > 0 ? <span className="infra-proj-chip">{banks} banks</span> : null}
          {project.reraVerified ? (
            <span className="infra-proj-chip border-[#99f6e4] text-hz-teal">RERA ✓</span>
          ) : null}
        </div>
        <button type="button" className="proj-enquire" onClick={handleEnquire}>
          <MessageCircle size={13} strokeWidth={1.8} />
          Enquire now
        </button>
      </div>
    </div>
  );
}
