import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { useCustomerGuard } from '@/hooks/useCustomerGuard'

export async function getServerSideProps() {
  return { props: {} }
}

export default function LivebuildDetailPage() {
  const { customer, isLoading } = useCustomerGuard()
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any | null>(null)
  const [error, setError] = useState('')
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

  useEffect(() => {
    if (!customer || !id || Array.isArray(id)) return
    Promise.all([
      fetch(`${API}/interiors/projects/${id}`, { headers: { Authorization: `Bearer ${customer.token}` } }),
      fetch(`${API}/invoice-estimator/by-mobile/${customer.mobile}`),
    ])
      .then(async ([pRes]) => {
        if (!pRes.ok) throw new Error('Project not found')
        const pData = await pRes.json()
        setProject(pData)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Project not found'))
      .finally(() => setLoading(false))
  }, [customer, id, API])

  if (isLoading || loading) return <><Navbar /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f80ed]" /></div></>
  if (!customer) return null
  if (error || !project) return <><Navbar /><main className="min-h-screen bg-[#f5f7fa] p-8"><button onClick={() => void router.push('/my-account/livebuild')} className="text-[#2f80ed]">← Back to my projects</button><h1 className="mt-4 font-head text-2xl font-extrabold text-[#1f2933]">Project not found</h1></main><Footer /></>

  const pct = Number(project.overallProgress ?? 0)
  const r = 46
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  return (
    <>
      <SeoHead title="LiveBuild Project | Houznext" description="Project details and progress." canonical={`/my-account/livebuild/${project.id}`} />
      <Navbar />
      <main className="min-h-screen bg-[#f5f7fa] px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <button onClick={() => void router.push('/my-account/livebuild')} className="mb-4 text-sm text-[#2f80ed] transition-all duration-200">← Back to my projects</button>
          <h1 className="font-head text-2xl font-extrabold text-[#1f2933]">{project.bhk ?? ''} · {project.locality ?? ''}, {project.city ?? ''}</h1>
          <div className="mt-4 rounded-[13px] border border-[#dde8f5] bg-white p-5">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle cx="55" cy="55" r={r} fill="none" stroke={pct === 100 ? '#16a34a' : '#2f80ed'} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
              <text x="55" y="50" textAnchor="middle" fontSize="18" fontWeight="800" fill="#0f2a44">{pct}%</text>
              <text x="55" y="65" textAnchor="middle" fontSize="10" fill="#5a6a7e">complete</text>
            </svg>
            <div className="mt-4 flex gap-2">
              <button onClick={() => void router.push('/my-account/invoices')} className="rounded-lg border border-[#dde8f5] bg-white px-3 py-1.5 text-xs font-bold text-[#1f2933] transition-all duration-200">View all invoices</button>
              <button className="rounded-lg bg-[#2f80ed] px-3 py-1.5 text-xs font-bold text-white transition-all duration-200">Pay now</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
