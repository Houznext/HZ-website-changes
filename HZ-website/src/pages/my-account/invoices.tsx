import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { useCustomerGuard } from '@/hooks/useCustomerGuard'

type InvoicePayment = {
  amount: number
  payment_date: string
  payment_method: string
}

type InvoiceRow = {
  id: string
  invoiceNumber?: string
  invoice_number?: string
  invoiceDate?: string
  invoice_date?: string
  invoiceDue?: string
  invoice_due?: string
  billToName?: string
  bill_to_name?: string
  billToCity?: string
  bill_to_city?: string
  status?: string
  grand_total?: number
  total_paid?: number
  balance_due?: number
  cgst_amount?: number
  sgst_amount?: number
  igst_amount?: number
  invoice_discount_amount?: number
  payments?: InvoicePayment[]
}

function invNum(i: InvoiceRow) {
  return i.invoice_number || i.invoiceNumber || 'Invoice'
}

function invDate(i: InvoiceRow) {
  return i.invoice_date || i.invoiceDate
}

function invDue(i: InvoiceRow) {
  return i.invoice_due || i.invoiceDue
}

function invName(i: InvoiceRow) {
  return i.bill_to_name || i.billToName || ''
}

function statusStyle(status?: string) {
  if (status === 'paid') return { color: '#0d9488', border: '#bbf7d0' }
  if (status === 'overdue') return { color: '#dc2626', border: '#fecaca' }
  if (status === 'partially_paid') return { color: '#d97706', border: '#fed7aa' }
  return { color: '#2f80ed', border: '#bfdbfe' }
}

function formatINR(n: number) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`
}

export default function InvoicesPage() {
  const { customer, isLoading } = useCustomerGuard()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<InvoiceRow[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const router = useRouter()
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  useEffect(() => {
    if (!customer) return
    const m = (customer.mobile ?? '').replace(/\D/g, '').slice(-10)
    if (m.length < 10) {
      setRows([])
      setLoading(false)
      return
    }
    fetch(`${API}/invoices/by-mobile/${m}`)
      .then((r) => r.json())
      .then((data: InvoiceRow[]) => setRows(Array.isArray(data) ? data : []))
      .catch(() => fetch(`${API}/invoice-estimator/by-mobile/${m}`).then((r) => r.json()).then((d) => setRows(Array.isArray(d) ? d : [])))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [customer, API])

  useEffect(() => {
    const id = typeof router.query.id === 'string' ? router.query.id : null
    if (!id || loading || rows.length === 0) return
    const match = rows.some((inv) => inv.id === id)
    if (!match) return
    setExpanded(id)
    setHighlightId(id)
    const el = rowRefs.current[id]
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
    const t = window.setTimeout(() => setHighlightId(null), 4000)
    return () => window.clearTimeout(t)
  }, [router.query.id, loading, rows])

  const downloadPdf = (id: string) => {
    const m = (customer?.mobile ?? '').replace(/\D/g, '').slice(-10)
    window.open(`${API}/invoices/public/${id}/pdf?mobile=${m}`, '_blank')
  }

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f80ed]" />
        </div>
      </>
    )
  }
  if (!customer) return null

  return (
    <>
      <SeoHead title="Invoices | Houznext" description="View your invoices." canonical="/my-account/invoices" />
      <Navbar />
      <main className="min-h-screen bg-[#f5f7fa] px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <button type="button" onClick={() => void router.push('/my-account')} className="mb-4 text-sm text-[#2f80ed]">← Back to dashboard</button>
          <h1 className="font-head text-2xl font-extrabold text-[#1f2933]">Invoices</h1>
          {loading ? (
            <div className="mt-4 space-y-3">{[1, 2].map((k) => <div key={k} className="h-[140px] animate-pulse rounded-[13px] bg-white border border-[#dde8f5]" />)}</div>
          ) : rows.length === 0 ? (
            <div className="mt-5 rounded-[13px] border border-[#dde8f5] bg-white p-8 text-center">
              <h3 className="font-head text-xl font-extrabold text-[#1f2933]">No invoices yet</h3>
              <p className="mt-2 text-sm text-[#5a6a7e]">Your billing details will appear here.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {rows.map((inv) => {
                const st = inv.status || 'sent'
                const ss = statusStyle(st)
                const open = expanded === inv.id
                const highlighted = highlightId === inv.id
                return (
                  <div
                    key={inv.id}
                    ref={(el) => { rowRefs.current[inv.id] = el }}
                    className="rounded-[13px] border bg-white p-4 sm:p-5 transition-all duration-300"
                    style={{
                      borderColor: highlighted ? '#2f80ed' : ss.border,
                      boxShadow: highlighted ? '0 0 0 2px #2f80ed33' : undefined,
                    }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-head font-extrabold text-[#1f2933]">{invNum(inv)}</span>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ color: ss.color, background: `${ss.color}15` }}>{st.replace('_', ' ')}</span>
                        </div>
                        <div className="mt-1 text-xs text-[#5a6a7e]">{invName(inv)} · {inv.bill_to_city || inv.billToCity} · Due {invDue(inv)}</div>
                        <div className="mt-2 font-head text-lg font-extrabold text-[#2f80ed]">{formatINR(inv.grand_total ?? 0)}</div>
                        {(inv.balance_due ?? 0) > 0 && (
                          <div className="text-xs text-[#d97706] font-semibold mt-1">Balance due: {formatINR(inv.balance_due ?? 0)}</div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setExpanded(open ? null : inv.id)} className="rounded-lg border border-[#dde8f5] px-3 py-1.5 text-xs font-bold">{open ? 'Hide' : 'Details'}</button>
                        <button type="button" onClick={() => downloadPdf(inv.id)} className="rounded-lg border border-[#dde8f5] px-3 py-1.5 text-xs font-bold">Download PDF</button>
                      </div>
                    </div>
                    {open && (
                      <div className="mt-4 border-t border-[#f0f4f8] pt-4 text-sm space-y-2">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          <div><span className="text-[#5a6a7e] text-xs">Paid</span><div className="font-semibold text-[#0d9488]">{formatINR(inv.total_paid ?? 0)}</div></div>
                          {(inv.cgst_amount ?? 0) > 0 && <div><span className="text-[#5a6a7e] text-xs">CGST</span><div className="font-semibold">{formatINR(inv.cgst_amount ?? 0)}</div></div>}
                          {(inv.sgst_amount ?? 0) > 0 && <div><span className="text-[#5a6a7e] text-xs">SGST</span><div className="font-semibold">{formatINR(inv.sgst_amount ?? 0)}</div></div>}
                          {(inv.igst_amount ?? 0) > 0 && <div><span className="text-[#5a6a7e] text-xs">IGST</span><div className="font-semibold">{formatINR(inv.igst_amount ?? 0)}</div></div>}
                        </div>
                        {(inv.invoice_discount_amount ?? 0) > 0 && (
                          <div className="text-xs text-[#5a6a7e]">Discount applied: {formatINR(inv.invoice_discount_amount ?? 0)}</div>
                        )}
                        {inv.payments && inv.payments.length > 0 && (
                          <div>
                            <div className="text-xs font-bold uppercase text-[#5a6a7e] mb-1">Payment history</div>
                            {inv.payments.map((p, i) => (
                              <div key={i} className="text-xs text-[#1f2933]">{p.payment_date} · {p.payment_method} · {formatINR(p.amount)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
