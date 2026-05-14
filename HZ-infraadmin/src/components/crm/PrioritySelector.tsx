import clsx from 'clsx';

export function PrioritySelector({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (p: 'hot' | 'warm' | 'cold') => void;
  disabled?: boolean;
}) {
  const opts: { id: 'hot' | 'warm' | 'cold'; label: string; active: string }[] = [
    { id: 'hot', label: '🔥 Hot', active: 'ring-2 ring-red-400 bg-red-50 border-red-300' },
    { id: 'warm', label: '🟡 Warm', active: 'ring-2 ring-amber-400 bg-amber-50 border-amber-300' },
    { id: 'cold', label: '🔵 Cold', active: 'ring-2 ring-blue-400 bg-blue-50 border-blue-300' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={clsx(
            'rounded-full border px-3 py-1.5 font-montserrat text-[11px] font-bold transition',
            value === o.id ? o.active : 'border-[#e2e8f0] bg-white text-[#5a6a7e] hover:border-[#93c5fd]',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
