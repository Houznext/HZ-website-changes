const CMS_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/cms`

export async function getCmsContent(
  key: string,
): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${CMS_BASE}/${key}`)
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}
