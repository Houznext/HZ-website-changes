import React from 'react'

import { DerivedProject } from './types'

const PKG_BADGE: Record<string, { bg: string; text: string }> = {
  Essential: { bg: '#dcfce7', text: '#166534' },
  Premium: { bg: '#dbeafe', text: '#1e40af' },
  Luxury: { bg: '#f3e8ff', text: '#6b21a8' },
}

interface LegacyProjectCardProps {
  project: DerivedProject
  onClick: () => void
}

export default function LegacyProjectCard({ project, onClick }: LegacyProjectCardProps) {
  const cover = project.photoUrls?.[0] ?? ''
  const topLeft = [project.bhk, project.areaLabel].filter(Boolean).join(' · ')
  const pkg = project.packageLabel || 'Premium'
  const pkgStyle = PKG_BADGE[pkg] ?? PKG_BADGE.Premium

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
            <span className="text-xs font-semibold">Project photo</span>
          </div>
        )}
        {topLeft && (
          <span className="absolute top-3 left-3 max-w-[min(100%-24px,220px)] truncate rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800 border border-slate-200/80">
            {topLeft}
          </span>
        )}
        <span
          className="absolute top-3 right-3 rounded-md px-2.5 py-1 text-[10px] font-bold border border-white/30"
          style={{ background: pkgStyle.bg, color: pkgStyle.text }}
        >
          {pkg}
        </span>
      </div>
      <div className="p-4">
        <h3
          className="font-head font-bold text-slate-900 line-clamp-2 leading-snug"
          style={{ fontSize: 15 }}
        >
          {project.displayName}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{project.locationFull}</p>
      </div>
    </button>
  )
}
