import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  PieChart as PieChartIcon,
} from "lucide-react";
import Button from "@/src/common/Button";

// ---------- Types ----------
type Log = {
  id: number;
  day: number;
  date: string;
  workType: string[] | string | null;
  status: string;
  laborCount?: number | null;
  expensesIncurred?: number | null;
  phaseId?: number | null;
};

type Phase = {
  id: number;
  order: number;
  name: string;
  plannedDays: number;
  plannedCost: number | null;
  plannedStart?: string | null;
  plannedEnd?: string | null;
  actualDays: number;
  actualCost: number;
};

type TrendsProps = {
  workData: Log[];
  estimatedCost: number;
  estimatedDays: number;
  phases: Phase[];
  activePhaseId?: number | null; // optional: filter charts to a selected phase
};

// ---------- Helpers ----------
const statusColors: Record<string, string> = {
  Completed: "#10B981",
  "In Progress": "#3B82F6",
  Pending: "#F59E0B",
  Delayed: "#EF4444",
};

const workTypeColors = [
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#14B8A6",
  "#0EA5E9",
  "#A78BFA",
];

function normalizeDate(d?: string) {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

function sortByDate(logs: Log[]) {
  return [...logs].sort((a, b) =>
    normalizeDate(a.date) > normalizeDate(b.date) ? 1 : -1
  );
}

function groupByDate(logs: Log[]) {
  return logs.reduce((acc, l) => {
    const k = normalizeDate(l.date);
    (acc[k] ||= []).push(l);
    return acc;
  }, {} as Record<string, Log[]>);
}

function plannedEvenLine(total: number, points: number) {
  if (points <= 1) return [0];
  const step = total / (points - 1);
  return Array.from({ length: points }, (_, i) =>
    Math.round(Math.min(total, step * i))
  );
}

function clamp<T>(arr: T[], count: number) {
  if (count <= 0) return [];
  if (arr.length <= count) return arr;
  return arr.slice(arr.length - count);
}

function earnedValueFromDays(
  cumDays: number,
  totalPlannedDays: number,
  totalPlannedCost: number
) {
  if (!totalPlannedDays) return 0;
  const pct = Math.min(1, cumDays / totalPlannedDays);
  return pct * (totalPlannedCost || 0); // EV = %complete * BAC
}

// ---------- Component ----------
const Trends: React.FC<TrendsProps> = ({
  workData,
  estimatedCost,
  estimatedDays,
  phases,
  activePhaseId,
}) => {
  // UI state
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");
  const [activeChart, setActiveChart] = useState<
    "progress" | "cost" | "timeline" | "burnup" | "scurve" | "cfd" | "breakdown"
  >("progress");

  // Phase-aware logs
  const filteredLogs = useMemo(() => {
    const logs = activePhaseId
      ? workData.filter((l) => String(l.phaseId) === String(activePhaseId))
      : workData;
    return sortByDate(logs);
  }, [workData, activePhaseId]);

  // Daily aggregates
  const { labels, series } = useMemo(() => {
    const by = groupByDate(filteredLogs);
    const lbls = Object.keys(by).sort();
    const rows = lbls.map((date) => {
      const set = by[date];
      const dayWorked = set.length > 0 ? 1 : 0;
      const cost = set.reduce(
        (s, l) => s + (Number(l.expensesIncurred) || 0),
        0
      );
      const labor = set.reduce((s, l) => s + (Number(l.laborCount) || 0), 0);
      const pending = set.filter((l) => l.status === "Pending").length;
      const inProgress = set.filter((l) => l.status === "In Progress").length;
      const completed = set.filter((l) => l.status === "Completed").length;
      const delayed = set.filter((l) => l.status === "Delayed").length;
      return {
        date,
        uniqueDay: dayWorked,
        cost,
        labor,
        pending,
        inProgress,
        completed,
        delayed,
      };
    });
    // cumulative
    let cumDays = 0,
      cumCost = 0;
    const withCum = rows.map((r) => {
      cumDays += r.uniqueDay;
      cumCost += r.cost;
      return { ...r, cumDays, cumCost };
    });
    return { labels: lbls, series: withCum };
  }, [filteredLogs]);

  // Time range slicing (apply to end)
  const rangeCount =
    timeRange === "week" ? 7 : timeRange === "month" ? 30 : Infinity;
  const labelsR = useMemo(
    () => (rangeCount === Infinity ? labels : clamp(labels, rangeCount)),
    [labels, rangeCount]
  );
  const seriesR = useMemo(
    () => (rangeCount === Infinity ? series : clamp(series, rangeCount)),
    [series, rangeCount]
  );

  // Totals (phase-aware)
  const totalPlannedDays = useMemo(() => {
    if (activePhaseId) {
      const p = phases.find((x) => String(x.id) === String(activePhaseId));
      return p?.plannedDays || 0;
    }
    return (
      phases.reduce((s, p) => s + (p.plannedDays || 0), 0) || estimatedDays || 0
    );
  }, [phases, activePhaseId, estimatedDays]);

  const totalPlannedCost = useMemo(() => {
    if (activePhaseId) {
      const p = phases.find((x) => String(x.id) === String(activePhaseId));
      return Number(p?.plannedCost || 0);
    }
    // Fall back to sum of phases (or estimatedCost if phases not filled)
    const sumPhases = phases.reduce(
      (s, p) => s + Number(p.plannedCost || 0),
      0
    );
    return sumPhases || estimatedCost || 0;
  }, [phases, activePhaseId, estimatedCost]);

  // KPI & summaries
  const totalSpent = useMemo(
    () =>
      filteredLogs.reduce((s, l) => s + (Number(l.expensesIncurred) || 0), 0),
    [filteredLogs]
  );
  const completedTasks = useMemo(
    () => filteredLogs.filter((l) => l.status === "Completed").length,
    [filteredLogs]
  );
  const completionRate = useMemo(
    () =>
      filteredLogs.length ? (completedTasks / filteredLogs.length) * 100 : 0,
    [completedTasks, filteredLogs.length]
  );
  const avgDailyCost = useMemo(
    () =>
      seriesR.length
        ? (seriesR[seriesR.length - 1].cumCost || 0) / seriesR.length
        : 0,
    [seriesR]
  );

  // ----------- Datasets -----------

  // A) Progress pie (status distribution)
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

  // B) Cost by work type (bar)
  const costByTypeData = useMemo(() => {
    const counter = new Map<string, number>();
    filteredLogs.forEach((l) => {
      const wt = Array.isArray(l.workType) ? l.workType[0] : l.workType;
      const key = (wt || "unknown").toString();
      const inc = Number(l.expensesIncurred) || 0;
      counter.set(key, (counter.get(key) || 0) + inc);
    });
    return Array.from(counter.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredLogs]);

  // C) Timeline (area): progress% and cumulativeCost
  const timelineData = useMemo(() => {
    return seriesR.map((r, idx) => ({
      dayIdx: idx + 1,
      date: r.date,
      progressPct: totalPlannedDays
        ? Math.round(Math.min(100, (r.cumDays / totalPlannedDays) * 100))
        : 0,
      cumulativeCost: r.cumCost,
    }));
  }, [seriesR, totalPlannedDays]);

  // D) Burn-up (days): actual cumDays vs planned days line
  const plannedDaysLineArr = useMemo(
    () => plannedEvenLine(totalPlannedDays, seriesR.length || 1),
    [totalPlannedDays, seriesR.length]
  );
  const burnupData = useMemo(() => {
    return seriesR.map((r, i) => ({
      date: r.date,
      actual: r.cumDays,
      planned: plannedDaysLineArr[i] ?? 0,
    }));
  }, [seriesR, plannedDaysLineArr]);

  // E) S-curve (cost): actual cumCost vs planned cost line + EV KPIs
  const plannedCostLineArr = useMemo(
    () => plannedEvenLine(totalPlannedCost, seriesR.length || 1),
    [totalPlannedCost, seriesR.length]
  );
  const sCurveData = useMemo(() => {
    return seriesR.map((r, i) => ({
      date: r.date,
      actual: r.cumCost,
      planned: plannedCostLineArr[i] ?? 0,
    }));
  }, [seriesR, plannedCostLineArr]);

  const lastPoint = seriesR[seriesR.length - 1];
  const EV = useMemo(
    () =>
      earnedValueFromDays(
        lastPoint?.cumDays ?? 0,
        totalPlannedDays,
        totalPlannedCost
      ),
    [lastPoint?.cumDays, totalPlannedDays, totalPlannedCost]
  );
  const AC = lastPoint?.cumCost ?? 0; // Actual Cost
  const PV = plannedCostLineArr[plannedCostLineArr.length - 1] ?? 0; // Planned Value
  const CPI = AC ? EV / AC : 0;
  const SPI = PV ? EV / PV : 0;

  // F) CFD (stacked area): pending / inProgress / completed
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

  // G) Phase breakdown (planned vs actual)
  const phaseBars = useMemo(() => {
    const rows = (
      activePhaseId
        ? phases.filter((p) => String(p.id) === String(activePhaseId))
        : phases
    ).map((p) => ({
      name: `${p.order}. ${p.name}`,
      planned: p.plannedDays || 0,
      actual: p.actualDays || 0,
    }));
    return rows.length ? rows : [{ name: "No Phases", planned: 0, actual: 0 }];
  }, [phases, activePhaseId]);

  // ---------- UI ----------
  return (
    <div className="w-full p-4">
      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-6 md:gap-6 gap-2 mb-8">
        {/* Completion Rate */}
        <div className="bg-white md:p-5 p-2 md:rounded-2xl rounded-[4px] shadow-md border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="md:p-3 p-1 bg-blue-100 rounded-full">
              <TrendingUp className="text-[#3586FF]  md:h-6 h-3 md:w-6 w-3" />
            </div>
            <div className="md:ml-4 ml-2">
              <p className="md:text-xs text-[12px] uppercase tracking-wide text-gray-400">
                Completion Rate
              </p>
              <p className="md:text-lg text-[13px] font-bold text-gray-800">
                {completionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Days Worked */}
        <div className="bg-white md:p-5 p-2 md:rounded-2xl rounded-[4px] shadow-md border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="md:p-3 p-1 bg-green-100 rounded-full">
              <Calendar className="text-green-500 md:h-6 h-3 md:w-6 w-3" />
            </div>
            <div className="md:ml-4 ml-2">
              <p className="md:text-xs text-[12px] uppercase tracking-wide text-gray-400">
                Days Worked
              </p>
              <p className="md:text-lg text-[13px] font-bold text-gray-800">
                {seriesR[seriesR.length - 1]?.cumDays || 0}/{totalPlannedDays}
              </p>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{
                width: `${
                  ((seriesR[seriesR.length - 1]?.cumDays || 0) /
                    totalPlannedDays) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white md:p-5 p-2 md:rounded-2xl rounded-[4px] shadow-md border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="md:p-3 p-1 bg-yellow-100 rounded-full">
              <DollarSign className="text-yellow-500 md:h-6 h-3 md:w-6 w-3" />
            </div>
            <div className="md:ml-4 ml-2">
              <p className="md:text-xs text-[12px] uppercase tracking-wide text-gray-400">
                Total Spent
              </p>
              <p className="md:text-lg text-[13px] font-bold text-gray-800">
                ₹{(seriesR[seriesR.length - 1]?.cumCost || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Avg Daily Cost */}
        <div className="bg-white md:p-5 p-2 md:rounded-2xl rounded-[4px] shadow-md border border-gray-100 hover:shadow-lg transition">
          <div className="flex items-center">
            <div className="md:p-3 p-1 bg-purple-100 rounded-full">
              <Clock className="text-purple-500 md:h-6 h-3 md:w-6 w-3" />
            </div>
            <div className="md:ml-4 ml-2">
              <p className="md:text-xs text-[12px] uppercase tracking-wide text-gray-400">
                Avg Daily Cost
              </p>
              <p className="md:text-lg text-[13px] font-bold text-gray-800">
                ₹{avgDailyCost.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* CPI */}
        <div className="bg-white md:p-5 p-2 md:rounded-2xl rounded-[4px] shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col justify-center">
          <p className="md:text-xs text-[12px] uppercase tracking-wide text-gray-400">
            CPI (Cost Efficiency)
          </p>
          <p
            className={`md:text-lg text-[13px] font-bold ${
              CPI >= 1 ? "text-green-600" : "text-red-500"
            }`}
          >
            {CPI.toFixed(2)}
          </p>
        </div>

        {/* SPI */}
        <div className="bg-white md:p-5 p-2 md:rounded-2xl rounded-[4px] shadow-md border border-gray-100 hover:shadow-lg transition flex flex-col justify-center">
          <p className="md:text-xs text-[12px] uppercase tracking-wide text-gray-400">
            SPI (Schedule Efficiency)
          </p>
          <p
            className={`md:text-lg text-[13px] font-bold ${
              SPI >= 1 ? "text-green-600" : "text-red-500"
            }`}
          >
            {SPI.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart selector */}
      <div className="flex  overflow-x-auto w-full gap-2 mb-4">
        {[
          {
            key: "progress",
            label: "Progress Breakdown",
            icon: <PieChartIcon className="h-4 w-4" />,
          },
          {
            key: "cost",
            label: "Cost by Work Type",
            icon: <DollarSign className="h-4 w-4" />,
          },
          {
            key: "timeline",
            label: "Timeline",
            icon: <TrendingUp className="h-4 w-4" />,
          },
          {
            key: "burnup",
            label: "Burn-up (Days)",
            icon: <TrendingUp className="h-4 w-4" />,
          },
          {
            key: "scurve",
            label: "S-curve (Cost)",
            icon: <TrendingUp className="h-4 w-4" />,
          },
          {
            key: "cfd",
            label: "CFD",
            icon: <TrendingUp className="h-4 w-4" />,
          },
          {
            key: "breakdown",
            label: "Phase Breakdown",
            icon: <PieChartIcon className="h-4 w-4" />,
          },
        ].map((b) => (
          <Button
            key={b.key}
            className={`px-4 py-1 font-medium rounded-lg text-nowrap  label-text  flex items-center gap-2 ${
              activeChart === (b.key as any)
                ? "bg-[#5297ff] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveChart(b.key as any)}
          >
            <span
              className={`${
                activeChart === (b.key as any) ? "text-white" : "text-[#3586FF] "
              }`}
            >
              {b.icon}
            </span>
            {b.label}
          </Button>
        ))}
      </div>

      {/* Time range selector */}
      <div className="flex gap-2 mb-6">
        {(["week", "month", "all"] as const).map((t) => (
          <Button
            key={t}
            className={`md:px-3 px-2 py-[2px] font-medium md:text-[14px] text-[12px] rounded ${
              timeRange === t
                ? "bg-[#5297ff] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setTimeRange(t)}
          >
            {t[0].toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      <div className="bg-white md:p-4 p-2 rounded-lg shadow">
        {activeChart === "progress" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF]  md:mb-4 mb-2">
              Progress Status Breakdown
            </h3>
            <div className="h-70">
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
                    //             labelStyle={{
                    //   fontFamily: "Gordita-Medium",
                    //   fontSize: "12px",
                    //   fill: "#374151",
                    // }}
                  >
                    {progressData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.name] || "#94A3B8"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                    }}
                    labelStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                    }}
                    formatter={(v: number) => [`${v} logs`, "Count"]}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      paddingTop: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeChart === "cost" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF]  md:mb-4 mb-2">
              Cost by Work Type
            </h3>
            <div className="h-80 p-2 overflow-x-auto w-full">
                 <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={costByTypeData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${Number(v).toLocaleString()}`}
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      borderRadius: "8px",
                    }}
                    formatter={(v: number) => [
                      `₹${v.toLocaleString()}`,
                      "Cost",
                    ]}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" name="Cost (₹)">
                    {costByTypeData.map((_, i) => (
                      <Cell
                        key={`b-${i}`}
                        fill={workTypeColors[i % workTypeColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeChart === "timeline" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF]  md:mb-4 mb-2">
              Progress Timeline
            </h3>
            <div className="h-80 overflow-x-auto p-2 w-full">
                 <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="dayIdx"
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(v) => `₹${Number(v).toLocaleString()}`}
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      borderRadius: "8px",
                    }}
                    formatter={(v: number, n: string) =>
                      n === "progressPct"
                        ? [`${v}%`, "Progress"]
                        : [`₹${v.toLocaleString()}`, "Cumulative Cost"]
                    }
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="progressPct"
                    stroke="#8884d8"
                    fill="#8884d8"
                    name="Progress (%)"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="cumulativeCost"
                    stroke="#10B981"
                    fill="#10B981"
                    name="Cumulative Cost (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeChart === "burnup" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF]  md:mb-4 mb-2">Burn-up (Days)</h3>
            <div className="h-80 p-2 w-full overflow-x-auto">
                 <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burnupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <YAxis
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      paddingTop: "8px",
                    }}
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

        {activeChart === "scurve" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF]  md:mb-4 mb-2">S-curve (Cost)</h3>
            <div className="h-80 p-2 overflow-x-auto w-full">
              <div className="min-w-[600px] h-full">
                 <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sCurveData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <YAxis
                    tickFormatter={(v) => `₹${Number(v).toLocaleString()}`}
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <Tooltip
                    formatter={(v: number) => `₹${v.toLocaleString()}`}
                    contentStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      paddingTop: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Actual (₹)"
                    stroke="#10B981"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="planned"
                    name="Planned (₹)"
                    stroke="#94A3B8"
                    strokeDasharray="6 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </div>
            {/* EV quick glance */}
            <div className="grid grid-cols-2 md:grid-cols-4 md:gap-4 gap-2 md:mt-4 mt-2">
              <div className="bg-gray-50 md:p-3 p-2 rounded">
                <p className="md:text-sm text-[12px] text-gray-500">EV</p>
                <p className="font-bold">₹{EV.toFixed(0)}</p>
              </div>
              <div className="bg-gray-50 md:p-3 p-2 rounded">
                <p className="md:text-sm text-[12px]  text-gray-500">AC</p>
                <p className="font-bold">₹{AC.toFixed(0)}</p>
              </div>
              <div className="bg-gray-50 md:p-3 p-2 rounded">
                <p className="md:text-sm text-[12px]  text-gray-500">PV</p>
                <p className="font-bold">₹{PV.toFixed(0)}</p>
              </div>
              <div className="bg-gray-50 md:p-3 p-2 rounded">
                <p className="md:text-sm text-[12px]  text-gray-500">Variance</p>
                <p
                  className={`font-bold ${
                    AC > EV ? "text-red-600" : "text-green-600"
                  }`}
                >
                  ₹{(EV - AC).toFixed(0)}
                </p>
              </div>
            </div>
          </>
        )}

        {activeChart === "cfd" && (
          <>
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF]  md:mb-4 mb-2">
              Cumulative Flow Diagram
            </h3>
            <div className="h-80 p-2 w-full overflow-x-auto">
                 <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cfdData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <YAxis
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                    }}
                    labelStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      paddingTop: "8px",
                    }}
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
            <h3 className="md:text-lg text-[14px] font-bold text-[#3586FF]  md:mb-4 mb-2">
              Phase Days Breakdown
            </h3>
            <div className="h-80 p-2 overflow-x-auto w-full">
                 <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={phaseBars}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{
                      className:
                        "font-medium md:text-[12px] text-black text-[12px]",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                    }}
                    labelStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontFamily: "Gordita-Medium",
                      fontSize: "12px",
                      paddingTop: "8px",
                    }}
                  />
                  <Bar dataKey="planned" name="Planned Days" fill="#94A3B8" />
                  <Bar dataKey="actual" name="Actual Days" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom summaries */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-3">Progress Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Logs:</span>
              <span className="font-medium">{filteredLogs.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-green-600">
                {completedTasks}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress:</span>
              <span className="font-medium text-[#3586FF] ">
                {filteredLogs.filter((l) => l.status === "In Progress").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">
                {filteredLogs.filter((l) => l.status === "Pending").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delayed:</span>
              <span className="font-medium text-red-600">
                {filteredLogs.filter((l) => l.status === "Delayed").length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-3">Financial Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Planned Budget:</span>
              <span className="font-medium">
                ₹{totalPlannedCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-medium">
                ₹{(seriesR[seriesR.length - 1]?.cumCost || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining Budget:</span>
              <span className="font-medium">
                ₹
                {Math.max(
                  0,
                  totalPlannedCost - (seriesR[seriesR.length - 1]?.cumCost || 0)
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Budget Utilization:</span>
              <span className="font-medium">
                {totalPlannedCost > 0
                  ? (
                      ((seriesR[seriesR.length - 1]?.cumCost || 0) /
                        totalPlannedCost) *
                      100
                    ).toFixed(1)
                  : "0.0"}
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;
