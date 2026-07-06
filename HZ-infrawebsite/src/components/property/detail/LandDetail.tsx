import type { ReactNode } from 'react';
import type { PublicProperty } from '@/types/property.types';
import { formatArea, formatPriceInr, formatPSF, num } from '@/lib/property-utils';
import { DocumentRow, KeyStatsBar } from './pdp-blocks';
import { PropertyInsights } from './PropertyInsights';

export function LandDetail({ property }: { property: PublicProperty }) {
  const area = property.landArea || property.plotArea;
  const unit = property.areaUnit || 'sqyd';

  return (
    <>
      <KeyStatsBar
        cells={[
          {
            label: 'Base price',
            value: formatPriceInr(property.basePrice),
            sub: formatPSF(property.basePrice, area, unit === 'sqft' ? 'sqft' : 'sqyd'),
          },
          { label: 'Land area', value: area ? num(area).toLocaleString('en-IN') : '—', sub: unit },
          { label: 'Approval', value: property.approvalAuthority || property.approvalType || '—', sub: 'Authority' },
          { label: 'Facing', value: property.facing || '—', sub: property.roadWidth ? `Road: ${property.roadWidth} ft` : '' },
        ]}
      />
      {property.description && (
        <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
          <div className="font-montserrat text-sm font-bold text-charcoal">About this land</div>
          <p className="mt-2 font-inter text-sm leading-relaxed text-muted">{property.description}</p>
        </div>
      )}
      <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
        <div className="font-montserrat text-sm font-bold text-charcoal">Land details</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Detail label="Land area" value={formatArea(area, unit)} />
          <Detail label="Land use type" value={property.landUseType || '—'} />
          <Detail label="Approval authority" value={property.approvalAuthority || '—'} />
          <Detail label="Survey number" value={property.surveyNumber || '—'} />
          <Detail label="Layout name" value={property.layoutName || '—'} />
          <Detail label="Road width" value={property.roadWidth ? `${property.roadWidth} ft` : '—'} />
          <Detail label="Facing" value={property.facing || '—'} />
          <Detail label="Zone type" value={property.zoneType || '—'} />
          <Detail label="Water source" value={property.waterSource || '—'} />
          <Detail label="Electricity" value={property.electricity || '—'} />
        </div>
      </div>
      <PropertyInsights
        insights={property.insights}
        propertyType={property.propertyType}
        locality={property.locality || property.city || ''}
        city={property.city || ''}
        propertyId={property.propertyId}
      />
      <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
        <div className="font-montserrat text-sm font-bold text-charcoal">Verification</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {property.isEcVerified && <Badge>EC verified</Badge>}
          {property.isTitleClear && <Badge>Title clear</Badge>}
          {property.isPattaAvailable && <Badge>Patta available</Badge>}
          {property.isCornerPlot && <Badge>Corner plot</Badge>}
        </div>
        <DocumentRow url={property.ecCertUrl} label="EC certificate" />
        <DocumentRow url={property.reraCertUrl} label="RERA certificate" sub={property.reraNumber || undefined} />
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-inter text-[11px] font-medium text-muted">{label}</div>
      <div className="font-inter text-sm font-semibold text-charcoal">{value}</div>
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-[#ccfbf1] px-2 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wide text-[#0f766e]">
      {children}
    </span>
  );
}
