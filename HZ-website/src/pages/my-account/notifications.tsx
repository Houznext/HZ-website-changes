import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { useCustomerGuard } from '@/hooks/useCustomerGuard'
import {
  fetchCustomerNotifications,
  formatNotificationTime,
  markAllNotificationsRead,
  markNotificationRead,
  notificationAccent,
  type CustomerNotification,
} from '@/utils/customerNotifications'

export default function NotificationsPage() {
  const { customer, isLoading } = useCustomerGuard()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<CustomerNotification[]>([])
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async () => {
    if (!customer?.token) return
    setLoading(true)
    try {
      const res = await fetchCustomerNotifications(customer.token, { limit: 50 })
      setRows(res.data ?? [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [customer?.token])

  useEffect(() => {
    if (customer?.token) void load()
  }, [customer?.token, load])

  const openNotification = async (n: CustomerNotification) => {
    if (!customer?.token) return
    if (!n.isRead) {
      try {
        await markNotificationRead(customer.token, n.id)
        setRows((prev) => prev.map((r) => (r.id === n.id ? { ...r, isRead: true } : r)))
      } catch {
        // still navigate
      }
    }
    void router.push(n.href)
  }

  const handleMarkAllRead = async () => {
    if (!customer?.token) return
    setMarkingAll(true)
    try {
      await markAllNotificationsRead(customer.token)
      setRows((prev) => prev.map((r) => ({ ...r, isRead: true })))
    } catch {
      // silent
    } finally {
      setMarkingAll(false)
    }
  }

  const unread = rows.filter((r) => !r.isRead).length
  const hasMobile = (customer?.mobile ?? '').replace(/\D/g, '').length >= 10

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#2f80ed]" />
        </div>
      </>
    )
  }
  if (!customer) return null

  return (
    <>
      <SeoHead
        title="Notifications | Houznext"
        description="Updates on your quotations, invoices, and LiveBuild projects."
        canonical="/my-account/notifications"
      />
      <Navbar />
      <main className="min-h-screen bg-[#f5f7fa] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => void router.push('/my-account')}
            className="mb-4 text-sm text-[#2f80ed]"
          >
            ← Back to dashboard
          </button>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-head text-2xl font-extrabold text-[#1f2933]">Notifications</h1>
              <p className="text-sm text-[#5a6a7e]">
                {hasMobile
                  ? 'Quotations, invoices, and LiveBuild updates for your account.'
                  : 'Link your mobile on the dashboard to receive project updates.'}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                disabled={markingAll}
                onClick={() => void handleMarkAllRead()}
                className="rounded-lg border border-[#dde8f5] bg-white px-3 py-1.5 text-xs font-bold text-[#1f2933]"
              >
                {markingAll ? 'Updating…' : 'Mark all read'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="h-[88px] animate-pulse rounded-[13px] border border-[#dde8f5] bg-white" />
              ))}
            </div>
          ) : !hasMobile ? (
            <div className="rounded-[13px] border border-[#dde8f5] bg-white p-8 text-center">
              <h3 className="font-head text-xl font-extrabold text-[#1f2933]">Link your mobile</h3>
              <p className="mt-2 text-sm text-[#5a6a7e]">
                Verify your phone number on My Account to see notifications tied to your projects.
              </p>
              <button
                type="button"
                onClick={() => void router.push('/my-account')}
                className="mt-4 rounded-lg bg-[#2f80ed] px-4 py-2 text-sm font-bold text-white"
              >
                Go to My Account →
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-[13px] border border-[#dde8f5] bg-white p-8 text-center">
              <h3 className="font-head text-xl font-extrabold text-[#1f2933]">No notifications yet</h3>
              <p className="mt-2 text-sm text-[#5a6a7e]">
                When we confirm a quotation, send an invoice, or update your LiveBuild project, it will show here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {rows.map((n) => {
                const accent = notificationAccent(n.type)
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => void openNotification(n)}
                    className="w-full rounded-[13px] border bg-white p-4 text-left transition-all hover:border-[#c7daf3] hover:shadow-sm"
                    style={{
                      borderColor: n.isRead ? '#dde8f5' : accent,
                      boxShadow: n.isRead ? undefined : `0 0 0 1px ${accent}22`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: n.isRead ? 'transparent' : accent }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className="font-head text-sm font-extrabold text-[#1f2933]"
                            style={{ opacity: n.isRead ? 0.85 : 1 }}
                          >
                            {n.title}
                          </span>
                          <span className="text-[11px] text-[#5a6a7e]">
                            {formatNotificationTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-[#5a6a7e]">{n.summary}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
