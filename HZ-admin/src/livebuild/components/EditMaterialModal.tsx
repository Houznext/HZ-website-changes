import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import livebuildApi from '../lib/api';
import { LB_MATERIAL_CATEGORIES, LB_MATERIAL_STATUSES, LB_MATERIAL_UNITS, normalizeMaterialStatus } from '../lib/constants';
import type { LbMaterial, LbRoom } from '../lib/types';
import { Btn } from './Btn';
import { FormInput } from './FormInput';
import { Label } from './Label';
import { Modal } from './Modal';
import { lbToast } from './Toast';

type Props = {
  open: boolean;
  material: LbMaterial | null;
  rooms: LbRoom[];
  onClose: () => void;
  onSaved: () => void;
};

export function EditMaterialModal({ open, material, rooms, onClose, onSaved }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(LB_MATERIAL_CATEGORIES[0]);
  const [specification, setSpecification] = useState('');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('No.');
  const [roomId, setRoomId] = useState('');
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('started');
  const [installDate, setInstallDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !material) return;
    setName(material.name);
    setCategory(material.category ?? LB_MATERIAL_CATEGORIES[0]);
    setSpecification(material.specification ?? '');
    setQty(material.quantity != null ? String(material.quantity) : '');
    setUnit(material.unit ?? 'No.');
    setRoomId(material.roomId ?? '');
    setBrand(material.brand ?? '');
    setStatus(normalizeMaterialStatus(material.status));
    setInstallDate(material.installDate?.slice(0, 10) ?? '');
  }, [open, material]);

  const submit = async () => {
    if (!material || !name.trim()) {
      lbToast('Material name required', 'err');
      return;
    }
    setSaving(true);
    try {
      await livebuildApi.updateMaterial(material.id, {
        name: name.trim(),
        category,
        specification: specification || undefined,
        quantity: qty ? Number(qty) : 1,
        unit,
        roomId: roomId ? Number(roomId) : undefined,
        brand: brand || undefined,
        status,
        installDate: installDate || null,
      });
      lbToast('Material updated', 'ok');
      onSaved();
      onClose();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Update failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit material"
      subtitle="Updates appear on the customer Materials page"
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
          <Label required>Material name</Label>
          <FormInput value={name} onChange={(e) => setName(e.target.value)} />
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
        <Label>Specification</Label>
        <FormInput value={specification} onChange={(e) => setSpecification(e.target.value)} />
      </div>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Quantity</Label>
          <FormInput type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
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
          <Label>Room</Label>
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
          <Label>Brand</Label>
          <FormInput value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>
      </div>
      <div className="lb-form-row">
        <div>
          <Label>Status</Label>
          <FormInput as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {LB_MATERIAL_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
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
          Save material
        </Btn>
      </div>
    </Modal>
  );
}
