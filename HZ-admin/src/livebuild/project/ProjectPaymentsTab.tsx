import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import livebuildApi from '../lib/api';
import type { LbPayment } from '../lib/types';
import { AddMilestoneModal } from '../components/AddMilestoneModal';
import { Badge, Btn, FormInput, StatCard, Table, lbToast } from '../components';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import Loader from '@/src/common/Loader';

type Props = { projectId: string; projectName: string };

export function ProjectPaymentsTab({ projectId, projectName }: Props) {
  const [payments, setPayments] = useState<LbPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPayments(await livebuildApi.listPayments(projectId));
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load payments', 'err');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const updatePayment = async (
    p: LbPayment,
    patch: Partial<LbPayment> & { pct?: number },
  ) => {
    try {
      await livebuildApi.updatePayment(p.id, patch);
      lbToast('Updated', 'ok');
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Update failed', 'err');
    }
  };

  const paid = payments.filter((p) => p.status === 'paid').length;
  const overdue = payments.filter((p) => p.status === 'due').length;

  if (loading) {
    return (
      <div className="lb-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--lb-m)', fontSize: 14, fontWeight: 700 }}>
          Payments — {projectName}
        </div>
        <Btn variant="blue" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={12} strokeWidth={2} />
          Add milestone
        </Btn>
      </div>
      <div className="lb-g3" style={{ marginBottom: 16 }}>
        <StatCard label="Total milestones" value={payments.length} valueColor="var(--lb-blue)" icon={<CreditCard size={18} strokeWidth={1.8} color="#2563eb" />} />
        <StatCard label="Paid" value={paid} sub={payments.length ? `${Math.round((paid / payments.length) * 100)}%` : undefined} valueColor="var(--lb-tl)" icon={<CheckCircle size={18} strokeWidth={1.8} color="var(--lb-tl)" />} />
        <StatCard label="Overdue" value={overdue} valueColor="var(--lb-rd)" icon={<AlertCircle size={18} strokeWidth={1.8} color="var(--lb-rd)" />} />
      </div>
      <div className="lb-card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table headers={['Milestone', '% of total', 'Due date', 'Status', 'Paid date', 'Actions']}>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>
                <FormInput
                  style={{ fontSize: 12, padding: '5px 9px', minWidth: 140 }}
                  defaultValue={p.label}
                  onBlur={(e) => updatePayment(p, { label: e.target.value })}
                />
              </td>
              <td>
                <FormInput
                  type="number"
                  style={{ width: 65, padding: '5px 8px' }}
                  defaultValue={p.pctOfTotal}
                  onBlur={(e) => updatePayment(p, { pct: Number(e.target.value) })}
                />
                %
              </td>
              <td>
                <FormInput
                  type="date"
                  style={{ fontSize: 12, padding: '5px 9px' }}
                  defaultValue={p.dueDate?.slice(0, 10)}
                  onBlur={(e) => updatePayment(p, { dueDate: e.target.value })}
                />
              </td>
              <td>
                <select
                  value={p.status}
                  onChange={(e) => {
                    const status = e.target.value;
                    updatePayment(p, {
                      status,
                      ...(status === 'paid' && !p.paidDate
                        ? { paidDate: new Date().toISOString().slice(0, 10) }
                        : {}),
                    });
                  }}
                  style={{
                    fontSize: 12,
                    padding: '5px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--lb-bd)',
                    background: '#fff',
                    color:
                      p.status === 'paid'
                        ? 'var(--lb-tl)'
                        : p.status === 'due'
                          ? 'var(--lb-rd)'
                          : 'var(--lb-mu)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="due">Due now</option>
                  <option value="paid">Paid</option>
                </select>
              </td>
              <td>
                <FormInput
                  type="date"
                  style={{ fontSize: 12, padding: '5px 9px' }}
                  defaultValue={p.paidDate?.slice(0, 10) || ''}
                  onBlur={(e) => {
                    const nextPaid = e.target.value.trim();
                    updatePayment(p, {
                      paidDate: nextPaid || null,
                      ...(nextPaid ? { status: 'paid' } : p.status === 'paid' ? { status: 'upcoming' } : {}),
                    });
                  }}
                />
              </td>
              <td>
                <div style={{ display: 'flex', gap: 5 }}>
                  {p.status !== 'paid' ? (
                    <Btn
                      variant="tl"
                      size="xs"
                      onClick={async () => {
                        try {
                          await livebuildApi.markPaymentPaid(p.id);
                          lbToast('Marked as paid', 'ok');
                          load();
                        } catch (e: any) {
                          lbToast(e?.body?.message || 'Failed to mark as paid', 'err');
                        }
                      }}
                    >
                      Mark paid
                    </Btn>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--lb-tl)' }}>✓ Paid</span>
                  )}
                  <Btn
                    variant="icon"
                    size="xs"
                    onClick={async () => {
                      if (!confirm('Delete milestone?')) return;
                      await livebuildApi.deletePayment(p.id);
                      lbToast('Deleted', 'ok');
                      load();
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 size={12} color="var(--lb-rd)" />
                  </Btn>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>
      <AddMilestoneModal open={modalOpen} projectId={projectId} onClose={() => setModalOpen(false)} onCreated={load} />
    </div>
  );
}
