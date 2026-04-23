import React from 'react'

import { Grid3x3, List } from 'lucide-react'

import { SortOrder } from './types'

export type ProjectsLegacyFilter =
  | 'all'
  | '2bhk'
  | '3bhk'
  | 'villa4'
  | 'essential'
  | 'premium'
  | 'luxury'

const FILTER_OPTS: { value: ProjectsLegacyFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '2bhk', label: '2BHK' },
  { value: '3bhk', label: '3BHK' },
  { value: 'villa4', label: 'Villa / 4BHK+' },
  { value: 'essential', label: 'Essential' },
  { value: 'premium', label: 'Premium' },
  { value: 'luxury', label: 'Luxury' },
]

const pill = (active: boolean): React.CSSProperties => ({
  padding: '7px 14px',
  borderRadius: 999,
  fontSize: 12.5,
  fontWeight: 600,
  border: `1.5px solid ${active ? '#2f80ed' : '#e2e8f0'}`,
  background: active ? '#2f80ed' : '#fff',
  color: active ? '#fff' : '#475569',
  cursor: 'pointer',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
})

type ViewMode = 'grid' | 'list'

interface ProjectsLegacyToolbarProps {
  filter: ProjectsLegacyFilter
  sortOrder: SortOrder
  viewMode: ViewMode
  onFilter: (f: ProjectsLegacyFilter) => void
  onSort: (s: SortOrder) => void
  onViewMode: (v: ViewMode) => void
}

export default function ProjectsLegacyToolbar({
  filter,
  sortOrder,
  viewMode,
  onFilter,
  onSort,
  onViewMode,
}: ProjectsLegacyToolbarProps) {
  return (
    <div
      className="border-b border-slate-200/90 bg-white"
      style={{ position: 'sticky', top: 62, zIndex: 100 }}
    >
      <div
        className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6"
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <span
            className="font-head mr-0.5 shrink-0 text-[11px] font-bold text-slate-500"
            style={{ letterSpacing: '0.04em' }}
          >
            Filter:
          </span>
          {FILTER_OPTS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onFilter(o.value)}
              style={pill(filter === o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 md:pl-2">
          <label className="flex items-center gap-2 text-[12px] text-slate-600">
            <span className="hidden sm:inline">Sort</span>
            <select
              value={sortOrder}
              onChange={(e) => onSort(e.target.value as SortOrder)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="fastest">Fastest delivery</option>
            </select>
          </label>
          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => onViewMode('grid')}
              className={`grid h-9 w-9 place-items-center transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-100 text-[#2f80ed]'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => onViewMode('list')}
              className={`grid h-9 w-9 place-items-center border-l border-slate-200 transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-100 text-[#2f80ed]'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
