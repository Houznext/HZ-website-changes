import type { PublicProperty } from '@/types/property.types';
import { formatPriceInr, formatPSF, num } from '@/lib/property-utils';
import { AmenitiesGrid, KeyStatsBar, LegalSection, PriceBreakdownCard } from './pdp-blocks';

export function GenericDetail({ property }: { property: PublicProperty }) {
  const ready = property.constructionStatus === 'Ready to Move';
  const floor =
    property.floorNumber != null && property.totalFloors != null
      ? `${property.floorNumber}/${property.totalFloors}`
      : property.floorNumber != null
        ? String(property.floorNumber)
        : '—';

  return (
    <>
      <KeyStatsBar
        cells={[
          {
            label: 'Price',
            value: formatPriceInr(property.basePrice),
            sub: formatPSF(property.basePrice, property.builtUpArea || property.carpetArea, 'sqft'),
          },
          {
            label: 'Built-up',
            value: property.builtUpArea ? num(property.builtUpArea).toLocaleString('en-IN') : '—',
            sub: 'sqft',
          },
          { label: 'Status', value: ready ? 'Ready' : property.constructionStatus, sub: '' },
          { label: 'Floor', value: floor, sub: property.facing || '' },
        ]}
      />
      {num(property.basePrice) > 0 && <PriceBreakdownCard property={property} />}
      {property.description && (
        <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
          <div className="font-montserrat text-sm font-bold text-charcoal">About this property</div>
          <p className="mt-2 font-inter text-sm leading-relaxed text-muted">{property.description}</p>
        </div>
      )}
      {property.amenities && property.amenities.length > 0 && <AmenitiesGrid amenities={property.amenities} />}
      <LegalSection property={property} />
    </>
  );
}
