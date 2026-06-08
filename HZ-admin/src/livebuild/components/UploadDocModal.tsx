import { useEffect, useState } from 'react';
import livebuildApi from '../lib/api';
import { LB_DOC_UPLOAD_CATEGORIES } from '../lib/constants';
import type { LbRoom, LbWorkType } from '../lib/types';
import { Btn } from './Btn';
import { FormInput } from './FormInput';
import { Label } from './Label';
import { Modal } from './Modal';
import { lbToast } from './Toast';

const CAT_MAP: Record<string, string> = {
  'Warranty slip': 'warranty',
  BOQ: 'boq',
  Agreement: 'agreement',
  'Design file': 'design',
  'Payment statement': 'statement',
  Other: 'other',
};

type Props = {
  open: boolean;
  projectId: string;
  rooms: LbRoom[];
  onClose: () => void;
  onUploaded: () => void;
};

export function UploadDocModal({ open, projectId, rooms, onClose, onUploaded }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Warranty slip');
  const [roomId, setRoomId] = useState('');
  const [workTypeId, setWorkTypeId] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [workTypes, setWorkTypes] = useState<LbWorkType[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    livebuildApi.listWorkTypes().then(setWorkTypes).catch(() => setWorkTypes([]));
  }, [open]);

  const submit = async () => {
    if (!file || !name.trim()) {
      lbToast('File and name required', 'err');
      return;
    }
    setSaving(true);
    try {
      await livebuildApi.uploadDocument(projectId, file, {
        name: name.trim(),
        category: CAT_MAP[category] ?? 'other',
        roomId: roomId || undefined,
        workTypeId: workTypeId || undefined,
        expiryDate: expiryDate || undefined,
      });
      lbToast('Document uploaded', 'ok');
      onUploaded();
      onClose();
      setName('');
      setFile(null);
      setRoomId('');
      setWorkTypeId('');
      setExpiryDate('');
    } catch (e: any) {
      lbToast(e?.body?.message || 'Upload failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload document" maxWidth={520}>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Document name</Label>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Greenply Warranty Card" />
        </div>
        <div>
          <Label required>Category</Label>
          <FormInput as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {LB_DOC_UPLOAD_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormInput>
        </div>
      </div>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label>Related room</Label>
          <FormInput as="select" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">All rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </FormInput>
        </div>
        <div>
          <Label>Related work type</Label>
          <FormInput as="select" value={workTypeId} onChange={(e) => setWorkTypeId(e.target.value)}>
            <option value="">General</option>
            {workTypes.map((wt) => (
              <option key={wt.id} value={wt.id}>
                {wt.name}
              </option>
            ))}
          </FormInput>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Label>Expiry date (for warranty)</Label>
        <FormInput type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
      </div>
      <label
        className="lb-dpr-upload"
        style={{ display: 'block', marginBottom: 16 }}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div style={{ fontFamily: 'var(--lb-m)', fontSize: 12.5, fontWeight: 700, color: 'var(--lb-ch)' }}>
          Click to choose file
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--lb-mu)', marginTop: 3 }}>
          PDF, JPG, PNG · Max 20MB
          {file ? ` · ${file.name}` : ''}
        </div>
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn variant="blue" onClick={submit} disabled={saving}>
          Upload
        </Btn>
      </div>
    </Modal>
  );
}
