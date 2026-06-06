import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { createPortal } from 'react-dom'
import type { GetServerSideProps } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SeoHead from '@/components/SeoHead'
import type { InteriorProject } from '@/types/interior-project'

function StrokeIcon({ path, stroke = '#64748b', size = 16 }: { path: string; stroke?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  )
}

function StylePlaceholder({ styleName }: { styleName?: string }) {
  const map: Record<string, string> = {
    Modern: '#dbeafe',
    'Warm / Scandi': '#fef3c7',
    Classic: '#f3e8ff',
    Bohemian: '#dcfce7',
    Industrial: '#f1f5f9',
    Luxury: '#fef9ee',
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: map[styleName || ''] || '#f0f7ff' }}>
      <StrokeIcon path="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" stroke="#2f80ed" size={30} />
      <p className="text-[12px] mt-2 font-[700]" style={{ color: '#0f2a44' }}>{styleName || 'Project image'}</p>
    </div>
  )
}

function ImgSlot({
  src,
  alt,
  styleName,
  onClick,
  overlayText,
}: {
  src?: string
  alt: string
  styleName?: string
  onClick?: () => void
  overlayText?: string
}) {
  return (
    <button onClick={onClick} className="group relative overflow-hidden w-full h-full text-left" style={{ cursor: 'pointer' }}>
      <div className="w-full h-full transition-transform duration-500 group-hover:scale-[1.06]">
        {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <StylePlaceholder styleName={styleName} />}
      </div>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100" style={{ transition: 'opacity .25s ease', background: 'rgba(15,42,68,.25)' }} />
      {overlayText && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(15,42,68,.55)' }}>
          <span className="text-white text-[18px] font-[900]">{overlayText}</span>
        </div>
      )}
    </button>
  )
}

type Props = { project: InteriorProject }

