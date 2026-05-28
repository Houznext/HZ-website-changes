import { useRef } from 'react';
import { Wrench } from 'lucide-react';
import { Label } from './Label';
import { FormInput } from './FormInput';
import { Toggle } from './Toggle';
import { Btn } from './Btn';
import { X } from 'lucide-react';

export const DPR_WT_COLORS: Record<string, string> = {
  'Plywood work': '#2563eb',
  'Electrical work': '#d97706',
  Painting: '#7c3aed',
  Flooring: '#0d9488',
  Tiles: '#dc2626',
  Fittings: '#0891b2',
  'False ceiling': '#6366f1',
  Plumbing: '#059669',
  'Counter work': '#92400e',
};

export function dprColorForWorkType(name: string): string {
  return DPR_WT_COLORS[name] ?? 'var(--lb-blue)';
}

export type DprSavedPhoto = { id: string; url: string };

export type DprWorkTypeState = {
  roomWorkTypeId: string;
  workTypeName: string;
  previousPct?: number;
  pct: string;
  doneToday: boolean;
  notes: string;
  savedPhotos: DprSavedPhoto[];
  photos: File[];
  previews: string[];
};

type Props = {
  state: DprWorkTypeState;
  onChange: (next: DprWorkTypeState) => void;
  onDeleteSavedPhoto?: (photoId: string) => Promise<void>;
  maxPhotos?: number;
};

const MAX_DEFAULT = 10;

export function DprWorkTypeCard({
  state,
  onChange,
  onDeleteSavedPhoto,
  maxPhotos = MAX_DEFAULT,
}: Props) {
  const color = dprColorForWorkType(state.workTypeName);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<DprWorkTypeState>) => onChange({ ...state, ...patch });

  const addPhotos = (files: FileList | null) => {
    if (!files?.length) return;
    const remaining = maxPhotos - state.photos.length - state.savedPhotos.length;
    if (remaining <= 0) return;
    const next = [...state.photos];
    const nextPreviews = [...state.previews];
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        next.push(file);
        nextPreviews.push(URL.createObjectURL(file));
      });
    update({ photos: next, previews: nextPreviews });
  };

  const removePhoto = (index: number) => {
    const url = state.previews[index];
    if (url) URL.revokeObjectURL(url);
    update({
      photos: state.photos.filter((_, i) => i !== index),
      previews: state.previews.filter((_, i) => i !== index),
    });
  };

  const pctNum = Math.min(100, Math.max(0, parseInt(state.pct, 10) || 0));

  return (
    <div
      className="lb-card lb-fa"
      style={{ marginBottom: 14, borderLeft: `3px solid ${color}` }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: '1px solid #f0f4f8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wrench size={15} strokeWidth={1.8} style={{ color }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--lb-m)', fontSize: 13, fontWeight: 700 }}>
              {state.workTypeName}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>
              Upload photos for this work type only
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Toggle
            on={state.doneToday}
            onChange={(doneToday) => update({ doneToday })}
            aria-label="Done today"
          />
          <span style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>Done today</span>
        </div>
      </div>

      <div className="lb-form-row" style={{ marginBottom: 14 }}>
        <div>
          <Label>% for {state.workTypeName}</Label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FormInput
              type="number"
              min={0}
              max={100}
              placeholder="e.g. 90"
              value={state.pct}
              onChange={(e) => update({ pct: e.target.value })}
              style={{ width: 90 }}
            />
            <div className="lb-prog-track" style={{ flex: 1 }}>
              <div
                className="lb-prog-fill"
                style={{ width: `${pctNum}%`, background: color }}
              />
            </div>
            {state.previousPct != null ? (
              <span style={{ fontSize: 11, color: 'var(--lb-mu)' }}>
                prev: {state.previousPct}%
              </span>
            ) : null}
          </div>
        </div>
        <div>
          <Label>Notes</Label>
          <FormInput
            placeholder="Optional notes…"
            value={state.notes}
            onChange={(e) => update({ notes: e.target.value })}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Label style={{ marginBottom: 0 }}>
          Photos — {state.workTypeName}{' '}
          <span style={{ color: 'var(--lb-mu)', fontWeight: 400, textTransform: 'none' }}>
            (max {maxPhotos})
          </span>
        </Label>
        <span style={{ fontSize: 11, color: 'var(--lb-mu)' }}>
          {state.savedPhotos.length + state.photos.length} / {maxPhotos}
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          addPhotos(e.target.files);
          e.target.value = '';
        }}
      />

      <div
        className="lb-dpr-upload"
        style={{ marginBottom: 10 }}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div style={{ fontFamily: 'var(--lb-m)', fontSize: 12, fontWeight: 700 }}>
          Upload {state.workTypeName} photos
        </div>
        <div style={{ fontSize: 11, color: 'var(--lb-mu)', marginTop: 2 }}>
          Drop or click · JPG, PNG
        </div>
      </div>

      {state.savedPhotos.length + state.previews.length > 0 ? (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {state.savedPhotos.map((p) => (
            <div
              key={`saved-${p.id}`}
              style={{
                width: 66,
                height: 54,
                borderRadius: 8,
                position: 'relative',
                overflow: 'hidden',
                border: '0.5px solid #e2e8f0',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {onDeleteSavedPhoto ? (
                <Btn
                  variant="icon"
                  size="xs"
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 14,
                    height: 14,
                    minWidth: 14,
                    padding: 0,
                  }}
                  onClick={async (e) => {
                    e.stopPropagation();
                    await onDeleteSavedPhoto(p.id);
                  }}
                  aria-label="Delete saved photo"
                >
                  <X size={8} strokeWidth={2} />
                </Btn>
              ) : null}
            </div>
          ))}
          {state.previews.map((src, i) => (
            <div
              key={`new-${src}`}
              style={{
                width: 66,
                height: 54,
                borderRadius: 8,
                position: 'relative',
                overflow: 'hidden',
                border: '0.5px solid #e2e8f0',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <Btn
                variant="icon"
                size="xs"
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  minWidth: 14,
                  padding: 0,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(i);
                }}
                aria-label="Remove photo"
              >
                <X size={8} strokeWidth={2} />
              </Btn>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
