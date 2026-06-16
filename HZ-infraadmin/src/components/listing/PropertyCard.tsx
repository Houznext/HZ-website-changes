'use client';

import type { ListingDraft } from '@/context/ListingFormContext';
import { formatPrice } from '@/lib/utils';
import { getPropertyGradient } from '@/lib/utils';
import { needsConstructionStatus } from '@/lib/propertyListingHelpers';
import { MapPin, Home } from 'lucide-react';

export function PropertyCard({ form }: { form: ListingDraft }) {
  const title = String(form.title || 'Property title');
  const type = String(form.propertyType || 'Apartment');
  const city = String(form.city || 'City');
  const locality = String(form.locality || 'Locality');
  const price = formatPrice(Number(form.basePrice) || undefined);
  const grad = getPropertyGradient(type);
  const hl = (form.highlights as string[] | undefined)?.filter(Boolean) ?? [];
  const chips = hl.slice(0, 4);
  const showConstructionStatus = needsConstructionStatus(type);
  const photos = (form.photoUrls as string[]) ?? [];
  const cover = String(form.coverImageUrl ?? '').trim();
  const imageUrl = cover || photos[0] || '';

  return (
    <div className="prev-card">
      <div className="prev-img" style={{ background: imageUrl ? '#e2e8f0' : grad }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Home width={48} height={48} strokeWidth={1} color="rgba(47,128,237,0.18)" />
        )}
        {showConstructionStatus ? (
          <span className="bdg b-teal" style={{ position: 'absolute', bottom: 10, left: 10 }}>
            {String(form.constructionStatus || 'Ready to Move')}
          </span>
        ) : null}
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
        {chips.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {chips.map((t) => (
              <span key={t} style={{ fontSize: 9.5, padding: '2px 8px', borderRadius: 20, background: 'var(--off)', color: 'var(--mu)', border: '0.5px solid var(--brd)', fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
