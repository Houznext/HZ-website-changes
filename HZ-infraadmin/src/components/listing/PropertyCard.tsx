'use client';

import type { ListingDraft } from '@/context/ListingFormContext';
import { formatPrice } from '@/lib/utils';
import { getPropertyGradient } from '@/lib/utils';
import { MapPin, Home } from 'lucide-react';

const ic = { size: 48, strokeWidth: 1, fill: 'none' as const, color: 'rgba(47,128,237,0.18)' as const };

export function PropertyCard({ form }: { form: ListingDraft }) {
  const title = String(form.title || 'Property title');
  const type = String(form.propertyType || 'Apartment');
  const city = String(form.city || 'City');
  const locality = String(form.locality || 'Locality');
  const price = formatPrice(Number(form.basePrice) || undefined);
  const grad = getPropertyGradient(type);
  const hl = (form.highlights as string[] | undefined)?.filter(Boolean) ?? [];
  const chips = hl.length ? hl.slice(0, 4) : ['3BHK', 'Pool', 'RERA'];

  return (
    <div className="prev-card">
      <div className="prev-img" style={{ background: grad }}>
        <Home width={48} height={48} strokeWidth={1} color="rgba(47,128,237,0.18)" />
        <span className="bdg b-teal" style={{ position: 'absolute', bottom: 10, left: 10 }}>
          {String(form.constructionStatus || 'Ready to Move')}
        </span>
      </div>
      <div className="prev-body">
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--mu)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Montserrat, sans-serif' }}>
          {type}
        </div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--ch)', lineHeight: 1.3, marginTop: 4 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--mu)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <MapPin size={12} strokeWidth={1.8} color="currentColor" />
          {locality}, {city}
        </div>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 17, fontWeight: 800, color: 'var(--ch)', marginTop: 8 }}>{price}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {chips.map((t) => (
            <span key={t} style={{ fontSize: 9.5, padding: '2px 8px', borderRadius: 20, background: 'var(--off)', color: 'var(--mu)', border: '0.5px solid var(--brd)', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
