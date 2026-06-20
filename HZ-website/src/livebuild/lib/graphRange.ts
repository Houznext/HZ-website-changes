import type { LbGraphPoint } from './types';

export type GraphRange = '7d' | '14d' | 'overall';

export const GRAPH_RANGE_OPTIONS: { key: GraphRange; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '14d', label: 'Last 14 days' },
  { key: 'overall', label: 'Overall' },
];

/** Index of "today" within a (possibly filtered) point series. */
export function todayIndexInPoints(
  points: LbGraphPoint[],
  startDate?: string | null,
): number {
  if (!points.length) return 0;
  if (!startDate) return points.length - 1;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const elapsed = Math.round((today.getTime() - start.getTime()) / 86400000);

  let idx = 0;
  for (let i = 0; i < points.length; i++) {
    if (points[i].dayIndex <= elapsed) idx = i;
    else break;
  }
  return idx;
}

/** Exactly N consecutive timeline days (7 / 14), anchored around today when possible. */
export function filterGraphPointsByRange(
  points: LbGraphPoint[],
  range: GraphRange,
  startDate?: string | null,
): LbGraphPoint[] {
  if (points.length === 0) return points;
  if (range === 'overall') return points;

  const windowDays = range === '7d' ? 7 : 14;
  const todayIdx = todayIndexInPoints(points, startDate);
  const todayDayIndex = points[todayIdx]?.dayIndex ?? todayIdx;
  const minDay = points[0].dayIndex;
  const maxDay = points[points.length - 1].dayIndex;

  let startDayIndex = todayDayIndex - (windowDays - 1);
  let endDayIndex = startDayIndex + windowDays - 1;

  if (startDayIndex < minDay) {
    startDayIndex = minDay;
    endDayIndex = Math.min(maxDay, minDay + windowDays - 1);
  }
  if (endDayIndex > maxDay) {
    endDayIndex = maxDay;
    startDayIndex = Math.max(minDay, maxDay - windowDays + 1);
  }

  return points.filter(
    (p) => p.dayIndex >= startDayIndex && p.dayIndex <= endDayIndex,
  );
}

/** Avoid overlapping x-axis labels (two-line day + name) for the current plot width. */
export function adaptiveXAxisStep(pointCount: number, plotWidth: number): number {
  if (pointCount <= 1) return 1;
  const labelSlotPx = 52;
  const maxTicks = Math.max(2, Math.floor(plotWidth / labelSlotPx));
  if (pointCount <= maxTicks) return 1;
  return Math.max(1, Math.ceil((pointCount - 1) / (maxTicks - 1)));
}
