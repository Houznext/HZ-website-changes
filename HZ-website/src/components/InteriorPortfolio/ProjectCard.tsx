import React from 'react'

import { DerivedProject } from './types'

interface ProjectCardProps {
  project: DerivedProject
  onClick: () => void
}

const PKG_COLOURS: Record<string, { bg: string; color: string }> = {
  Essential: { bg: '#dcfce7', color: '#166534' },
  Premium: { bg: '#e8f1fd', color: '#1e40af' },
  Luxury: { bg: '#f3e8ff', color: '#6b21a8' },
}

const IconPin = () => (
  <svg
    width="11"
    height="11"
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

const IconSearch = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#fff"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const IconImg = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(255,255,255,0.25)"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const pkgColour = PKG_COLOURS[project.packageLabel] ?? PKG_COLOURS.Premium
  const hasPhoto = (project.photoUrls?.length ?? 0) > 0
  const firstPhoto = project.photoUrls?.[0] ?? ''

  return (
    <div
      className="group"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      style={{
        breakInside: 'avoid',
        marginBottom: 16,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1.5px solid #dde8f5',
        background: '#fff',
        transition: 'all 0.28s',
        display: 'block',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#93c5fd'
        el.style.transform = 'translateY(-5px) scale(1.005)'
        el.style.boxShadow = '0 16px 48px rgba(15,42,68,0.13)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = '#dde8f5'
        el.style.transform = 'translateY(0) scale(1)'
        el.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          height: project.cardHeight,
          position: 'relative',
          overflow: 'hidden',
          background: hasPhoto
            ? `url('${firstPhoto}') center/cover no-repeat`
            : 'linear-gradient(135deg,#e8f1fd,#dde8f5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {!hasPhoto && (
          <>
            <IconImg />
            <span
              style={{
                fontSize: 11,
                color: 'rgba(15,42,68,0.35)',
                fontWeight: 600,
              }}
            >
              Project photo
            </span>
          </>
        )}

        <div
          className="group-hover:opacity-100"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(0deg,rgba(15,42,68,0.88) 0%,rgba(15,42,68,0.1) 55%)',
            opacity: 0,
            transition: 'opacity 0.28s',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: 16,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              background: 'rgba(47,128,237,0.85)',
              padding: '6px 13px',
              borderRadius: 7,
              marginBottom: 8,
              backdropFilter: 'blur(4px)',
              width: 'fit-content',
            }}
          >
            <IconSearch /> View project
          </div>
          <div
            className="font-head font-bold text-white"
            style={{ fontSize: 14, lineHeight: 1.3, marginBottom: 3 }}
          >
            {project.displayName}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
            {project.locationFull}
          </div>
        </div>
      </div>

      <div style={{ padding: '13px 14px 15px' }}>
        <div
          className="font-head font-bold"
          style={{
            fontSize: 14,
            color: '#1f2933',
            marginBottom: 4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {project.displayName}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: '#5a6a7e',
            }}
          >
            <IconPin /> {project.locationFull}
          </div>
          <span
            style={{
              ...pkgColour,
              fontSize: 10.5,
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 20,
            }}
          >
            {project.packageLabel}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 5,
            flexWrap: 'wrap',
            marginBottom: 8,
          }}
        >
          {[project.bhk, project.styleLabel, project.areaLabel]
            .filter(Boolean)
            .map((tag) => (
              <span
                key={String(tag)}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 20,
                  background: '#f5f7fa',
                  color: '#5a6a7e',
                  border: '0.5px solid #dde8f5',
                }}
              >
                {tag}
              </span>
            ))}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '0.5px solid #dde8f5',
            paddingTop: 9,
            marginTop: 9,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#e8f1fd',
                border: '1.5px solid #dde8f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                fontWeight: 700,
                color: '#2f80ed',
                flexShrink: 0,
              }}
            >
              {project.designerInitials}
            </div>
            <span style={{ fontSize: 11, color: '#5a6a7e', fontWeight: 600 }}>
              {project.rep?.fullName ?? 'Houznext team'}
            </span>
          </div>
          {project.deliveredInDays != null && project.deliveredInDays > 0 && (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: '#166534',
                background: '#dcfce7',
                padding: '2px 8px',
                borderRadius: 20,
              }}
            >
              {project.deliveredInDays}d ✓
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
