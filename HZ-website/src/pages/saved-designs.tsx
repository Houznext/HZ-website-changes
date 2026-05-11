import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import { getSavedDesigns, setSavedDesigns } from '@/utils/savedDesigns'
import type { GetStaticProps } from 'next'
import { fetchPageSeo, type PageSeoPublic } from '@/lib/fetchPageSeo'

const ROOM_LABELS: Record<string, string> = {
  living: 'Living room',
  kitchen: 'Kitchen',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  office: 'Home office',
  kids: 'Kids room',
  balcony: 'Balcony',
  pooja: 'Pooja unit',
  foyer: 'Foyer',
}

type Saved = { id: string; title: string; imageUrl: string; room: string; style: string }

export default function SavedDesignsPage({ pageSeo }: { pageSeo: PageSeoPublic | null }) {
  const router = useRouter()
  const [savedCards, setSavedCards] = useState<Saved[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      setSavedCards(getSavedDesigns() as Saved[])
    } catch {
      setSavedCards([])
    }
    setLoaded(true)
  }, [])

  function unsave(id: string) {
    const next = savedCards.filter((c) => c.id !== id)
    setSavedCards(next)
    setSavedDesigns(next)
  }

  return (
    <>
      <SeoHead
        title="Saved designs | Houznext"
        description="Your saved interior design ideas from the Houznext gallery."
        canonical="/saved-designs"
        ogImage="https://houznext.com/og-default.jpg"
      />
      <Navbar />
      <main>
        <div style={{ background: '#0f2a44' }} className="pt-2">
          <div className="max-w-5xl mx-auto px-6 py-10">
            <div className="text-[12px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span className="cursor-pointer hover:text-white" onClick={() => void router.push('/')}>Home</span>
              <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
              <span style={{ color: 'rgba(255,255,255,0.75)' }}>Saved designs</span>
            </div>
            <EyebrowLabel className="mb-2">My collection</EyebrowLabel>
            <h1 className="font-head font-black text-[32px] md:text-[40px] text-white leading-tight mb-2">
              Saved designs
            </h1>
            <p className="text-[14px] max-w-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Designs you saved from the gallery — tap a card to jump back to that room.
            </p>
          </div>
        </div>
        <div className="min-h-[50vh] py-10 px-4" style={{ background: '#f5f7fa' }}>
          <div className="max-w-5xl mx-auto">
            {!loaded ? (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[220px] rounded-xl bg-slate-200/80 animate-pulse"
                  />
                ))}
              </div>
            ) : savedCards.length === 0 ? (
              <div className="text-center py-20 max-w-md mx-auto">
                <div className="text-[48px] mb-3">🤍</div>
                <h2 className="font-head font-bold text-[20px] text-charcoal mb-2">No saved designs yet</h2>
                <p className="text-sm text-[#5a6a7e] mb-6">Browse the gallery and tap the heart to save what you like.</p>
                <button
                  type="button"
                  onClick={() => void router.push('/design-ideas')}
                  className="px-6 py-3 rounded-xl font-head font-bold text-white text-[14px] bg-[#2f80ed] hover:bg-[#1a6dd6] transition-all"
                >
                  Explore design ideas
                </button>
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}
              >
                {savedCards.map((c) => (
                  <div
                    key={c.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') void router.push(`/design-ideas?tab=${encodeURIComponent(c.room)}`) }}
                    onClick={() => void router.push(`/design-ideas?tab=${encodeURIComponent(c.room)}`)}
                    className="bg-white border border-[#dde8f5] rounded-xl overflow-hidden cursor-pointer relative hover:-translate-y-1 transition-all"
                  >
                    <div
                      className="h-[170px] bg-gradient-to-br from-[#e8f1fd] to-[#dde8f5] relative"
                    >
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#94a3b8] text-[12px] font-bold">
                          No image
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); unsave(c.id) }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(220,38,38,0.95)' }}
                        aria-label="Remove from saved"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.2">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-3 text-left">
                      <span className="text-[10px] font-bold text-[#2f80ed] bg-[#e8f1fd] px-2 py-0.5 rounded-full">
                        {ROOM_LABELS[c.room] ?? c.room}
                      </span>
                      <p className="text-[14px] font-head font-bold text-[#1f2933] mt-2 line-clamp-2">{c.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export const getStaticProps: GetStaticProps<{ pageSeo: PageSeoPublic | null }> = async () => {
  let pageSeo: PageSeoPublic | null = null
  try {
    pageSeo = await fetchPageSeo('/saved-designs')
  } catch {
    pageSeo = null
  }
  return { props: { pageSeo }, revalidate: 120 }
}
