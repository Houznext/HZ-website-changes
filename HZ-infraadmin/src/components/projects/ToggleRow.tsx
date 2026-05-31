'use client';

type Props = {
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
};

export function ToggleRow({ label, sub, checked, onChange }: Props) {
  return (
    <div className="tgl-row">
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ch)' }}>{label}</div>
        {sub ? <div className="tgl-sub">{sub}</div> : null}
      </div>
      <label className="tgl">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
        <span className="tgl-track">
          <span className="tgl-thumb" />
        </span>
      </label>
    </div>
  );
}
