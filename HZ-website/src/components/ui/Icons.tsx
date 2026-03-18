import React from 'react'

export interface IconProps {
  size?: number
  stroke?: string
  fill?: string
  strokeWidth?: number
  className?: string
}

const defaults: Required<Omit<IconProps, 'className'>> = {
  size: 22,
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 1.6,
}

const base = (props: IconProps) => ({
  width: props.size ?? defaults.size,
  height: props.size ?? defaults.size,
  viewBox: '0 0 24 24',
  fill: props.fill ?? defaults.fill,
  stroke: props.stroke ?? defaults.stroke,
  strokeWidth: props.strokeWidth ?? defaults.strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: props.className,
})

// ─── Property / Home ─────────────────────────────────────────────────────────
export function IconHome(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

// ─── Star / Rating ────────────────────────────────────────────────────────────
export function IconStar(p: IconProps) {
  return (
    <svg {...base(p)}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

// ─── Clock / Delivery ─────────────────────────────────────────────────────────
export function IconClock(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9.5" />
      <polyline points="12,6.5 12,12 16,14.5" />
    </svg>
  )
}

// ─── Tag / Fixed Price ────────────────────────────────────────────────────────
export function IconTag(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth={2.5} />
    </svg>
  )
}

// ─── Map Pin / Cities ─────────────────────────────────────────────────────────
export function IconMapPin(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

// ─── Phone / Consultation ─────────────────────────────────────────────────────
export function IconPhone(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81a19.79 19.79 0 0 1-3.07-8.59 2 2 0 0 1 2-2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92v2z" />
    </svg>
  )
}

// ─── Layers / 3D Design ───────────────────────────────────────────────────────
export function IconLayers(p: IconProps) {
  return (
    <svg {...base(p)}>
      <polygon points="12,2 22,8.5 12,15 2,8.5" />
      <polyline points="2,12 12,18.5 22,12" />
      <polyline points="2,16 12,22.5 22,16" />
    </svg>
  )
}

// ─── Check Circle / Approval ──────────────────────────────────────────────────
export function IconCheckCircle(p: IconProps) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

// ─── Tool / Execution ─────────────────────────────────────────────────────────
export function IconTool(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

// ─── Shield / Warranty ────────────────────────────────────────────────────────
export function IconShield(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

// ─── Smartphone / BuildLive ───────────────────────────────────────────────────
export function IconSmartphone(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth={2.5} />
    </svg>
  )
}

// ─── Credit Card / EMI ────────────────────────────────────────────────────────
export function IconCreditCard(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
      <line x1="6" y1="15" x2="9" y2="15" />
      <line x1="12" y1="15" x2="15" y2="15" />
    </svg>
  )
}

// ─── Zap / Fast delivery ──────────────────────────────────────────────────────
export function IconZap(p: IconProps) {
  return (
    <svg {...base(p)}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
    </svg>
  )
}

// ─── Lock / Fixed price ───────────────────────────────────────────────────────
export function IconLock(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  )
}

// ─── Trophy / Rating ──────────────────────────────────────────────────────────
export function IconTrophy(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  )
}

// ─── Camera / Photos ──────────────────────────────────────────────────────────
export function IconCamera(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

// ─── Trending Up / Stats ──────────────────────────────────────────────────────
export function IconTrendingUp(p: IconProps) {
  return (
    <svg {...base(p)}>
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
      <polyline points="17,6 23,6 23,12" />
    </svg>
  )
}

// ─── Check / List item ────────────────────────────────────────────────────────
export function IconCheck(p: IconProps) {
  return (
    <svg {...base(p)}>
      <polyline points="20,6 9,17 4,12" />
    </svg>
  )
}

// ─── Message Circle / Chat ───────────────────────────────────────────────────
export function IconMessageCircle(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

// ─── Bug / Snag ───────────────────────────────────────────────────────────────
export function IconBug(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="8" y="6" width="8" height="14" rx="4" />
      <path d="M19 13h2M3 13h2M12 2v4M8 6l-2-2M16 6l2-2M6 16l-2 2M18 16l2 2M6 10l-2-2M18 10l2-2" />
    </svg>
  )
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
export function IconWhatsApp(p: IconProps) {
  return (
    <svg {...base(p)} viewBox="0 0 24 24" fill={p.fill ?? 'currentColor'} stroke="none">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ─── Animated icon container ──────────────────────────────────────────────────
// Wraps an icon with a colored container. On hover: bg fills to `color`, icon goes white.
interface AnimatedIconBoxProps {
  color?: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  hovered?: boolean
  className?: string
}

export function AnimatedIconBox({
  color = '#2f80ed',
  size = 'md',
  children,
  hovered = false,
  className = '',
}: AnimatedIconBoxProps) {
  const sizeMap = { sm: 'w-9 h-9', md: 'w-12 h-12', lg: 'w-14 h-14' }
  return (
    <div
      className={`${sizeMap[size]} rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${className}`}
      style={{
        background: hovered ? color : `${color}18`,
        color: hovered ? '#fff' : color,
        transform: hovered ? 'scale(1.1) rotate(-4deg)' : 'scale(1) rotate(0deg)',
        boxShadow: hovered ? `0 6px 20px ${color}40` : 'none',
      }}
    >
      {children}
    </div>
  )
}
