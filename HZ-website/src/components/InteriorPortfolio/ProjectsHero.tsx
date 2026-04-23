import React from 'react'

import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Reveal from '@/components/ui/Reveal'

interface ProjectsHeroProps {
  totalCount: number
}

const STATS = [
  { value: '50+', label: 'Projects completed' },
  { value: '45d', label: 'Avg. delivery time' },
  { value: '4.8★', label: 'Average rating' },
  { value: '3+', label: 'Cities served' },
]

export default function ProjectsHero({ totalCount }: ProjectsHeroProps) {
  return (
    <section
      className="relative overflow-hidden text-center"
      style={{ background: '#0f2a44', padding: '64px 32px 60px' }}
      aria-label={`Our portfolio — ${totalCount} published projects`}
    >
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: 3,
          background: 'linear-gradient(90deg, #2f80ed, #f2994a, #2f80ed)',
        }}
      />

      <Reveal variant="fade">
        <EyebrowLabel className="justify-center mb-3">Our portfolio</EyebrowLabel>
        <h1
          className="font-head font-black leading-[1.08] text-white mx-auto"
          style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            marginBottom: 14,
            maxWidth: 640,
          }}
        >
          Real homes.{' '}
          <span style={{ color: '#2f80ed' }}>Real transformations.</span>
        </h1>
        <p
          className="mx-auto"
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.62)',
            maxWidth: 520,
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          Every project tells a story — from the first 3D design to the final
          handover. Browse completed homes delivered by Houznext across Telangana.
        </p>
      </Reveal>

      <Reveal variant="up" delay={150}>
        <div
          className="flex justify-center flex-wrap"
          style={{ marginTop: 36, gap: 0 }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="text-center"
              style={{
                padding: '0 32px',
                borderRight:
                  i < STATS.length - 1
                    ? '1px solid rgba(255,255,255,0.12)'
                    : 'none',
              }}
            >
              <div
                className="font-head font-black text-white"
                style={{ fontSize: 30 }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: 3,
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
