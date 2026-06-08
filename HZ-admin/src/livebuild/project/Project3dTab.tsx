import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Plus, Star, Trash2 } from 'lucide-react';
import livebuildApi from '../lib/api';
import type { Lb3dHotspot, Lb3dModel, LbRoom } from '../lib/types';
import { Upload3dModelModal } from '../components/Upload3dModelModal';
import { Btn, FormInput, Label, lbToast } from '../components';
import Loader from '@/src/common/Loader';

const ModelPreview3d = dynamic(() => import('../components/ModelPreview3d').then((m) => m.ModelPreview3d), {
  ssr: false,
});

type Props = { projectId: string; projectName: string; rooms: LbRoom[] };

function formatSize(bytes?: number) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Project3dTab({ projectId, projectName, rooms }: Props) {
  const [models, setModels] = useState<Lb3dModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [editHotspot, setEditHotspot] = useState<Lb3dHotspot | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await livebuildApi.list3dModels(projectId);
      setModels(rows);
      setSelectedId((prev) => prev ?? rows[0]?.id ?? null);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load 3D models', 'err');
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = models.find((m) => m.id === selectedId) ?? null;
  const hotspots = selected?.hotspots ?? [];

  const setPrimary = async (model: Lb3dModel) => {
    try {
      await livebuildApi.update3dModel(model.id, { isPrimary: true });
      lbToast('Primary model updated', 'ok');
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Update failed', 'err');
    }
  };

  const removeModel = async (model: Lb3dModel) => {
    if (!confirm(`Delete "${model.label}"?`)) return;
    try {
      await livebuildApi.delete3dModel(model.id);
      lbToast('Model deleted', 'ok');
      if (selectedId === model.id) setSelectedId(null);
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Delete failed', 'err');
    }
  };

  const seedHotspots = async () => {
    if (!selected) return;
    try {
      await livebuildApi.seed3dHotspots(selected.id);
      lbToast('Hotspots generated from rooms', 'ok');
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to seed hotspots', 'err');
    }
  };

  const addHotspot = async () => {
    if (!selected) return;
    try {
      const created = await livebuildApi.create3dHotspot(selected.id, {
        label: 'New hotspot',
        positionX: 0,
        positionY: 1.2,
        positionZ: 0,
      });
      setEditHotspot(created);
      setActiveHotspotId(created.id);
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to add hotspot', 'err');
    }
  };

  const saveHotspot = async () => {
    if (!editHotspot) return;
    try {
      await livebuildApi.update3dHotspot(editHotspot.id, {
        label: editHotspot.label,
        roomId: editHotspot.roomId ?? null,
        positionX: editHotspot.position[0],
        positionY: editHotspot.position[1],
        positionZ: editHotspot.position[2],
        cameraPosX: editHotspot.camera?.position[0] ?? null,
        cameraPosY: editHotspot.camera?.position[1] ?? null,
        cameraPosZ: editHotspot.camera?.position[2] ?? null,
        cameraTargetX: editHotspot.camera?.target[0] ?? null,
        cameraTargetY: editHotspot.camera?.target[1] ?? null,
        cameraTargetZ: editHotspot.camera?.target[2] ?? null,
      });
      lbToast('Hotspot saved', 'ok');
      setEditHotspot(null);
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Save failed', 'err');
    }
  };

  const deleteHotspot = async (id: string) => {
    if (!confirm('Delete this hotspot?')) return;
    try {
      await livebuildApi.delete3dHotspot(id);
      if (editHotspot?.id === id) setEditHotspot(null);
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Delete failed', 'err');
    }
  };

  const onPlace = (point: [number, number, number]) => {
    if (!editHotspot) {
      lbToast('Select or add a hotspot first, then click the model to place it', 'err');
      return;
    }
    setEditHotspot({
      ...editHotspot,
      position: point,
      camera: editHotspot.camera ?? {
        position: [point[0], point[1] + 2, point[2] + 3],
        target: point,
      },
    });
    lbToast('Pin position updated — click Save hotspot', 'ok');
  };

  if (loading) {
    return (
      <div className="lb-loading">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontFamily: 'var(--lb-m)', fontSize: 14, fontWeight: 700 }}>
          3D Walkthrough — {projectName}
        </div>
        <Btn variant="blue" size="sm" onClick={() => setUploadOpen(true)}>
          <Plus size={12} />
          Upload GLB
        </Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        <div className="lb-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--lb-ch)' }}>Models</div>
          {models.length === 0 ? (
            <div className="lb-empty" style={{ padding: '20px 0' }}>No 3D models yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setSelectedId(m.id); setEditHotspot(null); }}
                  className="lb-card-sm"
                  style={{
                    textAlign: 'left',
                    border: selectedId === m.id ? '1.5px solid var(--lb-blue)' : undefined,
                    cursor: 'pointer',
                    background: selectedId === m.id ? 'var(--lb-bl)' : undefined,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--lb-mu)' }}>
                    {m.modelType}{m.floorNumber ? ` · Floor ${m.floorNumber}` : ''} · {formatSize(m.fileSizeBytes)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {m.isPrimary ? (
                      <span className="lb-chip sel" style={{ fontSize: 10 }}>Primary</span>
                    ) : (
                      <Btn variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); setPrimary(m); }}>
                        <Star size={11} /> Set primary
                      </Btn>
                    )}
                    <Btn variant="icon" size="xs" aria-label="Delete" onClick={(e) => { e.stopPropagation(); removeModel(m); }}>
                      <Trash2 size={12} color="var(--lb-rd)" />
                    </Btn>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {selected ? (
            <>
              <ModelPreview3d
                modelUrl={selected.fileUrl}
                hotspots={editHotspot ? hotspots.map((h) => (h.id === editHotspot.id ? editHotspot : h)) : hotspots}
                height={380}
                placing={placing}
                activeHotspotId={activeHotspotId}
                onPlace={onPlace}
                onHotspotSelect={(h) => {
                  setEditHotspot(h);
                  setActiveHotspotId(h.id);
                }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 14px' }}>
                <Btn variant={placing ? 'blue' : 'ghost'} size="sm" onClick={() => setPlacing((p) => !p)}>
                  <MapPin size={12} />
                  {placing ? 'Click model to place pin' : 'Place pin on model'}
                </Btn>
                <Btn variant="ghost" size="sm" onClick={seedHotspots}>Generate from rooms</Btn>
                <Btn variant="ghost" size="sm" onClick={addHotspot}>+ Add hotspot</Btn>
              </div>

              {editHotspot ? (
                <div className="lb-card" style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Edit hotspot</div>
                  <div className="lb-form-row" style={{ marginBottom: 10 }}>
                    <div>
                      <Label>Label</Label>
                      <FormInput value={editHotspot.label} onChange={(e) => setEditHotspot({ ...editHotspot, label: e.target.value })} />
                    </div>
                    <div>
                      <Label>Room</Label>
                      <FormInput
                        as="select"
                        value={editHotspot.roomId ?? ''}
                        onChange={(e) => setEditHotspot({ ...editHotspot, roomId: e.target.value || undefined })}
                      >
                        <option value="">None</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </FormInput>
                    </div>
                  </div>
                  <div className="lb-g3" style={{ marginBottom: 10 }}>
                    {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                      <div key={axis}>
                        <Label>Position {axis}</Label>
                        <FormInput
                          type="number"
                          step="0.1"
                          value={editHotspot.position[i]}
                          onChange={(e) => {
                            const pos = [...editHotspot.position] as [number, number, number];
                            pos[i] = Number(e.target.value);
                            setEditHotspot({ ...editHotspot, position: pos });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Btn variant="blue" size="sm" onClick={saveHotspot}>Save hotspot</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setEditHotspot(null)}>Cancel</Btn>
                    <Btn variant="ghost" size="sm" onClick={() => deleteHotspot(editHotspot.id)}>
                      <Trash2 size={12} color="var(--lb-rd)" /> Delete
                    </Btn>
                  </div>
                </div>
              ) : null}

              <div className="lb-card">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Hotspots ({hotspots.length})</div>
                {hotspots.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--lb-mu)', margin: 0 }}>Generate from rooms or add manually, then place pins on the model.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {hotspots.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        className="lb-card-sm"
                        style={{ textAlign: 'left', cursor: 'pointer' }}
                        onClick={() => { setEditHotspot(h); setActiveHotspotId(h.id); }}
                      >
                        <strong>{h.label}</strong>
                        {h.roomName ? ` · ${h.roomName}` : ''}
                        <span style={{ color: 'var(--lb-mu)', fontSize: 11 }}>
                          {' '}· ({h.position.map((n) => n.toFixed(1)).join(', ')})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="lb-empty">Upload a GLB model to configure the customer 3D walkthrough</div>
          )}
        </div>
      </div>

      <Upload3dModelModal
        open={uploadOpen}
        projectId={projectId}
        rooms={rooms}
        onClose={() => setUploadOpen(false)}
        onUploaded={load}
      />
    </div>
  );
}
