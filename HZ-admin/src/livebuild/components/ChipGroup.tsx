type Props = {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  variant?: 'chip' | 'wt';
};

export function ChipGroup({ options, selected, onChange, variant = 'chip' }: Props) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((x) => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 5 }}>
      {options.map((opt) => {
        const on = selected.includes(opt);
        const cls = variant === 'wt' ? `lb-wt-chip ${on ? 'on' : ''}` : `lb-chip ${on ? 'sel' : ''}`;
        return (
          <button key={opt} type="button" className={cls} onClick={() => toggle(opt)}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}
