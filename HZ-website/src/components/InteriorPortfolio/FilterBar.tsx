import React from 'react'

import { FilterCity, FilterStyle, FilterType, SortOrder } from './types'

interface FilterBarProps {
  filterType: FilterType
  filterStyle: FilterStyle
  filterCity: FilterCity
  sortOrder: SortOrder
  cities: string[]
  styles: string[]
  onType: (v: FilterType) => void
  onStyle: (v: FilterStyle) => void
  onCity: (v: FilterCity) => void
  onSort: (v: SortOrder) => void
}

const TYPE_OPTS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '2bhk', label: '2BHK' },
  { value: '3bhk', label: '3BHK' },
  { value: 'villa', label: 'Villa' },
]

const pillStyle = (active: boolean): React.CSSProperties => ({
  padding: '6px 14px',
  borderRadius: 20,
  fontSize: 12.5,
  fontWeight: 600,
  border: `1.5px solid ${active ? '#2f80ed' : '#dde8f5'}`,
  background: active ? '#2f80ed' : '#fff',
  color: active ? '#fff' : '#5a6a7e',
  cursor: 'pointer',
  transition: 'all 0.15s',
  fontFamily: 'inherit',
  lineHeight: 1,
  whiteSpace: 'nowrap' as const,
})

const sepStyle: React.CSSProperties = {
  width: 1,
  height: 22,
  background: '#dde8f5',
  flexShrink: 0,
  margin: '0 4px',
}

export default function FilterBar({
  filterType,
  filterStyle,
  filterCity,
  sortOrder,
  cities,
  styles,
  onType,
  onStyle,
  onCity,
  onSort,
}: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      style={{
        background: '#fff',
        borderBottom: '1.5px solid #dde8f5',
        padding: '12px 32px',
        position: 'sticky',
        top: 62,
        zIndex: 100,
      }}
    >
      <div
        className="flex flex-wrap items-center gap-2 w-full"
        style={{ maxWidth: 1200, margin: '0 auto' }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#1f2933',
            marginRight: 2,
          }}
        >
          Type:
        </span>
        {TYPE_OPTS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onType(o.value)}
            style={pillStyle(filterType === o.value)}
          >
            {o.label}
          </button>
        ))}

        <div style={sepStyle} />

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#1f2933',
            marginRight: 2,
          }}
        >
          Style:
        </span>
        <button
          type="button"
          onClick={() => onStyle('all')}
          style={pillStyle(filterStyle === 'all')}
        >
          All
        </button>
        {styles.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStyle(s)}
            style={pillStyle(filterStyle === s)}
          >
            {s}
          </button>
        ))}

        <div style={sepStyle} />

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#1f2933',
            marginRight: 2,
          }}
        >
          City:
        </span>
        <button
          type="button"
          onClick={() => onCity('all')}
          style={pillStyle(filterCity === 'all')}
        >
          All
        </button>
        {cities.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onCity(c)}
            style={pillStyle(filterCity === c)}
          >
            {c}
          </button>
        ))}

        <select
          value={sortOrder}
          onChange={(e) => onSort(e.target.value as SortOrder)}
          style={{
            marginLeft: 'auto',
            padding: '7px 13px',
            border: '1.5px solid #dde8f5',
            borderRadius: 9,
            fontSize: 12.5,
            color: '#1f2933',
            outline: 'none',
            cursor: 'pointer',
            background: '#fff',
            fontFamily: 'inherit',
          }}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="fastest">Fastest delivery</option>
        </select>
      </div>
    </div>
  )
}
