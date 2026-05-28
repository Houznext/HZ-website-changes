/** Customer-facing enquiry pipeline statuses (admin + website). */
export const ENQUIRY_STATUS_VALUES = [
  'response_received',
  'site_visit_scheduled',
  'site_visited',
  'negotiation',
  'token_paid',
  'booked',
  'registered',
] as const;

export type EnquiryStatusValue = (typeof ENQUIRY_STATUS_VALUES)[number];

export const DEFAULT_ENQUIRY_STATUS: EnquiryStatusValue = 'response_received';

export const ENQUIRY_STATUS_LABELS: Record<string, string> = {
  response_received: 'Response received',
  site_visit_scheduled: 'Site visit scheduled',
  site_visited: 'Site visited',
  negotiation: 'Negotiation',
  token_paid: 'Token paid',
  booked: 'Booked',
  registered: 'Registered',
  pending: 'Awaiting response',
  awaiting_response: 'Awaiting response',
};

export function enquiryStatusLabel(status: string): string {
  return ENQUIRY_STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}
