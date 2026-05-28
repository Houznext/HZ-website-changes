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

export function enquiryStatusLabel(status: string): string {
  return LABELS[status] ?? status.replace(/_/g, ' ');
}
