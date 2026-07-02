import { fetchWithTimeout, getPublicApiBase } from '@/lib/fetchWithTimeout'

export async function getCmsContent(
  key: string,
): Promise<Record<string, any> | null> {
  const base = getPublicApiBase()
  if (!base) return null
  try {
    const res = await fetchWithTimeout(`${base}/cms/${key}`)
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}
