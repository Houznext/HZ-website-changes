export const INVOICE_SERIES_PREFIX = 'HZI';
export const INVOICE_SERIES_PAD = 6;

const HZI_PATTERN = /^HZI(\d+)$/i;

export function formatInvoiceSeriesNumber(sequence: number): string {
  const n = Math.max(1, Math.floor(sequence));
  return `${INVOICE_SERIES_PREFIX}${String(n).padStart(INVOICE_SERIES_PAD, '0')}`;
}

export function parseInvoiceSeriesNumber(invoiceNumber?: string | null): number | null {
  if (!invoiceNumber) return null;
  const m = invoiceNumber.trim().toUpperCase().match(HZI_PATTERN);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}
