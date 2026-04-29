import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import { useCustomerGuard } from '@/hooks/useCustomerGuard'
import { getSavedDesigns, removeSavedDesign, type SavedDesignItem } from '@/utils/savedDesigns'

export default function SavedDesignsPage() {
  const { customer, isLoading } = useCustomerGuard()
  const [saved, setSaved] = useState<SavedDesignItem[]>([])
  const [pendingUnsave, setPendingUnsave] = useState<SavedDesignItem | null>(null)
  const router = useRouter()

  useEffect(() => {
    try {
      setSaved(getSavedDesigns())
    } catch {
      setSaved([])
    }
  }, [customer?.mobile])

  const unsave = (id: string) => {
    try {
      removeSavedDesign(id)
      setSaved((s) => s.filter((i) => i.id !== id))
    } catch {
      // ignore
    }
  }

  if (isLoading) return <><Navbar /><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f80ed]" /></div></>
  if (!customer) return null

  return (
    <>
      <SeoHead title="Saved Designs | Houznext" description="Your saved design ideas." canonical="/my-account/saved-designs" />
      <Navbar />
      <main className="min-h-screen bg-[#f5f7fa] px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <button onClick={() => void router.push('/my-account')} className="mb-4 text-sm text-[#2f80ed] transition-all duration-200">← Back to dashboard</button>
          <h1 className="font-head text-2xl font-extrabold text-[#1f2933]">Saved designs</h1>
          {saved.length === 0 ? (
            <div className="mt-5 rounded-[13px] border border-[#dde8f5] bg-white p-8 text-center">
              <h3 className="font-head text-xl font-extrabold text-[#1f2933]">No saved designs yet</h3>
              <button onClick={() => void router.push('/design-ideas')} className="mt-4 rounded-lg bg-[#2f80ed] px-4 py-2 text-sm font-bold text-white transition-all duration-200">Browse design ideas →</button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {saved.map((item) => (
                <div key={item.id} className="rounded-[13px] border border-[#dde8f5] bg-white overflow-hidden cursor-pointer transition-all duration-200" onClick={() => void router.push(item.targetUrl || '/design-ideas')}>
                  <div className="relative h-[120px] bg-gradient-to-br from-[#e8f1fd] to-[#dde8f5]">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />}
                    <button onClick={(e) => { e.stopPropagation(); setPendingUnsave(item) }} className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-[#dc2626] transition-all duration-200">♥</button>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-[#5a6a7e]">{item.room}</div>
                    <div className="text-sm font-semibold text-[#1f2933]">{item.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {pendingUnsave && (
        <div
          className="fixed inset-0 z-[650] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,42,68,0.45)' }}
          onClick={() => setPendingUnsave(null)}
        >
          <div
            className="w-full max-w-[360px] rounded-[14px] border bg-white p-5 shadow-2xl"
            style={{ borderColor: '#dde8f5' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[16px] font-[700] text-[#1f2933]">Are you sure want to unsave</h3>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingUnsave(null)}
                className="rounded-lg border px-4 py-2 text-[13px] font-[600] text-[#5a6a7e] transition-all duration-200"
                style={{ borderColor: '#dde8f5' }}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  unsave(pendingUnsave.id)
                  setPendingUnsave(null)
                }}
                className="rounded-lg px-4 py-2 text-[13px] font-[700] text-white transition-all duration-200"
                style={{ background: '#2f80ed' }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  )
}
