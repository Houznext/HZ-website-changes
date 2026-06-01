export type StoredProjectRef = {
  slug: string;
  projectId: string;
  name: string;
  city?: string | null;
  locality?: string | null;
  savedAt?: string;
};

const SAVED_KEY = 'infra_saved_projects';

function readList(): StoredProjectRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is StoredProjectRef =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as StoredProjectRef).slug === 'string' &&
        typeof (x as StoredProjectRef).projectId === 'string' &&
        typeof (x as StoredProjectRef).name === 'string',
    );
  } catch {
    return [];
  }
}

function writeList(list: StoredProjectRef[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getSavedProjects(): StoredProjectRef[] {
  return readList();
}

export function isProjectSaved(slug: string): boolean {
  return readList().some((p) => p.slug === slug);
}

export function toggleSavedProject(ref: {
  slug: string;
  projectId: string;
  name: string;
  city?: string | null;
  locality?: string | null;
}): boolean {
  if (typeof window === 'undefined') return false;
  const list = readList();
  const idx = list.findIndex((p) => p.slug === ref.slug);
  if (idx >= 0) {
    list.splice(idx, 1);
    writeList(list);
    return false;
  }
  const now = new Date().toISOString();
  list.unshift({ ...ref, savedAt: now });
  writeList(list.slice(0, 200));
  return true;
}
