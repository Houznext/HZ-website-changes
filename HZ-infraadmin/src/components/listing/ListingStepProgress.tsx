'use client';

import { useRouter } from 'next/router';

const labels = ['Basic & Owner', 'Specifics', 'Pricing', 'Photos'];

export function ListingStepProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  const router = useRouter();
  const pct = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 90;
  return (
    <div className="acard" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {labels.map((label, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div
                className={`step-num ${done ? '' : active ? '' : ''}`}
                style={{
                  background: done ? 'var(--tl)' : active ? 'var(--blue)' : '#fff',
                  color: done || active ? '#fff' : '#94a3b8',
                  border: done || active ? 'none' : '2px solid #e2e8f0',
                  boxShadow: active ? '0 0 0 4px rgba(47,128,237,0.15)' : undefined,
                }}
              >
                {done ? '✓' : n}
              </div>
              <span style={{ fontWeight: 600, fontSize: 12, color: active ? 'var(--blue)' : '#64748b' }}>{label}</span>
              {i < labels.length - 1 ? <div style={{ width: 24, height: 2, background: '#e2e8f0', marginLeft: 4 }} /> : null}
            </div>
          );
        })}
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${pct}%` }} />
      </div>
      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => void router.push('/listings')}>
        Exit wizard
      </button>
    </div>
  );
}
