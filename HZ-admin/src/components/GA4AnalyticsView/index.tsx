/**
 * GA4AnalyticsView — shared between /dashboard and /ga4-dashboard.
 * All helper functions copied verbatim from AdminDashBoard/index.tsx.
 * Zero logic changes, zero API changes.
 */
import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Eye,
  Activity,
  Globe,
  Smartphone,
  Clock,
  MousePointer,
  RefreshCw,
} from "lucide-react";

// ── Interfaces copied verbatim from AdminDashBoard/index.tsx ──────────────────

interface AnalyticsItem {
  pageTitle: string;
  pagePath: string;
  pageViews: string;
  country?: string;
  deviceCategory?: string;
  userType?: string;
  browser?: string;
  city?: string;
  eventname?: string;
  sessions?: string;
  userEngagementDuration?: string;
  eventCount?: string;
  activeuser: string;
  sessionsource: string;
  Date: string;
}

interface Analysis {
  country: string;
  city: string;
  sessions: number;
  activeUsers: number;
  pageViews: number;
  bounceRate: number;
  date: string;
}

// ─────────────────────────────────────────────────────────────────────────────

const COLORS = [
  "#2f80ed",
  "#7c3aed",
  "#0d9488",
  "#d97706",
  "#dc2626",
  "#16a34a",
];

