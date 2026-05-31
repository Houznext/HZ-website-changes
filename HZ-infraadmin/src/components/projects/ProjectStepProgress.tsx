'use client';

import type { ProjectTypeKey } from '@/lib/projects/constants';
import { projectAccent } from '@/lib/projects/constants';

const labels = ['Basic', 'Details', 'Pricing', 'Media', 'Publish'];

export function ProjectStepProgress({ step, type }: { step: 1 | 2 | 3 | 4 | 5; type?: ProjectTypeKey }) {
  const pct = step * 20;
  const accent = type ? projectAccent(type) : 'blue';
  const accentColor =
    accent === 'rose' ? '#be185d' : accent === 'amber' ? 'var(--am)' : accent === 'teal' ? 'var(--tl)' : 'var(--blue)';

  const stepLabel =
    step === 1
      ? 'Step 1 of 5 — Basic details'
      : step === 2
        ? 'Step 2 of 5 — Project specifics'
        : step === 3
          ? 'Step 3 of 5 — Pricing & legal'
          : step === 4
            ? 'Step 4 of 5 — Media & banks'
            : 'Step 5 of 5 — Publish';

  return (
    <div className={`acard project-step-flow`} data-accent={accent === 'blue' ? undefined : accent} style={{ padding: '16px 20px', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10, gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, fontWeight: 700, color: accentColor }}>{stepLabel}</span>
        <span style={{ fontSize: 11, color: 'var(--mu)', marginLeft: 'auto' }}>{pct}% complete</span>
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${pct}%`, background: accentColor }} />
      </div>
      <div className="step-row project-step-dots">
        {labels.map((text, i) => {
          const n = i + 1;
          const done = n < step;
          const active = n === step;
          return (
            <div key={text} style={{ display: 'contents' }}>
              <div className={`step ${done ? 'done' : active ? 'active' : 'todo'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div className="step-dot">{done ? '✓' : n}</div>
                <span className="step-lbl">{text}</span>
              </div>
              {i < labels.length - 1 ? <div className="step-line" style={{ background: i + 1 < step ? 'var(--tl)' : '#e2e8f0' }} /> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
