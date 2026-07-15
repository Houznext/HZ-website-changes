const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export type CustomerNotification = {
  id: string
  type: string
  title: string
  summary: string
  href: string
  isRead: boolean
  createdAt: string
  meta?: Record<string, unknown> | null
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

export async function fetchCustomerNotifications(
  token: string,
  opts?: { limit?: number; offset?: number; unreadOnly?: boolean },
) {
  const params = new URLSearchParams()
  if (opts?.limit != null) params.set('limit', String(opts.limit))
  if (opts?.offset != null) params.set('offset', String(opts.offset))
  if (opts?.unreadOnly) params.set('unreadOnly', 'true')
  const qs = params.toString() ? `?${params.toString()}` : ''
  const res = await fetch(`${API}/customer-notifications${qs}`, {
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Failed to load notifications')
  return res.json() as Promise<{
    data: CustomerNotification[]
    total: number
    limit: number
    offset: number
  }>
}

export async function fetchUnreadNotificationCount(token: string) {
  const res = await fetch(`${API}/customer-notifications/unread-count`, {
    headers: authHeaders(token),
  })
  if (!res.ok) return { count: 0 }
  return res.json() as Promise<{ count: number }>
}

export async function markNotificationRead(token: string, id: string) {
  const res = await fetch(`${API}/customer-notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Failed to mark read')
  return res.json() as Promise<CustomerNotification>
}

export async function markAllNotificationsRead(token: string) {
  const res = await fetch(`${API}/customer-notifications/mark-all-read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Failed to mark all read')
  return res.json() as Promise<{ ok: boolean }>
}

export function notificationAccent(type: string) {
  if (type.startsWith('quotation')) return '#2f80ed'
  if (type.startsWith('invoice')) return '#d97706'
  if (type.startsWith('livebuild')) return '#0d9488'
  return '#5a6a7e'
}

export function formatNotificationTime(iso: string) {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const mins = Math.floor(diffMs / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}
