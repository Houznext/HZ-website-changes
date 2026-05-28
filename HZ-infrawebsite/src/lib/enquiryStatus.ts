export const ENQUIRY_STATUS_OPTIONS = [
  { value: 'response_received', label: 'Response received' },
  { value: 'site_visit_scheduled', label: 'Site visit scheduled' },
  { value: 'site_visited', label: 'Site visited' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'token_paid', label: 'Token paid' },
  { value: 'booked', label: 'Booked' },
  { value: 'registered', label: 'Registered' },
] as const;

const LABELS: Record<string, string> = Object.fromEntries(
  ENQUIRY_STATUS_OPTIONS.map((o) => [o.value, o.label]),
);

LABELS.pending = 'Awaiting response';
LABELS.awaiting_response = 'Awaiting response';

export function enquiryStatusLabel(status: string): string {
  return LABELS[status] ?? status.replace(/_/g, ' ');
}

export function enquiryStatusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (['replied', 'responded', 'closed', 'resolved', 'response_received', 'booked', 'registered'].includes(s)) {
    return 'infra-badge infra-badge-blue';
  }
  if (['pending', 'open', 'new', 'awaiting_response', 'site_visit_scheduled'].includes(s)) {
    return 'infra-badge infra-badge-amber';
  }
  if (['negotiation', 'token_paid', 'site_visited'].includes(s)) {
    return 'infra-badge infra-badge-gray';
  }
  return 'infra-badge infra-badge-gray';
}
