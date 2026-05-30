'use client';

import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import type { PublicProperty } from '@/types/property.types';
import { formatPriceInr, getPropertyGradient } from '@/lib/property-utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { isPropertySaved, toggleSavedProperty } from '@/lib/propertyListsLocal';

type Props = { property: PublicProperty; variant?: 'vertical' | 'horizontal' };

export function PropertyCard({ property, variant = 'vertical' }: Props) {
  const slug = property.slug || property.propertyId;
  const href = `/property/${slug}`;
  const img = property.coverImageUrl || property.media?.[0]?.url || property.photoUrls?.[0];
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (slug) setSaved(isPropertySaved(String(slug)));
  }, [slug]);

  const onSave = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!slug) return;
    setSaved(
      toggleSavedProperty({
        slug: String(slug),
        title: property.title,
        city: property.city,
        locality: property.locality,
        propertyId: property.propertyId,
      }),
    );
  };

  if (variant === 'horizontal') {
    return (
      <Link
        href={href}
        className="group flex flex-col overflow-hidden rounded-2xl border border-[#dde8f5] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_16px_48px_rgba(15,42,68,0.10)] sm:flex-row"
      >
        <div
          className="relative w-full shrink-0 sm:w-[220px]"
          style={!img ? { background: getPropertyGradient(property.propertyType) } : undefined}
        >
          {img ? (
            <div className="relative h-[180px] w-full sm:h-full sm:min-h-[140px]">
              <Image src={img} alt="" fill className="object-cover" sizes="(max-width:640px) 100vw, 220px" />
            </div>
          ) : (
            <div className="h-[180px] w-full sm:h-full sm:min-h-[140px]" />
          )}
          <div className="pointer-events-none absolute bottom-2 left-2">
            <StatusBadge status={property.constructionStatus} />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
            {property.propertyType}
            {property.propertyCode ? ` · ${property.propertyCode}` : ''}
          </div>
          <div className="font-montserrat text-base font-bold leading-snug text-charcoal line-clamp-2">{property.title}</div>
          <div className="mt-1 flex items-center gap-1 font-inter text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
            <span className="truncate">{property.locality || property.city || 'India'}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(property.highlights || []).slice(0, 4).map((h) => (
              <span key={h} className="rounded border border-[#0d9488]/25 bg-[#ccfbf1] px-1.5 py-0.5 font-inter text-[10px] font-semibold text-[#0f766e]">
                {h}
              </span>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-3 pt-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="font-montserrat text-lg font-extrabold text-charcoal">{formatPriceInr(property.basePrice)}</div>
            <div className="flex w-full gap-2 sm:w-auto sm:shrink-0 sm:flex-col">
              <span className="flex-1 rounded-lg border border-[#2f80ed] bg-[#2f80ed] px-3 py-2 text-center font-montserrat text-xs font-bold text-white sm:flex-none sm:py-1.5">
                Enquire now
              </span>
              <span className="flex-1 rounded-lg border border-[#dde8f5] px-3 py-2 text-center font-montserrat text-xs font-bold text-charcoal sm:flex-none sm:py-1.5">
                Site visit
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={href}
        className="relative flex flex-col overflow-hidden rounded-2xl border border-[#dde8f5] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_16px_48px_rgba(15,42,68,0.10)]"
      >
        <div className="relative h-[190px] w-full overflow-hidden">
          {img ? (
            <Image src={img} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
          ) : (
            <div className="h-full w-full" style={{ background: getPropertyGradient(property.propertyType) }} />
          )}
          <div className="pointer-events-none absolute bottom-2 left-2">
            <StatusBadge status={property.constructionStatus} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
            {property.propertyType}
            {property.propertyCode ? ` · ${property.propertyCode}` : ''}
          </div>
          <div className="font-montserrat text-[15px] font-bold leading-snug text-charcoal line-clamp-2">{property.title}</div>
          <div className="mt-1 flex items-center gap-1 font-inter text-xs text-muted">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.8} />
            {property.locality || property.city || 'India'}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {(property.highlights || []).slice(0, 4).map((h) => (
              <span
                key={h}
                className="rounded border border-[#0d9488]/25 bg-[#ccfbf1] px-1.5 py-0.5 font-inter text-[10px] font-semibold text-[#0f766e]"
              >
                {h}
              </span>
            ))}
          </div>
          <div className="mt-3 font-montserrat text-xl font-extrabold text-charcoal">{formatPriceInr(property.basePrice)}</div>
          <span className="mt-3 block w-full rounded-lg bg-[#2f80ed] py-2.5 text-center font-montserrat text-sm font-bold text-white transition duration-150 hover:bg-[#1a6dd6]">
            Enquire now
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={onSave}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/80 bg-white/90 text-charcoal opacity-0 shadow-sm transition duration-150 hover:opacity-100 group-hover:opacity-100"
        aria-label="Save property"
      >
        <Heart className={clsx('h-4 w-4', saved && 'fill-current text-[#f2994a]')} strokeWidth={1.8} />
      </button>
    </div>
  );
}
