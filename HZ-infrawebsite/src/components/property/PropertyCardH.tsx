import { PropertyCard } from '@/components/property/PropertyCard';
import type { PublicProperty } from '@/types/property.types';

export function PropertyCardH({ property }: { property: PublicProperty }) {
  return <PropertyCard property={property} variant="horizontal" />;
}
