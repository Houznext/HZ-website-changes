'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Building2, Heart, MapPin } from 'lucide-react';
import { clsx } from 'clsx';
import type { PublicProperty } from '@/types/property.types';
import { resolveCmsAssetUrl } from '@/lib/cmsAssetUrl';
import {
  formatPriceInr,
  formatPSF,
  getPropertyGradient,
  propertyImageUrls,
} from '@/lib/property-utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useSaveProperty } from '@/hooks/useSaveProperty';

function plpChips(property: PublicProperty): string[] {
  const chips: string[] = [];
  if (property.bhkType) chips.push(property.bhkType);
  if (property.facing) chips.push(property.facing);
  (property.highlights || []).slice(0, 3).forEach((h) => chips.push(h));
  if (property.isReraVerified) chips.push('RERA');
  return chips.slice(0, 5);
}

function configLine(property: PublicProperty): string {
  const parts: string[] = [];
  if (property.bhkType) parts.push(property.bhkType);
  const area = property.carpetArea || property.builtUpArea || property.plotArea || property.landArea;
  if (area) parts.push(`${Number(area).toLocaleString('en-IN')} ${property.areaUnit || 'sqft'}`);
  return parts.join(' · ') || property.propertyType;
}

export function PlpPropertyCard({ property }: { property: PublicProperty }) {
  const slug = property.slug || property.propertyId;
  const href = `/property/${slug}`;
  const rawImg = propertyImageUrls(property)[0];
  const img = rawImg ? resolveCmsAssetUrl(rawImg, '') : '';
  const psf = formatPSF(property.basePrice, property.carpetArea || property.builtUpArea, property.areaUnit || 'sqft');
  const chips = plpChips(property);
  const { saved, toggle: toggleSave } = useSaveProperty({
    propertyId: property.propertyId,
    slug: String(slug),
  });

  return (
    <article className="plp-card group flex flex-col overflow-hidden rounded-[14px] border border-[#dde8f5] bg-white transition-all duration-200 hover:border-[#93c5fd] hover:shadow-[0_16px_48px_rgba(15,42,68,0.10)] sm:flex-row">
      <Link href={href} className="relative w-full shrink-0 sm:w-[220px]">
        <div
          className="relative flex min-h-[160px] items-center justify-center overflow-hidden sm:min-h-[140px] sm:rounded-l-[13px]"
          style={!img ? { background: getPropertyGradient(property.propertyType) } : undefined}
        >
          {img ? (
            <Image
              src={img}
              alt=""
              fill
              className="object-cover"
              sizes="220px"
              unoptimized={img.includes('127.0.0.1') || img.includes('localhost')}
            />
          ) : (
            <Building2 className="h-9 w-9 text-[#0f2a44]/20" strokeWidth={1} />
          )}
          <div className="pointer-events-none absolute bottom-2.5 left-2.5">
            <StatusBadge status={property.constructionStatus} />
          </div>
          <button
            type="button"
            className="absolute right-2.5 top-2.5 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border-0 bg-white/90 shadow-sm"
            onClick={(e) => void toggleSave(e)}
            aria-label={saved ? 'Remove from saved' : 'Save property'}
          >
            <Heart
              className={clsx('h-3.5 w-3.5', saved ? 'fill-[#dc2626] text-[#dc2626]' : 'text-[#dc2626]')}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </Link>

      <Link href={href} className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
        <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
          {property.propertyType}
          {property.propertyCode ? ` · ${property.propertyCode}` : ''}
        </div>
        <h2 className="font-montserrat text-base font-bold leading-snug text-charcoal line-clamp-2">{property.title}</h2>
        <p className="mt-0.5 font-inter text-[11px] text-muted">{configLine(property)}</p>
        <div className="mt-1 flex items-center gap-1 font-inter text-xs text-muted">
          <MapPin className="h-3 w-3 shrink-0" strokeWidth={1.8} />
          <span className="truncate">
            {[property.locality, property.city].filter(Boolean).join(', ') || 'India'}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
          <span className="font-montserrat text-lg font-extrabold text-charcoal">{formatPriceInr(property.basePrice)}</span>
          {psf ? <span className="font-inter text-[11px] text-muted">{psf}</span> : null}
        </div>
        {chips.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-[#dde8f5] bg-offwhite px-2 py-0.5 font-montserrat text-[10px] font-semibold text-muted"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </Link>

      <div className="flex shrink-0 flex-row gap-2 border-t border-[#dde8f5] p-3 sm:w-[130px] sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:p-3.5">
        <Link
          href={href}
          className="flex flex-1 items-center justify-center rounded-lg bg-[#2f80ed] px-4 py-2.5 text-center font-montserrat text-xs font-bold text-white transition hover:bg-[#1a6dd6] sm:flex-none"
        >
          Enquire now
        </Link>
        <Link
          href={`${href}#enquire`}
          className="flex flex-1 items-center justify-center rounded-lg border border-[#dde8f5] bg-white px-4 py-2.5 text-center font-montserrat text-xs font-bold text-charcoal transition hover:border-[#2f80ed] hover:bg-[#e8f1fd] sm:flex-none"
        >
          Site visit
        </Link>
      </div>
    </article>
  );
}
