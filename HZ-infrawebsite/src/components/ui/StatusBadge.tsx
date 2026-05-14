import type { ConstructionStatus } from '@/types/property.types';

const STATUS: Record<
  string,
  { bg: string; text: string }
> = {
  'Ready to Move': { bg: '#ccfbf1', text: '#0f766e' },
  'Under Construction': { bg: '#fef3c7', text: '#92400e' },
  'New Launch': { bg: '#e8f1fd', text: '#1e40af' },
};

type Props = { status: ConstructionStatus | string; className?: string };

export function StatusBadge({ status, className = '' }: Props) {
  const s = STATUS[status] || { bg: '#f1f5f9', text: '#475569' };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-montserrat text-[10px] font-bold uppercase tracking-wide ${className}`}
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}