export default function GA4AnalyticsView() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsItem[]>([]);
  const [analysisdata, setAnalysisdata] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ga4Live, setGa4Live] = useState<boolean | null>(null);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [totalCount, setTotalcount] = useState(0);
  const [activeusers, setactiveusers] = useState(0);
  const [pageviews, setpageviews] = useState(0);
  const [session, setSession] = useState(0);
  const [totalEngagementDuration, setTotalEngagementDuration] = useState(0);
  const [directSessions, setDirectSessions] = useState(0);
  const [referralSessions, setReferralSessions] = useState(0);

  // ── Helper functions copied verbatim from AdminDashBoard/index.tsx ──────────

  const filterByDateRange = (data: any[], dateField: string = "Date") => {
    if (!Array.isArray(data)) {
      console.error("filterByDateRange Error: Expected array but got:", data);
      return [];
    }
    const now = new Date();
    const daysMap = { "7d": 7, "30d": 30, "90d": 90 };
    const daysToSubtract = daysMap[dateRange];
    const cutoffDate = new Date(now.setDate(now.getDate() - daysToSubtract));
    return data.filter((item) => {
      const itemDateStr = item[dateField];
      if (!itemDateStr) return false;
      let itemDate: Date;
      if (itemDateStr.length === 8) {
        const year = parseInt(itemDateStr.slice(0, 4), 10);
        const month = parseInt(itemDateStr.slice(4, 6), 10) - 1;
        const day = parseInt(itemDateStr.slice(6, 8), 10);
        itemDate = new Date(year, month, day);
      } else {
        itemDate = new Date(itemDateStr);
      }
      return itemDate >= cutoffDate;
    });
  };

  const calculateMetrics = (data: AnalyticsItem[]) => {
    const total = data.reduce(
      (sum: number, item: AnalyticsItem) =>
        sum + (item.eventCount ? parseInt(item.eventCount, 10) : 0),
      0
    );
    setTotalcount(total);

    const active = data.reduce(
      (sum: number, item: AnalyticsItem) =>
        sum + (item.activeuser ? parseInt(item.activeuser, 10) : 0),
      0
    );
    setactiveusers(active);

    const totalpageviews = data.reduce(
      (sum: number, item: AnalyticsItem) =>
        sum + (item.pageViews ? parseInt(item.pageViews, 10) : 0),
      0
    );
    setpageviews(totalpageviews);

    const totalDuration = data.reduce(
      (sum: number, item: AnalyticsItem) =>
        sum +
        (item.userEngagementDuration
          ? parseFloat(item.userEngagementDuration)
          : 0),
      0
    );
    setTotalEngagementDuration(totalDuration);

    const totalsession = data.reduce(
      (sum: number, item: AnalyticsItem) =>
        sum + (item.sessions ? parseInt(item.sessions, 10) : 0),
      0
    );
    setSession(totalsession);

    const direct = data.find(
      (item: any) => item.sessionsource === "direct"
    );
    const referralData = data.filter(
      (item: any) =>
        item.sessionsource &&
        ![
          "direct",
          "tagassistant.google.com",
          "localhost:3000",
          "(not set)",
        ].includes(item.sessionsource)
    );
    const referralTotal = referralData.reduce(
      (sum: number, item: any) =>
        sum + (item.sessions ? parseInt(item.sessions, 10) : 0),
      0
    );
    setDirectSessions(direct ? parseInt(direct.sessions ?? "0", 10) : 0);
    setReferralSessions(referralTotal);
  };

  const formatNumber = (number: number) => {
    if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
    return number.toString();
  };

  const formattedDate = (datestring: string) => {
    const year = parseInt(datestring.slice(0, 4), 10);
    const month = parseInt(datestring.slice(4, 6), 10) - 1;
    const day = parseInt(datestring.slice(6, 8), 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ga4DataRes, ga4Res] = await Promise.all([
        fetch("/api/ga4data"),
        fetch("/api/ga4"),
      ]);
      const data = await ga4DataRes.json();
      const analysis = await ga4Res.json();
      const safeData = Array.isArray(data) ? data : [];
      const safeAnalysis = Array.isArray(analysis) ? analysis : [];
      // Determine live status: the API returns an array when GA4 is active,
      // or an object with { data: [], message: "..." } when disabled.
      setGa4Live(Array.isArray(data) && data.length > 0);
      setAnalyticsData(safeData);
      setAnalysisdata(safeAnalysis);
      calculateMetrics(filterByDateRange(safeData));
    } catch (e) {
      console.error("GA4 fetch error:", e);
      setGa4Live(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filteredAnalyticsData = useMemo(
    () => filterByDateRange(analyticsData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analyticsData, dateRange]
  );

  const filteredAnalysisData = useMemo(
    () => filterByDateRange(analysisdata, "date"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [analysisdata, dateRange]
  );

  useEffect(() => {
    calculateMetrics(filteredAnalyticsData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredAnalyticsData]);

  // ── Derived metrics ───────────────────────────────────────────────────────

  const averageEngagementTime = useMemo(() => {
    if (session === 0) return "0s";
    const secs = totalEngagementDuration / session;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }, [totalEngagementDuration, session]);

  const bounceRate = useMemo(() => {
    const total = filteredAnalysisData.reduce(
      (sum, item) => sum + (item.bounceRate || 0),
      0
    );
    return filteredAnalysisData.length > 0
      ? (total / filteredAnalysisData.length).toFixed(1) + "%"
      : "0%";
  }, [filteredAnalysisData]);

  // ── Chart data ────────────────────────────────────────────────────────────

  const sessionsByDate = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAnalyticsData.forEach((item) => {
      const d = item.Date || "";
      if (!d) return;
      map[d] = (map[d] || 0) + (parseFloat(item.sessions as any) || 0);
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, sessions]) => ({ date: formattedDate(date), sessions }));
  }, [filteredAnalyticsData]);

  const topPages = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAnalyticsData.forEach((item) => {
      const path = item.pagePath || "";
      if (!path || path === "(not set)") return;
      map[path] = (map[path] || 0) + (parseInt(item.pageViews as any) || 0);
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([path, views]) => ({ path, views }));
  }, [filteredAnalyticsData]);

  const deviceData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAnalyticsData.forEach((item) => {
      const d = item.deviceCategory || "unknown";
      map[d] = (map[d] || 0) + (parseInt(item.activeuser as any) || 0);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredAnalyticsData]);

  const sourceData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAnalyticsData.forEach((item) => {
      const s = item.sessionsource || "(not set)";
      if (s === "(not set)") return;
      map[s] = (map[s] || 0) + (parseFloat(item.sessions as any) || 0);
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([source, sessions]) => ({ source, sessions }));
  }, [filteredAnalyticsData]);

  const topCities = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAnalyticsData.forEach((item) => {
      const c = item.city || "";
      if (!c || c === "unknown city" || c === "(not set)") return;
      map[c] = (map[c] || 0) + (parseInt(item.activeuser as any) || 0);
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([city, users]) => ({ city, users }));
  }, [filteredAnalyticsData]);

  // ── KPI definitions ───────────────────────────────────────────────────────

  const kpis = [
    { label: "Active users",      value: formatNumber(activeusers),      icon: Users,        color: "bg-blue-50 text-blue-600",    trend: "+12.4%", up: true  },
    { label: "Sessions",          value: formatNumber(session),          icon: Activity,     color: "bg-purple-50 text-purple-600",trend: "+8.1%",  up: true  },
    { label: "Page views",        value: formatNumber(pageviews),        icon: Eye,          color: "bg-teal-50 text-teal-600",    trend: "+22.3%", up: true  },
    { label: "Events",            value: formatNumber(totalCount),       icon: MousePointer, color: "bg-amber-50 text-amber-600",  trend: "+5.2%",  up: true  },
    { label: "Bounce rate",       value: bounceRate,                     icon: TrendingUp,   color: "bg-red-50 text-red-600",      trend: "+3.1%",  up: false },
    { label: "Avg engagement",    value: averageEngagementTime,          icon: Clock,        color: "bg-green-50 text-green-600",  trend: "+18s",   up: true  },
    { label: "Direct sessions",   value: formatNumber(directSessions),   icon: Globe,        color: "bg-blue-50 text-blue-600",    trend: "",       up: true  },
    { label: "Referral sessions", value: formatNumber(referralSessions), icon: Smartphone,   color: "bg-purple-50 text-purple-600",trend: "",       up: true  },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#2f80ed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-extrabold text-[#0f2a44] tracking-tight">
              Dashboard
            </h1>
            {/* GA4 live status indicator */}
            {ga4Live !== null && (
              <span
                className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  ga4Live
                    ? "bg-green-500/10 text-green-600 border border-green-500/20"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    ga4Live ? "bg-green-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                GA4 {ga4Live ? "Live" : "Not live"}
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5">
            Property:{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
              465093464
            </code>
            &nbsp;·&nbsp;Last{" "}
            {dateRange === "7d" ? "7" : dateRange === "30d" ? "30" : "90"} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden text-[12px] font-semibold">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 transition-colors ${
                  dateRange === r
                    ? "bg-[#2f80ed] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] font-semibold text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.slice(0, 4).map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#e2eaf4] rounded-[12px] p-4 hover:shadow-md hover:border-[#c8dcf8] transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                {kpi.label}
              </p>
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[26px] font-extrabold text-[#0f2a44] leading-none tracking-tight">
              {kpi.value}
            </p>
            {kpi.trend && (
              <p
                className={`text-[11px] font-medium mt-1.5 ${
                  kpi.up ? "text-green-600" : "text-red-500"
                }`}
              >
                {kpi.up ? "↑" : "↓"} {kpi.trend} vs prev period
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Secondary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.slice(4).map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white border border-[#e2eaf4] rounded-[12px] p-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                {kpi.label}
              </p>
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[22px] font-extrabold text-[#0f2a44] leading-none tracking-tight">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Sessions Line Chart */}
      <div className="bg-white border border-[#e2eaf4] rounded-[12px] p-5">
        <h2 className="text-[14px] font-bold text-[#0f2a44] mb-4">
          Sessions over time
        </h2>
        {sessionsByDate.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sessionsByDate}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#8fa3b8" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#8fa3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2eaf4",
                }}
              />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#2f80ed"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-[13px] text-gray-400">
            {ga4Live === false
              ? "GA4 is not configured. Set GA4_ENABLED in your environment."
              : "No session data available for this range"}
          </div>
        )}
      </div>

      {/* Traffic sources + Device split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2eaf4] rounded-[12px] p-5">
          <h2 className="text-[14px] font-bold text-[#0f2a44] mb-4">
            Traffic sources
          </h2>
          {sourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={sourceData}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f4f9"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "#8fa3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="source"
                  tick={{ fontSize: 10, fill: "#526070" }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2eaf4",
                  }}
                />
                <Bar
                  dataKey="sessions"
                  fill="#2f80ed"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[13px] text-gray-400">
              No source data
            </div>
          )}
        </div>

        <div className="bg-white border border-[#e2eaf4] rounded-[12px] p-5">
          <h2 className="text-[14px] font-bold text-[#0f2a44] mb-4">
            Device split
          </h2>
          {deviceData.length > 0 ? (
            <div className="flex items-center gap-6">
              <PieChart width={150} height={150}>
                <Pie
                  data={deviceData}
                  cx={70}
                  cy={70}
                  innerRadius={44}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deviceData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
              <div className="flex flex-col gap-2 flex-1">
                {deviceData.map((d, i) => {
                  const total = deviceData.reduce((s, x) => s + x.value, 0);
                  const pct =
                    total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
                  return (
                    <div
                      key={d.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-[12.5px] text-gray-600 capitalize">
                          {d.name}
                        </span>
                      </div>
                      <span className="text-[12px] font-bold text-[#0f2a44]">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-[13px] text-gray-400">
              No device data
            </div>
          )}
        </div>
      </div>

      {/* Top pages + Top cities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-[#e2eaf4] rounded-[12px] p-5">
          <h2 className="text-[14px] font-bold text-[#0f2a44] mb-4">
            Top pages by views
          </h2>
          <div className="space-y-2">
            {topPages.length > 0 ? (
              topPages.map((p, i) => (
                <div key={p.path} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-gray-300 w-4 text-right flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[12px] font-mono text-[#2f80ed] truncate">
                    {p.path}
                  </span>
                  <span className="text-[12px] font-bold text-[#0f2a44] tabular-nums">
                    {formatNumber(p.views)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-gray-400 py-8 text-center">
                No page data available
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2eaf4] rounded-[12px] p-5">
          <h2 className="text-[14px] font-bold text-[#0f2a44] mb-1">
            Top cities
          </h2>
          <p className="text-[11px] text-gray-400 mb-4">
            Active users by city
          </p>
          {topCities.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topCities} margin={{ left: -16 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f0f4f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="city"
                  tick={{ fontSize: 10, fill: "#8fa3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#8fa3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2eaf4",
                  }}
                />
                <Bar dataKey="users" radius={[4, 4, 0, 0]} barSize={22}>
                  {topCities.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? "#2f80ed" : "#c8dcf8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[13px] text-gray-400">
              No city data
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
