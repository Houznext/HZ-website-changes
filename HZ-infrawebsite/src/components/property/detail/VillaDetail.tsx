import type { PublicProperty } from '@/types/property.types';
import { formatPriceInr, formatPSF, num, showsConstructionStatus } from '@/lib/property-utils';
import { AmenitiesGrid, KeyStatsBar, LegalSection, PriceBreakdownCard } from './pdp-blocks';

export function VillaDetail({ property }: { property: PublicProperty }) {
  const ready = property.constructionStatus === 'Ready to Move';
  const area = property.plotArea || property.carpetArea;
  const unit = property.areaUnit || 'sqyd';
  const showStatus = showsConstructionStatus(property.propertyType);

  return (
    <>
      <KeyStatsBar
        cells={[
          {
            label: 'Price',
            value: formatPriceInr(property.basePrice),
            sub: formatPSF(property.basePrice, area, unit === 'sqft' ? 'sqft' : 'sqyd'),
          },
          {
            label: 'Plot area',
            value: property.plotArea ? num(property.plotArea).toLocaleString('en-IN') : '—',
            sub: 'sqyds',
          },
          ...(showStatus
            ? [{ label: 'Status', value: ready ? 'Ready' : property.constructionStatus, sub: '' }]
            : [{ label: 'Facing', value: property.facing || '—', sub: property.furnishingStatus || '' }]),
          { label: 'BHK', value: property.bhkType || '—', sub: property.numberOfFloors || '' },
        ]}
      />
      {num(property.basePrice) > 0 && <PriceBreakdownCard property={property} />}
      {property.description && (
        <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
          <div className="font-montserrat text-sm font-bold text-charcoal">About this property</div>
          <p className="mt-2 font-inter text-sm leading-relaxed text-muted">{property.description}</p>
        </div>
      )}
      <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
        <div className="font-montserrat text-sm font-bold text-charcoal">Villa features</div>
        <ul className="mt-2 flex flex-wrap gap-2 font-inter text-xs text-charcoal">
          {property.isGatedCommunity && <li className="rounded-md bg-[#e8f1fd] px-2 py-1">Gated community</li>}
          {property.isVastuCompliant && <li className="rounded-md bg-[#e8f1fd] px-2 py-1">Vastu compliant</li>}
          {property.hasPrivatePool && <li className="rounded-md bg-[#e8f1fd] px-2 py-1">Private pool</li>}
          {property.hasGarden && <li className="rounded-md bg-[#e8f1fd] px-2 py-1">Garden</li>}
          {property.hasSmartHome && <li className="rounded-md bg-[#e8f1fd] px-2 py-1">Smart home</li>}
          {property.hasEVCharging && <li className="rounded-md bg-[#e8f1fd] px-2 py-1">EV charging</li>}
        </ul>
      </div>
      {property.amenities && property.amenities.length > 0 && <AmenitiesGrid amenities={property.amenities} />}
      <LegalSection property={property} />
    </>
  );
}
