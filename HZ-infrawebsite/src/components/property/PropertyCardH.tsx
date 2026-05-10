import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { InfraProperty } from '@/types/infra.types';
import { formatPrice } from '@/lib/format';

export function PropertyCardH({ property }: { property: InfraProperty }) {
  const img = property.media?.[0]?.url || 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80';
  const slug = property.slug || property.propertyId;
  return (
    <Link
      href={`/property/${slug}`}
      className="flex overflow-hidden rounded-2xl border border-border bg-hzwhite transition hover:border-hz-blue/40 hover:shadow-lg"
    >
      <div className="relative w-40 shrink-0 bg-hz-blue-light sm:w-52">
        <Image src={img} alt="" fill className="object-cover" sizes="200px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <div className="font-montserrat text-[10px] font-bold uppercase text-muted">{property.propertyType}</div>
        <div className="font-montserrat text-base font-bold text-charcoal line-clamp-2">{property.title}</div>
        <div className="mt-1 flex items-center gap-1 font-inter text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {property.locality || property.city}
        </div>
        <div className="mt-auto font-montserrat text-lg font-extrabold text-charcoal">{formatPrice(property.basePrice)}</div>
      </div>
    </Link>
  );
}
