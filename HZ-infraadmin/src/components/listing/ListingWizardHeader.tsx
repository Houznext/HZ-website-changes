'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type Props = {
  backHref: string;
  centerTitle: React.ReactNode;
  onSaveDraft?: () => void;
  primaryLabel: string;
  onPrimary: () => void;
};

const ic = { size: 15 as const, strokeWidth: 1.8, fill: 'none' as const };

export function ListingWizardHeader({ backHref, centerTitle, onSaveDraft, primaryLabel, onPrimary }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', width: '100%' }}>
      <Link href={backHref} className="btn btn-ghost btn-sm" style={{ gap: 5 }}>
        <ChevronLeft {...ic} color="currentColor" />
        Back
      </Link>
      <div style={{ flex: 1, textAlign: 'center', minWidth: 160 }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--ch)' }}>{centerTitle}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onSaveDraft}>
          Save draft
        </button>
        <button type="button" className="btn btn-blue btn-sm" onClick={onPrimary}>
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
