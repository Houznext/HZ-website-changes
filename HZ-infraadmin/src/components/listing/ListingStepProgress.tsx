'use client';

type Accent = 'blue' | 'rose' | 'amber' | 'teal';

const labels = ['Basic & Owner', 'Property specifics', 'Pricing & Docs', 'Photos & Publish'];

export function ListingStepProgress({
  step,
  accent = 'blue',
}: {
  step: 1 | 2 | 3 | 4;
  accent?: Accent;
}) {
  const pct = step === 1 ? 25 : step === 2 ? 50 : step === 3 ? 75 : 90;
  const label =
    step === 1
      ? 'Step 1 of 4 — Basic details'
      : step === 2
        ? 'Step 2 of 4 — Property specifics'
        : step === 3
          ? 'Step 3 of 4 — Pricing & documents'
          : 'Step 4 of 4 — Photos & publish';

  return (
    <div className={`acard listing-step-flow`} data-accent={accent === 'blue' ? undefined : accent} style={{ padding: '16px 20px', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 11,
            fontWeight: 700,
            color: accent === 'blue' ? 'var(--blue)' : accent === 'rose' ? '#db2777' : accent === 'amber' ? 'var(--am)' : 'var(--tl)',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 11, color: 'var(--mu)', marginLeft: 'auto' }}>{pct}% complete</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="step-row">
        {labels.map((text, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={text} style={{ display: 'contents' }}>
              <div className={`step ${done ? 'done' : active ? 'active' : 'todo'}`} style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <div className="step-num">{done ? '✓' : n}</div>
                <span className="step-label">{text}</span>
              </div>
              {i < labels.length - 1 ? (
                <div
                  className="step-line"
                  style={{
                    background: i + 1 < step ? 'var(--tl)' : '#e2e8f0',
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
