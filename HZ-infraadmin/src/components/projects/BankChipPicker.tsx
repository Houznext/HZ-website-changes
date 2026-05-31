'use client';

import { BANKS_GOV, BANKS_NBFC, BANKS_PRIVATE } from '@/lib/projects/constants';

type Props = {
  selected: string[];
  onChange: (banks: string[]) => void;
};

function toggle(list: string[], name: string) {
  return list.includes(name) ? list.filter((b) => b !== name) : [...list, name];
}

export function BankChipPicker({ selected, onChange }: Props) {
  const renderGroup = (title: string, banks: string[]) => (
    <div style={{ marginBottom: 12 }}>
      <div className="bank-group-lbl">{title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {banks.map((name) => (
          <button
            key={name}
            type="button"
            className={`bank-chip${selected.includes(name) ? ' sel' : ''}`}
            onClick={() => onChange(toggle(selected, name))}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="acard" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
      <div className="warn-box" style={{ marginBottom: 14 }}>
        Bank approvals are shown as trust badges on the project page. Select all banks that have approved this project.
      </div>
      {renderGroup('Government / PSU banks', BANKS_GOV)}
      {renderGroup('Private sector banks', BANKS_PRIVATE)}
      {renderGroup('NBFCs & Housing Finance Companies', BANKS_NBFC)}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
        <div className="bank-group-lbl">Selected ({selected.length} banks)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
          {selected.length === 0 ? (
            <span style={{ fontSize: 12, color: 'var(--mu)' }}>No banks selected yet</span>
          ) : (
            selected.map((b) => (
              <span key={b} className="bdg b-teal">
                {b}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
