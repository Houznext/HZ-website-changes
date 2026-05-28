import { useCallback, useEffect, useState } from 'react';
import { Download, Plus, Package, CheckCircle, Clock, Trash2 } from 'lucide-react';
import livebuildApi from '../lib/api';
import { LB_MATERIAL_STATUSES } from '../lib/constants';
import type { LbMaterial, LbRoom } from '../lib/types';
import { AddMaterialModal } from '../components/AddMaterialModal';
import { Badge, Btn, FormInput, StatCard, TabBar, lbToast } from '../components';
import Loader from '@/src/common/Loader';

type Props = { projectId: string; projectName: string };

export function ProjectMaterialsTab({ projectId, projectName }: Props) {
  const [items, setItems] = useState<LbMaterial[]>([]);
  const [rooms, setRooms] = useState<LbRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [roomFilter, setRoomFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mats, rms] = await Promise.all([
        livebuildApi.listMaterials(projectId),
        livebuildApi.listRooms(projectId),
      ]);
      setItems(mats);
      setRooms(rms);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load materials', 'err');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter((m) => {
    if (roomFilter !== 'all' && m.room !== roomFilter && m.roomId !== roomFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    return true;
  });

  const installed = items.filter((m) => m.status === 'installed').length;
  const pending = items.filter((m) => m.status !== 'installed').length;

  const byRoom = rooms.map((room) => ({
    room,
    items: filtered.filter((m) => m.room === room.name || m.roomId === room.id),
  }));

  const uncategorized = filtered.filter(
    (m) => !rooms.some((r) => m.room === r.name || m.roomId === r.id),
  );

  const downloadBoq = () => {
    const rows = [['Room', 'Item', 'Category', 'Qty', 'Unit', 'Status', 'Brand', 'Spec']];
    filtered.forEach((m) => {
      rows.push([
        m.room ?? '',
        m.name,
        m.category ?? '',
        String(m.quantity ?? ''),
        m.unit ?? '',
        m.status,
        m.brand ?? '',
        m.specification ?? '',
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '-')}-boq.csv`;
    a.click();
    URL.revokeObjectURL(url);
    lbToast('BOQ downloaded', 'ok');
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ fontFamily: 'var(--lb-m)', fontSize: 14, fontWeight: 700 }}>
          Materials &amp; BOQ — {projectName}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="ghost" size="sm" onClick={downloadBoq}>
            <Download size={12} strokeWidth={2} />
            Download BOQ
          </Btn>
          <Btn variant="blue" size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={12} strokeWidth={2} />
            Add material
          </Btn>
        </div>
      </div>
      <div className="lb-g3" style={{ marginBottom: 16 }}>
        <StatCard
          label="Total items"
          value={items.length}
          valueColor="var(--lb-blue)"
          icon={<Package size={18} strokeWidth={1.8} color="#2563eb" />}
        />
        <StatCard
          label="Installed"
          value={installed}
          valueColor="var(--lb-tl)"
          icon={<CheckCircle size={18} strokeWidth={1.8} color="var(--lb-tl)" />}
        />
        <StatCard
          label="Pending"
          value={pending}
          valueColor="var(--lb-am)"
          icon={<Clock size={18} strokeWidth={1.8} color="var(--lb-am)" />}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <TabBar
          tabs={[
            { id: 'all', label: 'All rooms' },
            ...rooms.map((r) => ({ id: r.name, label: r.name })),
          ]}
          active={roomFilter}
          onChange={setRoomFilter}
        />
      </div>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          type="button"
          className={`lb-chip ${statusFilter === 'all' ? 'sel' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All statuses
        </button>
        {LB_MATERIAL_STATUSES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`lb-chip ${statusFilter === s.id ? 'sel' : ''}`}
            onClick={() => setStatusFilter(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>
      {byRoom.map(({ room, items: roomItems }) =>
        roomItems.length ? (
          <div key={room.id} style={{ marginBottom: 18 }}>
            <div
              style={{
                fontFamily: 'var(--lb-m)',
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 10,
                color: 'var(--lb-ch)',
              }}
            >
              {room.name}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {roomItems.map((m) => (
                <MaterialRow key={m.id} material={m} onChanged={load} />
              ))}
            </div>
          </div>
        ) : null,
      )}
      {uncategorized.length > 0 ? (
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: 'var(--lb-m)',
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 10,
              color: 'var(--lb-ch)',
            }}
          >
            Other
          </div>
          {uncategorized.map((m) => (
            <MaterialRow key={m.id} material={m} onChanged={load} />
          ))}
        </div>
      ) : null}
      {filtered.length === 0 ? <div className="lb-empty">No BOQ items</div> : null}
      <AddMaterialModal
        open={modalOpen}
        projectId={projectId}
        rooms={rooms}
        onClose={() => setModalOpen(false)}
        onCreated={load}
      />
    </div>
  );
}

function MaterialRow({ material: m, onChanged }: { material: LbMaterial; onChanged: () => void }) {
  const updateStatus = async (status: string) => {
    try {
      await livebuildApi.updateMaterial(m.id, { status });
      lbToast('Updated', 'ok');
      onChanged();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Update failed', 'err');
    }
  };

  return (
    <div className="lb-card-sm" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{m.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>
          {m.category}
          {m.quantity != null ? ` · ${m.quantity} ${m.unit ?? ''}` : ''}
          {m.brand ? ` · ${m.brand}` : ''}
          {m.specification ? ` · ${m.specification}` : ''}
        </div>
      </div>
      <FormInput
        as="select"
        style={{ fontSize: 11, padding: '5px 8px', width: 120 }}
        value={m.status}
        onChange={(e) => updateStatus(e.target.value)}
      >
        {LB_MATERIAL_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </FormInput>
      <Btn
        variant="icon"
        size="xs"
        aria-label="Delete"
        onClick={async () => {
          if (!confirm('Delete material?')) return;
          await livebuildApi.deleteMaterial(m.id);
          lbToast('Deleted', 'ok');
          onChanged();
        }}
      >
        <Trash2 size={12} color="var(--lb-rd)" />
      </Btn>
    </div>
  );
}
