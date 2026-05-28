import { useEffect, useState } from 'react';
import livebuildApi from '../lib/api';
import { LB_ROOM_NAMES, LB_ROOM_TYPES } from '../lib/constants';
import type { LbWorkType } from '../lib/types';
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

export function AddRoomModal({ open, projectId, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('Bedroom');
  const [lengthFt, setLengthFt] = useState('');
  const [widthFt, setWidthFt] = useState('');
  const [workTypes, setWorkTypes] = useState<LbWorkType[]>([]);
  const [selectedWt, setSelectedWt] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    livebuildApi.listWorkTypes().then(setWorkTypes).catch(() => setWorkTypes([]));
  }, [open]);

  const submit = async () => {
    if (!name.trim()) {
      lbToast('Room name required', 'err');
      return;
    }
    setSaving(true);
    try {
      await livebuildApi.createRoom(projectId, {
        name: name.trim(),
        roomType,
        lengthFt: lengthFt ? Number(lengthFt) : undefined,
        widthFt: widthFt ? Number(widthFt) : undefined,
        workTypeIds: selectedWt.map((id) => Number(id)),
      });
      lbToast('Room added', 'ok');
      onCreated();
      onClose();
      setName('');
      setLengthFt('');
      setWidthFt('');
      setSelectedWt([]);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to add room', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add room to project" maxWidth={560}>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Room name</Label>
          <FormInput
            list="lb-room-names"
            placeholder="e.g. Master Bedroom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <datalist id="lb-room-names">
            {LB_ROOM_NAMES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>
        <div>
          <Label>Room type</Label>
          <FormInput as="select" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            {LB_ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FormInput>
        </div>
      </div>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label>Length (ft)</Label>
          <FormInput type="number" placeholder="14" value={lengthFt} onChange={(e) => setLengthFt(e.target.value)} />
        </div>
        <div>
          <Label>Width (ft)</Label>
          <FormInput type="number" placeholder="12" value={widthFt} onChange={(e) => setWidthFt(e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Label>Assign work types</Label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 5 }}>
          {workTypes.map((wt) => (
            <button
              key={wt.id}
              type="button"
              className={`lb-wt-chip ${selectedWt.includes(wt.id) ? 'on' : ''}`}
              onClick={() =>
                setSelectedWt((prev) =>
                  prev.includes(wt.id) ? prev.filter((x) => x !== wt.id) : [...prev, wt.id],
                )
              }
            >
              {wt.name}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn variant="blue" onClick={submit} disabled={saving}>
          Add room
        </Btn>
      </div>
    </Modal>
  );
}
