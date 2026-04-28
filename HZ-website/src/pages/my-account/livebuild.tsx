import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { useCustomerGuard } from '@/hooks/useCustomerGuard'
import { useQuoteModal } from '@/components/QuoteModal'

export default function LivebuildListPage() {
  const { customer, isLoading } = useCustomerGuard()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const router = useRouter()
  const { openModal } = useQuoteModal()
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  useEffect(() => {
    if (!customer) return
    fetch(`${API}/interiors/customers/${customer.id}/projects`, {
      headers: { Authorization: `Bearer ${customer.token}` },
    })
      .then((r) => r.json())
      .then((data: any[]) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [customer, API])

  const today = useMemo(() => new Date(), [])

  if (isLoading) return <><Navbar /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f80ed]" /></div></>
  if (!customer) return null

  return (
    <>
      <SeoHead title="My Home — LiveBuild | Houznext" description="Track your interior projects." canonical="/my-account/livebuild" />
      <Navbar />
      <main className="min-h-screen bg-[#f5f7fa] px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => void router.push('/my-account')} className="mb-4 text-sm text-[#2f80ed] transition-all duration-200">← Back to dashboard</button>
          <h1 className="font-head text-2xl font-extrabold text-[#1f2933]">My Home — LiveBuild</h1>
          {loading ? (
            <div className="mt-4 space-y-3">{[1, 2].map((k) => <div key={k} className="h-[108px] animate-pulse rounded-[13px] bg-white border border-[#dde8f5]" />)}</div>
          ) : projects.length === 0 ? (
            <div className="mt-5 rounded-[13px] border border-[#dde8f5] bg-white p-8 text-center">
              <h3 className="font-head text-xl font-extrabold text-[#1f2933]">No projects yet</h3>
              <p className="mt-2 text-sm text-[#5a6a7e]">Your interior project will appear here once it's created.</p>
              <button onClick={() => openModal('LiveBuild — Get free consultation')} className="mt-4 rounded-lg bg-[#2f80ed] px-4 py-2 text-sm font-bold text-white transition-all duration-200">Get free consultation →</button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {projects.map((p) => {
                const pct = Number(p.overallProgress ?? 0)
                const start = p.createdAt ? new Date(p.createdAt) : today
                const days = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
                return (
                  <div key={p.id} onClick={() => void router.push(`/my-account/livebuild/${p.id}`)} className="cursor-pointer rounded-[13px] border border-[#dde8f5] bg-white p-4 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-head text-sm font-bold text-[#1f2933]">{p.bhk ?? ''} · {p.locality ?? ''}, {p.city ?? ''}</div>
                        <div className="text-xs text-[#5a6a7e]">Day {days} / 45</div>
                      </div>
                      <div className="text-sm font-bold text-[#2f80ed]">{pct}%</div>
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
