import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LbGraphPoint } from '../lib/types';

export const GRAPH_ZOOM_MIN = 0.6;
export const GRAPH_ZOOM_MAX = 4;
export const GRAPH_ZOOM_STEP = 0.2;

const BASE_CHART_H = 220;
const Y_AXIS_W = 44;
const PAD_RIGHT = 48;
const PAD_Y = 28;
const MIN_POINT_GAP = 42;
const Y_TICKS = [100, 75, 50, 25, 0] as const;
const POINT_HIT_PX = 22;
const DRAG_THRESHOLD = 5;

function yForPct(pct: number, chartH: number): number {
  return chartH - PAD_Y - (pct / 100) * (chartH - PAD_Y * 2);
}

function xForIndex(i: number, total: number, chartW: number): number {
  if (total <= 1) return 0;
  return (i / (total - 1)) * (chartW - PAD_RIGHT);
}

function clampZoom(z: number): number {
  return Math.min(GRAPH_ZOOM_MAX, Math.max(GRAPH_ZOOM_MIN, z));
}

function touchDistance(touches: React.TouchList): number {
  if (touches.length < 2) return 0;
  const t0 = touches.item(0);
  const t1 = touches.item(1);
  if (!t0 || !t1) return 0;
  return Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
}

type Props = {
  points: LbGraphPoint[];
  todayPct?: number;
  totalDays?: number;
  startDate?: string | null;
  onPointClick?: (point: LbGraphPoint) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
};

type DragState = {
  active: boolean;
  moved: boolean;
  onPoint: boolean;
  startX: number;
  startY: number;
  startScrollLeft: number;
  startScrollTop: number;
  pointerId: number;
  startPoint: LbGraphPoint | null;
};

