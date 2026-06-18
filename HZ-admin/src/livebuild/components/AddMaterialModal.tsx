import { useEffect, useState } from 'react';
import { Package } from 'lucide-react';
import livebuildApi from '../lib/api';
import { LB_MATERIAL_CATEGORIES, LB_MATERIAL_STATUSES, LB_MATERIAL_UNITS, normalizeMaterialStatus } from '../lib/constants';
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
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [brand, setBrand] = useState('');
  const [status, setStatus] = useState('started');
  const [installDate, setInstallDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && rooms.length) setSelectedRoomIds([rooms[0].id]);
    if (!open) setSelectedRoomIds([]);
  }, [open, rooms]);

  const toggleRoom = (roomId: string) => {
    setSelectedRoomIds((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId],
    );
  };

  const selectAllRooms = () => setSelectedRoomIds(rooms.map((r) => r.id));
  const clearRooms = () => setSelectedRoomIds([]);

  const submit = async () => {
    if (!name.trim()) {
      lbToast('Material name required', 'err');
      return;
    }
    if (!selectedRoomIds.length) {
      lbToast('Select at least one room', 'err');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        specification: specification || undefined,
        quantity: qty ? Number(qty) : 1,
        unit,
        brand: brand || undefined,
        status,
        installDate: installDate || undefined,
      };
      await Promise.all(
        selectedRoomIds.map((roomId) =>
          livebuildApi.createMaterial(projectId, {
            ...payload,
            roomId: Number(roomId),
          }),
        ),
      );
      lbToast(
        selectedRoomIds.length > 1
          ? `Added to ${selectedRoomIds.length} rooms`
          : 'Added to BOQ',
        'ok',
      );
      onCreated();
      onClose();
      setName('');
      setQty('');
      setSpecification('');
      setBrand('');
      setInstallDate('');
      setSelectedRoomIds([]);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed', 'err');
    } finally {
      setSaving(false);
    }
  };

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
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Label required>Rooms</Label>
            {rooms.length > 1 ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={selectAllRooms}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--lb-blue)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearRooms}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: 'var(--lb-mu)',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Clear
                </button>
              </div>
            ) : null}
          </div>
          {rooms.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--lb-mu)', margin: 0 }}>
              Add rooms to this project first, then assign materials.
            </p>
          ) : (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                padding: '10px 12px',
                border: '1.5px solid var(--lb-bd)',
                borderRadius: 10,
                background: '#fff',
                maxHeight: 140,
                overflowY: 'auto',
              }}
            >
              {rooms.map((room) => {
                const checked = selectedRoomIds.includes(room.id);
                return (
                  <label
                    key={room.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 10px',
                      borderRadius: 8,
                      border: `1.5px solid ${checked ? 'var(--lb-blue)' : 'var(--lb-bd)'}`,
                      background: checked ? 'var(--lb-bl)' : '#fff',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: checked ? 700 : 500,
                      color: checked ? 'var(--lb-blue)' : 'var(--lb-ch)',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRoom(room.id)}
                      style={{ accentColor: 'var(--lb-blue)' }}
                    />
                    {room.name}
                  </label>
                );
              })}
            </div>
          )}
          <p style={{ fontSize: 11, color: 'var(--lb-mu)', margin: '8px 0 0' }}>
            Total quantity applies to the procurement. The same item appears under each selected room.
          </p>
        </div>
      </div>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label>Brand</Label>
          <FormInput value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Greenply" />
        </div>
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
      </div>
      <div className="lb-form-row" style={{ marginBottom: 0 }}>
        <div>
          <Label>Install date</Label>
          <FormInput type="date" value={installDate} onChange={(e) => setInstallDate(e.target.value)} />
        </div>
        <div />
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
