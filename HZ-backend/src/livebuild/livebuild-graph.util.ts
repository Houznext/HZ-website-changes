export type GraphTimeline = {
  start: Date;
  totalDays: number;
  elapsedDay: number;
};

export type GraphPointDraft = {
  dayIndex: number;
  label: string;
  dayName: string;
  date: string;
  actualPct: number;
  targetPct: number;
  status: 'live' | 'on_hold';
};

type DprLike = {
  workTypeId: number;
  roomId?: number;
  reportDate: string | Date;
  pctToday?: number | null;
};

export const GRAPH_X_AXIS_STEP = 4;

export function formatGraphDayName(d: Date): string {
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function normalizeGraphDate(input: string | Date): string {
  if (typeof input === 'string') return input.slice(0, 10);
  return input.toISOString().slice(0, 10);
}

export function projectGraphTimeline(project: {
  startDate?: string | Date | null;
  dueDate?: string | Date | null;
}): GraphTimeline {
  const start = project.startDate ? new Date(project.startDate) : new Date();
  start.setHours(0, 0, 0, 0);
  const due = project.dueDate
    ? new Date(project.dueDate)
    : new Date(start.getTime() + 45 * 86400000);
  due.setHours(0, 0, 0, 0);
  const totalDays = Math.max(
    1,
    Math.ceil((due.getTime() - start.getTime()) / 86400000),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const elapsedDay = project.startDate
    ? Math.min(
        totalDays,
        Math.max(0, Math.ceil((today.getTime() - start.getTime()) / 86400000)),
      )
    : totalDays;
  return { start, totalDays, elapsedDay };
}

export function workTypePctAtDate(
  workTypeId: number,
  dateStr: string,
  dprs: DprLike[],
): number {
  const hits = dprs
    .filter(
      (d) =>
        d.workTypeId === workTypeId &&
        normalizeGraphDate(d.reportDate) <= dateStr,
    )
    .sort((a, b) =>
      normalizeGraphDate(b.reportDate).localeCompare(normalizeGraphDate(a.reportDate)),
    );
  if (!hits.length) return 0;
  return Math.round(Number(hits[0].pctToday ?? 0));
}

export function averagePct(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function roomPctFromWorkTypes(
  workTypes: Array<{ pct?: number | null }>,
  fallback = 0,
): number {
  if (!workTypes.length) return fallback;
  return averagePct(workTypes.map((wt) => Number(wt.pct ?? 0)));
}

export function buildGraphPoints(input: {
  timeline: GraphTimeline;
  onHold?: boolean;
  currentActualPct: number;
  actualAtDay: (dayIndex: number, dateStr: string, elapsedDay: number) => number;
}): GraphPointDraft[] {
  const { start, totalDays, elapsedDay } = input.timeline;
  const points: GraphPointDraft[] = [];
  for (let i = 0; i <= totalDays; i++) {
    const targetPct = Math.min(100, Math.round((i / totalDays) * 100));
    const dayDate = new Date(start.getTime() + i * 86400000);
    const dateStr = normalizeGraphDate(dayDate);
    let actual = 0;
    if (i <= elapsedDay) {
      actual = input.actualAtDay(i, dateStr, elapsedDay);
    } else {
      actual = input.currentActualPct;
    }
    if (i === elapsedDay) actual = input.currentActualPct;
    points.push({
      dayIndex: i,
      label: `Day ${i + 1}`,
      dayName: formatGraphDayName(dayDate),
      date: dateStr,
      actualPct: Math.min(100, Math.max(0, actual)),
      targetPct,
      status: input.onHold ? 'on_hold' : 'live',
    });
  }
  return points;
}

export function xAxisTickIndices(pointCount: number, step = GRAPH_X_AXIS_STEP): number[] {
  if (pointCount <= 0) return [];
  const ticks: number[] = [];
  for (let i = 0; i < pointCount; i += step) ticks.push(i);
  const last = pointCount - 1;
  if (last > 0 && ticks[ticks.length - 1] !== last) ticks.push(last);
  return ticks;
}
