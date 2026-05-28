import { useCallback, useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import livebuildApi from '../lib/api';
import type { LbRoom } from '../lib/types';
import {
  Btn,
  DprWorkTypeCard,
  FormInput,
  Label,
  type DprWorkTypeState,
  lbToast,
} from '../components';

type Props = {
  projectId: string;
  projectName: string;
  rooms: LbRoom[];
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ProjectDprTab({ projectId, projectName, rooms }: Props) {
  const [date, setDate] = useState(todayIso());
  const [roomId, setRoomId] = useState('');
  const [wtStates, setWtStates] = useState<DprWorkTypeState[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rooms.length && !roomId) setRoomId(rooms[0].id);
  }, [rooms, roomId]);

  const loadDpr = useCallback(async () => {
    if (!projectId || !roomId) return;
    setLoading(true);
    try {
      const ctx = await livebuildApi.getDprContext(projectId, { date, roomId });
      setWtStates(
        ctx.workTypes.map((w) => ({
          roomWorkTypeId: w.roomWorkTypeId,
          workTypeName: w.workTypeName,
          previousPct: w.previousPct,
          pct: w.pct != null ? String(w.pct) : '',
          doneToday: !!w.doneToday,
          notes: w.notes ?? '',
          savedPhotos: (w.photos ?? []).map((p) => ({ id: p.id, url: p.url })),
          photos: [],
          previews: [],
        })),
      );
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load DPR', 'err');
      setWtStates([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, roomId, date]);

  useEffect(() => {
    loadDpr();
  }, [loadDpr]);

  const updateWt = (index: number, next: DprWorkTypeState) => {
    setWtStates((prev) => prev.map((s, i) => (i === index ? next : s)));
  };

  const submit = async () => {
    if (!roomId) {
      lbToast('Select a room', 'err');
      return;
    }
    setSubmitting(true);
    try {
      const photosByWorkType: Record<string, File[]> = {};
      wtStates.forEach((s) => {
        if (s.photos.length) photosByWorkType[s.roomWorkTypeId] = s.photos;
      });
      await livebuildApi.submitDpr(
        projectId,
        {
          date,
          roomId,
          entries: wtStates.map((s) => {
            const trimmed = s.pct.trim();
            const pct =
              trimmed !== '' && !Number.isNaN(parseInt(trimmed, 10))
                ? Math.min(100, Math.max(0, parseInt(trimmed, 10)))
                : null;
            return {
              roomWorkTypeId: s.roomWorkTypeId,
              pct,
              doneToday: s.doneToday,
              notes: s.notes,
            };
          }),
        },
        photosByWorkType,
      );
      lbToast('DPR submitted', 'ok');
      loadDpr();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to submit DPR', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  const roomName = rooms.find((r) => r.id === roomId)?.name ?? '';

  return (
    <div className="pdt-panel">
      <div className="lb-dpr-banner">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 11,
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CalendarCheck size={22} strokeWidth={2} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--lb-m)', fontSize: 15, fontWeight: 800, color: '#fff' }}>
            Daily Progress Report
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)' }}>
            Upload today&apos;s site photos per work type.
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'var(--lb-m)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Project
          </div>
          <div style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 700, color: '#fff' }}>
            {projectName}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>
        <div>
          <div className="lb-card" style={{ marginBottom: 14 }}>
            <div className="lb-form-row">
              <div>
                <Label required>DPR date</Label>
                <FormInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label required>Room</Label>
                <FormInput
                  as="select"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </FormInput>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="lb-empty">Loading work types…</div>
          ) : wtStates.length === 0 ? (
            <div className="lb-empty">No work types for {roomName || 'this room'}</div>
          ) : (
            wtStates.map((s, i) => (
              <DprWorkTypeCard
                key={s.roomWorkTypeId}
                state={s}
                onChange={(n) => updateWt(i, n)}
                onDeleteSavedPhoto={async (photoId) => {
                  try {
                    await livebuildApi.deleteDprPhoto(photoId);
                    updateWt(i, {
                      ...s,
                      savedPhotos: s.savedPhotos.filter((p) => p.id !== photoId),
                    });
                    lbToast('Photo removed', 'ok');
                  } catch (e: any) {
                    lbToast(e?.body?.message || 'Failed to delete photo', 'err');
                  }
                }}
              />
            ))
          )}
        </div>

        <div
          style={{
            position: 'sticky',
            top: 'calc(var(--lb-pd-head-height, 96px) + 12px)',
          }}
        >
          <div
            className="lb-card"
            style={{
              marginBottom: 12,
              background: 'linear-gradient(135deg,#f0f7ff,#e8f1fd)',
              border: '1px solid #bfdbfe',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--lb-m)',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--lb-blue)',
                marginBottom: 6,
              }}
            >
              Auto-calculated update
            </div>
            <div style={{ fontSize: 12, color: 'var(--lb-ch)', lineHeight: 1.5 }}>
              Room progress updates when you submit DPR entries. Previous % shown per work type.
            </div>
          </div>
          <div className="lb-card">
            <div
              style={{
                fontFamily: 'var(--lb-m)',
                fontSize: 13,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Today&apos;s summary
            </div>
            {wtStates.map((s) => (
              <div
                key={s.roomWorkTypeId}
                style={{
                  padding: '7px 0',
                  borderBottom: '0.5px solid #f1f5f9',
                  fontSize: 12.5,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{s.workTypeName}</span>
                  <span style={{ color: 'var(--lb-blue)', fontWeight: 700 }}>
                    {s.pct ? `${s.pct}%` : '—'}
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--lb-mu)', marginTop: 2 }}>
                  Prev: {s.previousPct ?? 0}%
                  {s.doneToday ? ' · Done today ✓' : ''}
                </div>
              </div>
            ))}
            <Btn
              variant="accent"
              size="sm"
              style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              onClick={submit}
              disabled={submitting || loading}
            >
              Submit DPR
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
