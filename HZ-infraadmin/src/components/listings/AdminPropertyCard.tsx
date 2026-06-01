'use client';

import Link from 'next/link';
import { Building2, MapPin, Trash2 } from 'lucide-react';
import { resolveAssetUrl } from '@/lib/assetUrl';
import { formatDate, formatPrice, getPropertyGradient } from '@/lib/utils';

const ic = { size: 12, strokeWidth: 1.8, fill: 'none' as const };

export type AdminPropertyRow = {
  propertyId: string;
  propertyCode?: string | null;
  title: string;
  propertyType: string;
  city?: string | null;
  locality?: string | null;
  basePrice?: string | null;
  coverImageUrl?: string | null;
  photoUrls?: string[] | null;
  media?: { url: string }[] | null;
  isApproved: boolean;
  isActive: boolean;
  listedBy?: string;
  createdAt: string;
};

function propertyCoverUrl(p: AdminPropertyRow): string | null {
  const raw =
    p.coverImageUrl || p.photoUrls?.[0] || p.media?.find((m) => m.url)?.url || null;
  return resolveAssetUrl(raw);
}

type Props = {
  property: AdminPropertyRow;
  onDelete: (p: AdminPropertyRow) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
};

export function AdminPropertyCard({ property, onDelete, onApprove, onReject }: Props) {
  const grad = getPropertyGradient(property.propertyType);
  const cover = propertyCoverUrl(property);
  const code = property.propertyCode ?? property.propertyId.slice(0, 8).toUpperCase();

  const statusBadge = !property.isApproved ? (
    <span className="bdg b-amber">Pending</span>
  ) : property.isActive ? (
    <span className="bdg b-green">Active</span>
  ) : (
    <span className="bdg b-gray">Archived</span>
  );

  return (
    <div className="admin-proj-card admin-prop-card">
      <div
        className="admin-proj-card-hd"
        style={{
          background: cover ? undefined : grad,
          backgroundImage: cover ? `url(${cover})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <span className="admin-proj-type-pill">{property.propertyType}</span>
        <div className="admin-proj-card-actions">{statusBadge}</div>
        {!cover ? (
          <Building2 size={48} strokeWidth={0.8} color="rgba(15,42,68,0.12)" style={{ position: 'absolute', right: 16, bottom: 12 }} />
        ) : null}
      </div>
      <div className="admin-proj-card-bd">
        <div className="admin-proj-ref">#{code}</div>
        <div className="admin-proj-name">{property.title}</div>
        <div className="admin-proj-loc">
          <MapPin {...ic} color="var(--mu)" />
          {[property.locality, property.city].filter(Boolean).join(', ') || '—'}
        </div>
        <div className="admin-proj-foot">
          <div>
            <div className="admin-proj-price">{formatPrice(Number(property.basePrice))}</div>
            <div className="admin-proj-psf">{property.listedBy ? `Listed by ${property.listedBy}` : ''}</div>
          </div>
        </div>
        <div className="admin-proj-added">Added {formatDate(property.createdAt)}</div>
        <div className="admin-prop-card-actions" style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <Link href={`/listings/${property.propertyId}/edit`} className="btn btn-ghost btn-xs">
            Edit
          </Link>
          {!property.isApproved && onApprove && onReject ? (
            <>
              <button type="button" className="btn btn-tl btn-xs" onClick={() => onApprove(property.propertyId)}>
                Approve
              </button>
              <button type="button" className="btn btn-danger btn-xs" onClick={() => onReject(property.propertyId)}>
                Reject
              </button>
            </>
          ) : null}
          <button type="button" className="btn btn-danger btn-xs" onClick={() => onDelete(property)}>
            <Trash2 size={12} strokeWidth={1.8} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
