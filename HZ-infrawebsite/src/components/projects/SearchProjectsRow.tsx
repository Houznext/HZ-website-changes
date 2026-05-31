'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import api from '@/lib/axios';
import type { InfraProject } from '@/types/infra.types';
import { TYPE_LABELS } from '@/lib/projects/constants';
import { mapPropertyTypeToProjectType, projectTypeKey } from '@/lib/projects/utils';
import { ProjCard } from '@/components/projects/ProjCard';

type Props = {
  propertyType?: string;
  city?: string;
};

export function SearchProjectsRow({ propertyType, city }: Props) {
  const [items, setItems] = useState<InfraProject[]>([]);

  const mappedType = mapPropertyTypeToProjectType(propertyType);

  useEffect(() => {
    void (async () => {
      try {
        const params: Record<string, string | number> = { limit: 6 };
        if (mappedType) params.type = mappedType;
        if (city) params.city = city;
        const res = await api.get<InfraProject[]>('/projects', { params });
        setItems(Array.isArray(res.data) ? res.data : []);
      } catch {
        setItems([]);
      }
    })();
  }, [mappedType, city]);

  const shown = useMemo(() => {
    let list = items;
    if (mappedType) list = list.filter((p) => projectTypeKey(p) === mappedType);
    return list.slice(0, 3);
  }, [items, mappedType]);

  if (shown.length === 0) return null;

  const typeLabel = mappedType ? TYPE_LABELS[mappedType] : 'Project';
  const title = `${shown.length}${items.length > shown.length ? '+' : ''} ${typeLabel}${shown.length > 1 ? 's' : ''} nearby`;

  return (
    <div className="search-proj-row">
      <div className="search-proj-header mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-hz-blue">
            <Building2 size={14} strokeWidth={1.8} className="text-white" />
          </div>
          <div>
            <div className="font-montserrat text-[13px] font-bold text-charcoal">{title}</div>
            <div className="font-inter text-[11.5px] text-muted">
              RERA-registered projects with multiple units available
            </div>
          </div>
        </div>
        <Link
          href={mappedType ? `/projects?type=${mappedType}` : '/projects'}
          className="inline-flex min-h-[40px] items-center justify-center rounded-lg border-[1.5px] border-[#dde8f5] bg-white px-3 py-2 font-montserrat text-[12px] font-bold text-charcoal hover:border-hz-blue hover:text-hz-blue"
        >
          View all projects →
        </Link>
      </div>
      <div id="search-proj-mini">
        {shown.map((p) => (
          <ProjCard key={p.projectId} project={p} mini />
        ))}
      </div>
    </div>
  );
}
