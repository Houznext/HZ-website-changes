import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LbGraphPoint } from '../lib/types';
import { todayIndexInPoints, adaptiveXAxisStep } from '../lib/graphRange';

export const GRAPH_ZOOM_MIN = 0.6;
export const GRAPH_ZOOM_MAX = 4;
export const GRAPH_ZOOM_STEP = 0.2;

const PLOT_TOP = 28;
const PLOT_HEIGHT = 168;
const X_AXIS_GAP = 7;
const X_LABEL_LINE_GAP = 11;
const X_LABEL_BOTTOM_PAD = 8;
const Y_AXIS_W = 44;
const PAD_LEFT = 36;
const PAD_RIGHT = 48;
const X_AXIS_STEP = 4;
const MIN_VIEWPORT_CHART_W = 260;
const FUTURE_LINE = '#cbd5e1';
const FUTURE_DOT = '#94a3b8';
const Y_TICKS = [100, 75, 50, 25, 0] as const;
const POINT_HIT_PX = 22;
const DRAG_THRESHOLD = 5;

function graphDayName(point: LbGraphPoint): string {
  if (point.dayName) return point.dayName;
  if (!point.date) return '';
  try {
    return new Date(`${point.date}T12:00:00`).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

function xAxisTickIndices(pointCount: number, step: number): number[] {
  if (pointCount <= 0) return [];
  const ticks: number[] = [];
  for (let i = 0; i < pointCount; i += step) ticks.push(i);
  const last = pointCount - 1;
  if (last > 0 && ticks[ticks.length - 1] !== last) ticks.push(last);
  return ticks;
}

function yForPct(pct: number, xAxisY: number): number {
  return PLOT_TOP + (1 - pct / 100) * (xAxisY - PLOT_TOP);
}

function xForIndex(i: number, total: number, chartW: number): number {
  const plotW = chartW - PAD_LEFT - PAD_RIGHT;
  if (total <= 1) return PAD_LEFT;
  return PAD_LEFT + (i / (total - 1)) * plotW;
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
  xAxisStep?: number;
  scrollResetKey?: string | number;
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
  xAxisStep = X_AXIS_STEP,
  scrollResetKey,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewportW, setViewportW] = useState(0);
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

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setViewportW(el.clientWidth || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  /** At zoom 1 the plot fills the visible graph area; zoom scales width for pan/zoom controls. */
  const baseChartW = useMemo(() => {
    const fitInner = Math.max(MIN_VIEWPORT_CHART_W, viewportW - Y_AXIS_W);
    return fitInner;
  }, [viewportW]);

  const chartW = useMemo(() => Math.round(baseChartW * zoom), [baseChartW, zoom]);
  const plotW = Math.max(1, chartW - PAD_LEFT - PAD_RIGHT);
  const xAxisY = PLOT_TOP + PLOT_HEIGHT;
  const chartH = xAxisY + X_AXIS_GAP + 9 + X_LABEL_LINE_GAP + 9 + X_LABEL_BOTTOM_PAD;
  const xLabelY = xAxisY + X_AXIS_GAP;
  const plotClipId = useMemo(() => `plot-clip-${Math.random().toString(36).slice(2, 9)}`, []);
  const initialScrollDone = useRef(false);
  const prevZoomRef = useRef(zoom);

  const xTicks = useMemo(() => {
    const adaptive = adaptiveXAxisStep(sorted.length, plotW);
    const step = sorted.length > 14 ? Math.max(xAxisStep, adaptive) : adaptive;
    return xAxisTickIndices(sorted.length, step);
  }, [sorted.length, plotW, xAxisStep]);

  const todayIndex = useMemo(
    () => todayIndexInPoints(sorted, startDate),
    [sorted, startDate],
  );

  const pastLine = useMemo(() => {
    if (!sorted.length) return '';
    const slice = sorted.slice(0, todayIndex + 1);
    return slice
      .map((p, i) => `${xForIndex(i, sorted.length, chartW)},${yForPct(p.actualPct, xAxisY)}`)
      .join(' ');
  }, [sorted, todayIndex, chartW, xAxisY]);

  const futureLine = useMemo(() => {
    if (!sorted.length || todayIndex >= sorted.length - 1) return '';
    const slice = sorted.slice(todayIndex);
    return slice
      .map((p, j) => {
        const i = todayIndex + j;
        return `${xForIndex(i, sorted.length, chartW)},${yForPct(p.actualPct, xAxisY)}`;
      })
      .join(' ');
  }, [sorted, todayIndex, chartW, xAxisY]);

  const targetLine = useMemo(() => {
    if (!sorted.length) return '';
    return sorted
      .map((p, i) =>
        `${xForIndex(i, sorted.length, chartW)},${yForPct(p.targetPct ?? ((i + 1) / sorted.length) * 100, xAxisY)}`,
      )
      .join(' ');
  }, [sorted, chartW, xAxisY]);

  const areaPoly = useMemo(() => {
    if (!sorted.length) return '';
    const past = sorted.slice(0, todayIndex + 1);
    const top = past
      .map((p, i) => `${xForIndex(i, sorted.length, chartW)},${yForPct(p.actualPct, xAxisY)}`)
      .join(' ');
    const lastPastX = xForIndex(todayIndex, sorted.length, chartW);
    return `${PAD_LEFT},${xAxisY} ${PAD_LEFT},${yForPct(past[0]?.actualPct ?? 0, xAxisY)} ${top} ${lastPastX},${xAxisY}`;
  }, [sorted, todayIndex, chartW, xAxisY]);

  const todayX = sorted.length ? xForIndex(todayIndex, sorted.length, chartW) : chartW - PAD_RIGHT;
  const todayPoint = sorted[todayIndex];
  const displayTodayPct = todayPct ?? todayPoint?.actualPct ?? 0;

  useEffect(() => {
    initialScrollDone.current = false;
  }, [scrollResetKey, sorted.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !sorted.length || initialScrollDone.current) return;
    if (zoom <= 1) {
      el.scrollLeft = 0;
    } else {
      const targetX = Y_AXIS_W + xForIndex(todayIndex, sorted.length, chartW);
      const center = targetX - el.clientWidth / 2;
      el.scrollLeft = Math.max(0, center);
    }
    initialScrollDone.current = true;
  }, [todayIndex, sorted.length, chartW, scrollResetKey, zoom]);

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
        top: yForPct(point.actualPct, xAxisY),
      });
    },
    [sorted, chartW, xAxisY],
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
    <div className="graph-wrap" ref={wrapRef}>
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
            {graphDayName(hover) ? ` · ${graphDayName(hover)}` : hover.date ? ` · ${hover.date}` : ''}
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
        style={{ height: chartH }}
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
              const y = yForPct(pct, xAxisY);
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
            overflow="visible"
          >
            <defs>
              <clipPath id={plotClipId}>
                <rect x={0} y={0} width={chartW} height={xAxisY} />
              </clipPath>
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
            <g clipPath={`url(#${plotClipId})`}>
              {Y_TICKS.map((pct) => {
                const y = yForPct(pct, xAxisY);
                return (
                  <line key={pct} x1={0} y1={y} x2={chartW} y2={y} stroke="#eef2f6" strokeWidth="1" />
                );
              })}
              {targetLine ? <polyline className="graph-target" points={targetLine} /> : null}
              {areaPoly ? <polygon className="graph-fill" points={areaPoly} fill={`url(#${gradId})`} /> : null}
              {pastLine ? <polyline className="graph-line" points={pastLine} /> : null}
              {futureLine ? (
                <polyline className="graph-line graph-line-future" points={futureLine} stroke={FUTURE_LINE} />
              ) : null}
              {sorted.map((p, i) => {
                const cx = xForIndex(i, sorted.length, chartW);
                const cy = yForPct(p.actualPct, xAxisY);
                const hold = p.status === 'on_hold';
                const isFuture = i > todayIndex;
                const isToday = i === todayIndex;
                const active = hover === p;
                const glowColor = hold ? '#f59e0b' : isFuture ? FUTURE_DOT : '#2f80ed';
                const dotFill = hold ? '#f59e0b' : isFuture ? FUTURE_DOT : 'var(--blue)';
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
                      fill={dotFill}
                      stroke="#fff"
                      strokeWidth={active ? 2.5 : 2}
                      opacity={active || isToday ? 1 : isFuture ? 0.85 : 0.9}
                      filter={active ? `url(#${glowId})` : undefined}
                      className="graph-point-dot"
                    />
                  </g>
                );
              })}
              <line
                x1={todayX}
                y1={PLOT_TOP - 8}
                x2={todayX}
                y2={xAxisY}
                stroke="rgba(47,128,237,.28)"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              {displayTodayPct != null && todayPoint ? (
                <>
                  <circle
                    cx={todayX}
                    cy={yForPct(displayTodayPct, xAxisY)}
                    r="5.5"
                    fill="var(--blue)"
                    stroke="#fff"
                    strokeWidth="2.5"
                  />
                  <rect
                    x={todayX - 38}
                    y={yForPct(displayTodayPct, xAxisY) - 30}
                    width="76"
                    height="21"
                    rx="6"
                    fill="var(--blue)"
                  />
                  <text
                    x={todayX}
                    y={yForPct(displayTodayPct, xAxisY) - 16}
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
            </g>
            <line
              x1={PAD_LEFT}
              y1={xAxisY}
              x2={chartW - PAD_RIGHT}
              y2={xAxisY}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
            {xTicks.map((tickIndex) => {
              const point = sorted[tickIndex];
              if (!point) return null;
              const x = xForIndex(tickIndex, sorted.length, chartW);
              const dayLabel = point.label ?? `Day ${point.dayIndex + 1}`;
              const nameLabel = graphDayName(point);
              const isFirst = tickIndex === 0;
              const isLast = tickIndex === sorted.length - 1;
              const textAnchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
              const labelX = isFirst ? Math.max(x, PAD_LEFT) : isLast ? Math.min(x, chartW - PAD_RIGHT) : x;
              return (
                <g key={`x-${point.dayIndex}-${tickIndex}`}>
                  <line
                    x1={x}
                    y1={xAxisY}
                    x2={x}
                    y2={xAxisY + 4}
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                  <text
                    x={labelX}
                    y={xLabelY}
                    fontSize="9"
                    fill="#64748b"
                    textAnchor={textAnchor}
                    dominantBaseline="hanging"
                    fontFamily="Montserrat, sans-serif"
                    fontWeight="700"
                  >
                    {dayLabel}
                    {nameLabel ? (
                      <tspan
                        x={labelX}
                        dy={X_LABEL_LINE_GAP}
                        fontSize="8.5"
                        fill="#94a3b8"
                        fontWeight="600"
                        fontFamily="Inter, sans-serif"
                      >
                        {nameLabel}
                      </tspan>
                    ) : null}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <div className="graph-scroll-hint">
        {zoom > 1
          ? onPointClick
            ? 'Drag to pan horizontally · Pinch or Ctrl+scroll to zoom · Click a day point to open progress'
            : 'Drag to pan horizontally · Pinch or Ctrl+scroll to zoom width'
          : onPointClick
            ? 'Use + to zoom in · Click a day point to open progress'
            : 'Use + to zoom in for a wider view'}
      </div>
    </div>
  );
}
