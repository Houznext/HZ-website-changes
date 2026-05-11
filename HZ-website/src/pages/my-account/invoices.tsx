import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { useCustomerGuard } from '@/hooks/useCustomerGuard'

type InvoiceEstimator = {
  id: string
  invoiceNumber?: string
  invoiceDate?: string
  invoiceDue?: string
  billToName?: string
  billToCity?: string
  customerMobile?: string | null
  items?: Array<{ item_name: string; quantity: number; price: number }>
}

function getInvoiceStatus(inv: InvoiceEstimator) {
  if (!inv.invoiceDue) return 'upcoming'
  const due = new Date(inv.invoiceDue)
  const today = new Date()
  if (due < today) return 'overdue'
  return 'due'
}

export default function InvoicesPage() {
  const { customer, isLoading } = useCustomerGuard()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<InvoiceEstimator[]>([])
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
    fetch(`${API}/invoice-estimator/by-mobile/${m}`)
      .then((r) => r.json())
      .then((data: InvoiceEstimator[]) => setRows((Array.isArray(data) ? data : []).filter((i) => !i.customerMobile || i.customerMobile === m)))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [customer, API])

  if (isLoading) return <><Navbar /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f80ed]" /></div></>
  if (!customer) return null

  return (
    <>
      <SeoHead title="Invoices | Houznext" description="View your invoices." canonical="/my-account/invoices" />
      <Navbar />
      <main className="min-h-screen bg-[#f5f7fa] px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => void router.push('/my-account')} className="mb-4 text-sm text-[#2f80ed] transition-all duration-200">← Back to dashboard</button>
          <h1 className="font-head text-2xl font-extrabold text-[#1f2933]">Invoices</h1>
          {loading ? (
            <div className="mt-4 space-y-3">{[1, 2].map((k) => <div key={k} className="h-[120px] animate-pulse rounded-[13px] bg-white border border-[#dde8f5]" />)}</div>
          ) : rows.length === 0 ? (
            <div className="mt-5 rounded-[13px] border border-[#dde8f5] bg-white p-8 text-center"><h3 className="font-head text-xl font-extrabold text-[#1f2933]">No invoices yet</h3><p className="mt-2 text-sm text-[#5a6a7e]">Your billing details will appear here.</p></div>
          ) : (
            <div className="mt-4 space-y-3">
              {rows.map((inv) => {
                const status = getInvoiceStatus(inv)
                return (
                  <div key={inv.id} className="rounded-[13px] border bg-white p-4" style={{ borderColor: status === 'overdue' ? '#dc2626' : status === 'due' ? '#d97706' : '#dde8f5' }}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[#1f2933]">{inv.invoiceNumber ?? 'Invoice'}</div>
                      <span className="text-xs font-bold" style={{ color: status === 'overdue' ? '#dc2626' : status === 'due' ? '#d97706' : '#16a34a' }}>{status.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-[#5a6a7e] mt-1">{inv.billToName} • {inv.billToCity}</div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => toast('PDF download coming soon')} className="rounded-lg border border-[#dde8f5] bg-white px-3 py-1.5 text-xs font-bold text-[#1f2933] transition-all duration-200">Download PDF</button>
                      {(status === 'due' || status === 'overdue') && <button className="rounded-lg bg-[#2f80ed] px-3 py-1.5 text-xs font-bold text-white transition-all duration-200">Pay now</button>}
                    </div>
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
