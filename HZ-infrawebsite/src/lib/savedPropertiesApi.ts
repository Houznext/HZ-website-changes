import api from '@/lib/axios';

let cachedIds: Set<string> | null = null;
let inflight: Promise<Set<string>> | null = null;

export function invalidateSavedPropertyCache() {
  cachedIds = null;
  inflight = null;
}

export async function fetchSavedPropertyIds(): Promise<Set<string>> {
  if (cachedIds) return cachedIds;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await api.get<{ propertyId: string }[]>('/saved/me');
      const list = Array.isArray(res.data) ? res.data : [];
      cachedIds = new Set(list.map((p) => p.propertyId).filter(Boolean));
    } catch {
      cachedIds = new Set();
    }
    inflight = null;
    return cachedIds;
  })();
  return inflight;
}

export async function savePropertyApi(propertyId: string): Promise<void> {
  await api.post('/saved', { propertyId });
  invalidateSavedPropertyCache();
}

export async function unsavePropertyApi(propertyId: string): Promise<void> {
  await api.delete(`/saved/${propertyId}`);
  invalidateSavedPropertyCache();
}
