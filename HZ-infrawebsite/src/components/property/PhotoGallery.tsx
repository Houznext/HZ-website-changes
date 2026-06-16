'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import type { ConstructionStatus } from '@/types/property.types';
import { getPropertyGradient } from '@/lib/property-utils';
import { Building2 } from 'lucide-react';

export type GalleryBadge = { label: string; variant: 'teal' | 'amber' | 'blue' | 'navy' };

const badgeCls: Record<GalleryBadge['variant'], string> = {
  teal: 'bg-[#ccfbf1] text-[#0f766e]',
  amber: 'bg-[#fef3c7] text-[#92400e]',
  blue: 'bg-[#e8f1fd] text-[#1e40af]',
  navy: 'bg-[#0f2a44] text-white',
};

type Props = {
  photos: string[];
  propertyType: string;
  title: string;
  constructionStatus: ConstructionStatus | string;
  badges: GalleryBadge[];
  floorPlanUrl?: string | null;
};

export function PhotoGallery({ photos, propertyType, title, constructionStatus, badges, floorPlanUrl }: Props) {
  const list = useMemo(() => (photos.length ? photos : []), [photos]);
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const main = list[active] || null;

  const openLightbox = (idx: number) => {
    if (!list.length) return;
    setActive(idx);
    setLightboxOpen(true);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-2">
        <StatusBadge status={constructionStatus} propertyType={propertyType} />
        {badges.map((b) => (
          <span
            key={b.label}
            className={clsx(
              'rounded-md px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide',
              badgeCls[b.variant],
            )}
          >
            {b.label}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex gap-2">
        {floorPlanUrl && (
          <a
            href={floorPlanUrl}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto flex h-9 items-center gap-1.5 rounded-full border border-[#dde8f5] bg-white/95 px-3 font-montserrat text-[11px] font-bold text-charcoal shadow-sm transition hover:border-[#2f80ed]"
            aria-label="Open floor plan"
          >
            <FileText className="h-4 w-4" strokeWidth={1.8} />
            Plan
          </a>
        )}
      </div>

      <button
        type="button"
        className={clsx(
          'relative block h-[240px] w-full overflow-hidden rounded-xl border border-[#dde8f5] sm:h-[300px] md:h-[360px]',
          main && 'cursor-zoom-in',
        )}
        style={!main ? { background: getPropertyGradient(propertyType) } : undefined}
        onClick={() => main && openLightbox(active)}
        aria-label={main ? 'Open image gallery' : undefined}
        disabled={!main}
      >
        {main ? (
          <Image src={main} alt={title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 66vw" priority />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-20 w-20 text-charcoal/20" strokeWidth={1.8} />
          </div>
        )}
      </button>

      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => openLightbox(i)}
              className={clsx(
                'relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border transition',
                i === active ? 'border-[#2f80ed] ring-2 ring-[rgba(47,128,237,0.25)]' : 'border-[#dde8f5] hover:border-[#93c5fd]',
              )}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}

      <ImageLightbox
        images={list}
        index={active}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setActive}
        alt={title}
      />
    </div>
  );
}
