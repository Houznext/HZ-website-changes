import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import livebuildApi from '../lib/api';
import type { LbRoom, LbWorkType } from '../lib/types';
import { Btn } from './Btn';
import { Modal } from './Modal';
import { lbToast } from './Toast';
import Loader from '@/src/common/Loader';

type Props = {
  open: boolean;
  room: LbRoom | null;
  onClose: () => void;
  onAdded: () => void;
  onCreateNewWorkType: () => void;
};

export function AddRoomWorkTypeModal({
  open,
  room,
  onClose,
  onAdded,
  onCreateNewWorkType,
}: Props) {
  const [catalog, setCatalog] = useState<LbWorkType[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await livebuildApi.listWorkTypes();
      setCatalog(Array.isArray(list) ? list.filter((w) => w.status === 'active') : []);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load work types', 'err');
      setCatalog([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const assignedIds = useMemo(() => {
    if (!room) return new Set<string>();
    return new Set(room.workTypes.map((w) => w.workTypeId).filter(Boolean) as string[]);
  }, [room]);

  const available = useMemo(
    () => catalog.filter((w) => !assignedIds.has(w.id)),
    [catalog, assignedIds],
  );

  const addOne = async (wt: LbWorkType) => {
    if (!room) return;
    setAddingId(wt.id);
    try {
      await livebuildApi.addRoomWorkType(room.id, wt.id);
      lbToast(`${wt.name} added to ${room.name}`, 'ok');
      onAdded();
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to add work type', 'err');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add work type to room"
      subtitle={room ? `${room.name} — select from catalog or create new` : undefined}
      maxWidth={480}
      footer={
        <Btn variant="ghost" onClick={onClose}>
          Done
        </Btn>
      }
    >
      <div style={{ marginBottom: 12 }}>
        <Btn variant="blue" size="sm" onClick={onCreateNewWorkType}>
          <Plus size={12} strokeWidth={2} />
          Create new work type
        </Btn>
      </div>
      {loading ? (
        <div className="lb-loading" style={{ padding: 24 }}>
          <Loader />
        </div>
      ) : available.length === 0 ? (
        <div className="lb-empty" style={{ padding: 16 }}>
          {catalog.length === 0
            ? 'No work types in catalog — create one first'
            : 'All work types are already assigned to this room'}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: 320,
            overflowY: 'auto',
          }}
        >
          {available.map((wt) => (
            <div
              key={wt.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                border: '1px solid var(--lb-brd)',
                borderRadius: 9,
                background: '#fafbfc',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{wt.name}</div>
                <div style={{ fontSize: 11, color: 'var(--lb-mu)' }}>{wt.category}</div>
              </div>
              <Btn
                variant="blue"
                size="xs"
                disabled={addingId === wt.id}
                onClick={() => addOne(wt)}
              >
                {addingId === wt.id ? 'Adding…' : 'Add'}
              </Btn>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
