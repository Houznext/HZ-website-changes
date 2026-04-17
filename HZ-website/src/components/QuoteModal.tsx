import { useState, useCallback, useEffect, createContext, useContext } from 'react'
import FreeConsultationHeroModal from '@/components/HeroConsultation/FreeConsultationHeroModal'

const DEFAULT_SOURCE_LINE =
  'Form type: Free consultation | Source: Website CTA.'

interface QuoteModalContextValue {
  open: boolean
  /** Optional short hint for `tellUsMore` (e.g. page name). Omit or use bare `onClick={openModal}` for generic CTA. */
  openModal: (sourceHint?: string) => void
  closeModal: () => void
}

const QuoteModalContext = createContext<QuoteModalContextValue>({
  open: false,
  openModal: () => undefined,
  closeModal: () => undefined,
})

export function QuoteModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [tellUsMoreSourceLine, setTellUsMoreSourceLine] = useState(DEFAULT_SOURCE_LINE)

  const openModal = useCallback((sourceHint?: unknown) => {
    if (typeof sourceHint === 'string' && sourceHint.trim()) {
      setTellUsMoreSourceLine(
        `Form type: Free consultation | Source: ${sourceHint.trim()}`
      )
    } else {
      setTellUsMoreSourceLine(DEFAULT_SOURCE_LINE)
    }
    setOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setOpen(false)
    setTellUsMoreSourceLine(DEFAULT_SOURCE_LINE)
  }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <QuoteModalContext.Provider value={{ open, openModal, closeModal }}>
      {children}
      {open && (
        <FreeConsultationHeroModal
          open={open}
          onClose={closeModal}
          tellUsMoreSourceLine={tellUsMoreSourceLine}
        />
      )}
    </QuoteModalContext.Provider>
  )
}

export function useQuoteModal() {
  return useContext(QuoteModalContext)
}