export default function ProgressGraph({
  points,
  todayPct,
  totalDays = 50,
  startDate,
  onPointClick,
  zoom: zoomProp,
  onZoomChange,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomInternal, setZoomInternal] = useState(1);
  const zoom = zoomProp ?? zoomInternal;
  const setZoom = useCallback(
    (next: number | ((z: number) => number)) => {
      const value = clampZoom(typeof next === 'function' ? next(zoomProp ?? zoomInternal) : next);
      if (onZoomChange) onZoomChange(value);
      else setZoomInternal(value);
    },
    [onZoomChange, zoomProp, zoomInternal],
  );

  const [hover, setHover] = useState<LbGraphPoint | null>(null);
  const [tipPos, setTipPos] = useState({ left: 0, top: 0 });
  const [panning, setPanning] = useState(false);
  const dragRef = useRef<DragState>({
    active: false,
    moved: false,
    onPoint: false,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
    pointerId: -1,
    startPoint: null,
  });
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const suppressClickRef = useRef(false);
  const gradId = useMemo(() => `gfill-${Math.random().toString(36).slice(2, 9)}`, []);
  const glowId = `${gradId}-glow`;

  const sorted = useMemo(
    () => [...points].sort((a, b) => a.dayIndex - b.dayIndex),
    [points],
  );

  const baseChartW = useMemo(
    () => Math.max(280, sorted.length * MIN_POINT_GAP + PAD_RIGHT),
    [sorted.length],
  );

  const chartW = useMemo(() => Math.round(baseChartW * zoom), [baseChartW, zoom]);
  const chartH = BASE_CHART_H;
  const initialScrollDone = useRef(false);
  const prevZoomRef = useRef(zoom);

  const todayIndex = useMemo(() => {
    if (!sorted.length) return 0;
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const elapsed = Math.round((today.getTime() - start.getTime()) / 86400000);
      return Math.min(Math.max(0, elapsed), sorted.length - 1);
    }
    return sorted.length - 1;
  }, [sorted.length, startDate]);

  const actualLine = useMemo(() => {
    if (!sorted.length) return '';
    return sorted.map((p, i) => `${xForIndex(i, sorted.length, chartW)},${yForPct(p.actualPct, chartH)}`).join(' ');
  }, [sorted, chartW, chartH]);

  const targetLine = useMemo(() => {
    if (!sorted.length) return '';
    return sorted
      .map((p, i) =>
        `${xForIndex(i, sorted.length, chartW)},${yForPct(p.targetPct ?? ((i + 1) / sorted.length) * 100, chartH)}`,
      )
      .join(' ');
  }, [sorted, chartW, chartH]);

  const areaPoly = useMemo(() => {
    if (!sorted.length) return '';
    const top = sorted
      .map((p, i) => `${xForIndex(i, sorted.length, chartW)},${yForPct(p.actualPct, chartH)}`)
      .join(' ');
    const lastX = xForIndex(sorted.length - 1, sorted.length, chartW);
    const baseY = chartH - PAD_Y / 2;
    return `0,${baseY} 0,${yForPct(sorted[0]?.actualPct ?? 0, chartH)} ${top} ${lastX},${baseY}`;
  }, [sorted, chartW, chartH]);

  const todayX = sorted.length ? xForIndex(todayIndex, sorted.length, chartW) : chartW - PAD_RIGHT;
  const todayPoint = sorted[todayIndex];
  const displayTodayPct = todayPct ?? todayPoint?.actualPct ?? 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !sorted.length || initialScrollDone.current) return;
    const targetX = Y_AXIS_W + xForIndex(todayIndex, sorted.length, chartW);
    const center = targetX - el.clientWidth / 2;
    el.scrollLeft = Math.max(0, center);
    initialScrollDone.current = true;
  }, [todayIndex, sorted.length, chartW]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || prevZoomRef.current === zoom) return;
    const ratio = zoom / prevZoomRef.current;
    el.scrollLeft = Math.max(0, el.scrollLeft * ratio);
    prevZoomRef.current = zoom;
  }, [zoom]);

  const getPlotX = useCallback((clientX: number) => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return 0;
    const rect = scrollEl.getBoundingClientRect();
    return scrollEl.scrollLeft + (clientX - rect.left) - Y_AXIS_W;
  }, []);

  const isInPlotArea = useCallback(
    (clientX: number, clientY: number) => {
      const scrollEl = scrollRef.current;
      if (!scrollEl) return false;
      const rect = scrollEl.getBoundingClientRect();
      const y = clientY - rect.top;
      const hasHScroll = scrollEl.scrollWidth > scrollEl.clientWidth;
      const scrollbarX = hasHScroll ? 12 : 0;
      const plotBottom = rect.height - scrollbarX;
      const plotRight = rect.width;
      const x = clientX - rect.left;
      return x >= Y_AXIS_W && x <= plotRight && y >= 0 && y <= plotBottom;
    },
    [],
  );

  const pickPoint = useCallback(
    (clientX: number, clientY?: number) => {
      if (!sorted.length) return null;
      if (clientY != null && !isInPlotArea(clientX, clientY)) return null;
      const mx = getPlotX(clientX);
      let best = sorted[0];
      let bestDist = Infinity;
      sorted.forEach((p, i) => {
        const x = xForIndex(i, sorted.length, chartW);
        const d = Math.abs(x - mx);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      });
      return bestDist <= POINT_HIT_PX ? best : null;
    },
    [sorted, chartW, getPlotX, isInPlotArea],
  );

  const showTipForPoint = useCallback(
    (point: LbGraphPoint) => {
      const i = sorted.indexOf(point);
      if (i < 0) return;
      const chartX = Y_AXIS_W + xForIndex(i, sorted.length, chartW);
      const scrollLeft = scrollRef.current?.scrollLeft ?? 0;
      setHover(point);
      setTipPos({
        left: chartX - scrollLeft,
        top: yForPct(point.actualPct, chartH),
      });
    },
    [sorted, chartW, chartH],
  );

  const handlePointClick = useCallback(
    (point: LbGraphPoint) => {
      if (suppressClickRef.current || pinchRef.current) return;
      onPointClick?.(point);
    },
    [onPointClick],
  );

  const updateHover = useCallback(
    (clientX: number, clientY: number) => {
      if (panning || dragRef.current.moved || suppressClickRef.current) {
        setHover(null);
        return;
      }
      const best = pickPoint(clientX, clientY);
      if (!best) {
        setHover(null);
        return;
      }
      showTipForPoint(best);
    },
    [pickPoint, panning, showTipForPoint],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pinchRef.current) return;
    suppressClickRef.current = false;
    const point = pickPoint(e.clientX, e.clientY);
    dragRef.current = {
      active: true,
      moved: false,
      onPoint: !!point,
      startX: e.clientX,
      startY: e.clientY,
      startScrollLeft: scrollRef.current?.scrollLeft ?? 0,
      startScrollTop: scrollRef.current?.scrollTop ?? 0,
      pointerId: e.pointerId,
      startPoint: point,
    };
    if (!point) {
      scrollRef.current?.setPointerCapture(e.pointerId);
    }
    setPanning(!point);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active || pinchRef.current) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      d.moved = true;
      suppressClickRef.current = true;
    }
    if (d.moved && scrollRef.current) {
      scrollRef.current.scrollLeft = d.startScrollLeft - dx;
      setHover(null);
      return;
    }
    if (!d.moved) updateHover(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const scrollEl = scrollRef.current;
    if (scrollEl && scrollEl.scrollLeft !== d.startScrollLeft) {
      suppressClickRef.current = true;
    }
    d.active = false;
    setPanning(false);
    if (scrollEl?.hasPointerCapture(e.pointerId)) {
      scrollEl.releasePointerCapture(e.pointerId);
    }
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      pinchRef.current = { dist: touchDistance(e.touches), zoom };
      dragRef.current.active = false;
      setPanning(false);
    }
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) pinchRef.current = null;
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (!dragRef.current.active) return;
      suppressClickRef.current = true;
      dragRef.current.moved = true;
      setHover(null);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      if (pinchRef.current.dist <= 0) return;
      setZoom(pinchRef.current.zoom * (dist / pinchRef.current.dist));
    };
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, [setZoom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -GRAPH_ZOOM_STEP : GRAPH_ZOOM_STEP;
      setZoom((z) => z + delta);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [setZoom]);

  return (
    <div className="graph-wrap">
      {hover && !panning && (
        <div
          className="graph-tip"
          style={{
            left: tipPos.left,
            top: tipPos.top,
            background: hover.status === 'on_hold' ? '#92400e' : 'var(--ch)',
          }}
        >
          <div style={{ fontSize: 10, opacity: 0.65, marginBottom: 2 }}>
            {hover.label ?? `Day ${hover.dayIndex + 1}`}
            {hover.date ? ` · ${hover.date}` : ''}
          </div>
          <div style={{ fontSize: 13 }}>{Math.round(hover.actualPct)}% complete</div>
          <div style={{ fontSize: 10, marginTop: 2, opacity: 0.75 }}>
            {onPointClick ? 'Click point to view day progress' : hover.status === 'on_hold' ? 'On hold' : 'Live'}
          </div>
        </div>
      )}
      <div
        className={`graph-scroll ${panning ? 'is-panning' : ''}`}
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          dragRef.current.active = false;
          setPanning(false);
          setHover(null);
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="graph-canvas" style={{ width: Y_AXIS_W + chartW, height: chartH }}>
          <div className="graph-y-axis" style={{ width: Y_AXIS_W, height: chartH }}>
            {Y_TICKS.map((pct) => {
              const y = yForPct(pct, chartH);
              return (
                <div key={pct} className="graph-y-tick" style={{ top: y }}>
                  <span className="graph-y-label">{pct}%</span>
                  <span className="graph-y-line" />
                </div>
              );
            })}
          </div>
          <svg
            width={chartW}
            height={chartH}
            viewBox={`0 0 ${chartW} ${chartH}`}
            className="graph-svg"
            role="img"
            aria-label="Project progress chart"
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f80ed" stopOpacity=".18" />
                <stop offset="100%" stopColor="#2f80ed" stopOpacity="0" />
              </linearGradient>
              <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {Y_TICKS.map((pct) => {
              const y = yForPct(pct, chartH);
              return (
                <line key={pct} x1={0} y1={y} x2={chartW} y2={y} stroke="#eef2f6" strokeWidth="1" />
              );
            })}
            {targetLine ? <polyline className="graph-target" points={targetLine} /> : null}
            {areaPoly ? <polygon className="graph-fill" points={areaPoly} fill={`url(#${gradId})`} /> : null}
            {actualLine ? <polyline className="graph-line" points={actualLine} /> : null}
            {sorted.map((p, i) => {
              const cx = xForIndex(i, sorted.length, chartW);
              const cy = yForPct(p.actualPct, chartH);
              const hold = p.status === 'on_hold';
              const isToday = i === todayIndex;
              const active = hover === p;
              const glowColor = hold ? '#f59e0b' : '#2f80ed';
              return (
                <g
                  key={`${p.dayIndex}-${i}`}
                  transform={`translate(${cx}, ${cy})`}
                  className={`graph-point ${active ? 'is-hovered' : ''}`}
                  onMouseEnter={() => showTipForPoint(p)}
                  onMouseLeave={() => setHover(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePointClick(p);
                  }}
                  style={{ cursor: onPointClick ? 'pointer' : 'default' }}
                >
                  {active ? (
                    <>
                      <circle r={18} fill={glowColor} opacity={0.12} className="graph-point-halo" />
                      <circle r={12} fill={glowColor} opacity={0.22} className="graph-point-halo" />
                    </>
                  ) : null}
                  <circle
                    r={active ? 10 : 7}
                    fill={hold ? '#f59e0b' : 'var(--blue)'}
                    stroke="#fff"
                    strokeWidth={active ? 2.5 : 2}
                    opacity={active || isToday ? 1 : 0.9}
                    filter={active ? `url(#${glowId})` : undefined}
                    className="graph-point-dot"
                  />
                </g>
              );
            })}
            <line
              x1={todayX}
              y1={PAD_Y - 8}
              x2={todayX}
              y2={chartH - PAD_Y / 2}
              stroke="rgba(47,128,237,.28)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            {displayTodayPct != null && todayPoint ? (
              <>
                <circle
                  cx={todayX}
                  cy={yForPct(displayTodayPct, chartH)}
                  r="5.5"
                  fill="var(--blue)"
                  stroke="#fff"
                  strokeWidth="2.5"
                />
                <rect
                  x={todayX - 38}
                  y={yForPct(displayTodayPct, chartH) - 30}
                  width="76"
                  height="21"
                  rx="6"
                  fill="var(--blue)"
                />
                <text
                  x={todayX}
                  y={yForPct(displayTodayPct, chartH) - 16}
                  fontSize="10.5"
                  fill="#fff"
                  fontFamily="Montserrat, sans-serif"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  Today {Math.round(displayTodayPct)}%
                </text>
              </>
            ) : null}
            <text x={8} y={chartH - 6} fontSize="9" fill="#94a3b8" textAnchor="start" fontFamily="Inter, sans-serif">
              Day 1
            </text>
            <text
              x={chartW - PAD_RIGHT / 2}
              y={chartH - 6}
              fontSize="9"
              fill="#94a3b8"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              Day {totalDays}
            </text>
          </svg>
        </div>
      </div>
      <div className="graph-scroll-hint">
        Drag to pan horizontally · Pinch or Ctrl+scroll to zoom width · Click a day point to open progress
      </div>
    </div>
  );
}
