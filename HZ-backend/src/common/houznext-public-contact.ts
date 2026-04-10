/**
 * Only phone + email that may appear in customer-facing outbound copy (SMS, WhatsApp, HTML footers).
 * Use these constants everywhere so messaging stays consistent.
 */
export const HOUZNEXT_PUBLIC_PHONE_E164 = '919759750770';
export const HOUZNEXT_PUBLIC_PHONE_DISPLAY = '+91 9759750770';
export const HOUZNEXT_PUBLIC_EMAIL = 'business@houznext.com';
export const HOUZNEXT_COMPANY_NAME = 'Houznext';

/** Optional: logo in system notification emails */
export const HOUZNEXT_LOGO_URL =
  process.env.HOUZNEXT_LOGO_URL?.trim() || 'https://houznext.com/og-home.jpg';

/** Public portfolio PDF for WhatsApp flows; when empty, text is sent without a document. */
export const HOUZNEXT_PORTFOLIO_PDF_URL =
  process.env.HOUZNEXT_PORTFOLIO_PDF_URL?.trim() || '';
