import React from 'react'

import ProjectCard from './ProjectCard'
import { DerivedProject } from './types'

interface MasonryGridProps {
  projects: DerivedProject[]
  onCardClick: (p: DerivedProject) => void
}

export default function MasonryGrid({ projects, onCardClick }: MasonryGridProps) {
  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', color: '#5a6a7e' }}>
        <svg
          width="56"
          height="56"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dde8f5"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: '0 auto 16px', display: 'block' }}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <h3
          className="font-head font-bold"
          style={{ fontSize: 18, color: '#1f2933', marginBottom: 8 }}
        >
          No projects found
        </h3>
        <p style={{ fontSize: 14 }}>Try adjusting the filters above.</p>
      </div>
    )
  }

  return (
    <div
      style={{
        columns: '4 260px',
        gap: 16,
        marginBottom: 48,
      }}
    >
      {projects.map((p) => (
        <div key={p.id} style={{ breakInside: 'avoid', marginBottom: 0 }}>
          <ProjectCard project={p} onClick={() => onCardClick(p)} />
        </div>
      ))}
    </div>
  )
}
