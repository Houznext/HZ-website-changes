import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import livebuildApi from '../lib/api';
import { Btn } from './Btn';
import { FormInput } from './FormInput';
import { Label } from './Label';
import { Modal } from './Modal';
import { lbToast } from './Toast';

type Props = {
  open: boolean;
  projectId: string;
  onClose: () => void;
  onCreated: () => void;
};

export function AddMilestoneModal({ open, projectId, onClose, onCreated }: Props) {
  const [label, setLabel] = useState('');
  const [pct, setPct] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!label.trim() || !dueDate) {
      lbToast('Label and due date required', 'err');
      return;
    }
    const pctNum = Number(pct);
    if (!pct || Number.isNaN(pctNum) || pctNum < 1 || pctNum > 100) {
      lbToast('Enter % of total between 1 and 100', 'err');
      return;
    }
    setSaving(true);
    try {
      await livebuildApi.createPayment(projectId, {
        label: label.trim(),
        pct: pctNum,
        dueDate,
        paidDate: paidDate.trim() || null,
        status: paidDate.trim() ? 'paid' : 'upcoming',
      });
      lbToast('Milestone added', 'ok');
      onCreated();
      onClose();
      setLabel('');
      setPct('');
      setDueDate('');
      setPaidDate('');
    } catch (e: any) {
      const msg =
        e?.body?.message ||
        (e?.status === 404
          ? 'Project not found — refresh and open the project again from All Projects'
          : 'Failed to add milestone');
      lbToast(msg, 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add payment milestone" maxWidth={500}>
      <div style={{ marginBottom: 12 }}>
        <Label required>Milestone name</Label>
        <FormInput
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Milestone 4 — Finishing works"
        />
      </div>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>% of total</Label>
          <FormInput type="number" min={1} max={100} value={pct} onChange={(e) => setPct(e.target.value)} placeholder="20" />
        </div>
        <div>
          <Label required>Due date</Label>
          <FormInput type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Label>Paid date</Label>
        <FormInput type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} />
      </div>
      <div
        style={{
          background: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: 9,
          padding: '10px 13px',
          fontSize: 12,
          color: '#92400e',
          display: 'flex',
          gap: 7,
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <AlertCircle size={13} strokeWidth={1.8} color="#ca8a04" style={{ flexShrink: 0, marginTop: 1 }} />
        Amount values are not shown to customers — only % of total project cost.
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn variant="blue" onClick={submit} disabled={saving}>
          Add milestone
        </Btn>
      </div>
    </Modal>
  );
}
