'use client';

import { CRM_STAGES } from './crmConstants';
import { KanbanCard, type KanbanLead } from './KanbanCard';
import { LeadFormModal } from './LeadFormModal';
import { useState } from 'react';

export function KanbanBoard({
  pipeline,
  onRefresh,
}: {
  pipeline: Record<string, KanbanLead[]>;
  onRefresh: () => void;
}) {
  const [modalStage, setModalStage] = useState<string | null>(null);

  return (
    <>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 10 }}>
        {CRM_STAGES.map((col) => {
          const cards = pipeline[col.id] ?? [];
          return (
            <div key={col.id} className="k-col" style={{ borderLeft: `3px solid ${col.border}` }}>
              <div className="k-head">
                <div className="k-title">{col.label}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>
                  {col.win} · {cards.length} leads
                </div>
              </div>
              <div className="k-body">
                {cards.map((c) => (
                  <KanbanCard key={c.id} lead={c} />
                ))}
                <button
                  type="button"
                  className="k-card"
                  style={{ borderStyle: 'dashed', textAlign: 'center', color: '#64748b', fontSize: 11.5, fontWeight: 600 }}
                  onClick={() => setModalStage(col.id)}
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <LeadFormModal
        open={modalStage != null}
        defaultStage={modalStage ?? undefined}
        onClose={() => setModalStage(null)}
        onCreated={() => {
          setModalStage(null);
          onRefresh();
        }}
      />
    </>
  );
}
