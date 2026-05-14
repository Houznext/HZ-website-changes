'use client';

const stroke = { stroke: 'currentColor', strokeWidth: 1.8, fill: 'none' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export function PropertyTypeIcon({ type }: { type: string }) {
  const s = { width: 14, height: 14, viewBox: '0 0 24 24' as const };
  switch (type) {
    case 'Apartment':
      return (
        <svg {...s} {...stroke}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case 'Villa':
      return (
        <svg {...s} {...stroke}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <line x1="6" y1="7" x2="18" y2="7" />
        </svg>
      );
    case 'Land':
      return (
        <svg {...s} {...stroke}>
          <rect x="3" y="3" width="18" height="14" rx="2" />
          <line x1="3" y1="20" x2="21" y2="20" />
        </svg>
      );
    case 'Plot':
      return (
        <svg {...s} {...stroke}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="2" y1="20" x2="22" y2="20" />
        </svg>
      );
    case 'Row House':
      return (
        <svg {...s} {...stroke}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <line x1="8" y1="21" x2="8" y2="14" />
          <line x1="16" y1="21" x2="16" y2="14" />
        </svg>
      );
    case 'Commercial':
      return (
        <svg {...s} {...stroke}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
        </svg>
      );
    case 'Studio':
      return (
        <svg {...s} {...stroke}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <line x1="9" y1="4" x2="9" y2="20" />
        </svg>
      );
    case 'Farmhouse':
      return (
        <svg {...s} {...stroke}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <path d="M9 14a5 5 0 006 0" />
        </svg>
      );
    default:
      return (
        <svg {...s} {...stroke}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      );
  }
}
