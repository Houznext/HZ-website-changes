/**
 * Opens WhatsApp Web / the WhatsApp app to a chat with `rawPhone`.
 * No message is pre-filled — the admin types and sends from their own WhatsApp account.
 *
 * @returns true if a tab/window was opened, false if the number could not be parsed
 */
export function openWhatsAppToNumber(
  rawPhone: string | null | undefined,
): boolean {
  if (!rawPhone?.trim()) return false;

  let digits = rawPhone.replace(/\D/g, "");
  if (!digits.length) return false;

  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "") || digits;
  }
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // 10-digit numbers are treated as India (91) — matches typical CRM data in this product.
  if (digits.length === 10) {
    digits = `91${digits}`;
  }

  const url = `https://wa.me/${digits}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
