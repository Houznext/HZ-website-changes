export function statusBadgeClass(status: string): string {
  const s = status.toLowerCase().replace(/\s+/g, '_');
  if (s.includes('hold')) return 'b-amber';
  if (s.includes('complete') || s.includes('done')) return 'b-gray';
  if (s.includes('progress') || s.includes('live') || s.includes('active')) return 'b-blue';
  if (s.includes('open') || s.includes('pending')) return 'b-red';
  return 'b-prog';
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function projectLocation(p: {
  location?: string;
  locality?: string;
  city?: string;
}): string {
  return p.location || [p.locality, p.city].filter(Boolean).join(', ') || '—';
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
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

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
