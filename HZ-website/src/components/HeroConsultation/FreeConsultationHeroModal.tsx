import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { HERO_CONSULTATION_CSS } from './keyframes'
import HeroConsultationFormCard from './HeroConsultationFormCard'
import HeroSuccessModal from './HeroSuccessModal'

export interface FreeConsultationHeroModalProps {
  open: boolean
  onClose: () => void
  tellUsMoreSourceLine?: string
}

export default function FreeConsultationHeroModal({
  open,
  onClose,
  tellUsMoreSourceLine = 'Source: Our projects page CTA (email not collected on this form).',
}: FreeConsultationHeroModalProps) {
  const router = useRouter()
  const [successOpen, setSuccessOpen] = useState(false)
  const [submittedName, setSubmittedName] = useState('')

  useEffect(() => {
    if (!open) {
      setSuccessOpen(false)
      setSubmittedName('')
    }
  }, [open])

  useEffect(() => {
    if (!open || successOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, successOpen, onClose])

  if (!open) return null

  const handleFormSuccess = (name: string) => {
    setSubmittedName(name)
    setSuccessOpen(true)
  }

  const handleSuccessClose = () => {
    setSuccessOpen(false)
    onClose()
  }

  const handleViewPricing = () => {
    setSuccessOpen(false)
    onClose()
    void router.push('/pricing')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HERO_CONSULTATION_CSS }} />

      {!successOpen && (
        <div
          className="animate-hz-modal-bg"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(4,10,20,0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="animate-hz-modal-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 420,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(6,16,30,0.95)',
                border: '1px solid rgba(47,128,237,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.65)',
                fontSize: 18,
                lineHeight: 1,
                zIndex: 2,
                transition: 'background 0.18s, color 0.18s',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(47,128,237,0.25)'
                el.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = 'rgba(6,16,30,0.95)'
                el.style.color = 'rgba(255,255,255,0.65)'
              }}
            >
              ×
            </button>
            <HeroConsultationFormCard tellUsMoreSourceLine={tellUsMoreSourceLine} onSuccess={handleFormSuccess} />
          </div>
        </div>
      )}

      {successOpen && (
        <HeroSuccessModal
          name={submittedName}
          onClose={handleSuccessClose}
          onViewPricing={handleViewPricing}
        />
      )}
    </>
  )
}
