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

export function formatDateShort(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

export function dayProgressFilterLabel(
  range: string,
  specificDate: string | null,
): string {
  if (specificDate) {
    return `Showing specific date: ${formatDate(specificDate)}`;
  }
  const days = parseInt(range.replace(/\D/g, ''), 10) || 7;
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return `Showing last ${days} days · ${formatDateShort(start.toISOString())} – ${formatDateShort(end.toISOString())}`;
}

export function roomRingColor(color?: string): string {
  if (color === 'apt') return 'var(--blue)';
  if (color === 'pu') return 'var(--pu)';
  if (color === 'am') return 'var(--am)';
  return 'var(--navy)';
}

export function paymentStatusBadge(status: string): string {
  if (status === 'paid') return 'b-blue';
  if (status === 'due') return 'b-red';
  return 'b-gray';
}

export function paymentStatusLabel(status: string): string {
  if (status === 'paid') return 'Paid';
  if (status === 'due') return 'Due now';
  return 'Upcoming';
}

/** Short timestamp for project card updates (Today 2:30 PM / Yesterday / 28 Dec). */
export function formatUpdateWhen(iso?: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayDiff = Math.round(
      (startOfToday.getTime() - startOfThat.getTime()) / 86400000,
    );
    if (dayDiff === 0) {
      return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    }
    if (dayDiff === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}
