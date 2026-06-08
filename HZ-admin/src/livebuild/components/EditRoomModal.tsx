import { useEffect, useState } from 'react';
import livebuildApi from '../lib/api';
import { LB_ROOM_NAMES, LB_ROOM_TYPES } from '../lib/constants';
import type { LbRoom } from '../lib/types';
import { Btn } from './Btn';
import { FormInput } from './FormInput';
import { Label } from './Label';
import { Modal } from './Modal';
import { lbToast } from './Toast';

type Props = {
  open: boolean;
  room: LbRoom | null;
  onClose: () => void;
  onSaved: () => void;
};

export function EditRoomModal({ open, room, onClose, onSaved }: Props) {
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('Bedroom');
  const [lengthFt, setLengthFt] = useState('');
  const [widthFt, setWidthFt] = useState('');
  const [ceilingHeight, setCeilingHeight] = useState('');
  const [flooring, setFlooring] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !room) return;
    setName(room.name);
    setRoomType(room.roomType ?? 'Bedroom');
    setLengthFt(room.lengthFt != null ? String(room.lengthFt) : '');
    setWidthFt(room.widthFt != null ? String(room.widthFt) : '');
    setCeilingHeight(room.ceilingHeight ?? '');
    setFlooring(room.flooring ?? '');
  }, [open, room]);

  const submit = async () => {
    if (!room || !name.trim()) {
      lbToast('Room name required', 'err');
      return;
    }
    setSaving(true);
    try {
      await livebuildApi.updateRoom(room.id, {
        name: name.trim(),
        roomType,
        lengthFt: lengthFt ? Number(lengthFt) : undefined,
        widthFt: widthFt ? Number(widthFt) : undefined,
        ceilingHeight: ceilingHeight || undefined,
        flooring: flooring || undefined,
      });
      lbToast('Room details updated', 'ok');
      onSaved();
      onClose();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to update room', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit room details" maxWidth={560}>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Room name</Label>
          <FormInput
            list="lb-edit-room-names"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <datalist id="lb-edit-room-names">
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
          <FormInput type="number" value={lengthFt} onChange={(e) => setLengthFt(e.target.value)} />
        </div>
        <div>
          <Label>Width (ft)</Label>
          <FormInput type="number" value={widthFt} onChange={(e) => setWidthFt(e.target.value)} />
        </div>
      </div>
      <div className="lb-form-row" style={{ marginBottom: 16 }}>
        <div>
          <Label>Ceiling height</Label>
          <FormInput
            placeholder="e.g. 10 ft"
            value={ceilingHeight}
            onChange={(e) => setCeilingHeight(e.target.value)}
          />
        </div>
        <div>
          <Label>Flooring</Label>
          <FormInput
            placeholder="e.g. Vitrified tiles"
            value={flooring}
            onChange={(e) => setFlooring(e.target.value)}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn variant="blue" onClick={submit} disabled={saving}>
          Save details
        </Btn>
      </div>
    </Modal>
  );
}
