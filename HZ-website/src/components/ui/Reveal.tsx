import React, { useEffect, useRef, useState } from 'react'

export type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'fade'

interface RevealProps {
  children: React.ReactNode
  /** Animation direction. Defaults to 'up' */
  variant?: RevealVariant
  /** Delay before animation starts, in ms */
  delay?: number
  /** Animation duration in ms. Defaults to 650 */
  duration?: number
  /** IntersectionObserver threshold. Defaults to 0.1 */
  threshold?: number
  /** Extra classes forwarded to the wrapper div */
  className?: string
  style?: React.CSSProperties
}

const HIDDEN: Record<RevealVariant, string> = {
  up:    'opacity-0 translate-y-8',
  down:  'opacity-0 -translate-y-6',
  left:  'opacity-0 translate-x-8',
  right: 'opacity-0 -translate-x-8',
  zoom:  'opacity-0 scale-95',
  fade:  'opacity-0',
}

const SHOWN: Record<RevealVariant, string> = {
  up:    'opacity-100 translate-y-0',
  down:  'opacity-100 translate-y-0',
  left:  'opacity-100 translate-x-0',
  right: 'opacity-100 translate-x-0',
  zoom:  'opacity-100 scale-100',
  fade:  'opacity-100',
}

export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  duration = 650,
  threshold = 0.1,
  className = '',
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={`${shown ? SHOWN[variant] : HIDDEN[variant]} ${className}`}
      style={{
        transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
