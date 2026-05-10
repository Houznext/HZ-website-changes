import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { InfraProperty } from '@/types/infra.types';
import { formatPrice } from '@/lib/format';

type Props = { property: InfraProperty };

export function PropertyCard({ property }: Props) {
  const img = property.media?.[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80';
  const slug = property.slug || property.propertyId;
  return (
    <Link
      href={`/property/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-hzwhite transition hover:-translate-y-1 hover:border-hz-blue/40 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-hz-blue-light">
        <Image src={img} alt="" fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="font-montserrat text-[10px] font-bold uppercase tracking-wide text-muted">
          {property.propertyType}
        </div>
        <div className="font-montserrat text-[15px] font-bold leading-snug text-charcoal line-clamp-2">{property.title}</div>
        <div className="mt-1 flex items-center gap-1 font-inter text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {property.locality || property.city || 'India'}
        </div>
        <div className="mt-3 font-montserrat text-xl font-extrabold text-charcoal">{formatPrice(property.basePrice)}</div>
      </div>
    </Link>
  );
}
