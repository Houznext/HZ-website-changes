/** UUID v4 (and variant) pattern for blog `id` lookups */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isBlogUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** URL-safe slug from title or user-provided string */
export function slugifyTitle(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return s || 'post';
}
