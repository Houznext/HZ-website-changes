import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import { useQuoteModal } from '@/components/QuoteModal'
import { getCmsContent } from '@/lib/cms'

interface Room {
  slug: string
  label: string
  iconUrl: string
  sortOrder: number
  visible: boolean
  action: string
  actionValue: string
}

interface DesignCard {
  id: string
  title: string
  description: string
  imageUrl: string
  room: string
  style: string
  package: string
  status: string
  onclick: string
  onclickValue: string
}

const DEFAULT_HEADER = {
  eyebrow: 'Inspiration',
  heading: 'Design ideas for every room.',
  subheading:
    'Explore real designs from Houznext homes across Hyderabad, Warangal and Karimnagar.',
}

const DEFAULT_SETTINGS = {
  showStyleFilters: true,
  showBudgetFilters: true,
  showSaveButton: true,
  showLikeCount: false,
}

const DEFAULT_SEO = {
  metaTitle: 'Interior Design Ideas for Every Room | Houznext Design Gallery Hyderabad',
  metaDescription:
    'Explore 500+ interior design ideas for living rooms, kitchens, bedrooms and more from real Houznext homes in Hyderabad. Filter by style, room and budget.',
  ogImage: '',
}

const STYLE_PILLS = [
  'all',
  'Modern minimalist',
  'Contemporary',
  'Classic',
  'Japandi',
  'Industrial',
  'Luxury',
  'Minimalist',
] as const

function stableLikeCount(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i += 1) h = (h + id.charCodeAt(i) * (i + 1)) % 200
  return h + 20
}

export async function getStaticProps() {
  const cms = await getCmsContent('design_ideas_page')
  return { props: { cms: cms ?? null }, revalidate: 60 }
}

