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
  const opts: { id: 'hot' | 'warm' | 'cold'; label: string; on: string }[] = [
    { id: 'hot', label: '🔥 Hot', on: 'pri-pill--hot-on' },
    { id: 'warm', label: '🟡 Warm', on: 'pri-pill--warm-on' },
    { id: 'cold', label: '🔵 Cold', on: 'pri-pill--cold-on' },
  ];
  return (
    <div className="pri-pill-row">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.id)}
          className={clsx('pri-pill', value === o.id && o.on, disabled && 'opacity-50')}
          style={disabled ? { cursor: 'not-allowed' } : undefined}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
