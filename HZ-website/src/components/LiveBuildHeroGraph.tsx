import { useEffect, useState } from 'react'

const BUILDLIVE_ROOMS = [
  { label: 'Living room', pct: 90, color: '#2f80ed' },
  { label: 'Kitchen', pct: 100, color: '#4ade80' },
  { label: 'Master bed', pct: 65, color: '#f2994a' },
  { label: 'Bedroom 2', pct: 55, color: '#a78bfa' },
]

const OVERALL_PCT = 76

const BUILDLIVE_TIMELINE = [
  { label: 'Civil & flooring', date: 'Feb 2', status: 'done' as const },
  { label: 'Electrical fit-out', date: 'Feb 18', status: 'done' as const },
  { label: 'Furniture & finishing', date: 'Mar 14', status: 'active' as const },
  { label: 'Handover', date: 'Mar 28', status: 'upcoming' as const },
]

interface DonutProps {
  pct: number
  color: string
  size?: number
  strokeWidth?: number
  animate?: boolean
}

function DonutChart({ pct, color, size = 40, strokeWidth = 5, animate = false }: DonutProps) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const targetOffset = circ * (1 - pct / 100)
  const [offset, setOffset] = useState(circ)

  useEffect(() => {
    if (!animate) {
      setOffset(targetOffset)
      return
    }
    const t = setTimeout(() => setOffset(targetOffset), 350)
    return () => clearTimeout(t)
  }, [targetOffset, animate])

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: animate ? 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}
      />
    </svg>
  )
}

function useCountUpOnce(target: number, duration = 1700): number {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf = 0
    let cancelled = false
    const t0 = performance.now()
    const tick = (now: number) => {
      if (cancelled) return
      const p = Math.min((now - t0) / duration, 1)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [target, duration])
  return val
}

type LiveBuildHeroGraphProps = {
  /** Extra Tailwind classes on the outer glass card (e.g. max width, margins). */
  className?: string
}

/**
 * LiveBuild “graph” preview: overall donut, per-room donuts, timeline — same as homepage hero.
 */
export default function LiveBuildHeroGraph({ className = '' }: LiveBuildHeroGraphProps) {
  const overallCount = useCountUpOnce(OVERALL_PCT)

  return (
    <div
      className={`rounded-[18px] p-3 w-full min-w-0 ${className}`.trim()}
      style={{
        background: 'rgba(6,16,30,0.86)',
        border: '1px solid rgba(47,128,237,0.30)',
        backdropFilter: 'blur(18px)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full animate-pulse-dot flex-shrink-0" style={{ background: '#f2994a' }} />
          <span className="text-[10px] font-extrabold uppercase tracking-[0.1em]" style={{ color: '#f2994a' }}>
            LiveBuild
          </span>
        </div>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: 'rgba(74,222,128,0.14)',
            color: '#4ade80',
            border: '1px solid rgba(74,222,128,0.24)',
          }}
        >
          LIVE
        </span>
      </div>

      <div className="mb-2">
        <p className="text-[12px] font-bold text-white leading-tight">Ravi&apos;s Home</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.42)' }}>
          3BHK · Kondapur, Hyderabad
        </p>
      </div>

      <div
        className="flex items-center gap-2 mb-2 p-2 rounded-lg min-w-0"
        style={{ background: 'rgba(47,128,237,0.08)', border: '1px solid rgba(47,128,237,0.18)' }}
      >
        <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
          <DonutChart pct={OVERALL_PCT} color="#2f80ed" size={52} strokeWidth={5} animate />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-black text-[12px]"
              style={{ color: '#2f80ed' }}
              suppressHydrationWarning
            >
              {overallCount}%
            </span>
            <span className="text-[7px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
              overall
            </span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-white mb-0.5">Site progress</p>
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.42)' }}>
            Est. finish: Mar 28
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {BUILDLIVE_ROOMS.map((room) => (
          <div
            key={room.label}
            className="flex items-center gap-1.5 rounded-lg p-2 transition-all duration-200 cursor-default min-w-0"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.08)'
              el.style.borderColor = 'rgba(255,255,255,0.14)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget
              el.style.background = 'rgba(255,255,255,0.04)'
              el.style.borderColor = 'rgba(255,255,255,0.07)'
            }}
          >
            <div className="relative flex-shrink-0" style={{ width: 34, height: 34 }}>
              <DonutChart pct={room.pct} color={room.color} size={34} strokeWidth={4} animate />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-extrabold"
                  style={{ fontSize: room.pct === 100 ? 11 : 8.5, color: room.color }}
                >
                  {room.pct === 100 ? '✓' : room.pct}
                </span>
              </div>
            </div>
            <div className="min-w-0">
              <p className="font-[600] truncate" style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>
                {room.label}
              </p>
              <p className="font-black mt-0.5" style={{ fontSize: 11, color: room.color }}>
                {room.pct}%
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {BUILDLIVE_TIMELINE.map((tl) => (
          <div key={tl.label} className="flex items-center gap-2 min-w-0">
            <span
              className="flex-shrink-0 rounded-full"
              style={{
                width: 7,
                height: 7,
                background:
                  tl.status === 'done' ? '#4ade80' : tl.status === 'active' ? '#2f80ed' : 'transparent',
                border:
                  tl.status === 'done'
                    ? '1.5px solid #4ade80'
                    : tl.status === 'active'
                      ? '1.5px solid #2f80ed'
                      : '1.5px solid rgba(255,255,255,0.18)',
              }}
            />
            <span
              className="text-[10px] truncate min-w-0"
              style={{
                color:
                  tl.status === 'done'
                    ? 'rgba(74,222,128,0.75)'
                    : tl.status === 'active'
                      ? 'rgba(255,255,255,0.88)'
                      : 'rgba(255,255,255,0.45)',
                fontWeight: tl.status === 'active' ? 600 : 400,
              }}
            >
              {tl.label}
            </span>
            <span className="text-[9.5px] ml-auto flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {tl.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
