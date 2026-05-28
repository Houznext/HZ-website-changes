import { useCallback, useMemo, useRef, useState } from 'react';
import type { LbGraphPoint } from '../lib/types';

const VB_W = 800;
const VB_H = 220;

function yForPct(pct: number): number {
  return VB_H - 16 - (pct / 100) * (VB_H - 36);
}

function xForIndex(i: number, total: number): number {
  if (total <= 1) return 40;
  return 40 + (i / (total - 1)) * (VB_W - 80);
}

type Props = {
  points: LbGraphPoint[];
  todayPct?: number;
  totalDays?: number;
  height?: number;
};

export default function ProgressGraph({ points, todayPct, totalDays = 50, height = 220 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<LbGraphPoint | null>(null);
  const [tipPos, setTipPos] = useState({ left: 0, top: 0 });

  const sorted = useMemo(
    () => [...points].sort((a, b) => a.dayIndex - b.dayIndex),
    [points],
  );

  const actualLine = useMemo(() => {
    if (!sorted.length) return '';
    return sorted.map((p, i) => `${xForIndex(i, sorted.length)},${yForPct(p.actualPct)}`).join(' ');
  }, [sorted]);

  const targetLine = useMemo(() => {
    if (!sorted.length) return '';
    return sorted
      .map((p, i) => `${xForIndex(i, sorted.length)},${yForPct(p.targetPct ?? ((i + 1) / sorted.length) * 100)}`)
      .join(' ');
  }, [sorted]);

  const areaPoly = useMemo(() => {
    if (!sorted.length) return '';
    const top = sorted
      .map((p, i) => `${xForIndex(i, sorted.length)},${yForPct(p.actualPct)}`)
      .join(' ');
    const lastX = xForIndex(sorted.length - 1, sorted.length);
    return `40,${VB_H} 40,${yForPct(sorted[0]?.actualPct ?? 0)} ${top} ${lastX},${VB_H}`;
  }, [sorted]);

  const onMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!wrapRef.current || !sorted.length) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = VB_W / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      let best = sorted[0];
      let bestDist = Infinity;
      sorted.forEach((p, i) => {
        const x = xForIndex(i, sorted.length);
        const d = Math.abs(x - mx);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      });
      if (bestDist > 60) {
        setHover(null);
        return;
      }
      setHover(best);
      const i = sorted.indexOf(best);
      const px = (xForIndex(i, sorted.length) / VB_W) * rect.width;
      const py = (yForPct(best.actualPct) / VB_H) * rect.height;
      setTipPos({ left: px, top: py });
    },
    [sorted],
  );

  const todayX = sorted.length ? xForIndex(sorted.length - 1, sorted.length) : 680;

  return (
    <div className="graph-wrap" ref={wrapRef} style={{ position: 'relative' }}>
      {hover && (
        <div
          style={{
            display: 'block',
            position: 'absolute',
            left: tipPos.left,
            top: tipPos.top,
            transform: 'translate(-50%, -130%)',
            background: hover.status === 'on_hold' ? '#92400e' : 'var(--ch)',
            color: '#fff',
            padding: '7px 12px',
            borderRadius: 9,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'var(--m)',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 14px rgba(15,42,68,.2)',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 2 }}>
            {hover.label ?? `Day ${hover.dayIndex}`}
          </div>
          <div style={{ fontSize: 13 }}>{Math.round(hover.actualPct)}% complete</div>
          <div
            style={{
              fontSize: 10,
              marginTop: 2,
              color: hover.status === 'on_hold' ? '#fde68a' : 'rgba(255,255,255,.6)',
            }}
          >
            {hover.status === 'on_hold' ? '⏸ On Hold' : '● Live'}
          </div>
        </div>
      )}
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={{ display: 'block', cursor: 'crosshair' }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="gfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f80ed" stopOpacity=".18" />
            <stop offset="100%" stopColor="#2f80ed" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[44, 88, 132, 176].map((y) => (
          <line key={y} x1="0" y1={y} x2={VB_W} y2={y} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {targetLine && (
          <polyline className="graph-target" points={targetLine} />
        )}
        {areaPoly && <polygon className="graph-fill" points={areaPoly} />}
        {actualLine && <polyline className="graph-line" points={actualLine} />}
        {sorted.map((p, i) => {
          const cx = xForIndex(i, sorted.length);
          const cy = yForPct(p.actualPct);
          const hold = p.status === 'on_hold';
          return (
            <circle
              key={`${p.dayIndex}-${i}`}
              cx={cx}
              cy={cy}
              r={hold ? 6.5 : hover === p ? 5.5 : 0}
              fill={hold ? '#f59e0b' : 'var(--blue)'}
              stroke="#fff"
              strokeWidth="2.5"
              style={{ opacity: hold || hover === p ? 1 : 0, transition: 'opacity .2s' }}
            />
          );
        })}
        <line
          x1={todayX}
          y1="10"
          x2={todayX}
          y2={VB_H - 10}
          stroke="rgba(47,128,237,.25)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        {todayPct != null && (
          <>
            <circle
              cx={todayX}
              cy={yForPct(todayPct)}
              r="5.5"
              fill="var(--blue)"
              stroke="#fff"
              strokeWidth="2.5"
            />
            <rect x={todayX - 36} y={yForPct(todayPct) - 28} width="74" height="21" rx="6" fill="var(--blue)" />
            <text
              x={todayX}
              y={yForPct(todayPct) - 14}
              fontSize="10.5"
              fill="#fff"
              fontFamily="Montserrat"
              fontWeight="700"
              textAnchor="middle"
            >
              Today {Math.round(todayPct)}%
            </text>
          </>
        )}
        <text x="40" y={VB_H - 5} fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="Inter">
          Day 1
        </text>
        <text x={VB_W - 40} y={VB_H - 5} fontSize="9" fill="#94a3b8" textAnchor="middle" fontFamily="Inter">
          Day {totalDays}
        </text>
      </svg>
    </div>
  );
}
