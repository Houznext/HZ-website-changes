import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Box } from 'lucide-react';
import livebuildApi from '../lib/api';
import type { LbRoom } from '../lib/types';
import { Btn } from './Btn';
import { FormInput } from './FormInput';
import { Label } from './Label';
import { Modal } from './Modal';
import { lbToast } from './Toast';

const ModelPreview3d = dynamic(() => import('./ModelPreview3d').then((m) => m.ModelPreview3d), {
  ssr: false,
  loading: () => (
    <div style={{ height: 360, background: '#0f172a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
      Loading 3D…
    </div>
  ),
});

type Props = {
  open: boolean;
  projectId: string;
  rooms: LbRoom[];
  onClose: () => void;
  onUploaded: () => void;
};

export function Upload3dModelModal({ open, projectId, rooms, onClose, onUploaded }: Props) {
  const [label, setLabel] = useState('');
  const [modelType, setModelType] = useState('full_home');
  const [floorNumber, setFloorNumber] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!file || !label.trim()) {
      lbToast('GLB file and label required', 'err');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
      lbToast('Upload a .glb or .gltf file', 'err');
      return;
    }
    setSaving(true);
    try {
      await livebuildApi.upload3dModel(projectId, file, {
        label: label.trim(),
        modelType,
        floorNumber: floorNumber ? Number(floorNumber) : undefined,
        roomId: roomId || undefined,
        isPrimary,
      });
      lbToast('3D model uploaded', 'ok');
      onUploaded();
      onClose();
      setLabel('');
      setFile(null);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Upload failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Upload 3D model" maxWidth={560}
      icon={
        <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#1a3d5c,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box size={15} strokeWidth={1.8} color="#fff" />
        </div>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <Label required>Model label</Label>
        <FormInput
          list="lb-3d-labels"
          placeholder="e.g. Full 3BHK interior"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <datalist id="lb-3d-labels">
          <option value="Full home interior" />
          <option value="Ground floor" />
          <option value="First floor" />
        </datalist>
      </div>
      <div className="lb-form-row" style={{ marginBottom: 12 }}>
        <div>
          <Label required>Type</Label>
          <FormInput as="select" value={modelType} onChange={(e) => setModelType(e.target.value)}>
            <option value="full_home">Full home</option>
            <option value="floor">Floor level</option>
            <option value="room">Single room</option>
          </FormInput>
        </div>
        <div>
          <Label>Floor number</Label>
          <FormInput type="number" min={1} placeholder="1" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} />
        </div>
      </div>
      {modelType === 'room' ? (
        <div style={{ marginBottom: 12 }}>
          <Label>Linked room</Label>
          <FormInput as="select" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">Select room</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </FormInput>
        </div>
      ) : null}
      <label className="lb-dpr-upload" style={{ display: 'block', marginBottom: 12 }}>
        <input
          type="file"
          accept=".glb,.gltf"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <div style={{ fontWeight: 700, fontSize: 12.5, color: 'var(--lb-ch)' }}>Choose GLB / GLTF file</div>
        <div style={{ fontSize: 11.5, color: 'var(--lb-mu)', marginTop: 3 }}>
          Max 150MB · Export from SketchUp / Blender as GLB
          {file ? ` · ${file.name}` : ''}
        </div>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 12.5 }}>
        <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
        Set as primary model on customer 3D page
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn variant="blue" onClick={submit} disabled={saving}>{saving ? 'Uploading…' : 'Upload'}</Btn>
      </div>
    </Modal>
  );
}
