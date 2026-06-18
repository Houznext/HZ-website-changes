/** Last 10 digits — canonical key for matching customers across systems. */
export function mobileSuffix10(mobile: string): string {
  return mobile.replace(/\D/g, '').slice(-10);
}

/** Store in int_customers / website portal (10-digit). */
export function normalizePortalMobile(mobile: string): string {
  return mobileSuffix10(mobile);
}

/** Store in livebuild_customers / livebuild_projects (+91…). */
export function normalizeLbMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length > 10) return `+${digits}`;
  return mobile.trim();
}

/** SQL fragment: compare any phone column to a 10-digit suffix. */
export function sqlMobileSuffixMatch(column: string, param = 'mobileSuffix'): string {
  return `RIGHT(REGEXP_REPLACE(${column}, '[^0-9]', '', 'g'), 10) = :${param}`;
}
