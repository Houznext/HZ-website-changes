import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useQuoteModal } from '@/components/QuoteModal'

import { DerivedProject } from './types'

interface ProjectModalProps {
  project: DerivedProject | null
  onClose: () => void
}

const IconX = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconChevronLeft = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const IconChevronRight = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const IconPin = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const IconShare = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)
const IconImg = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(255,255,255,0.2)"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const IcoHome = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
)
const IcoMapPin = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const IcoClock = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IcoCard = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
)
const IcoStar = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const IcoRuler = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.3 8.7l-8-8a1 1 0 00-1.4 0l-9.2 9.2a1 1 0 000 1.4l8 8a1 1 0 001.4 0l9.2-9.2a1 1 0 000-1.4z" />
    <path d="M7.5 10.5l2-2M10.5 13.5l2-2M13.5 10.5l2-2" />
  </svg>
)
const IcoShield = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s-8-4.5-8-11V5l8-3 8 3v6c0 6.5-8 11-8 11z" />
  </svg>
)
const IcoCheck = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11l3 3L22 4" />
  </svg>
)
const IcoSmile = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2f80ed"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
)
const IcoWA = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const ROOM_EMOJIS: Record<string, string> = {
  'Living room': '🛋',
  Kitchen: '🍳',
  'Master bedroom': '🛏',
  Bedroom: '🛏',
  Bathroom: '🚿',
  Foyer: '🚪',
  'Home office': '📚',
  Balcony: '🌿',
  'Pooja room': '🕯',
  Dining: '🪑',
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { openModal } = useQuoteModal()
  const [currentImg, setCurrentImg] = useState(0)
  const [fullscreenImg, setFullscreenImg] = useState<number | null>(null)
  const [storyExpanded, setStoryExpanded] = useState(false)
  const [beforeAfter, setBeforeAfter] = useState<'after' | 'before'>('after')
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const photos = project?.photoUrls ?? []
  const totalPhotos = Math.max(photos.length, 1)

  useEffect(() => {
    if (project) {
      setCurrentImg(0)
      setFullscreenImg(null)
      setStoryExpanded(false)
      setBeforeAfter('after')
      document.body.style.overflow = 'hidden'
      const t = window.setTimeout(() => closeRef.current?.focus(), 100)
      return () => {
        window.clearTimeout(t)
        document.body.style.overflow = ''
      }
    }
    document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [project])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!project) return
      if (e.key === 'Escape') {
        if (fullscreenImg !== null) {
          setFullscreenImg(null)
          return
        }
        onClose()
        return
      }
      if (e.key === 'ArrowLeft') {
        setCurrentImg((i) => (i - 1 + totalPhotos) % totalPhotos)
      }
      if (e.key === 'ArrowRight') {
        setCurrentImg((i) => (i + 1) % totalPhotos)
      }
    },
    [project, onClose, totalPhotos, fullscreenImg],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (!project || !modalRef.current) return
    const root = modalRef.current
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el.getClientRects().length > 0,
      )
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onTab)
    return () => document.removeEventListener('keydown', onTab)
  }, [project])

  if (!project) return null

  const prevImg = () => setCurrentImg((i) => (i - 1 + totalPhotos) % totalPhotos)
  const nextImg = () => setCurrentImg((i) => (i + 1) % totalPhotos)
  const goImg = (idx: number) => setCurrentImg(idx)
  const openFullscreen = (idx: number) => setFullscreenImg(idx)
  const closeFullscreen = () => setFullscreenImg(null)

  const ratingDisplay =
    project.customerRating != null ? String(project.customerRating) : '5.0'

  const handleShare = () => {
    const path =
      typeof window !== 'undefined' ? `${window.location.origin}/projects?project=${project.id}` : ''
    if (path && navigator.share) {
      void navigator
        .share({ title: project.displayName, url: path })
        .catch(() => undefined)
    } else if (path && typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(path).catch(() => undefined)
    }
  }

  const currentPhotoUrl = photos[currentImg] ?? ''

  const ROOMS = project.trades.filter((t) => t.template?.name).slice(0, 10)

  const TRUST: {
    icon: React.ReactNode
    val: string
    sub: string
  }[] = [
    { icon: <IcoShield />, val: '10yr warranty', sub: 'All workmanship' },
    { icon: <IcoCheck />, val: 'Fixed price', sub: 'Zero overruns' },
    { icon: <IcoClock />, val: project.daysLabel, sub: 'On-time delivery' },
    { icon: <IcoSmile />, val: `${ratingDisplay}★`, sub: 'By homeowner' },
  ]

  const DETAILS: {
    icon: React.ReactNode
    label: string
    val: string
    green?: boolean
  }[] = [
    {
      icon: <IcoHome />,
      label: 'Property type',
      val: [project.bhk, project.propertyType].filter(Boolean).join(' ') || '—',
    },
    { icon: <IcoMapPin />, label: 'Location', val: project.locationFull || '—' },
    { icon: <IcoClock />, label: 'Delivered in', val: project.daysLabel, green: true },
    { icon: <IcoCard />, label: 'Package', val: project.packageLabel || '—' },
    { icon: <IcoStar />, label: 'Style', val: project.styleLabel || '—' },
    { icon: <IcoRuler />, label: 'Area', val: project.areaLabel || '—' },
  ]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,20,35,0.88)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '24px 16px',
        overflowY: 'auto',
        animation: 'hzBgIn 0.25s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="presentation"
    >
      <style>{`
        @keyframes hzBgIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes hzMIn   { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
        .hz-project-modal-body {
          display: grid;
          grid-template-columns: minmax(0,1fr) 300px;
        }
        @media (max-width: 700px) {
          .hz-project-modal-body { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Project: ${project.displayName}`}
        style={{
          background: '#fff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 960,
          overflow: 'hidden',
          position: 'relative',
          margin: 'auto',
          animation: 'hzMIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}
        tabIndex={-1}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 10,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.28)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'
          }}
        >
          <IconX />
        </button>

        <div style={{ background: '#0f2a44', position: 'relative' }}>
          <div
            style={{
              width: '100%',
              height: 420,
              position: 'relative',
              overflow: 'hidden',
              background: currentPhotoUrl
                ? `url('${currentPhotoUrl}') center/cover no-repeat`
                : 'linear-gradient(135deg,#1a3a5c,#0d2337)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            role={currentPhotoUrl ? 'button' : undefined}
            tabIndex={currentPhotoUrl ? 0 : -1}
            onClick={() => {
              if (currentPhotoUrl) openFullscreen(currentImg)
            }}
            onKeyDown={(e) => {
              if (!currentPhotoUrl) return
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                openFullscreen(currentImg)
              }
            }}
          >
            {!currentPhotoUrl && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  zIndex: 1,
                }}
              >
                <IconImg />
                <span
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.3)',
                    fontWeight: 600,
                  }}
                >
                  Project photos
                </span>
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15,42,68,0.7)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 20,
                backdropFilter: 'blur(4px)',
                zIndex: 2,
              }}
            >
              {currentImg + 1} / {totalPhotos}
            </div>

            {totalPhotos > 1 && (
              <button
                type="button"
                onClick={prevImg}
                aria-label="Previous photo"
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  zIndex: 5,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.15)'
                }}
              >
                <IconChevronLeft />
              </button>
            )}

            {totalPhotos > 1 && (
              <button
                type="button"
                onClick={nextImg}
                aria-label="Next photo"
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  border: '1.5px solid rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  zIndex: 5,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(255,255,255,0.15)'
                }}
              >
                <IconChevronRight />
              </button>
            )}
          </div>

          {totalPhotos > 1 && (
            <div
              style={{
                display: 'flex',
                gap: 6,
                padding: '8px 14px',
                background: 'rgba(15,42,68,0.8)',
                overflowX: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {Array.from({ length: totalPhotos }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    goImg(i)
                    if (photos[i]) openFullscreen(i)
                  }}
                  aria-label={`Photo ${i + 1}`}
                  style={{
                    width: 56,
                    height: 42,
                    borderRadius: 6,
                    flexShrink: 0,
                    cursor: 'pointer',
                    border: `2px solid ${i === currentImg ? '#2f80ed' : 'transparent'}`,
                    transition: 'border-color 0.18s',
                    overflow: 'hidden',
                    background: photos[i]
                      ? `url('${photos[i]}') center/cover no-repeat`
                      : 'linear-gradient(135deg,#1a3a5c,#0d2337)',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!photos[i] && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hz-project-modal-body">
          <div
            style={{
              padding: 24,
              borderRight: '0.5px solid #dde8f5',
              overflowY: 'auto',
              maxHeight: 480,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: '#f2994a',
                marginBottom: 6,
              }}
            >
              {[project.bhk, project.packageLabel, 'Package'].filter(Boolean).join(' · ')}
            </div>

            <h2
              className="font-head font-black"
              style={{ fontSize: 22, color: '#1f2933', marginBottom: 5, lineHeight: 1.2 }}
            >
              {project.displayName}
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 13,
                color: '#5a6a7e',
                marginBottom: 16,
              }}
            >
              <IconPin /> {project.locationFull}
              {project.deliveredMonth ? ` · Delivered ${project.deliveredMonth}` : null}
            </div>

            <div
              style={{
                display: 'flex',
                background: '#f5f7fa',
                borderRadius: 8,
                padding: 3,
                gap: 2,
                marginBottom: 14,
                width: 'fit-content',
              }}
            >
              {(['after', 'before'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setBeforeAfter(mode)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: beforeAfter === mode ? '#1f2933' : '#5a6a7e',
                    background: beforeAfter === mode ? '#fff' : 'transparent',
                    boxShadow: beforeAfter === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <p
              style={
                {
                  fontSize: 14,
                  color: '#5a6a7e',
                  lineHeight: 1.75,
                  marginBottom: 0,
                  display: storyExpanded ? 'block' : '-webkit-box',
                  WebkitLineClamp: storyExpanded ? undefined : 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: storyExpanded ? 'visible' : 'hidden',
                } as React.CSSProperties
              }
            >
              {project.projectStory ||
                'A beautifully transformed home delivered by the Houznext team with fixed pricing, photorealistic 3D designs, and daily LiveBuild site updates.'}
            </p>
            <button
              type="button"
              onClick={() => setStoryExpanded((v) => !v)}
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#2f80ed',
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                display: 'block',
                marginTop: 6,
                fontFamily: 'inherit',
              }}
            >
              {storyExpanded ? 'Read less ↑' : 'Read more →'}
            </button>

            <div style={{ height: 0.5, background: '#dde8f5', margin: '16px 0' }} />

            {ROOMS.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1f2933',
                    marginBottom: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                  }}
                >
                  Rooms completed
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    marginBottom: 20,
                  }}
                >
                  {ROOMS.map((t) => {
                    const name = t.template?.name ?? ''
                    const emoji = ROOM_EMOJIS[name] ?? '🏠'
                    return (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          background: '#f5f7fa',
                          border: '0.5px solid #dde8f5',
                          borderRadius: 9,
                          padding: '8px 11px',
                          fontSize: 12,
                          color: '#1f2933',
                          fontWeight: 600,
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            background: '#e8f1fd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {emoji}
                        </div>
                        <span>{name}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {project.customerTestimonial && (
              <div
                style={{
                  background: '#f5f7fa',
                  borderLeft: '3px solid #2f80ed',
                  borderRadius: '0 10px 10px 0',
                  padding: '13px 15px',
                }}
              >
                <p
                  style={{
                    fontSize: 13,
                    color: '#1f2933',
                    lineHeight: 1.65,
                    fontStyle: 'italic',
                    marginBottom: 8,
                  }}
                >
                  &ldquo;{project.customerTestimonial}&rdquo;
                </p>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1f2933' }}>
                  {project.customerName ?? 'Homeowner'}{' '}
                  <span style={{ fontWeight: 400, color: '#5a6a7e' }}>
                    — {project.locationFull}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              overflowY: 'auto',
              maxHeight: 480,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DETAILS.map((d) => (
                <div
                  key={d.label}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: '#e8f1fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {d.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#5a6a7e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: 2,
                      }}
                    >
                      {d.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: d.green ? '#16a34a' : '#1f2933',
                      }}
                    >
                      {d.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ height: 0.5, background: '#dde8f5' }} />

            {project.rep && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#5a6a7e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 8,
                  }}
                >
                  Designed by
                </div>
                <div
                  style={{
                    background: '#f5f7fa',
                    border: '0.5px solid #dde8f5',
                    borderRadius: 12,
                    padding: 13,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      background: '#e8f1fd',
                      border: '2px solid #dde8f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#2f80ed',
                      flexShrink: 0,
                    }}
                  >
                    {project.designerInitials}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2933' }}>
                      {project.rep.fullName}
                    </div>
                    <div style={{ fontSize: 11, color: '#5a6a7e' }}>Interior Designer</div>
                    {project.rep.city && (
                      <div
                        style={{ fontSize: 10.5, color: '#5a6a7e', fontWeight: 600 }}
                      >
                        {project.rep.city}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 7,
              }}
            >
              {TRUST.map((t) => (
                <div
                  key={t.val}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    background: '#f5f7fa',
                    borderRadius: 8,
                    padding: '7px 9px',
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: '#e8f1fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {t.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#1f2933',
                        lineHeight: 1.3,
                      }}
                    >
                      {t.val}
                    </div>
                    <div style={{ fontSize: 9.5, color: '#5a6a7e' }}>{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => openModal('Portfolio project — similar design CTA')}
                className="font-head font-bold"
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 10,
                  background: '#2f80ed',
                  color: '#fff',
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget
                  b.style.background = '#1a6dd6'
                  b.style.transform = 'translateY(-1px)'
                  b.style.boxShadow = '0 5px 16px rgba(47,128,237,0.35)'
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget
                  b.style.background = '#2f80ed'
                  b.style.transform = 'translateY(0)'
                  b.style.boxShadow = 'none'
                }}
              >
                Get a similar design →
              </button>

              <a
                href="https://wa.me/919759750770?text=Hi+Houznext+I+want+a+free+consultation"
                target="_blank"
                rel="noopener noreferrer"
                className="font-head font-bold"
                style={{
                  width: '100%',
                  padding: 11,
                  borderRadius: 10,
                  background: '#25D366',
                  color: '#fff',
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 7,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#128C7E'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = '#25D366'
                }}
              >
                <IcoWA /> Chat with designer on WhatsApp
              </a>

              <button
                type="button"
                onClick={onClose}
                className="font-head font-bold"
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 10,
                  background: 'transparent',
                  color: '#2f80ed',
                  fontSize: 13,
                  border: '1.5px solid #2f80ed',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#e8f1fd'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                View more projects
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#5a6a7e', fontWeight: 600 }}>Share:</span>
              <button
                type="button"
                onClick={handleShare}
                aria-label="Copy link or share"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: '1.5px solid #dde8f5',
                  background: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#1f2933',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget
                  b.style.borderColor = '#2f80ed'
                  b.style.background = '#e8f1fd'
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget
                  b.style.borderColor = '#dde8f5'
                  b.style.background = '#fff'
                }}
              >
                <IconShare />
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Check out this beautiful ${project.displayName} home by Houznext: ${
                    typeof window !== 'undefined' ? window.location.origin : ''
                  }/projects?project=${project.id}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  border: '1.5px solid #86efac',
                  background: '#f0fdf4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#16a34a',
                  textDecoration: 'none',
                }}
                aria-label="Share on WhatsApp"
              >
                <IcoWA />
              </a>
            </div>
          </div>
        </div>

        {fullscreenImg !== null && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10020,
              background: 'rgba(8,15,28,0.96)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeFullscreen()
            }}
            role="presentation"
          >
            <button
              type="button"
              onClick={closeFullscreen}
              aria-label="Close full image"
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconX />
            </button>

            {totalPhotos > 1 && (
              <button
                type="button"
                onClick={prevImg}
                aria-label="Previous full image"
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <IconChevronLeft />
              </button>
            )}

            <img
              src={photos[fullscreenImg] ?? ''}
              alt={`${project.displayName} full view`}
              style={{
                maxWidth: '95vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: 10,
              }}
            />

            {totalPhotos > 1 && (
              <button
                type="button"
                onClick={nextImg}
                aria-label="Next full image"
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <IconChevronRight />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
