import { useEffect, useRef, useState, type CSSProperties } from 'react'

export const HERO_CITIES = [
  'Hyderabad',
  'Warangal',
  'Karimnagar',
  'Nizamabad',
  'Khammam',
  'Ramagundam',
  'Mahbubnagar',
  'Nalgonda',
  'Adilabad',
  'Suryapet',
  'Miryalaguda',
  'Siddipet',
  'Jagtial',
  'Mancherial',
  'Other',
]

interface HeroCityDropdownProps {
  value: string
  onChange: (city: string) => void
}

export default function HeroCityDropdown({ value, onChange }: HeroCityDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = search.trim()
    ? HERO_CITIES.filter((c) => c.toLowerCase().includes(search.toLowerCase().trim()))
    : HERO_CITIES

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function openDropdown() {
    setOpen(true)
    setSearch('')
    setTimeout(() => searchRef.current?.focus(), 60)
  }

  function selectCity(city: string) {
    onChange(city)
    setOpen(false)
    setSearch('')
  }

  const triggerStyle: CSSProperties = {
    width: '100%',
    padding: '10px 13px',
    borderRadius: open ? '9px 9px 0 0' : 9,
    border: `1px solid ${open ? 'rgba(47,128,237,0.7)' : 'rgba(255,255,255,0.12)'}`,
    background: open ? 'rgba(47,128,237,0.08)' : 'rgba(255,255,255,0.055)',
    color: value ? '#fff' : 'rgba(255,255,255,0.28)',
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'border-color 0.18s, background 0.18s',
    outline: 'none',
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', marginBottom: 8 }}>
      <button
        type="button"
        style={triggerStyle}
        onClick={() => {
          if (open) {
            setOpen(false)
            setSearch('')
          } else {
            openDropdown()
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: 'rgba(47,128,237,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2f80ed" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 1C4.3 1 3 2.3 3 4c0 2.5 3 6 3 6s3-3.5 3-6c0-1.7-1.3-3-3-3z" />
              <circle cx="6" cy="4" r="1" />
            </svg>
          </span>
          <span style={{ fontSize: 13 }}>{value || 'Select your city'}</span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.22s', flexShrink: 0 }}
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div
          className="animate-hz-city-in"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 999,
            background: 'rgba(6,18,34,0.98)',
            border: '1px solid rgba(47,128,237,0.35)',
            borderTop: '1px solid rgba(47,128,237,0.18)',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              padding: '10px 10px 8px',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="5.5" cy="5.5" r="4" />
              <path d="M11 11l-2.5-2.5" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 12.5,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ maxHeight: 132, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: '12px 14px',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.35)',
                  textAlign: 'center',
                }}
              >
                No cities found
              </div>
            ) : (
              filtered.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => selectCity(city)}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    background: city === value ? 'rgba(47,128,237,0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'background 0.14s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    if (city !== value) e.currentTarget.style.background = 'rgba(47,128,237,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    if (city !== value) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: city === value ? '#2f80ed' : 'rgba(255,255,255,0.2)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      flex: 1,
                      color: city === value ? '#2f80ed' : 'rgba(255,255,255,0.65)',
                      fontWeight: city === value ? 600 : 400,
                    }}
                  >
                    {city}
                  </span>
                  {city === value && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#2f80ed" strokeWidth="2" strokeLinecap="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
