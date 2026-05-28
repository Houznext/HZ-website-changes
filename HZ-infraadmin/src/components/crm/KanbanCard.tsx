'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';
import { LeadScoreRing } from './LeadScoreRing';
import { StageBadge } from './StageBadge';
import clsx from 'clsx';

export type KanbanLead = {
  id: string;
  fullName: string;
  phone: string;
  propertyType: string;
  bhkPreference?: string | null;
  budgetRange?: string | null;
  source?: string;
  priority: string;
  leadScore: number;
  stage: string;
};

export function KanbanCard({ lead }: { lead: KanbanLead }) {
  const pri = lead.priority === 'hot' ? 'p-hot' : lead.priority === 'warm' ? 'p-warm' : 'p-cold';
  return (
    <Link href={`/crm/leads/${lead.id}`} className="k-card block no-underline text-inherit">
      <div className="flex items-start justify-between gap-2">
        <div className="k-name">{lead.fullName}</div>
        <span className={clsx('bdg', pri)}>{lead.priority}</span>
      </div>
      <div className="k-prop">
        {lead.propertyType}
        {lead.bhkPreference ? ` · ${lead.bhkPreference}` : ''}
        {lead.budgetRange ? <span className="ml-1 font-bold text-[#2f80ed]"> · {lead.budgetRange}</span> : null}
      </div>
      <div className="flex items-center gap-1 text-[11px] text-[#5a6a7e]">
        <Phone size={11} strokeWidth={1.8} />
        {lead.phone}
      </div>
      <div className="k-tags items-center">
        <span className="k-tag">{lead.source || '—'}</span>
        <LeadScoreRing score={lead.leadScore} size={22} />
      </div>
    </Link>
  );
}
