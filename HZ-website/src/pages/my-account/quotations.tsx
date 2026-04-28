import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { useCustomerGuard } from '@/hooks/useCustomerGuard'

export default function QuotationsPage() {
  const { customer, isLoading } = useCustomerGuard()
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<any[]>([])
  const router = useRouter()
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  useEffect(() => {
    if (!customer) return
    fetch(`${API}/cost-estimator?customerMobile=${encodeURIComponent(customer.mobile)}`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((data: { data?: any[] } | any[]) => {
        if (Array.isArray(data)) {
          setRows(data)
          return
        }
        setRows(Array.isArray(data?.data) ? data.data : [])
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [customer, API])

  if (isLoading) return <><Navbar /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f80ed]" /></div></>
  if (!customer) return null

  return (
    <>
      <SeoHead title="My Quotations | Houznext" description="Track your interior quotations." canonical="/my-account/quotations" />
      <Navbar />
      <main className="min-h-screen bg-[#f5f7fa] px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => void router.push('/my-account')} className="mb-4 text-sm text-[#2f80ed] transition-all duration-200">← Back to dashboard</button>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="font-head text-2xl font-extrabold text-[#1f2933]">My quotations</h1>
              <p className="text-sm text-[#5a6a7e]">Your recent estimate requests.</p>
            </div>
            <button onClick={() => void router.push('/interiors/cost-calculator')} className="rounded-lg border border-[#dde8f5] bg-white px-4 py-2 text-sm font-bold text-[#1f2933] transition-all duration-200">+ New quotation</button>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2].map((k) => <div key={k} className="h-[120px] animate-pulse rounded-[13px] bg-white border border-[#dde8f5]" />)}</div>
          ) : rows.length === 0 ? (
            <div className="rounded-[13px] border border-[#dde8f5] bg-white p-8 text-center">
              <h3 className="font-head text-xl font-extrabold text-[#1f2933]">No quotations yet</h3>
              <p className="mt-2 text-sm text-[#5a6a7e]">Use the cost calculator to get your free interior estimate.</p>
              <button onClick={() => void router.push('/interiors/cost-calculator')} className="mt-4 rounded-lg bg-[#2f80ed] px-4 py-2 text-sm font-bold text-white transition-all duration-200">Get estimate →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((q, i) => (
                <div key={q.id ?? i} className="rounded-[13px] border border-[#dde8f5] bg-white p-4">
                  <div className="text-sm font-semibold text-[#1f2933]">{`${q.firstname ?? ''} ${q.lastname ?? ''}`.trim() || 'Quotation request'}</div>
                  <div className="mt-1 text-xs text-[#5a6a7e]">{q.customerMobile ?? customer.mobile}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
