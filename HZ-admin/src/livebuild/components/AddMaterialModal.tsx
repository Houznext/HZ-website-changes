import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import livebuildApi from '../lib/api';
import { LB_MATERIAL_CATEGORIES, LB_MATERIAL_UNITS, LB_ROOM_NAMES } from '../lib/constants';
import type { LbRoom } from '../lib/types';
import { Btn } from './Btn';
import { FormInput } from './FormInput';
import { Label } from './Label';
import { Modal } from './Modal';
import { lbToast } from './Toast';

type Props = {
  open: boolean;
  projectId: string;
  rooms: LbRoom[];
  onClose: () => void;
  onCreated: () => void;
};

export function AddMaterialModal({ open, projectId, rooms, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(LB_MATERIAL_CATEGORIES[0]);
  const [specification, setSpecification] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('No.');
  const [roomName, setRoomName] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('not_started');
  const [installDate, setInstallDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && rooms.length) setRoomName(rooms[0].name);
  }, [open, rooms]);

  const submit = async () => {
    if (!name.trim()) {
      lbToast('Material name required', 'err');
      return;
    }
    const room = rooms.find((r) => r.name === roomName);
    setSaving(true);
    try {
      await livebuildApi.createMaterial(projectId, {
        name: name.trim(),
        category,
        specification: specification || undefined,
        quantity: qty ? Number(qty) : 1,
        unit,
        roomId: room?.id ? Number(room.id) : undefined,
        brand: brand || undefined,
        status,
      });
      lbToast('Added to BOQ', 'ok');
      onCreated();
      onClose();
      setName('');
      setQty('');
      setSpecification('');
      setBrand('');
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  const roomOptions = [...new Set([...rooms.map((r) => r.name), ...LB_ROOM_NAMES, 'All rooms'])];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add material / BOQ item"
      subtitle="Added to this project's BOQ"
      maxWidth={600}
      icon={
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'linear-gradient(135deg, var(--lb-am), #b45309)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Package size={15} strokeWidth={1.8} color="#fff" />
        </div>
      }
    >
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Material / item name</Label>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Greenply Gold Plywood" />
        </div>
        <div>
          <Label required>Category</Label>
          <FormInput as="select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {LB_MATERIAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </FormInput>
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Label required>Specification</Label>
        <FormInput
          value={specification}
          onChange={(e) => setSpecification(e.target.value)}
          placeholder="e.g. 18mm BWR ISI grade"
        />
      </div>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Quantity</Label>
          <FormInput type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="24" />
        </div>
        <div>
          <Label required>Unit</Label>
          <FormInput as="select" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {LB_MATERIAL_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </FormInput>
        </div>
      </div>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Room</Label>
          <FormInput as="select" value={roomName} onChange={(e) => setRoomName(e.target.value)}>
            {roomOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </FormInput>
        </div>
        <div>
          <Label>Brand</Label>
          <FormInput value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Greenply" />
        </div>
      </div>
      <div className="lb-form-row">
        <div>
          <Label>Status</Label>
          <FormInput as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="not_started">Not started</option>
            <option value="procured">Procured</option>
            <option value="installed">Installed</option>
          </FormInput>
        </div>
        <div>
          <Label>Install date</Label>
          <FormInput type="date" value={installDate} onChange={(e) => setInstallDate(e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn variant="am" onClick={submit} disabled={saving}>
          Add to BOQ
        </Btn>
      </div>
    </Modal>
  );
}
