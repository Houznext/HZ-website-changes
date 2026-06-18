import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { useCustomerGuard } from '@/hooks/useCustomerGuard'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import { countSavedDesigns } from '@/utils/savedDesigns'
import LivebuildEntryCard from '@/livebuild/components/LivebuildEntryCard'
import { configureLivebuildAuth, livebuildApi } from '@/livebuild/lib/api'
import type { LbAccountStats } from '@/livebuild/lib/types'

export default function MyAccountDashboard() {
  const { customer, isLoading } = useCustomerGuard()
  const { updateCustomerName, updateCustomerMobile } = useCustomerAuth()
  const router = useRouter()
  const [savedCount, setSavedCount] = useState(0)
  const [invoiceDue, setInvoiceDue] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [orderCount, setOrderCount] = useState<number | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [lbStats, setLbStats] = useState<LbAccountStats | null>(null)
  const [lbStatsLoading, setLbStatsLoading] = useState(false)
  const [linkMobile, setLinkMobile] = useState('')
  const [linkOtp, setLinkOtp] = useState('')
  const [linkBusy, setLinkBusy] = useState(false)
  const [linkMsg, setLinkMsg] = useState('')
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  const hasMobile = (customer?.mobile ?? '').replace(/\D/g, '').length >= 10

  useEffect(() => {
    try {
      setSavedCount(countSavedDesigns())
    } catch {
      setSavedCount(0)
    }
    if (customer) {
      setNameDraft(customer.name || '')
      const m = customer.mobile?.replace(/\D/g, '').slice(-10) ?? ''
      if (m.length === 10) {
        fetch(`${API}/invoice-estimator/by-mobile/${m}`)
          .then((r) => r.json())
          .then((invs: Array<{ invoiceDue?: string }>) => setInvoiceDue(invs?.some((i) => !!i.invoiceDue && new Date(i.invoiceDue) >= new Date()) ?? false))
          .catch(() => setInvoiceDue(false))
      } else {
        setInvoiceDue(false)
      }
      fetch(`${API}/orders/customer/${customer.id}`, {
        headers: { Authorization: `Bearer ${customer.token}` },
      })
        .then((r) => r.json())
        .then((rows: any[]) => {
          const list = Array.isArray(rows) ? rows : []
          setOrders(list)
          setOrderCount(list.length)
        })
        .catch(() => {
          setOrders([])
          setOrderCount(0)
        })
    }
    const m = customer?.mobile?.replace(/\D/g, '').slice(-10) ?? ''
    if (customer?.token && m.length === 10) {
      configureLivebuildAuth(customer.token)
      setLbStatsLoading(true)
      livebuildApi
        .myStats()
        .then((s) => setLbStats(s))
        .catch(() => setLbStats(null))
        .finally(() => setLbStatsLoading(false))
    } else {
      setLbStats(null)
      setLbStatsLoading(false)
    }
  }, [customer, API])

  if (isLoading) return <><Navbar /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f80ed]" /></div></>
  if (!customer) return null

  const initials = customer.name.split(' ').map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 2) || 'HZ'

  const sendLinkMobileOtp = async () => {
    if (!customer) return
    const digits = linkMobile.replace(/\D/g, '').slice(-10)
    if (digits.length < 10) {
      setLinkMsg('Enter a valid 10-digit mobile number.')
      return
    }
    setLinkBusy(true)
    setLinkMsg('')
    try {
      const res = await fetch(`${API}/interiors/customers/${customer.id}/send-mobile-link-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer.token}`,
        },
        body: JSON.stringify({ newMobile: digits }),
      })
      if (!res.ok) {
        let msg = 'Could not send OTP.'
        try {
          const err = await res.json() as { message?: string | string[] }
          const raw = Array.isArray(err?.message) ? err.message[0] : err?.message
          if (typeof raw === 'string' && raw.trim()) msg = raw
        } catch {
          // ignore
        }
        throw new Error(msg)
      }
      setLinkMsg('OTP sent to your phone. Enter it below to link this number.')
    } catch (e) {
      setLinkMsg(e instanceof Error ? e.message : 'Failed to send OTP.')
    } finally {
      setLinkBusy(false)
    }
  }

  const verifyLinkMobile = async () => {
    if (!customer) return
    const digits = linkMobile.replace(/\D/g, '').slice(-10)
    if (digits.length < 10 || linkOtp.replace(/\D/g, '').length < 6) {
      setLinkMsg('Enter mobile and OTP.')
      return
    }
    setLinkBusy(true)
    setLinkMsg('')
    try {
      const res = await fetch(`${API}/interiors/customers/${customer.id}/change-contact`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer.token}`,
        },
        body: JSON.stringify({ newMobile: digits, otp: linkOtp.replace(/\D/g, '') }),
      })
      if (!res.ok) {
        let msg = 'Could not verify OTP.'
        try {
          const err = await res.json() as { message?: string | string[] }
          const raw = Array.isArray(err?.message) ? err.message[0] : err?.message
          if (typeof raw === 'string' && raw.trim()) msg = raw
        } catch {
          // ignore
        }
        throw new Error(msg)
      }
      updateCustomerMobile(digits)
      setLinkMobile('')
      setLinkOtp('')
      setLinkMsg('Mobile number linked. Your quotations and invoices will load here.')
    } catch (e) {
      setLinkMsg(e instanceof Error ? e.message : 'Verification failed.')
    } finally {
      setLinkBusy(false)
    }
  }

  const saveName = async () => {
    const nextName = nameDraft.trim()
    if (!nextName || nextName === customer.name) {
      setEditingName(false)
      return
    }
    setSavingName(true)
    try {
      const res = await fetch(`${API}/interiors/customers/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customer.token}`,
        },
        body: JSON.stringify({ fullName: nextName }),
      })
      if (!res.ok) throw new Error('Failed')
      updateCustomerName(nextName)
      setEditingName(false)
    } catch {
      // keep silent; user can retry
    } finally {
      setSavingName(false)
    }
  }

  return (
    <>
      <SeoHead title="My Account | Houznext" description="Manage your quotations, invoices, saved designs and LiveBuild project." canonical="/my-account" />
      <Navbar />
      <main style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ background: '#0f2a44', padding: '32px 24px 0', position: 'relative' }}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#2f80ed,#f2994a,#2f80ed)' }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 13, paddingBottom: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#2f80ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Montserrat, system-ui', fontSize: 20, fontWeight: 800, color: '#fff', border: '3px solid rgba(255,255,255,.2)' }}>{initials}</div>
            <div>
              {editingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="rounded-md border px-2 py-1 text-[13px] outline-none"
                    style={{ borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.95)', color: '#1f2933' }}
                  />
                  <button
                    type="button"
                    onClick={() => void saveName()}
                    disabled={savingName}
                    className="rounded-md px-2 py-1 text-[12px] font-bold text-white"
                    style={{ background: '#2f80ed', opacity: savingName ? 0.7 : 1 }}
                  >
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingName(false); setNameDraft(customer.name || '') }}
                    className="rounded-md border px-2 py-1 text-[12px] font-bold"
                    style={{ borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontFamily: 'Montserrat, system-ui', fontSize: 21, fontWeight: 800, color: '#fff' }}>{customer.name}</div>
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="rounded-md border px-2 py-1 text-[11px] font-bold"
                    style={{ borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }}
                  >
                    Edit
                  </button>
                </div>
              )}
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>{customer.mobile?.trim() || customer.email || 'Add your mobile below'}</div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
          {!hasMobile && (
            <div
              style={{
                marginBottom: 20,
                padding: '14px 16px',
                borderRadius: 11,
                border: '1px solid #c7daf3',
                background: 'linear-gradient(135deg, #e8f1fd 0%, #f5f9ff 100%)',
                color: '#0f2a44',
              }}
            >
              <div style={{ fontFamily: 'Montserrat, system-ui', fontSize: 14, fontWeight: 800, marginBottom: 6 }}>Link your mobile number</div>
              <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.55, margin: 0 }}>
                Add and verify your mobile to see quotations, invoices, and store activity tied to your projects. Until then, some sections may stay empty.
              </p>
              <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <input
                  value={linkMobile}
                  onChange={(e) => setLinkMobile(e.target.value)}
                  placeholder="10-digit mobile"
                  className="rounded-md border px-3 py-2 text-[13px] outline-none"
                  style={{ borderColor: '#dde8f5', minWidth: 160, color: '#1f2933' }}
                />
                <button
                  type="button"
                  disabled={linkBusy}
                  onClick={() => void sendLinkMobileOtp()}
                  className="rounded-md px-3 py-2 text-[12px] font-bold text-white"
                  style={{ background: '#2f80ed', opacity: linkBusy ? 0.7 : 1 }}
                >
                  Send OTP
                </button>
                <input
                  value={linkOtp}
                  onChange={(e) => setLinkOtp(e.target.value)}
                  placeholder="6-digit OTP"
                  className="rounded-md border px-3 py-2 text-[13px] outline-none"
                  style={{ borderColor: '#dde8f5', width: 120, color: '#1f2933' }}
                />
                <button
                  type="button"
                  disabled={linkBusy}
                  onClick={() => void verifyLinkMobile()}
                  className="rounded-md border px-3 py-2 text-[12px] font-bold"
                  style={{ borderColor: '#0f2a44', color: '#0f2a44', background: '#fff' }}
                >
                  Verify and link
                </button>
              </div>
              {linkMsg ? <p style={{ marginTop: 10, fontSize: 12, color: '#1e40af' }}>{linkMsg}</p> : null}
            </div>
          )}
          <div style={{ fontFamily: 'Montserrat, system-ui', fontSize: 17, fontWeight: 800, color: '#1f2933', marginBottom: 5 }}>My account</div>
          <div style={{ fontSize: 12, color: '#5a6a7e', marginBottom: 24 }}>
            {hasMobile
              ? 'All your Houznext activity in one place — linked to your mobile number.'
              : 'Profile and orders on this account; link your mobile to load quotations and invoices by phone.'}
          </div>
          <LivebuildEntryCard
            stats={lbStats}
            loading={lbStatsLoading}
            hasMobile={hasMobile}
            isLoggedIn={!!customer}
          />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2.5">
            {[
              {
                val: '—',
                lbl: 'My quotations',
                sub: 'Interior cost estimates',
                href: '/my-account/quotations',
                accent: '#2f80ed',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
              },
              {
                val: invoiceDue ? '1 due' : '—',
                lbl: 'Invoices',
                sub: 'Payments & receipts',
                href: '/my-account/invoices',
                accent: invoiceDue ? '#dc2626' : '#d97706',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={invoiceDue ? '#dc2626' : '#d97706'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
              },
              {
                val: String(savedCount),
                lbl: 'Saved designs',
                sub: 'From design ideas gallery',
                href: '/my-account/saved-designs',
                accent: '#db2777',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>,
              },
              {
                val: orderCount !== null ? String(orderCount) : '—',
                lbl: 'My orders',
                sub: 'Furniture & home decor',
                href: '/my-account?tab=orders',
                accent: '#d97706',
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
              },
            ].map((card) => (
              <div
                key={card.href}
                onClick={() => void router.push(card.href)}
                className="flex items-center gap-3 rounded-[11px] border border-[#dde8f5] bg-white px-3.5 py-3 cursor-pointer transition-all hover:border-[#c7daf3] hover:shadow-sm lg:block lg:p-[13px_15px]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[#f4f8fd] lg:hidden">
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1 lg:block">
                  <div className="hidden lg:flex lg:justify-end lg:mb-1.5">{card.icon}</div>
                  <div className="flex items-center justify-between gap-2 lg:block">
                    <div
                      className="font-[Montserrat,system-ui] text-[22px] font-extrabold leading-none text-[#1f2933] lg:text-2xl"
                    >
                      {card.val}
                    </div>
                    <div className="text-[11px] font-bold lg:hidden" style={{ color: card.accent }}>
                      View all →
                    </div>
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-[#5a6a7e] lg:mt-[3px] lg:text-[11px]">{card.lbl}</div>
                  <div className="text-[11px] text-[#5a6a7e] lg:mt-0.5 lg:text-[10px]">{card.sub}</div>
                  <div className="mt-2.5 hidden text-[11px] font-bold lg:block" style={{ color: card.accent }}>
                    View all →
                  </div>
                </div>
              </div>
            ))}
          </div>
          {router.query.tab === 'orders' && (
            <div style={{ marginTop: 18, background: '#fff', border: '1px solid #dde8f5', borderRadius: 11, padding: 14 }}>
              <div style={{ fontFamily: 'Montserrat, system-ui', fontSize: 16, fontWeight: 800, color: '#1f2933', marginBottom: 8 }}>My orders</div>
              {orders.length === 0 ? (
                <div style={{ fontSize: 13, color: '#5a6a7e' }}>No store orders yet.</div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} style={{ borderTop: '1px solid #eef4fb', padding: '10px 0', fontSize: 13, color: '#1f2933' }}>
                    <div style={{ fontWeight: 700 }}>{o.orderNo || o.id}</div>
                    <div style={{ color: '#5a6a7e' }}>{o.status} · ₹{Number(o.grandTotal || 0).toLocaleString('en-IN')}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button style={{ border: '1px solid #c7daf3', borderRadius: 8, background: '#e8f1fd', color: '#0f2a44', padding: '5px 10px', fontSize: 11 }}>Track order</button>
                      <button style={{ border: '1px solid #dde8f5', borderRadius: 8, background: '#fff', color: '#1f2933', padding: '5px 10px', fontSize: 11 }}>Download invoice</button>
                      {['CREATED', 'PENDING', 'PROCESSING'].includes(String(o.status || '').toUpperCase()) && (
                        <button style={{ border: '1px solid #fecaca', borderRadius: 8, background: '#fff1f2', color: '#dc2626', padding: '5px 10px', fontSize: 11 }}>Cancel</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
