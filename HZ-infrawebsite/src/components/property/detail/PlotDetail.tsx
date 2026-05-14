import type { ReactNode } from 'react';
import type { PublicProperty } from '@/types/property.types';
import { formatPriceInr, formatPSF, num } from '@/lib/property-utils';
import { DocumentRow, KeyStatsBar } from './pdp-blocks';

export function PlotDetail({ property }: { property: PublicProperty }) {
  const area = property.plotArea;
  const unit = property.areaUnit || 'sqyd';

  return (
    <>
      <KeyStatsBar
        cells={[
          {
            label: 'Base price',
            value: formatPriceInr(property.basePrice),
            sub: formatPSF(property.basePrice, area, 'sqyd'),
          },
          { label: 'Plot area', value: area ? num(area).toLocaleString('en-IN') : '—', sub: unit },
          { label: 'Approval', value: property.approvalType || '—', sub: property.approvalNumber || '' },
          {
            label: 'Status',
            value: property.isReadyToRegister ? 'Ready' : 'Pending',
            sub: 'to register',
          },
        ]}
      />
      {property.description && (
        <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
          <div className="font-montserrat text-sm font-bold text-charcoal">About this plot</div>
          <p className="mt-2 font-inter text-sm leading-relaxed text-muted">{property.description}</p>
        </div>
      )}
      <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
        <div className="font-montserrat text-sm font-bold text-charcoal">Plot details</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <Cell label="Plot area" value={area ? `${num(area).toLocaleString('en-IN')} ${unit}` : '—'} />
          <Cell label="Plot number" value={property.plotNumber || '—'} />
          <Cell label="Layout name" value={property.layoutName || '—'} />
          <Cell label="Approval type" value={property.approvalType || '—'} />
          <Cell label="Approval no." value={property.approvalNumber || '—'} />
          <Cell label="Road width" value={property.roadWidth ? `${property.roadWidth} ft` : '—'} />
          <Cell label="Facing" value={property.facing || '—'} />
          <Cell label="Possession" value={property.possessionDate || 'Immediate'} />
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-[#dde8f5] bg-white p-5">
        <div className="font-montserrat text-sm font-bold text-charcoal">Features</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {property.isGatedLayout && <Feat>Gated layout</Feat>}
          {property.isCornerPlot && <Feat>Corner plot</Feat>}
          {property.hasCompoundWall && <Feat>Compound wall</Feat>}
          {property.isReadyToRegister && <Feat>Ready to register</Feat>}
          {property.hasEBConnection && <Feat>EB connection</Feat>}
          {property.hasBorewell && <Feat>Borewell</Feat>}
          {property.hasDrainage && <Feat>Drainage</Feat>}
        </div>
        <DocumentRow url={property.ecCertUrl} label="EC / Title certificate" />
        <DocumentRow url={property.reraCertUrl} label="RERA certificate" sub={property.reraNumber || undefined} />
      </div>
    </>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-inter text-[11px] font-medium text-muted">{label}</div>
      <div className="font-inter text-sm font-semibold text-charcoal">{value}</div>
    </div>
  );
}

function Feat({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-[#0d9488]/30 bg-[#ccfbf1] px-2 py-1 font-inter text-xs font-semibold text-[#0f766e]">
      {children}
    </span>
  );
}