function DesignCardItem({
  card,
  saved,
  showSaveBtn,
  showLikes,
  onClick,
  onSave,
}: {
  card: DesignCard
  saved: boolean
  showSaveBtn: boolean
  showLikes: boolean
  onClick: () => void
  onSave: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const heights = [175, 205, 185, 165, 195, 175, 210, 180]
  const h = heights[card.id.charCodeAt(0) % heights.length]
  const likeN = stableLikeCount(card.id)

  return (
    <div
      className="bg-white border-[1.5px] border-[#dde8f5] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-250"
      style={{
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 36px rgba(15,42,68,0.10)' : 'none',
        borderColor: hovered ? '#93c5fd' : '#dde8f5',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative overflow-hidden"
        style={{
          height: h,
          background: card.imageUrl
            ? undefined
            : 'linear-gradient(135deg, #e8f1fd, #dde8f5)',
        }}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
        role="button"
        tabIndex={0}
      >
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: hovered ? 'scale(1.04)' : 'scale(1)' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span className="text-[10px] text-[#94a3b8] font-semibold">Photo coming soon</span>
          </div>
        )}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 pointer-events-none"
          style={{ background: 'rgba(15,42,68,0.50)', opacity: hovered ? 1 : 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <span className="text-[12px] font-bold text-white">View design</span>
        </div>
        {showSaveBtn && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSave() }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
            style={{ background: 'rgba(255,255,255,0.92)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill={saved ? '#dc2626' : 'none'} stroke={saved ? '#dc2626' : '#5a6a7e'} strokeWidth="1.8" strokeLinecap="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        )}
      </div>
      <div className="px-3 pb-3 pt-2.5" onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }} role="button" tabIndex={0}>
        <div
          className="text-[13px] font-bold text-[#1f2933] mb-1 leading-[1.35]"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {card.title}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10.5px] font-semibold text-[#5a6a7e] bg-[#f5f7fa] px-2 py-0.5 rounded-full">{card.style}</span>
          {showLikes && (
            <span className="flex items-center gap-1 text-[11px] text-[#5a6a7e]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              {likeN}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function DesignDetailPanel({
  card,
  saved,
  rooms,
  allCards,
  onClose,
  onSave,
  onOpenCard,
  onOpenModal,
}: {
  card: DesignCard
  saved: boolean
  rooms: Room[]
  allCards: DesignCard[]
  onClose: () => void
  onSave: () => void
  onOpenCard: (c: DesignCard) => void
  onOpenModal: () => void
}) {
  const router = useRouter()
  const related = allCards.filter((c) => c.room === card.room && c.id !== card.id).slice(0, 6)
  const roomCards = allCards.filter((c) => c.room === card.room)
  const idx = roomCards.findIndex((c) => c.id === card.id)
  const prevCard = idx > 0 ? roomCards[idx - 1] : null
  const nextCard = idx < roomCards.length - 1 ? roomCards[idx + 1] : null

  return (
    <>
      <div
        className="fixed inset-0 bg-[rgba(10,20,35,0.85)] z-[9998] transition-opacity"
        onClick={onClose}
        role="presentation"
      />
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto py-5 px-4"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="bg-[#f5f7fa] rounded-2xl w-full max-w-[1100px] overflow-hidden"
          style={{ marginTop: '20px', animation: 'slideUp 0.25s ease' }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#0f2a44] px-6 py-3">
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <span className="cursor-pointer hover:text-white" onClick={onClose}>Design ideas</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
              <span className="cursor-pointer hover:text-white" onClick={onClose}>
                {rooms.find((r) => r.slug === card.room)?.label ?? card.room}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
              <span style={{ color: 'rgba(255,255,255,0.75)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {card.title}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-8 p-6 items-start">
            <div>
              <div
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#e8f1fd] to-[#c5d9f5]"
                style={{ aspectRatio: '4/3' }}
              >
                {card.imageUrl ? (
                  <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-[13px] text-[#94a3b8] font-semibold">Design photo</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={onSave}
                    className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? '#dc2626' : 'none'} stroke={saved ? '#dc2626' : '#5a6a7e'} strokeWidth="1.8" strokeLinecap="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        void navigator.clipboard.writeText(window.location.href)
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a6a7e" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[rgba(15,42,68,0.7)] flex items-center justify-center text-white hover:bg-[rgba(15,42,68,0.9)] transition-all text-lg font-bold"
                >
                  ×
                </button>
              </div>
              <div className="flex gap-3 mt-3">
                {prevCard ? (
                  <div
                    className="flex-1 flex items-center gap-2.5 bg-white border border-[#dde8f5] rounded-xl p-2.5 cursor-pointer hover:border-[#2f80ed] hover:bg-[#e8f1fd] transition-all"
                    onClick={() => onOpenCard(prevCard)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenCard(prevCard) }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="w-14 h-11 rounded-lg bg-gradient-to-br from-[#e8f1fd] to-[#dde8f5] flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {prevCard.imageUrl && <img src={prevCard.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-[#5a6a7e] uppercase tracking-wider mb-0.5">← Previous</div>
                      <div className="text-[12px] font-bold text-[#1f2933] line-clamp-2 leading-[1.3]">{prevCard.title}</div>
                    </div>
                  </div>
                ) : <div className="flex-1" />}
                {nextCard ? (
                  <div
                    className="flex-1 flex items-center gap-2.5 bg-white border border-[#dde8f5] rounded-xl p-2.5 cursor-pointer hover:border-[#2f80ed] hover:bg-[#e8f1fd] transition-all"
                    onClick={() => onOpenCard(nextCard)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenCard(nextCard) }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex-1 text-right">
                      <div className="text-[10px] font-semibold text-[#5a6a7e] uppercase tracking-wider mb-0.5">Next →</div>
                      <div className="text-[12px] font-bold text-[#1f2933] line-clamp-2 leading-[1.3]">{nextCard.title}</div>
                    </div>
                    <div className="w-14 h-11 rounded-lg bg-gradient-to-br from-[#e8f1fd] to-[#dde8f5] flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {nextCard.imageUrl && <img src={nextCard.imageUrl} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                ) : <div className="flex-1" />}
              </div>
              {related.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-head font-bold text-[18px] text-[#1f2933] mb-4">Related designs</h3>
                  <div className="grid grid-cols-3 gap-3.5">
                    {related.map((r) => (
                      <div
                        key={r.id}
                        className="bg-white border border-[#dde8f5] rounded-xl overflow-hidden cursor-pointer transition-all duration-250 hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-lg"
                        onClick={() => onOpenCard(r)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenCard(r) }}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="h-[140px] bg-gradient-to-br from-[#e8f1fd] to-[#dde8f5] flex items-center justify-center overflow-hidden">
                          {r.imageUrl
                            ? <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover" />
                            : (
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            )}
                        </div>
                        <div className="p-2.5">
                          <div className="text-[12px] font-bold text-[#1f2933] line-clamp-2 leading-[1.35]">{r.title}</div>
                          <div className="text-[11px] text-[#5a6a7e] mt-1 line-clamp-2 leading-[1.4]">{r.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="sticky top-5 self-start max-h-[90vh] overflow-y-auto">
              <div className="bg-white border border-[#dde8f5] rounded-2xl overflow-hidden">
                <h2 className="font-head font-bold text-[18px] text-[#1f2933] px-5 pt-5 pb-1 leading-[1.3]">{card.title}</h2>
                <p className="text-[13px] text-[#5a6a7e] px-5 pb-4 pt-2 leading-[1.7] border-b border-[#dde8f5]">
                  {card.description}
                </p>
                <div className="px-5 py-4 border-b border-[#dde8f5]">
                  <div className="text-[11px] font-bold text-[#1f2933] uppercase tracking-wider mb-3">Design details</div>
                  {[
                    { label: 'Theme', value: card.style },
                    { label: 'Room', value: rooms.find((r) => r.slug === card.room)?.label ?? card.room },
                    { label: 'Package', value: card.package },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-2.5 mb-2.5">
                      <span className="text-[12px] text-[#5a6a7e] font-semibold min-w-[72px] pt-0.5">{label}</span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#e8f1fd] text-[#2f80ed]">
                          {value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-b border-[#dde8f5]">
                  <button
                    type="button"
                    onClick={onOpenModal}
                    className="w-full py-3 rounded-xl font-head font-bold text-white text-[14px] bg-[#2f80ed] hover:bg-[#1a6dd6] transition-all hover:-translate-y-px mb-2"
                  >
                    Book free consultation →
                  </button>
                  <a
                    href="https://wa.me/919759750770"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-head font-bold text-white text-[13px] bg-[#25D366] hover:bg-[#128C7E] transition-all no-underline"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9 9 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    Chat on WhatsApp
                  </a>
                </div>
                <div className="grid grid-cols-4 px-3 py-3">
                  {[
                    { val: '10 Year', lbl: 'Warranty' },
                    { val: '500+', lbl: 'Designs' },
                    { val: 'Easy', lbl: 'EMI' },
                    { val: '4.8★', lbl: 'Rating' },
                  ].map(({ val, lbl }, i) => (
                    <div key={lbl} className={`flex flex-col items-center text-center py-2 px-1 ${i < 3 ? 'border-r border-[#dde8f5]' : ''}`}>
                      <div className="w-8 h-8 rounded-lg bg-[#e8f1fd] flex items-center justify-center mb-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round">
                          {i === 0 && <path d="M12 22s-8-4.5-8-11V5l8-3 8 3v6c0 6.5-8 11-8 11z" />}
                          {i === 1 && <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>}
                          {i === 2 && <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>}
                          {i === 3 && <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />}
                        </svg>
                      </div>
                      <div className="text-[11px] font-bold text-[#1f2933]">{val}</div>
                      <div className="text-[9px] text-[#5a6a7e] leading-tight mt-0.5">{lbl}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-5 py-3 border-t border-[#dde8f5]">
                  <span className="text-[12px] font-semibold text-[#5a6a7e] mr-1">Share:</span>
                  <button
                    type="button"
                    onClick={() => { if (typeof window !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(window.location.href) }}
                    className="w-8 h-8 rounded-full border border-[#dde8f5] bg-white flex items-center justify-center hover:border-[#2f80ed] hover:bg-[#e8f1fd] transition-all"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5a6a7e" strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                  </button>
                  <a
                    href={typeof window !== 'undefined' ? `https://wa.me/?text=${encodeURIComponent(window.location.href)}` : 'https://wa.me/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full border border-[#86efac] bg-[#f0fdf4] flex items-center justify-center hover:bg-[#dcfce7] transition-all"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#16a34a">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a9 9 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-[#0f2a44] px-6 py-10 text-center">
            <h2 className="font-head font-bold text-[24px] md:text-[30px] text-white mb-3">
              Love this design? Get it in your home.
            </h2>
            <p className="text-[14px] text-white/65 mb-6 max-w-[460px] mx-auto leading-relaxed">
              Book a free 3D design consultation and we&apos;ll recreate this look in your exact space — fixed price, no surprises.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                type="button"
                onClick={onOpenModal}
                className="px-6 py-3 rounded-xl font-head font-bold text-white text-[14px] bg-[#2f80ed] hover:bg-[#1a6dd6] transition-all hover:-translate-y-0.5"
              >
                Book free consultation →
              </button>
              <button
                type="button"
                className="px-6 py-3 rounded-xl font-head font-bold text-white text-[14px] border border-white/30 hover:bg-white/10 transition-colors"
                onClick={() => { onClose(); void router.push('/pricing') }}
              >
                View pricing packages
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`@keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}
      </style>
    </>
  )
}

export default function DesignIdeasPage({ cms }: { cms: any }) {
  const router = useRouter()
  const { openModal } = useQuoteModal()
  const [activeTab, setActiveTab] = useState('living')
  const [activeStyle, setActiveStyle] = useState('all')
  const [activePkg, setActivePkg] = useState('all')
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [detailCard, setDetailCard] = useState<DesignCard | null>(null)

  const roomsResolved = useMemo((): Room[] => {
    const rawRooms: Room[] = Array.isArray(cms?.rooms) ? cms.rooms : []
    const sortedRooms = [...rawRooms]
      .filter((r) => r.visible !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder)
    if (sortedRooms.length) return sortedRooms
    return [
      { slug: 'living', label: 'Living room', iconUrl: '', sortOrder: 1, visible: true, action: 'tab', actionValue: 'living' },
      { slug: 'kitchen', label: 'Kitchen', iconUrl: '', sortOrder: 2, visible: true, action: 'tab', actionValue: 'kitchen' },
      { slug: 'bedroom', label: 'Bedroom', iconUrl: '', sortOrder: 3, visible: true, action: 'tab', actionValue: 'bedroom' },
    ]
  }, [cms])

  const allCards: DesignCard[] = (cms?.cards ?? []).filter((c: DesignCard) => c.status === 'published')
  const header = cms?.header ?? DEFAULT_HEADER
  const settings = { ...DEFAULT_SETTINGS, ...(cms?.settings ?? {}) }
  const seo = { ...DEFAULT_SEO, ...(cms?.seo ?? {}) }

  useEffect(() => {
    if (!router.isReady) return
    const tab = typeof router.query.tab === 'string' ? router.query.tab : ''
    if (tab && roomsResolved.some((r) => r.slug === tab)) {
      setActiveTab(tab)
    }
  }, [router.isReady, router.query.tab, roomsResolved])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hz_saved_designs')
      if (stored) {
        const arr = JSON.parse(stored) as { id: string }[]
        setSavedIds(new Set(arr.map((x) => x.id)))
      }
    } catch { /* ignore */ }
  }, [])

  const persistSaved = useCallback((items: { id: string; title: string; imageUrl: string; room: string; style: string }[]) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('hz_saved_designs', JSON.stringify(items))
  }, [])

  const toggleSave = useCallback((card: DesignCard) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      let list: { id: string; title: string; imageUrl: string; room: string; style: string }[] = []
      try {
        list = JSON.parse(
          typeof window !== 'undefined' ? (localStorage.getItem('hz_saved_designs') || '[]') : '[]',
        ) as { id: string; title: string; imageUrl: string; room: string; style: string }[]
      } catch {
        list = []
      }
      if (next.has(card.id)) {
        next.delete(card.id)
        persistSaved(list.filter((x) => x.id !== card.id))
      } else {
        next.add(card.id)
        const row = {
          id: card.id,
          title: card.title,
          imageUrl: card.imageUrl,
          room: card.room,
          style: card.style,
        }
        persistSaved([...list.filter((x) => x.id !== card.id), row])
      }
      return next
    })
  }, [persistSaved])

  const tabCards = allCards.filter((c) => {
    if (c.room !== activeTab) return false
    if (activeStyle !== 'all' && c.style !== activeStyle) return false
    if (activePkg !== 'all' && c.package !== activePkg) return false
    return true
  })

  function handleCardClick(card: DesignCard) {
    if (card.onclick === 'detail' || card.onclick === 'modal') {
      setDetailCard(card)
    } else if (card.onclick === 'cta') {
      openModal('Design ideas — card CTA')
    } else if (card.onclick === 'url' && card.onclickValue) {
      void router.push(card.onclickValue)
    }
  }

  return (
    <>
      <SeoHead
        title={seo.metaTitle}
        description={seo.metaDescription}
        canonical="/design-ideas"
        ogImage={seo.ogImage || 'https://houznext.com/og-default.jpg'}
      />
      <Navbar />
      <main>
        <div style={{ background: '#0f2a44' }}>
          <div className="max-w-[1100px] mx-auto px-6 pt-9 pb-0">
            <EyebrowLabel className="mb-2.5">{header.eyebrow}</EyebrowLabel>
            <h1 className="font-head font-black text-[32px] md:text-[42px] leading-[1.1] text-white mb-2.5">
              {header.heading}
            </h1>
            <p className="text-[14px] leading-relaxed mb-6 max-w-[520px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {header.subheading}
            </p>
            <div
              className="flex gap-0 overflow-x-auto -mx-1 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {roomsResolved.map((room) => (
                <button
                  key={room.slug}
                  type="button"
                  onClick={() => {
                    setActiveTab(room.slug)
                    setActiveStyle('all')
                    setActivePkg('all')
                    void router.replace(`/design-ideas?tab=${room.slug}`, undefined, { shallow: true })
                  }}
                  className={`
                    flex items-center gap-1.5 px-5 py-3 text-[13px] font-semibold whitespace-nowrap
                    border-none outline-none bg-transparent cursor-pointer flex-shrink-0
                    border-b-[3px] transition-all duration-200
                    ${activeTab === room.slug
                      ? 'text-white border-b-[#2f80ed]'
                      : 'border-b-transparent hover:text-white hover:border-b-white/30'
                    }
                  `}
                  style={{ color: activeTab === room.slug ? '#fff' : 'rgba(255,255,255,0.55)' }}
                >
                  {room.iconUrl && (
                    <img src={room.iconUrl} alt="" width={14} height={14} className="object-contain opacity-80" />
                  )}
                  {room.label}
                </button>
              ))}
            </div>
            <style>
              {`.scrollbar-hide::-webkit-scrollbar { display: none; }`}
            </style>
          </div>
        </div>

        {(settings.showStyleFilters || settings.showBudgetFilters) && (
          <div
            className="bg-white border-b border-[#dde8f5]"
            style={{ position: 'sticky', top: 0, zIndex: 50 }}
          >
            <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center gap-2 flex-wrap">
              {settings.showStyleFilters && (
                <>
                  <span className="text-[11px] font-bold text-[#1f2933] mr-1">Style:</span>
                  {STYLE_PILLS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActiveStyle(s)}
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold border-[1.5px] transition-all duration-150 ${
                        activeStyle === s
                          ? 'bg-[#2f80ed] text-white border-[#2f80ed]'
                          : 'bg-white text-[#5a6a7e] border-[#dde8f5] hover:border-[#2f80ed] hover:text-[#2f80ed] hover:bg-[#e8f1fd]'
                      }`}
                    >
                      {s === 'all' ? 'All styles' : s}
                    </button>
                  ))}
                  <div className="w-px h-5 bg-[#dde8f5] mx-1" />
                </>
              )}
              {settings.showBudgetFilters && (
                <>
                  {['Essential', 'Premium', 'Luxury'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setActivePkg(activePkg === p ? 'all' : p)}
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold border-[1.5px] transition-all duration-150 ${
                        activePkg === p
                          ? 'bg-[#2f80ed] text-white border-[#2f80ed]'
                          : 'bg-white text-[#5a6a7e] border-[#dde8f5] hover:border-[#2f80ed] hover:text-[#2f80ed] hover:bg-[#e8f1fd]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </>
              )}
              <select
                className="ml-auto border border-[#dde8f5] rounded-lg px-3 py-1.5 text-[12px] text-[#1f2933] outline-none cursor-pointer bg-white"
                defaultValue="saved"
                aria-label="Sort designs"
              >
                <option value="saved">Most saved</option>
                <option value="latest">Latest</option>
                <option value="budget">Budget low–high</option>
              </select>
            </div>
          </div>
        )}

        <div className="max-w-[1100px] mx-auto px-6 py-5 pb-14 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[14px] font-bold text-[#1f2933]">
              {tabCards.length}
              {' '}
              <span className="font-normal text-[#5a6a7e]">
                {roomsResolved.find((r) => r.slug === activeTab)?.label ?? activeTab} designs
              </span>
            </div>
            <button
              type="button"
              onClick={() => openModal('Design ideas — filter bar CTA')}
              className="px-4 py-2 rounded-lg bg-[#2f80ed] text-white text-[12px] font-bold hover:bg-[#1a6dd6] transition-all hover:-translate-y-px"
            >
              Get free 3D design →
            </button>
          </div>

          {tabCards.length === 0 ? (
            <div className="text-center py-20 text-[#5a6a7e]">
              <div className="text-[40px] mb-3">🎨</div>
              <p className="font-head font-bold text-[16px] text-[#1f2933] mb-2">No designs yet</p>
              <p className="text-[13px]">Check back soon — new designs are added regularly.</p>
            </div>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {tabCards.map((card) => (
                <DesignCardItem
                  key={card.id}
                  card={card}
                  saved={savedIds.has(card.id)}
                  showSaveBtn={settings.showSaveButton}
                  showLikes={settings.showLikeCount}
                  onClick={() => handleCardClick(card)}
                  onSave={() => toggleSave(card)}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <button
              type="button"
              className="px-7 py-2.5 rounded-lg border-2 border-[#2f80ed] text-[#2f80ed] text-[13px] font-bold hover:bg-[#2f80ed] hover:text-white transition-all duration-200"
            >
              Load more designs
            </button>
          </div>
        </div>

        {detailCard && (
          <DesignDetailPanel
            card={detailCard}
            saved={savedIds.has(detailCard.id)}
            rooms={roomsResolved}
            allCards={allCards}
            onClose={() => setDetailCard(null)}
            onSave={() => toggleSave(detailCard)}
            onOpenCard={(c) => setDetailCard(c)}
            onOpenModal={() => {
              openModal('Design ideas — detail panel')
            }}
          />
        )}
      </main>
      <Footer />
    </>
  )
}
