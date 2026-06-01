export type StoredPropertyRef = {
  slug: string;
  title: string;
  city?: string | null;
  locality?: string | null;
  propertyId?: string;
  propertyType?: string | null;
  viewedAt?: string;
  savedAt?: string;
};

const SEEN_KEY = 'infra_seen_properties';
const SAVED_KEY = 'infra_saved_properties';

function readList(key: string): StoredPropertyRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is StoredPropertyRef =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as StoredPropertyRef).slug === 'string' &&
        typeof (x as StoredPropertyRef).title === 'string',
    );
  } catch {
    return [];
  }
}

function writeList(key: string, list: StoredPropertyRef[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

/** Record or refresh a property in the “seen” list (most recent first). */
export function recordSeenProperty(ref: {
  slug: string;
  title: string;
  city?: string | null;
  locality?: string | null;
  propertyId?: string;
  propertyType?: string | null;
}) {
  if (typeof window === 'undefined') return;
  const list = readList(SEEN_KEY);
  const now = new Date().toISOString();
  const next = list.filter((p) => p.slug !== ref.slug);
  next.unshift({
    slug: ref.slug,
    title: ref.title,
    city: ref.city,
    locality: ref.locality,
    propertyId: ref.propertyId,
    propertyType: ref.propertyType,
    viewedAt: now,
  });
  writeList(SEEN_KEY, next.slice(0, 100));
}

export function getSeenProperties(): StoredPropertyRef[] {
  return readList(SEEN_KEY);
}

export function getSavedProperties(): StoredPropertyRef[] {
  return readList(SAVED_KEY);
}

export function isPropertySaved(slug: string): boolean {
  return readList(SAVED_KEY).some((p) => p.slug === slug);
}

/** Toggle saved; returns true if now saved. */
export function toggleSavedProperty(ref: {
  slug: string;
  title: string;
  city?: string | null;
  locality?: string | null;
  propertyId?: string;
}): boolean {
  if (typeof window === 'undefined') return false;
  const list = readList(SAVED_KEY);
  const idx = list.findIndex((p) => p.slug === ref.slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeList(SAVED_KEY, list);
    return false;
  }
  const now = new Date().toISOString();
  list.unshift({
    slug: ref.slug,
    title: ref.title,
    city: ref.city,
    locality: ref.locality,
    propertyId: ref.propertyId,
    savedAt: now,
  });
  writeList(SAVED_KEY, list.slice(0, 200));
  return true;
}
