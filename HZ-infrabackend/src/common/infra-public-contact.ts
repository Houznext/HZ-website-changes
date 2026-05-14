/** +91 9759750770 — digits only for wa.me (no leading +). */
const DEFAULT_E164 = '919759750770';

function normalizeE164(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length === 10) return `91${d}`;
  if (d.length >= 11) return d;
  return DEFAULT_E164;
}

/** Override with INFRA_WHATSAPP_E164 (e.g. 919759750770 or 9759750770). */
export function infraBusinessWhatsappE164(): string {
  const env = process.env.INFRA_WHATSAPP_E164;
  if (!env?.trim()) return DEFAULT_E164;
  return normalizeE164(env);
}
