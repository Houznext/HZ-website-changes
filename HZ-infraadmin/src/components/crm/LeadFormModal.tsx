'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { X, Users } from 'lucide-react';
import adminApi from '@/lib/axios';
import { BHK_OPTS, BUDGET_RANGES, PROPERTY_TYPES, SOURCES } from './crmConstants';

type Props = {
  open: boolean;
  onClose: () => void;
  defaultStage?: string;
  onCreated: () => void;
};

export function LeadFormModal({ open, onClose, defaultStage, onCreated }: Props) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    source: 'Website enquiry',
    propertyType: 'Apartment',
    bhkPreference: '',
    budgetRange: '',
    preferredCity: '',
    preferredLocality: '',
    purpose: 'Self use',
    loanRequired: 'Yes',
    timeline: '3–6 months',
    priority: 'cold' as 'hot' | 'warm' | 'cold',
    assignedTo: '',
    notes: '',
    stage: defaultStage || 'new',
  });

  useEffect(() => {
    if (open) setForm((f) => ({ ...f, stage: defaultStage || f.stage || 'new' }));
  }, [open, defaultStage]);

  if (!open) return null;

  const submit = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setBusy(true);
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
      onCreated();
      onClose();
    } catch {
      toast.error('Could not create lead');
    } finally {
      setBusy(false);
    }
  };

  const fi =
    'w-full rounded-lg border border-[#dde8f5] px-3 py-2 font-inter text-sm outline-none focus:border-[#2f80ed] focus:ring-[3px] focus:ring-[rgba(47,128,237,0.08)]';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,42,68,0.35)',
        zIndex: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="acard"
        style={{ width: 'min(680px, 100%)', maxHeight: '92vh', overflow: 'auto', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ position: 'absolute', top: 10, right: 10 }}
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} strokeWidth={1.8} />
        </button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg,#2f80ed,#1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={22} strokeWidth={1.8} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 17, fontWeight: 800, color: 'var(--ch)' }}>Add new lead</div>
            <div style={{ fontSize: 12, color: 'var(--mu)', marginTop: 2 }}>Real estate buyer / investor enquiry</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="label">Full name *</label>
            <input className={fi} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone *</label>
            <input className={fi} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className={fi} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Lead source</label>
            <select className={fi} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Interested in</label>
            <select className={fi} value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
              {PROPERTY_TYPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">BHK preference</label>
            <select className={fi} value={form.bhkPreference} onChange={(e) => setForm({ ...form, bhkPreference: e.target.value })}>
              <option value="">—</option>
              {BHK_OPTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Budget range</label>
            <select className={fi} value={form.budgetRange} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}>
              <option value="">—</option>
              {BUDGET_RANGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Preferred city</label>
            <input className={fi} value={form.preferredCity} onChange={(e) => setForm({ ...form, preferredCity: e.target.value })} />
          </div>
          <div>
            <label className="label">Preferred locality</label>
            <input className={fi} value={form.preferredLocality} onChange={(e) => setForm({ ...form, preferredLocality: e.target.value })} />
          </div>
          <div>
            <label className="label">Purpose</label>
            <select className={fi} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
              <option>Self use</option>
              <option>Investment</option>
              <option>Rental income</option>
            </select>
          </div>
          <div>
            <label className="label">Loan required</label>
            <select className={fi} value={form.loanRequired} onChange={(e) => setForm({ ...form, loanRequired: e.target.value })}>
              <option>Yes</option>
              <option>No</option>
              <option>Pre-approved</option>
            </select>
          </div>
          <div>
            <label className="label">Timeline</label>
            <select className={fi} value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}>
              <option>Immediate</option>
              <option>1–3 months</option>
              <option>3–6 months</option>
              <option>6–12 months</option>
              <option>Just exploring</option>
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {(['hot', 'warm', 'cold'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn btn-sm ${form.priority === p ? 'btn-tl' : 'btn-ghost'}`}
                  onClick={() => setForm({ ...form, priority: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Assign to (name)</label>
            <input className={fi} value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">Notes</label>
            <textarea className={fi} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-tl" onClick={() => void submit()} disabled={busy}>
            {busy ? 'Creating…' : 'Create lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
