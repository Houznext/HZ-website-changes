'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CrmLayout } from '@/components/crm/CrmLayout';
import { StageBadge } from '@/components/crm/StageBadge';
import { LeadScoreRing } from '@/components/crm/LeadScoreRing';
import { PrioritySelector } from '@/components/crm/PrioritySelector';
import { CRM_STAGES, getAvatarColor } from '@/components/crm/crmConstants';
import adminApi from '@/lib/axios';
import { ChevronLeft, Home, MapPin, MessageCircle, Phone } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Lead = Record<string, unknown>;
type Activity = {
  id: string;
  type: string;
  content: string;
  agentName?: string | null;
  createdAt: string;
};

const actEmoji: Record<string, string> = {
  note: '📝',
  call: '📞',
  whatsapp: '💬',
  followup: '📅',
  stage_change: '🔄',
  site_visit: '🏠',
  token: '💰',
  booking: '📋',
  created: '✨',
};

export default function CrmLeadDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const [data, setData] = useState<{ lead: Lead; activities: Activity[]; linkedProperties: Array<Record<string, unknown>> } | null>(null);
  const [tab, setTab] = useState('note');
  const [actText, setActText] = useState('');
  const [stage, setStage] = useState('');
  const [fuDate, setFuDate] = useState('');
  const [fuTime, setFuTime] = useState('');
  const [fuMethod, setFuMethod] = useState('Phone call');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const res = await adminApi.get(`/admin/crm/leads/${id}`);
      setData(res.data);
      setStage(String(res.data?.lead?.stage ?? 'new'));
    } catch {
      toast.error('Failed to load lead');
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const lead = data?.lead;
  if (!id) return null;
  if (!lead) {
    return (
      <AdminLayout title="Lead">
        <CrmLayout>
          <p style={{ color: 'var(--mu)' }}>Loading…</p>
        </CrmLayout>
      </AdminLayout>
    );
  }

  const fullName = String(lead.fullName ?? '');
  const saveStage = async () => {
    try {
      await adminApi.patch(`/admin/crm/leads/${id}/stage`, { stage, agentName: 'Admin' });
      toast.success('Stage updated ✓ · Notification sent');
      void load();
    } catch {
      toast.error('Update failed');
    }
  };

  const savePriority = async (p: 'hot' | 'warm' | 'cold') => {
    try {
      await adminApi.patch(`/admin/crm/leads/${id}/priority`, { priority: p, agentName: 'Admin' });
      toast.success('Priority updated ✓ · Notification sent');
      void load();
    } catch {
      toast.error('Update failed');
    }
  };

  const scheduleFu = async () => {
    if (!fuDate) {
      toast.error('Pick a date');
      return;
    }
    const iso = fuTime ? `${fuDate}T${fuTime}:00` : `${fuDate}T09:00:00`;
    try {
      await adminApi.patch(`/admin/crm/leads/${id}`, { nextFollowUpAt: new Date(iso).toISOString(), followUpMethod: fuMethod });
      toast.success('Follow-up saved ✓ · Notification sent');
      void load();
    } catch {
      toast.error('Save failed');
    }
  };

  const saveActivity = async () => {
    if (!actText.trim()) return;
    try {
      await adminApi.post(`/admin/crm/leads/${id}/activities`, { type: tab, content: actText.trim(), agentName: 'Admin' });
      toast.success('Activity saved ✓ · Email sent to business@houznext.com');
      setActText('');
      void load();
    } catch {
      toast.error('Save failed');
    }
  };

  return (
    <AdminLayout title={fullName}>
      <CrmLayout>
        <Link href="/crm/leads" className="btn btn-ghost btn-sm" style={{ marginBottom: 12, gap: 6 }}>
          <ChevronLeft size={15} strokeWidth={1.8} /> All leads
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }} className="max-lg:grid-cols-1">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="acard" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', right: 16, top: 16 }}>
                <LeadScoreRing score={Number(lead.leadScore ?? 0)} size={52} />
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: getAvatarColor(fullName),
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 19, fontWeight: 800, margin: 0 }}>{fullName}</h1>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: 12.5, color: '#5a6a7e' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={14} strokeWidth={1.8} /> {String(lead.phone)}
                    </span>
                    {lead.email ? <span>{String(lead.email)}</span> : null}
                    {lead.preferredCity ? <span>{String(lead.preferredCity)}</span> : null}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    <StageBadge stage={String(lead.stage)} />
                    <span className={`bdg ${String(lead.priority) === 'hot' ? 'p-hot' : String(lead.priority) === 'warm' ? 'p-warm' : 'p-cold'}`}>
                      {String(lead.priority)}
                    </span>
                    <span className="crm-tag crm-tag--gray">{String(lead.propertyType)}</span>
                    {lead.budgetRange ? (
                      <span className="crm-tag crm-tag--blue">{String(lead.budgetRange)}</span>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    <a className="btn btn-ghost btn-sm" href={`tel:${lead.phone}`}>
                      Call
                    </a>
                    <a
                      className="btn btn-wa btn-sm"
                      href={`https://wa.me/91${String(lead.phone).replace(/\D/g, '').slice(-10)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle size={14} strokeWidth={1.8} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="acard">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, borderBottom: '1px solid #f0f4f8', paddingBottom: 10 }}>
                <Home size={16} strokeWidth={1.8} color="#2f80ed" />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13 }}>Property requirements</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }} className="max-md:grid-cols-2">
                {([
                  ['Property type', lead.propertyType],
                  ['BHK', lead.bhkPreference],
                  ['Budget', lead.budgetRange],
                  ['City', lead.preferredCity],
                  ['Locality', lead.preferredLocality],
                  ['Purpose', lead.purpose],
                  ['Loan', lead.loanRequired],
                  ['Timeline', lead.timeline],
                ] as [string, unknown][]).map(([k, v]) => (
                  <div key={k} className="crm-req-cell">
                    <div className="crm-req-lbl">{k}</div>
                    <div className="crm-req-val">{v != null && v !== '' ? String(v) : '—'}</div>
                  </div>
                ))}
              </div>
              {lead.notes ? (
                <div style={{ marginTop: 12, background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 9, padding: 12, fontSize: 13 }}>{String(lead.notes)}</div>
              ) : null}
            </div>

            <div className="acard">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MapPin size={16} strokeWidth={1.8} color="#6d28d9" />
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13 }}>Properties shown / shared</span>
              </div>
              {(data?.linkedProperties ?? []).length === 0 ? (
                <p style={{ fontSize: 12.5, color: 'var(--mu)' }}>No linked listings yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data!.linkedProperties.map((p) => (
                    <div key={String(p.id)} className="acard" style={{ padding: 10, margin: 0 }}>
                      <div style={{ fontWeight: 700 }}>{String(p.title)}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--mu)' }}>{String(p.propertyCode ?? '')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="acard">
              <div style={{ fontWeight: 700, marginBottom: 10, fontFamily: 'Montserrat, sans-serif' }}>Log activity</div>
              <div className="tab-bar" style={{ marginBottom: 10 }}>
                {['note', 'call', 'whatsapp', 'followup', 'site_visit', 'token'].map((t) => (
                  <button key={t} type="button" className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <textarea className="fi" rows={4} value={actText} onChange={(e) => setActText(e.target.value)} placeholder="Details…" style={{ width: '100%' }} />
              <button type="button" className="btn btn-tl btn-sm" style={{ marginTop: 8 }} onClick={() => void saveActivity()}>
                Save activity
              </button>
            </div>
          </div>

          <div className="crm-detail-side" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="acard">
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Stage & assignment</div>
              <label className="lbl">Stage</label>
              <select className="fi" value={stage} onChange={(e) => setStage(e.target.value)} style={{ width: '100%', marginBottom: 10 }}>
                {CRM_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-tl btn-sm w-full" onClick={() => void saveStage()}>
                Save stage
              </button>
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Priority</div>
                <PrioritySelector value={String(lead.priority)} onChange={savePriority} />
              </div>
            </div>

            <div className="acard">
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Follow-up</div>
              <input type="date" className="fi mb-2" value={fuDate} onChange={(e) => setFuDate(e.target.value)} style={{ width: '100%' }} />
              <input type="time" className="fi mb-2" value={fuTime} onChange={(e) => setFuTime(e.target.value)} style={{ width: '100%' }} />
              <select className="fi mb-2" value={fuMethod} onChange={(e) => setFuMethod(e.target.value)} style={{ width: '100%' }}>
                <option>Phone call</option>
                <option>WhatsApp</option>
                <option>Site visit</option>
                <option>Email</option>
                <option>Meeting</option>
              </select>
              <button type="button" className="btn btn-tl btn-sm w-full" onClick={() => void scheduleFu()}>
                Schedule
              </button>
            </div>

            <div className="acard">
              <div style={{ fontWeight: 700, marginBottom: 10 }}>Activity history</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflow: 'auto' }}>
                {(data?.activities ?? []).map((a) => (
                  <div key={a.id} className="act-item">
                    <span className="act-emoji">{actEmoji[a.type] ?? '📌'}</span>
                    <div>
                      <div className="act-text">{a.content}</div>
                      <div className="act-time">
                        {formatDate(a.createdAt)} {a.agentName ? `· ${a.agentName}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CrmLayout>
    </AdminLayout>
  );
}
