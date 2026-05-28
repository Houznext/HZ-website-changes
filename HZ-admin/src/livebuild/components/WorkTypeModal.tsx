import { useEffect, useState } from 'react';
import livebuildApi from '../lib/api';
import { LB_ROOM_NAMES, LB_WT_CATEGORIES } from '../lib/constants';
import type { LbWorkType } from '../lib/types';
import { Btn } from './Btn';
import { ChipGroup } from './ChipGroup';
import { FormInput } from './FormInput';
import { Label } from './Label';
import { Modal } from './Modal';
import { Toggle } from './Toggle';
import { lbToast } from './Toast';

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  edit?: LbWorkType | null;
};

export function WorkTypeModal({ open, onClose, onSaved, edit }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Carpentry');
  const [description, setDescription] = useState('');
  const [defaultRooms, setDefaultRooms] = useState<string[]>([]);
  const [status, setStatus] = useState('active');
  const [requiresPhotos, setRequiresPhotos] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (edit) {
      setName(edit.name);
      setCategory(edit.category);
      setDescription(edit.description ?? '');
      setDefaultRooms(edit.defaultRooms ?? []);
      setStatus(edit.status === 'disabled' ? 'disabled' : 'active');
      setRequiresPhotos(edit.requiresPhotos !== false);
    } else {
      setName('');
      setCategory('Carpentry');
      setDescription('');
      setDefaultRooms([]);
      setStatus('active');
      setRequiresPhotos(true);
    }
  }, [open, edit]);

  const submit = async () => {
    if (!name.trim()) {
      lbToast('Work type name required', 'err');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        description: description || undefined,
        defaultRooms,
        status,
        requiresPhotos,
      };
      if (edit) {
        await livebuildApi.updateWorkType(edit.id, payload);
      } else {
        await livebuildApi.createWorkType(payload);
      }
      lbToast('Work type saved', 'ok');
      onSaved();
      onClose();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Save failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={edit ? `Edit work type: ${edit.name}` : 'Add new work type'}
      subtitle="Available to assign to any project room"
      maxWidth={600}
      footer={
        <>
          <Btn variant="tl" onClick={submit} disabled={saving}>
            Save work type
          </Btn>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
        </>
      }
    >
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Work type name</Label>
          <FormInput
            placeholder="e.g. False ceiling"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label required>Category</Label>
          <FormInput as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {LB_WT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormInput>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Label>Description</Label>
        <FormInput
          as="textarea"
          rows={2}
          placeholder="Brief description of what this work type involves…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <Label>Applicable rooms (default)</Label>
        <ChipGroup
          options={[...LB_ROOM_NAMES, 'All rooms']}
          selected={defaultRooms}
          onChange={setDefaultRooms}
        />
      </div>
      <div className="lb-form-row">
        <div>
          <Label>Status</Label>
          <FormInput as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </FormInput>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
          <div>
            <Label>Requires photos</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <Toggle on={requiresPhotos} onChange={setRequiresPhotos} aria-label="Requires photos" />
              <span style={{ fontSize: 12.5, color: 'var(--lb-ch)' }}>Photos mandatory for DPR</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
