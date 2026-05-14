/** +91 9759750770 — digits only for wa.me (no leading +). */
const DEFAULT_E164 = '919759750770';

export const INFRA_WHATSAPP_DISPLAY = '+91 9759750770';

function normalizeE164(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) return `91${d}`;
  if (d.length >= 11) return d;
  return DEFAULT_E164;
}

/** Client: set NEXT_PUBLIC_INFRA_WHATSAPP_E164 to override (e.g. 919759750770 or 9759750770). */
export function infraBusinessWhatsappE164(): string {
  const env = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_INFRA_WHATSAPP_E164 : undefined;
  if (!env?.trim()) return DEFAULT_E164;
  return normalizeE164(env);
}

export function infraWhatsAppMeUrl(prefilledText: string, e164Override?: string | null): string {
  const e164 = e164Override ? normalizeE164(e164Override) : infraBusinessWhatsappE164();
  return `https://wa.me/${e164}?text=${encodeURIComponent(prefilledText)}`;
}
