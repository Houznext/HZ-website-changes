import { enquiryStatusBadgeClass, enquiryStatusLabel } from '@/lib/enquiryStatus';

export type ProfileTab = 'saved' | 'seen' | 'enq';

export function parseProfileTab(value: string | string[] | undefined): ProfileTab {
  const t = (Array.isArray(value) ? value[0] : value)?.toLowerCase();
  if (t === 'seen' || t === 'enq' || t === 'saved') return t;
  return 'saved';
}

export function profileHref(tab: ProfileTab, authed: boolean): string {
  const path = `/profile?tab=${tab}`;
  return authed ? path : `/login?callbackUrl=${encodeURIComponent(path)}`;
}

export function profileInitials(name?: string | null, email?: string | null): string {
  const n = (name ?? '').trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  }
  const em = (email ?? '').trim();
  if (em) return em.slice(0, 2).toUpperCase();
  return 'U';
}

export function formatProfilePhone(phone?: string | null): string {
  const d = (phone ?? '').replace(/\D/g, '').slice(-10);
  if (d.length !== 10) return phone ?? '—';
  return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
}

export function formatEnquiryDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function enquiryStatusMeta(status: string): { className: string; label: string } {
  return {
    className: enquiryStatusBadgeClass(status),
    label: enquiryStatusLabel(status),
  };
}

export type CustomerEnquiry = {
  enquiryId: string;
  message: string | null;
  status: string;
  adminResponse: string | null;
  createdAt: string;
  propertyId: string | null;
  propertySlug: string | null;
  propertyTitle: string | null;
  city: string | null;
  locality: string | null;
};
