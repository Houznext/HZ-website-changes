import React, { useMemo, useState } from "react";
import Button from "@/common/Button";
import { axisTickStyle, tooltipStyle, legendStyle } from '../ServicesSelectedView/helper'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  PieChart as PieChartIcon,
} from "lucide-react";

type WorkLog = {
  id?: string | number;
  date: string; // YYYY-MM-DD
  status: "Pending" | "In Progress" | "Completed" | "Delayed" | string;
  workType?: string | string[];
  phaseId?: string | number | null;
  laborCount?: number;
};
type Phase = {
  id: string | number;
  name: string;
  order?: number;
  plannedDays?: number;
  actualDays?: number;
};

type Props = {
  workData: WorkLog[];
  phases: Phase[];
  estimatedDays?: number;
  activePhaseId?: string | number | null;
};

// ---- local helpers (kept minimal) ----
const sortByDate = <T extends { date: string }>(arr: T[]) =>
  [...arr].sort((a, b) => +new Date(a.date) - +new Date(b.date));

const groupByDate = <T extends { date: string }>(arr: T[]) =>
  arr.reduce<Record<string, T[]>>((acc, cur) => {
    (acc[cur.date] ||= []).push(cur);
    return acc;
  }, {});

const clampTail = <T,>(xs: T[], lastN: number) =>
  xs.slice(Math.max(0, xs.length - lastN));

const plannedEvenLine = (total: number, points: number) => {
  if (!points) return [];
  const step = points > 1 ? total / (points - 1) : total;
  return Array.from({ length: points }, (_, i) => Math.round(i * step));
};

const statusColors: Record<string, string> = {
  Pending: "#F59E0B",
  "In Progress": "#3B82F6",
  Completed: "#10B981",
  Delayed: "#EF4444",
};

