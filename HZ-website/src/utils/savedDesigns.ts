export type SavedDesignItem = {
  id: string
  title: string
  imageUrl: string
  room: string
  style: string
  clickAction?: string
  targetUrl?: string
}

const LEGACY_KEY = 'hz_saved_designs'

function getMobileScope() {
  try {
    const mobile = localStorage.getItem('hz_customer_mobile')?.trim()
    if (mobile) return mobile
    const id = localStorage.getItem('hz_customer_id')?.trim()
    if (id) return `cust_${id}`
  } catch {
    // ignore
  }
  return 'guest'
}

function scopedKey() {
  return `hz_saved_designs_${getMobileScope()}`
}

function normalize(raw: unknown): SavedDesignItem[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as SavedDesignItem[]
  if (typeof raw === 'object') return Object.values(raw as Record<string, SavedDesignItem>)
  return []
}

function readByKey(key: string) {
  try {
    return normalize(JSON.parse(localStorage.getItem(key) || '[]'))
  } catch {
    return []
  }
}

export function getSavedDesigns(): SavedDesignItem[] {
  if (typeof window === 'undefined') return []
  const key = scopedKey()
  let rows = readByKey(key)
  if (rows.length === 0) {
    // one-time legacy fallback migration
    const legacyRows = readByKey(LEGACY_KEY)
    if (legacyRows.length > 0) {
      localStorage.setItem(key, JSON.stringify(legacyRows))
      rows = legacyRows
    }
  }
  return rows
}

export function setSavedDesigns(items: SavedDesignItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(scopedKey(), JSON.stringify(items))
  window.dispatchEvent(new Event('saved-changed'))
}

export function countSavedDesigns() {
  return getSavedDesigns().length
}

export function removeSavedDesign(id: string) {
  const next = getSavedDesigns().filter((x) => x.id !== id)
  setSavedDesigns(next)
}

