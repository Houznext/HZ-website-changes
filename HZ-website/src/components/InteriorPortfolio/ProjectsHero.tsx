import React from 'react'

import Reveal from '@/components/ui/Reveal'

interface ProjectsHeroProps {
  /** Number of live projects currently listed on the page (fallback). */
  listedCount: number
  /** Admin-configured total from Projects CMS (takes precedence). */
  displayTotal?: number | null
}

export default function ProjectsHero({ listedCount, displayTotal }: ProjectsHeroProps) {
  const metricCount =
    displayTotal != null && displayTotal >= 0
      ? displayTotal
      : listedCount > 0
        ? listedCount
        : 0

  const projectsStat = metricCount > 0 ? `${metricCount}+` : '15+'

  const subtitle =
    metricCount > 0
      ? `${metricCount} completed interior project${metricCount === 1 ? '' : 's'} across Telangana. Every space designed, built, and delivered on time — fixed price, no surprises.`
      : '15+ completed interior projects across Telangana. Every space designed, built, and delivered on time — fixed price, no surprises.'

  const STATS = [
    { value: projectsStat, label: 'Projects delivered' },
    { value: '45d', label: 'Avg. delivery' },
    { value: '4.8★', label: 'Customer rating' },
    { value: '8+', label: 'Cities served' },
  ]

  return (
    <section
      className="relative overflow-hidden text-center"
      style={{ background: '#0f2a44', padding: '56px 24px 52px' }}
    >
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: 3,
          background: 'linear-gradient(90deg, #2f80ed, #f2994a, #2f80ed)',
        }}
      />

      <Reveal variant="fade">
        <h1
          className="font-head font-black leading-[1.1] text-white mx-auto"
          style={{
            fontSize: 'clamp(26px, 4vw, 44px)',
            marginBottom: 12,
            maxWidth: 720,
          }}
        >
          Homes we&apos;ve{' '}
          <span style={{ color: '#f2994a' }}>transformed</span>
        </h1>
        <p
          className="mx-auto"
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.62)',
            maxWidth: 540,
            lineHeight: 1.7,
            marginBottom: 28,
          }}
        >
          {subtitle}
        </p>
      </Reveal>

      <Reveal variant="up" delay={120}>
        <div
          className="flex flex-wrap justify-center"
          style={{ marginTop: 8, gap: 0 }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="text-center"
              style={{
                padding: '0 24px 8px',
                borderRight:
                  i < STATS.length - 1
                    ? '1px solid rgba(255,255,255,0.12)'
                    : 'none',
              }}
            >
              <div
                className="font-head font-black text-white"
                style={{ fontSize: 28 }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: 2,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
