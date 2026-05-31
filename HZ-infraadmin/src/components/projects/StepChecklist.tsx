'use client';

import { Check, Circle } from 'lucide-react';

type Item = { label: string; done: boolean };

export function StepChecklist({ title, items }: { title?: string; items: Item[] }) {
  return (
    <div className="acard step-checklist">
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <Check size={14} strokeWidth={1.8} color="#16a34a" />
        <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700, color: '#15803d' }}>
          {title || 'Step complete when:'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: item.done ? '#15803d' : '#64748b' }}>
            {item.done ? (
              <Check size={14} strokeWidth={2.5} color="#16a34a" />
            ) : (
              <Circle size={14} strokeWidth={2} color="#cbd5e1" />
            )}
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
