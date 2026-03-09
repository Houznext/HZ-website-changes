import { PlacedPlan } from "./contracts";

const cache = new Map<string, { value: PlacedPlan; createdAtMs: number }>();
const TTL_MS = 1000 * 60 * 60 * 12;

export const getCachedPlacedPlan = (key: string): PlacedPlan | null => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.createdAtMs > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.value;
};

export const setCachedPlacedPlan = (key: string, value: PlacedPlan): void => {
  cache.set(key, { value, createdAtMs: Date.now() });
};
