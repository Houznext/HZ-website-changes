import { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import livebuildApi from '../lib/api';
import { LB_ROOM_ICONS } from '../lib/constants';
import {
  getPropertyCategory,
  PROPERTY_CATEGORY_FEATURES,
} from '../lib/propertyInfoConfig';
import type { LbRoom } from '../lib/types';
import { AddRoomModal } from '../components/AddRoomModal';
import { EditRoomModal } from '../components/EditRoomModal';
import { AddRoomWorkTypeModal } from '../components/AddRoomWorkTypeModal';
import { WorkTypeModal } from '../components/WorkTypeModal';
import { Badge, Btn, FormInput, Label, Modal, ProgressRing, lbToast } from '../components';

type Props = {
  projectId: string;
  projectName: string;
  propertyType: string;
  rooms: LbRoom[];
  onReload: () => void;
};

type RoomWt = LbRoom['workTypes'][number];

function statusColor(status: string) {
  if (status === 'done') return '#94a3b8';
  if (status === 'hold') return 'var(--lb-am)';
  return 'var(--lb-blue)';
}

function RoomCard({
  room,
  index,
  onSave,
  onDelete,
  onAddWorkType,
  onRemoveWorkType,
  onEditDetails,
}: {
  room: LbRoom;
  index: number;
  onSave: (r: LbRoom, pct: number, status: string, holdReason: string) => void;
  onDelete: (r: LbRoom) => void;
  onAddWorkType: (r: LbRoom) => void;
  onRemoveWorkType: (r: LbRoom, wt: RoomWt) => void;
  onEditDetails: (r: LbRoom) => void;
}) {
  const [pct, setPct] = useState(String(room.progressPct));
  const [status, setStatus] = useState(room.status);
  const [holdReason, setHoldReason] = useState(room.holdReason ?? '');

  useEffect(() => {
    setPct(String(room.progressPct));
    setStatus(room.status);
    setHoldReason(room.holdReason ?? '');
  }, [room.id, room.progressPct, room.status, room.holdReason]);
  const icon = LB_ROOM_ICONS[room.name] ?? '🏠';
  const dim =
    room.lengthFt && room.widthFt ? `${room.lengthFt}×${room.widthFt} ft` : room.dimensions ?? '';
  const detailParts = [
    dim,
    room.ceilingHeight ? `Ceiling ${room.ceilingHeight}` : '',
    room.flooring ? room.flooring : '',
    `${room.workTypes.length} work types`,
  ].filter(Boolean);

  return (
    <div className="lb-card lb-fa" style={{ animationDelay: `${index * 0.05}s` }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 14,
          paddingBottom: 12,
          borderBottom: '1px solid #f0f4f8',
        }}
      >
        <div style={{ fontSize: 22 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontFamily: 'var(--lb-m)', fontSize: 14, fontWeight: 700 }}>{room.name}</span>
            <Badge variant={room.status === 'done' ? 'tl' : room.status === 'hold' ? 'amber' : 'blue'}>
              {room.status === 'live' ? '● Live' : room.status}
            </Badge>
          </div>
          <div style={{ fontSize: 12, color: 'var(--lb-mu)' }}>
            {detailParts.join(' · ')}
          </div>
        </div>
        <ProgressRing pct={room.progressPct} size={64} strokeWidth={5} color={statusColor(room.status)} />
        <Btn variant="ghost" size="sm" onClick={() => onEditDetails(room)}>
          Edit
        </Btn>
        <Btn
          variant="icon"
          size="sm"
          aria-label={`Delete ${room.name}`}
          onClick={() => onDelete(room)}
          title="Delete room"
        >
          <Trash2 size={16} color="var(--lb-rd)" />
        </Btn>
      </div>
      <div className="lb-g3" style={{ marginBottom: 12 }}>
        <div>
          <Label>Progress %</Label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FormInput
              type="number"
              min={0}
              max={100}
              style={{ width: 75 }}
              value={pct}
              onChange={(e) => setPct(e.target.value)}
            />
            <div className="lb-prog-track" style={{ flex: 1, height: 5 }}>
              <div
                className="lb-prog-fill"
                style={{
                  width: `${Math.min(100, Number(pct) || 0)}%`,
                  background: statusColor(status),
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <Label>Status</Label>
          <FormInput as="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="live">Live</option>
            <option value="hold">On Hold</option>
            <option value="done">Done</option>
          </FormInput>
        </div>
        <div>
          <Label>Hold reason</Label>
          <FormInput
            placeholder="If on hold…"
            value={holdReason}
            disabled={status !== 'hold'}
            style={{ opacity: status !== 'hold' ? 0.4 : 1 }}
            onChange={(e) => setHoldReason(e.target.value)}
          />
        </div>
      </div>
      <Btn variant="blue" size="sm" onClick={() => onSave(room, Number(pct) || 0, status, holdReason)}>
        Save room
      </Btn>
      <div style={{ marginTop: 10 }}>
        <Label style={{ marginBottom: 7 }}>Work types</Label>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          {room.workTypes.map((w) => (
            <span key={w.id} className="lb-wt-chip on" style={{ cursor: 'default' }}>
              {w.name}
              <button
                type="button"
                aria-label={`Remove ${w.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveWorkType(room, w);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  marginLeft: 2,
                  cursor: 'pointer',
                  color: 'var(--lb-rd)',
                  lineHeight: 1,
                }}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}
          <button
            type="button"
            className="lb-wt-chip"
            onClick={(e) => {
              e.stopPropagation();
              onAddWorkType(room);
            }}
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectRoomsTab({ projectId, projectName, propertyType, rooms, onReload }: Props) {
  const category = getPropertyCategory(propertyType);
  const features = PROPERTY_CATEGORY_FEATURES[category];
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LbRoom | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addWtRoom, setAddWtRoom] = useState<LbRoom | null>(null);
  const [removeWtTarget, setRemoveWtTarget] = useState<{ room: LbRoom; wt: RoomWt } | null>(null);
  const [removingWt, setRemovingWt] = useState(false);
  const [workTypeModalOpen, setWorkTypeModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<LbRoom | null>(null);

  const saveRoom = async (
    r: LbRoom,
    pct: number,
    status: string,
    holdReason: string,
  ) => {
    try {
      await livebuildApi.updateRoom(r.id, {
        pct,
        status,
        holdReason: status === 'hold' ? holdReason : null,
      });
      lbToast('Room updated', 'ok');
      onReload();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Update failed', 'err');
    }
  };

  const confirmDeleteRoom = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await livebuildApi.deleteRoom(deleteTarget.id);
      lbToast(`"${deleteTarget.name}" removed from project`, 'ok');
      setDeleteTarget(null);
      onReload();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to delete room', 'err');
    } finally {
      setDeleting(false);
    }
  };

  const confirmRemoveWorkType = async () => {
    if (!removeWtTarget) return;
    setRemovingWt(true);
    try {
      await livebuildApi.deleteRoomWorkType(removeWtTarget.wt.id);
      lbToast(`"${removeWtTarget.wt.name}" removed from ${removeWtTarget.room.name}`, 'ok');
      setRemoveWtTarget(null);
      onReload();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to remove work type', 'err');
    } finally {
      setRemovingWt(false);
    }
  };

  const handleWorkTypeAdded = () => {
    onReload();
  };

  const dimLabel =
    deleteTarget?.lengthFt && deleteTarget?.widthFt
      ? `${deleteTarget.lengthFt}×${deleteTarget.widthFt} ft`
      : '—';

  const addWtRoomLive = addWtRoom
    ? rooms.find((r) => r.id === addWtRoom.id) ?? addWtRoom
    : null;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--lb-m)', fontSize: 14, fontWeight: 700 }}>
            {features.adminRoomsHeading} — {projectName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--lb-mu)', marginTop: 4 }}>{features.adminRoomsSub}</div>
        </div>
        <Btn variant="ghost" size="sm" onClick={() => setModalOpen(true)}>
          + {features.addRoomLabel}
        </Btn>
      </div>
      {rooms.length === 0 ? (
        <div className="lb-empty">{features.adminRoomsSub}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rooms.map((r, i) => (
            <RoomCard
              key={r.id}
              room={r}
              index={i}
              onSave={saveRoom}
              onDelete={setDeleteTarget}
              onAddWorkType={setAddWtRoom}
              onRemoveWorkType={(room, wt) => setRemoveWtTarget({ room, wt })}
              onEditDetails={setEditRoom}
            />
          ))}
        </div>
      )}
      <AddRoomModal
        open={modalOpen}
        projectId={projectId}
        onClose={() => setModalOpen(false)}
        onCreated={onReload}
      />

      <EditRoomModal
        open={!!editRoom}
        room={editRoom}
        onClose={() => setEditRoom(null)}
        onSaved={onReload}
      />

      <AddRoomWorkTypeModal
        open={!!addWtRoom}
        room={addWtRoomLive}
        onClose={() => setAddWtRoom(null)}
        onAdded={handleWorkTypeAdded}
        onCreateNewWorkType={() => setWorkTypeModalOpen(true)}
      />

      <WorkTypeModal
        open={workTypeModalOpen}
        onClose={() => setWorkTypeModalOpen(false)}
        onSaved={() => {
          setWorkTypeModalOpen(false);
          handleWorkTypeAdded();
        }}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete room?"
        subtitle="This cannot be undone. Houznext will email project contacts about the removal."
        maxWidth={480}
        footer={
          <>
            <Btn variant="red" onClick={confirmDeleteRoom} disabled={deleting}>
              {deleting ? 'Removing…' : 'Yes, delete room'}
            </Btn>
            <Btn variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              No, keep room
            </Btn>
          </>
        }
      >
        {deleteTarget ? (
          <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--lb-ch)' }}>
            <p style={{ margin: '0 0 12px' }}>
              Remove <strong>{deleteTarget.name}</strong> from <strong>{projectName}</strong>?
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--lb-mu)' }}>
              <li>Progress: {deleteTarget.progressPct}%</li>
              <li>Status: {deleteTarget.status}</li>
              <li>Dimensions: {dimLabel}</li>
              <li>
                Work types:{' '}
                {deleteTarget.workTypes.length
                  ? deleteTarget.workTypes.map((w) => w.name).join(', ')
                  : 'None'}
              </li>
            </ul>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={!!removeWtTarget}
        onClose={() => !removingWt && setRemoveWtTarget(null)}
        title="Remove work type?"
        subtitle="This removes the work type from this room only (catalog entry stays)."
        maxWidth={440}
        footer={
          <>
            <Btn variant="red" onClick={confirmRemoveWorkType} disabled={removingWt}>
              {removingWt ? 'Removing…' : 'Yes, remove'}
            </Btn>
            <Btn variant="ghost" onClick={() => setRemoveWtTarget(null)} disabled={removingWt}>
              No, keep
            </Btn>
          </>
        }
      >
        {removeWtTarget ? (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
            Remove <strong>{removeWtTarget.wt.name}</strong> from{' '}
            <strong>{removeWtTarget.room.name}</strong>?
          </p>
        ) : null}
      </Modal>
    </div>
  );
}