const TrendsClient: React.FC<Props> = ({
  workData,
  phases,
  estimatedDays,
  activePhaseId = null,
}) => {

  type ChartKey = "timeline" | "progress" | "burnup" | "breakdown" | "cfd";
  const [activeChart, setActiveChart] = useState<ChartKey>("timeline");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");


  const filteredLogs = useMemo(() => {
    const list = activePhaseId
      ? workData.filter((l) => String(l.phaseId) === String(activePhaseId))
      : workData;
    return sortByDate(list);
  }, [workData, activePhaseId]);


  const { labels, series } = useMemo(() => {
    const by = groupByDate(filteredLogs);
    const lbls = Object.keys(by).sort();
    const rows = lbls.map((date) => {
      const set = by[date];
      const dayWorked = set.length > 0 ? 1 : 0;
      const pending = set.filter((l) => l.status === "Pending").length;
      const inProgress = set.filter((l) => l.status === "In Progress").length;
      const completed = set.filter((l) => l.status === "Completed").length;
      const delayed = set.filter((l) => l.status === "Delayed").length;
      return {
        date,
        uniqueDay: dayWorked,
        pending,
        inProgress,
        completed,
        delayed,
      };
    });

    let cumDays = 0;
    const withCum = rows.map((r) => ({
      ...r,
      cumDays: (cumDays += r.uniqueDay),
    }));
    return { labels: lbls, series: withCum };
  }, [filteredLogs]);


  const rangeCount =
    timeRange === "week" ? 7 : timeRange === "month" ? 30 : Infinity;
  const labelsR = useMemo(
    () => (rangeCount === Infinity ? labels : clampTail(labels, rangeCount)),
    [labels, rangeCount]
  );
  const seriesR = useMemo(
    () => (rangeCount === Infinity ? series : clampTail(series, rangeCount)),
    [series, rangeCount]
  );


  const totalPlannedDays = useMemo(() => {
    if (activePhaseId) {
      const p = phases.find((x) => String(x.id) === String(activePhaseId));
      return p?.plannedDays || 0;
    }
    return (
      phases.reduce((s, p) => s + (p.plannedDays || 0), 0) || estimatedDays || 0
    );
  }, [phases, activePhaseId, estimatedDays]);


  const progressData = useMemo(() => {
    const counter = new Map<string, number>();
    filteredLogs.forEach((l) => {
      const s = l.status || "Unknown";
      counter.set(s, (counter.get(s) || 0) + 1);
    });
    return Array.from(counter.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredLogs]);

  const timelineData = useMemo(
    () =>
      seriesR.map((r, idx) => ({
        dayIdx: idx + 1,
        date: r.date,
        progressPct: totalPlannedDays
          ? Math.round(Math.min(100, (r.cumDays / totalPlannedDays) * 100))
          : 0,
      })),
    [seriesR, totalPlannedDays]
  );


  const plannedDaysLineArr = useMemo(
    () => plannedEvenLine(totalPlannedDays, seriesR.length || 1),
    [totalPlannedDays, seriesR.length]
  );
  const burnupData = useMemo(
    () =>
      seriesR.map((r, i) => ({
        date: r.date,
        actual: r.cumDays,
        planned: plannedDaysLineArr[i] ?? 0,
      })),
    [seriesR, plannedDaysLineArr]
  );


  const cfdData = useMemo(
    () =>
      seriesR.map((r) => ({
        date: r.date,
        pending: r.pending,
        inProgress: r.inProgress,
        completed: r.completed,
      })),
    [seriesR]
  );


  const phaseBars = useMemo(() => {
    const rows = (
      activePhaseId
        ? phases.filter((p) => String(p.id) === String(activePhaseId))
        : phases
    ).map((p) => ({
      name: `${p.order ?? ""}${p.order ? ". " : ""}${p.name}`,
      planned: p.plannedDays || 0,
      actual: p.actualDays || 0,
    }));
    return rows.length ? rows : [{ name: "No Phases", planned: 0, actual: 0 }];
  }, [phases, activePhaseId]);

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto w-full gap-2 mb-3">
        {(
          [
            { key: "timeline", label: "Timeline", icon: <TrendingUp className="h-4 w-4" />, },
            { key: "progress", label: "Progress Breakdown", icon: <PieChartIcon className="h-4 w-4" />, },
            { key: "burnup", label: "Burn-up (Days)", icon: <TrendingUp className="h-4 w-4" />, },
            { key: "breakdown", label: "Phase Breakdown", icon: <PieChartIcon className="h-4 w-4" />, },
            { key: "cfd", label: "CFD", icon: <TrendingUp className="h-4 w-4" />, },
          ] as { key: ChartKey; label: string, icon: React.ReactNode }[]
        ).map((b) => (
          <Button
            key={b.key}
            className={`px-4 py-1 font-medium rounded-lg text-nowrap  label-text  flex items-center gap-2 ${activeChart === (b.key as any)
              ? "bg-[#3586FF] text-white"
              : "bg-gray-100 text-gray-700"
              }`}
            onClick={() => setActiveChart(b.key)}
          > {b.icon}
            {b.label}
          </Button>
        ))}

        <div className="ml-auto flex gap-2">
          {(["week", "month", "all"] as const).map((t) => (
            <Button
              key={t}
              className={`md:px-3 px-2 py-[2px] font-medium md:text-[14px] text-[12px] rounded ${timeRange === t
                ? "bg-[#3586FF] text-white"
                : "bg-gray-100 text-gray-700"
                }`}
              onClick={() => setTimeRange(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white md:p-4 p-2 rounded-lg shadow">
        {activeChart === "progress" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF] md:mb-4 mb-2">
              Progress Status Breakdown
            </h3>
            <div className="h-80 p-2 overflow-x-auto w-full">
              <div className="md:min-w-[600px] min-w-[400px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={progressData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}

                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent, value }) =>
                        `${name}: ${(percent * 100).toFixed(0)}% (${value})`
                      }
                    >
                      {progressData.map((e, i) => (
                        <Cell
                          key={i}
                          fill={statusColors[e.name] || "#94A3B8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      {...tooltipStyle}
                      formatter={(v: number) => [`${v} logs`, "Count"]}
                    />
                    <Legend
                      {...legendStyle}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeChart === "timeline" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF] md:mb-4 mb-2">
              Progress Timeline
            </h3>
            <div className="h-80 p-2 overflow-x-auto w-full">
              <div className="min-w-[600px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dayIdx"
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                      tick={axisTickStyle}
                    />
                    <YAxis
                      domain={[0, 100]}
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                      tickFormatter={(v) => `${v}%`}
                      tick={axisTickStyle}
                    />
                    <Tooltip
                      {...tooltipStyle}
                    />
                    <Legend
                      {...legendStyle}
                    />
                    <Area
                      type="monotone"
                      dataKey="progressPct"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      name="Progress (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeChart === "burnup" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF] md:mb-4 mb-2">
              Burn-up (Days)
            </h3>
            <div className="h-80 p-2 overflow-x-auto w-full">
              <div className="min-w-[600px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burnupData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={axisTickStyle}
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <YAxis
                      tick={axisTickStyle}
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <Tooltip
                      contentStyle={{
                        fontFamily: "Gordita-Medium",
                        fontSize: "12px",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend
                      {...legendStyle}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual (cum days)"
                      stroke="#3B82F6"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="planned"
                      name="Planned (days)"
                      stroke="#94A3B8"
                      strokeDasharray="6 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeChart === "cfd" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF] md:mb-4 mb-2">
              Cumulative Flow Diagram
            </h3>
            <div className="h-80 p-2 overflow-x-auto w-full">
              <div className="min-w-[600px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cfdData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={axisTickStyle}
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <YAxis
                      tick={axisTickStyle}
                      style={{ fontSize: "12px", fontWeight: "bold" }}
                    />
                    <Tooltip
                      contentStyle={{
                        fontFamily: "Gordita-Medium",
                        fontSize: "12px",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend
                      {...legendStyle}
                    />
                    <Area
                      type="monotone"
                      stackId="1"
                      dataKey="pending"
                      name="Pending"
                      stroke="#F59E0B"
                      fill="#F59E0B"
                    />
                    <Area
                      type="monotone"
                      stackId="1"
                      dataKey="inProgress"
                      name="In Progress"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                    />
                    <Area
                      type="monotone"
                      stackId="1"
                      dataKey="completed"
                      name="Completed"
                      stroke="#10B981"
                      fill="#10B981"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeChart === "breakdown" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF] md:mb-4 mb-2">
              Phase Days Breakdown
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={phaseBars}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tick={axisTickStyle}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={axisTickStyle}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    {...legendStyle}
                  />
                  <Bar dataKey="planned" name="Planned Days" fill="#94A3B8" />
                  <Bar dataKey="actual" name="Actual Days" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrendsClient;
