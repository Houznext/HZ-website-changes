import React from 'react'

import { DerivedProject } from './types'

const PKG_BADGE: Record<string, { bg: string; text: string }> = {
  Essential: { bg: '#dcfce7', text: '#166534' },
  Premium: { bg: '#dbeafe', text: '#1e40af' },
  Luxury: { bg: '#f3e8ff', text: '#6b21a8' },
}

interface LegacyProjectListItemProps {
  project: DerivedProject
  onClick: () => void
}

export default function LegacyProjectListItem({
  project,
  onClick,
}: LegacyProjectListItemProps) {
  const cover = project.photoUrls?.[0] ?? ''
  const topLeft = [project.bhk, project.areaLabel].filter(Boolean).join(' · ')
  const pkg = project.packageLabel || 'Premium'
  const pkgStyle = PKG_BADGE[pkg] ?? PKG_BADGE.Premium

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full text-left flex-col sm:flex-row gap-4 rounded-2xl border border-slate-200/90 bg-white p-3 sm:items-stretch shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden"
    >
      <div className="relative w-full sm:w-[240px] shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[160px] rounded-xl overflow-hidden bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs">
            No photo
          </div>
        )}
        {topLeft && (
          <span className="absolute top-2.5 left-2.5 max-w-[200px] truncate rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 border border-slate-200/80">
            {topLeft}
          </span>
        )}
        <span
          className="absolute top-2.5 right-2.5 rounded-md px-2 py-0.5 text-[9px] font-bold border border-white/30"
          style={{ background: pkgStyle.bg, color: pkgStyle.text }}
        >
          {pkg}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-1">
        <h3
          className="font-head font-bold text-slate-900 line-clamp-2"
          style={{ fontSize: 16 }}
        >
          {project.displayName}
        </h3>
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{project.locationFull}</p>
        <p className="mt-2 text-xs text-slate-400">
          {[project.styleLabel, project.daysLabel].filter((x) => x && x !== '—').join(' · ')}
        </p>
        <span className="mt-3 text-xs font-bold text-[#2f80ed]">View details →</span>
      </div>
    </button>
  )
}
