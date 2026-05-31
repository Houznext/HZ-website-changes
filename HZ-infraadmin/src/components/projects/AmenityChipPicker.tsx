'use client';

type Props = {
  options: string[];
  selected: string[];
  onChange: (items: string[]) => void;
};

export function AmenityChipPicker({ options, selected, onChange }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
      {options.map((item) => {
        const sel = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            className={`am-chip${sel ? ' sel' : ''}`}
            onClick={() => onChange(sel ? selected.filter((a) => a !== item) : [...selected, item])}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
