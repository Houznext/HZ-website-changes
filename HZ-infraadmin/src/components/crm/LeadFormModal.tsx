'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import adminApi from '@/lib/axios';
import { BHK_OPTS, BUDGET_RANGES, PROPERTY_TYPES, SOURCES } from './crmConstants';

const AGENTS = ['Arjun Sharma', 'Priya Reddy', 'Kiran Kumar'];

type Props = {
  open: boolean;
  onClose: () => void;
  defaultStage?: string;
  onCreated?: () => void;
};

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export function LeadFormModal({ open, onClose, defaultStage, onCreated }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [linkProperty, setLinkProperty] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    source: 'Website enquiry', propertyType: 'Apartment',
    bhkPreference: '', budgetRange: '', preferredCity: '', preferredLocality: '',
    purpose: 'Self use', loanRequired: 'Yes', timeline: '3–6 months',
    priority: 'cold' as 'hot' | 'warm' | 'cold',
    assignedTo: '', notes: '', stage: defaultStage || 'new',
  });

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, stage: defaultStage || f.stage || 'new' }));
  }, [open, defaultStage]);

  const resetForm = () => {
    setForm({
      fullName: '', phone: '', email: '', source: 'Website enquiry', propertyType: 'Apartment',
      bhkPreference: '', budgetRange: '', preferredCity: '', preferredLocality: '',
      purpose: 'Self use', loanRequired: 'Yes', timeline: '3–6 months',
      priority: 'cold', assignedTo: '', notes: '', stage: defaultStage || 'new',
    });
    setLinkProperty(false);
  };

  const handleClose = () => { resetForm(); onClose(); };

  const priorityPills = [
    { val: 'hot' as const, emoji: '🔥', label: 'Hot', a: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' }, i: { bg: '#fff', color: '#5a6a7e', border: '#e2e8f0' } },
    { val: 'warm' as const, emoji: '🟡', label: 'Warm', a: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' }, i: { bg: '#fff', color: '#5a6a7e', border: '#e2e8f0' } },
    { val: 'cold' as const, emoji: '🔵', label: 'Cold', a: { bg: '#eff6ff', color: '#2563eb', border: '#93c5fd' }, i: { bg: '#fff', color: '#5a6a7e', border: '#e2e8f0' } },
  ];

  const handleSubmit = async () => {
    if (!form.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!form.phone.trim()) { toast.error('Phone is required'); return; }
    setSubmitting(true);
    try {
      await adminApi.post('/admin/crm/leads', {
        ...form,
        email: form.email || undefined,
        assignedTo: form.assignedTo || undefined,
        bhkPreference: form.bhkPreference || undefined,
        budgetRange: form.budgetRange || undefined,
        preferredCity: form.preferredCity || undefined,
        preferredLocality: form.preferredLocality || undefined,
        notes: form.notes || undefined,
        stage: form.stage,
        priority: form.priority,
      });
      toast.success('Lead created ✓ · Email sent to business@houznext.com');
      resetForm();
      onClose();
      onCreated?.();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(msg || 'Failed to create lead');
    } finally { setSubmitting(false); }
  };

  if (!open) return null;

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: 'linear-gradient(135deg, #2f80ed, #1a6dd6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UsersIcon />
            </div>
            <div>
              <div style={{ fontFamily: "'Montserrat',sans-serif", fontSize: 16, fontWeight: 700, color: '#1f2933' }}>Add new lead</div>
              <div style={{ fontSize: 12, color: '#5a6a7e', marginTop: 2 }}>Real estate buyer / investor enquiry</div>
            </div>
          </div>
          <button type="button" onClick={handleClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 6, borderRadius: 8, color: '#5a6a7e', display: 'flex' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <CloseIcon />
          </button>
        </div>
        <div className="modal-bd">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label className="lbl">Full name <span style={{ color: '#dc2626' }}>*</span></label>
            <input className="fi" type="text" placeholder="Enter full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><label className="lbl">Phone <span style={{ color: '#dc2626' }}>*</span></label>
            <input className="fi" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="lbl">Email</label>
            <input className="fi" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="lbl">Lead source</label>
            <select className="fi" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
            <div><label className="lbl">Interested in (type)</label>
            <select className="fi" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
              {PROPERTY_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
            <div><label className="lbl">BHK preference</label>
            <select className="fi" value={form.bhkPreference} onChange={(e) => setForm({ ...form, bhkPreference: e.target.value })}>
              <option value="">—</option>
              {BHK_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
            <div><label className="lbl">Budget range</label>
            <select className="fi" value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}>
              <option value="">—</option>
              {BUDGET_RANGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></div>
            <div><label className="lbl">Preferred city</label>
            <select className="fi" value={form.preferredCity} onChange={(e) => setForm({ ...form, preferredCity: e.target.value })}>
              <option value="">Select city</option><option>Hyderabad</option><option>Bengaluru</option><option>Chennai</option><option>Mumbai</option>
            </select></div>
            <div><label className="lbl">Preferred locality</label>
            <input className="fi" type="text" placeholder="e.g. Gachibowli, Kondapur" value={form.preferredLocality} onChange={(e) => setForm({ ...form, preferredLocality: e.target.value })} /></div>
            <div><label className="lbl">Purpose</label>
            <select className="fi" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
              <option>Self use</option><option>Investment</option><option>Rental income</option>
            </select></div>
            <div><label className="lbl">Loan required</label>
            <select className="fi" value={form.loanRequired} onChange={(e) => setForm({ ...form, loanRequired: e.target.value })}>
              <option>Yes</option><option>No</option><option>Pre-approved</option>
            </select></div>
            <div><label className="lbl">Timeline</label>
            <select className="fi" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}>
              <option>Immediate (0–1 month)</option><option>1–3 months</option><option>3–6 months</option><option>6–12 months</option><option>Just exploring</option>
            </select></div>
            <div><label className="lbl">Priority</label>
            <div style={{ display: 'flex', gap: 7 }}>
              {priorityPills.map((p) => {
                const active = form.priority === p.val;
                const s = active ? p.a : p.i;
                return (
                  <button key={p.val} type="button" onClick={() => setForm({ ...form, priority: p.val })}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 8, border: `1.5px solid ${s.border}`, background: s.bg, color: s.color, fontFamily: "'Montserrat',sans-serif", fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 150ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    {p.emoji} {p.label}
                  </button>
                );
              })}
            </div></div>
            <div><label className="lbl">Assign to</label>
            <select className="fi" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Unassigned</option>
              {AGENTS.map((name) => <option key={name} value={name}>{name}</option>)}
            </select></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="lbl">Notes / requirements</label>
            <textarea className="fi" rows={2} style={{ resize: 'none' }} placeholder="Any specific notes about this lead…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="crm-amber-row" onClick={() => setLinkProperty(!linkProperty)}>
            <input type="checkbox" readOnly checked={linkProperty} style={{ accentColor: '#d97706', width: 14, height: 14, cursor: 'pointer' }} />
            <span>Specific property interested in (link property from listings)</span>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-blue" type="button" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting ? 'Creating…' : (<><PlusIcon /> Create lead</>)}
          </button>
          <button className="btn btn-ghost" type="button" onClick={handleClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