export default function ProjectDetailPage({ project }: Props) {
  const router = useRouter()
  const images = useMemo(
    () => (project.images || []).filter((u): u is string => typeof u === 'string' && u.trim().length > 0),
    [project.images],
  )
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const hasMultipleImages = images.length > 1

  const goToProjectsList = () => {
    void router.push('/projects')
  }

  const showPrevImage = () => {
    setSelectedImageIndex((prev) => {
      if (prev === null || images.length === 0) return prev
      return (prev - 1 + images.length) % images.length
    })
  }

  const showNextImage = () => {
    setSelectedImageIndex((prev) => {
      if (prev === null || images.length === 0) return prev
      return (prev + 1) % images.length
    })
  }

  const packageStyle = useMemo(() => {
    if (project.package === 'Luxury') return { background: '#fef3c7', color: '#92400e' }
    if (project.package === 'Premium') return { background: '#dbeafe', color: '#1e40af' }
    return { background: '#f0fdf4', color: '#166534' }
  }, [project.package])

  const openGalleryAt = (index: number) => {
    if (!images[index]) return
    setGalleryOpen(true)
    setSelectedImageIndex(index)
  }

  const openFullscreenAt = (index: number) => {
    if (!images[index]) return
    setSelectedImageIndex(index)
  }

  const currentImage = selectedImageIndex !== null ? images[selectedImageIndex] : null

  return (
    <>
      <SeoHead
        title={`${project.title} | Houznext Projects`}
        description={project.description || 'Interior project by Houznext'}
        canonical={`/projects/${project.id}`}
      />
      <Navbar />
      <main style={{ background: '#f8fafc', fontFamily: 'Inter,system-ui,sans-serif' }}>
        <style>{`
          @keyframes hz-fade-up {
            from { opacity: 0; transform: translateY(12px) }
            to { opacity: 1; transform: translateY(0) }
          }
        `}</style>
        <section style={{ background: '#0f2a44' }}>
          <div className="max-w-5xl mx-auto px-6 py-[14px] flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={goToProjectsList}
              className="flex items-center gap-1.5 text-[13px] font-[600]"
              style={{ color: 'rgba(255,255,255,.7)', background: 'transparent', border: 'none', transition: 'color .18s ease' }}
            >
              <StrokeIcon path="M15 18l-6-6 6-6" stroke="rgba(255,255,255,.7)" size={14} />
              Back
            </button>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,.4)' }}>
              Projects / <span style={{ color: 'rgba(255,255,255,.7)' }}>{project.title}</span>
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 pt-7" style={{ animation: 'hz-fade-up .4s ease' }}>
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div>
              <h1 className="text-[20px] md:text-[26px] font-[900] mb-1.5 leading-[1.2]" style={{ color: '#0f2a44' }}>{project.title}</h1>
              <div className="flex items-center gap-1.5 text-[13px]" style={{ color: '#64748b' }}>
                <StrokeIcon path="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#2f80ed" size={13} />
                {project.location}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-[5px] text-[12px] font-[700]" style={{ borderRadius: 20, ...packageStyle }}>{project.package}</span>
              <span className="flex items-center gap-1 text-[13px] font-[700]" style={{ color: '#92400e' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.2"><path d="M12 2l2.9 6.3 6.9.9-5 4.8 1.2 6.8L12 17.9 6 20.8l1.2-6.8-5-4.8 6.9-.9z"/></svg>
                {project.rating}
              </span>
            </div>
          </div>

          <div className="rounded-[14px] overflow-hidden mb-6 hidden md:grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '220px 170px', gap: 6 }}>
            <div style={{ gridColumn: '1/3', gridRow: '1/2' }}>
              <ImgSlot src={images[0]} alt={`${project.title} main`} styleName={project.style} onClick={() => openGalleryAt(0)} />
            </div>
            <div style={{ gridColumn: '3/4', gridRow: '1/2' }}>
              <ImgSlot src={images[1]} alt={`${project.title} 2`} styleName={project.style} onClick={() => openGalleryAt(1)} />
            </div>
            <div className="grid grid-cols-3 gap-[6px]" style={{ gridColumn: '1/4', gridRow: '2/3' }}>
              {[2, 3, 4].map((idx, i) => (
                <ImgSlot
                  key={idx}
                  src={images[idx]}
                  alt={`${project.title} ${idx + 1}`}
                  styleName={project.style}
                  onClick={() => openGalleryAt(idx)}
                  overlayText={i === 2 && images.length > 5 ? `+${images.length - 5} photos` : undefined}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[14px] overflow-hidden mb-6 hidden sm:grid md:hidden grid-cols-2 gap-[6px]">
            <div className="col-span-2 h-[200px]">
              <ImgSlot src={images[0]} alt={`${project.title} main`} styleName={project.style} onClick={() => openGalleryAt(0)} />
            </div>
            <div className="h-[140px]">
              <ImgSlot src={images[1]} alt={`${project.title} 2`} styleName={project.style} onClick={() => openGalleryAt(1)} />
            </div>
            <div className="h-[140px]">
              <ImgSlot
                src={images[2]}
                alt={`${project.title} 3`}
                styleName={project.style}
                onClick={() => openGalleryAt(2)}
                overlayText={images.length > 3 ? `+${images.length - 3} photos` : undefined}
              />
            </div>
          </div>

          <div className="rounded-[14px] overflow-hidden mb-6 grid sm:hidden gap-[6px]">
            <div className="h-[220px]">
              <ImgSlot src={images[0]} alt={`${project.title} main`} styleName={project.style} onClick={() => openGalleryAt(0)} />
            </div>
            <div className="grid grid-cols-2 gap-[6px]">
              <div className="h-[130px]">
                <ImgSlot src={images[1]} alt={`${project.title} 2`} styleName={project.style} onClick={() => openGalleryAt(1)} />
              </div>
              <div className="h-[130px]">
                <ImgSlot
                  src={images[2]}
                  alt={`${project.title} 3`}
                  styleName={project.style}
                  onClick={() => openGalleryAt(2)}
                  overlayText={images.length > 3 ? `+${images.length - 3} photos` : undefined}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ animation: 'hz-fade-up .4s ease' }}>
          {[
            ['Property', `${project.propertyType} · ${project.sqft} sqft`, '#0f2a44'],
            ['Total cost', `₹${project.costInLakhs}L`, '#2f80ed'],
            ['Delivered in', `${project.deliveryDays} days`, '#0f2a44'],
            ['Style', project.style, '#0f2a44'],
          ].map(([label, value, color]) => (
            <div key={label} className="bg-white px-4 py-3.5" style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, transition: 'all .2s ease' }}>
              <p className="text-[11px] font-[700] uppercase tracking-[.05em]" style={{ color: '#64748b' }}>{label}</p>
              <p className="text-[20px] font-[900]" style={{ color }}>{value}</p>
            </div>
          ))}
        </section>

        <section className="max-w-5xl mx-auto px-6 pb-8" style={{ animation: 'hz-fade-up .4s ease' }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div>
              <h3 className="text-[15px] font-[800] mb-3" style={{ color: '#0f2a44' }}>Rooms completed</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {(project.rooms || []).map((room) => (
                  <div key={room} className="flex items-center gap-2 px-3 py-2.5" style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 10, color: '#0f2a44', fontSize: 13, fontWeight: 600, transition: 'all .18s ease' }}>
                    <StrokeIcon path="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" stroke="#2f80ed" size={13} />
                    {room}
                  </div>
                ))}
              </div>

              <h3 className="text-[15px] font-[800] mt-4 mb-2" style={{ color: '#0f2a44' }}>About this project</h3>
              <p className="text-[14px] leading-[1.7] mb-5" style={{ color: '#64748b' }}>
                {project.description || 'A premium fixed-price interior project delivered by Houznext with transparent pricing and timeline-led execution.'}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {[project.propertyType, project.package, project.style, `${project.sqft} sqft`, `${project.deliveryDays} days`, 'Fixed price'].map((tag) => (
                  <span key={tag} className="text-[12px] font-[600] px-3 py-[5px]" style={{ color: '#0f2a44', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 20 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <aside className="h-fit sticky top-24" style={{ background: '#0f2a44', borderRadius: 16, padding: 22 }}>
              <h3 className="text-[16px] font-[900] text-white">Like this project?</h3>
              <p className="text-[12px] mt-1 mb-4" style={{ color: 'rgba(255,255,255,.5)' }}>Get a similar design for your home</p>
              <p className="text-[28px] font-[900] text-white">₹{project.costInLakhs}L</p>
              <p className="text-[12px] mb-4" style={{ color: '#f2994a' }}>Fixed price · No hidden costs</p>

              <button
                onClick={() => router.push('/interiors')}
                className="w-full mb-2 flex items-center justify-center gap-2 py-3 text-[14px] font-[700]"
                style={{ borderRadius: 10, background: '#2f80ed', color: '#fff', border: 'none', transition: 'all .2s ease', cursor: 'pointer' }}
              >
                <StrokeIcon path="M20 6L9 17l-5-5" stroke="#fff" size={14} />
                Get free estimate
              </button>

              <button
                onClick={() => window.open('https://wa.me/919759750770?text=Hi%20Houznext%2C%20I%20want%20a%20quote%20for%20a%20similar%20project', '_blank')}
                className="w-full flex items-center justify-center gap-2 py-3 text-[14px] font-[700]"
                style={{ borderRadius: 10, background: '#25D366', color: '#fff', border: 'none', transition: 'all .2s ease', cursor: 'pointer' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/></svg>
                Ask on WhatsApp
              </button>

              <div className="my-3.5" style={{ borderTop: '1px solid rgba(255,255,255,.1)' }} />
              <div className="flex flex-col gap-1.5 text-[12px]" style={{ color: 'rgba(255,255,255,.5)' }}>
                <p className="flex items-center gap-2"><StrokeIcon path="M12 3l7 4v5c0 5-3.4 9.7-7 11-3.6-1.3-7-6-7-11V7l7-4z" stroke="rgba(255,255,255,.6)" size={13} /> Fixed price guarantee</p>
                <p className="flex items-center gap-2"><StrokeIcon path="M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2" stroke="rgba(255,255,255,.6)" size={13} /> 45-day avg. delivery</p>
                <p className="flex items-center gap-2"><StrokeIcon path="M12 2l2.9 6.3 6.9.9-5 4.8 1.2 6.8L12 17.9 6 20.8l1.2-6.8-5-4.8 6.9-.9z" stroke="rgba(255,255,255,.6)" size={13} /> 4.8★ rated service</p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />

      {galleryOpen && typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5" style={{ background: 'rgba(10,20,35,.92)' }}>
            <div className="w-full max-w-[800px] bg-white overflow-y-auto" style={{ borderRadius: 20, maxHeight: '90vh' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#0f2a44', borderRadius: '20px 20px 0 0' }}>
                <p className="text-[15px] font-[700] text-white">{project.title} — All photos</p>
                <button
                  onClick={() => { setGalleryOpen(false); setSelectedImageIndex(null) }}
                  className="w-[34px] h-[34px] flex items-center justify-center"
                  style={{ borderRadius: 999, border: '2px solid rgba(255,255,255,.5)', background: 'rgba(255,255,255,.12)', color: '#fff' }}
                >
                  <StrokeIcon path="M6 6l12 12M18 6L6 18" stroke="#fff" size={16} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    className="overflow-hidden w-full text-left"
                    style={{
                      borderRadius: 12,
                      aspectRatio: '4/3',
                      transition: 'all .2s ease',
                      outline: selectedImageIndex === idx ? '3px solid #2f80ed' : 'none',
                    }}
                    onClick={() => openFullscreenAt(idx)}
                  >
                    <img src={img} alt={`${project.title} ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {selectedImageIndex !== null && currentImage && typeof window !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" style={{ background: 'rgba(8,15,28,.95)' }}>
            {hasMultipleImages && (
              <button
                type="button"
                onClick={showPrevImage}
                className="absolute left-3 sm:left-6 w-10 h-10 flex items-center justify-center rounded-full z-20"
                style={{ border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.1)' }}
                aria-label="Previous image"
              >
                <StrokeIcon path="M15 18l-6-6 6-6" stroke="#fff" size={18} />
              </button>
            )}
            <img src={currentImage} alt={`${project.title} fullscreen`} style={{ maxWidth: '92vw', maxHeight: '86vh', objectFit: 'contain', borderRadius: 12, position: 'relative', zIndex: 10 }} />
            {hasMultipleImages && (
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-3 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full z-20"
                style={{ border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.1)' }}
                aria-label="Next image"
              >
                <StrokeIcon path="M9 6l6 6-6 6" stroke="#fff" size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full z-20"
              style={{ border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.1)' }}
              aria-label="Close image viewer"
            >
              <StrokeIcon path="M6 6l12 12M18 6L6 18" stroke="#fff" size={18} />
            </button>
            {hasMultipleImages && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-[12px] font-[600] z-20" style={{ background: 'rgba(15,42,68,.75)', padding: '4px 12px', borderRadius: 20 }}>
                {selectedImageIndex + 1} / {images.length}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = params?.id
  const rawApi = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT || 'http://localhost:4000'
  const api = rawApi.endsWith('/') ? rawApi.slice(0, -1) : rawApi

  try {
    const res = await fetch(`${api}/interior-projects/public/${id}`)
    if (!res.ok) return { notFound: true }
    const project = (await res.json()) as InteriorProject
    return { props: { project } }
  } catch {
    return { notFound: true }
  }
}
