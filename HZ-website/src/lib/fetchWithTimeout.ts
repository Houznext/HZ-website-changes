/** Abort fetch during SSG/ISR when the API is slow or unreachable (e.g. Vercel build). */
const DEFAULT_TIMEOUT_MS = 8_000

export function getPublicApiBase(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT
  if (!raw?.trim()) return null
  return String(raw).replace(/\/$/, '')
}

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const timeoutMs = init?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const { timeoutMs: _omit, ...fetchInit } = init ?? {}
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...fetchInit, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
