/** Normalize customer mobile for livebuild_projects.customer_mobile (+91…). */
export function normalizeLbMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length > 10) return `+${digits}`;
  return mobile.trim();
}

export function mobileSuffix10(mobile: string): string {
  return mobile.replace(/\D/g, '').slice(-10);
}

export function mobilesMatch(a: string, b: string): boolean {
  return mobileSuffix10(a) === mobileSuffix10(b);
}
