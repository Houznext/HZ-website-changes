import { useEffect } from 'react'

export interface HeroSuccessModalProps {
  name: string
  onClose: () => void
  onViewPricing: () => void
}

export default function HeroSuccessModal({ name, onClose, onViewPricing }: HeroSuccessModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="animate-hz-modal-bg"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
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
          background: 'rgba(6,16,30,0.97)',
          border: '1px solid rgba(47,128,237,0.32)',
          borderRadius: 20,
          padding: '40px 40px',
          width: '100%',
          maxWidth: 580,
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)',
            fontSize: 16,
            lineHeight: 1,
            transition: 'background 0.18s, color 0.18s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.background = 'rgba(255,255,255,0.14)'
            el.style.color = '#fff'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.background = 'rgba(255,255,255,0.07)'
            el.style.color = 'rgba(255,255,255,0.45)'
          }}
        >
          ×
        </button>

        <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 20px' }}>
          <div
            className="animate-hz-ring"
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: '50%',
              border: '1.5px solid rgba(47,128,237,0.22)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'rgba(47,128,237,0.1)',
              border: '2px solid rgba(47,128,237,0.3)',
            }}
          />
          <div
            className="animate-hz-check-pop"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#2f80ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 11l5 5 9-9" />
              </svg>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            marginBottom: 14,
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.25)',
            fontSize: 10.5,
            fontWeight: 700,
            color: '#4ade80',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ade80',
              display: 'inline-block',
              animation: 'hz-ring-pulse 1.8s ease-in-out infinite',
            }}
          />
          Enquiry received
        </div>

        <p
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: '#fff',
            marginBottom: 8,
            letterSpacing: '-0.3px',
            lineHeight: 1.2,
            fontFamily: 'inherit',
          }}
        >
          We&apos;ve got your{' '}
          <span style={{ color: '#2f80ed' }}>
            details{name ? `, ${name.split(' ')[0]}` : ''}!
          </span>
        </p>

        <p
          style={{
            fontSize: 13.5,
            color: 'rgba(255,255,255,0.52)',
            lineHeight: 1.65,
            marginBottom: 24,
            maxWidth: 460,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Our interior design expert will reach out within{' '}
          <strong style={{ color: 'rgba(255,255,255,0.78)' }}>2 hours</strong>. We&apos;ll walk you through packages, pricing, and a free 3D design
          preview.
        </p>

        <div
          style={{
            display: 'flex',
            gap: 0,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: 20,
          }}
        >
          {[
            { num: '<2hr', label: 'First callback' },
            { num: 'Free', label: '3D design' },
            { num: 'Fixed', label: 'Price quote' },
          ].map((s, i, arr) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                padding: '12px 10px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.03)',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <p style={{ fontSize: 16, fontWeight: 900, color: '#2f80ed', marginBottom: 2 }}>{s.num}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 24,
            textAlign: 'left',
            padding: '14px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {[
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M7 1v4l2.5 1.5" />
                  <circle cx="7" cy="7" r="5.5" />
                </svg>
              ),
              bg: 'rgba(47,128,237,0.15)',
              title: 'Expert calls you',
              sub: 'Within 2 hours on your number',
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#f2994a" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="1" y="2" width="12" height="10" rx="2" />
                  <path d="M1 5h12" />
                </svg>
              ),
              bg: 'rgba(242,153,74,0.15)',
              title: 'Free site visit scheduled',
              sub: 'At your convenience, zero cost',
            },
            {
              icon: (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 7l4 4 6-6" />
                </svg>
              ),
              bg: 'rgba(74,222,128,0.12)',
              title: 'Fixed price quote delivered',
              sub: 'No surprises, no hidden charges',
            },
          ].map((step) => (
            <div key={step.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: step.bg,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {step.icon}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 1 }}>{step.title}</p>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)' }}>{step.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onViewPricing}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: '#2f80ed',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = '#1a6dd6'
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 8px 22px rgba(47,128,237,0.45)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = '#2f80ed'
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = 'none'
            }}
          >
            View Pricing Packages →
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.65)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.18s, border-color 0.18s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.07)'
              el.style.borderColor = 'rgba(255,255,255,0.3)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = 'transparent'
              el.style.borderColor = 'rgba(255,255,255,0.15)'
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
