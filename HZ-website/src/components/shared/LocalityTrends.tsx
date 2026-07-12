"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Info,
  ArrowUpRight,
} from "lucide-react";

type TrendPoint = { year: string; value: number };

type LocalityTrendsProps = {
  locality: string;
  city: string;
  subLocality?: string;
  /** Rent | Sell | Flat Share – drives "rental" vs "sale price" context */
  lookingType?: string;
  /** Residential | Commercial */
  purpose?: string;
  /** e.g. Apartment, Plot, Agricultural Land – plot/land shows per sqft */
  propertyType?: string;
  className?: string;
};

type CachedPayload = {
  trendData: TrendPoint[];
  insight: string;
  locality: string;
  contextLabel?: string;
  isPerSqft?: boolean;
};

const formatYear = (v: any) => String(v);
const safeNum = (v: any) => (typeof v === "number" && Number.isFinite(v) ? v : 0);

const LOCALITY_TRENDS_CACHE_KEY = "locality_trends";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour – avoid API call on refresh/navigation

function getCacheKey(
  locality: string,
  city: string,
  subLocality?: string,
  lookingType?: string,
  purpose?: string,
  propertyType?: string
) {
  return [locality, city, subLocality ?? "", lookingType ?? "", purpose ?? "", propertyType ?? ""]
    .join("|")
    .toLowerCase();
}

function getCachedTrends(
  locality: string,
  city: string,
  subLocality?: string,
  lookingType?: string,
  purpose?: string,
  propertyType?: string
): CachedPayload | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const key = getCacheKey(locality, city, subLocality, lookingType, purpose, propertyType);
    const raw = sessionStorage.getItem(LOCALITY_TRENDS_CACHE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as Record<string, { data: CachedPayload; at: number }>;
    const entry = store[key];
    if (!entry || Date.now() - entry.at > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function setCachedTrends(
  locality: string,
  city: string,
  subLocality: string | undefined,
  lookingType: string | undefined,
  purpose: string | undefined,
  propertyType: string | undefined,
  data: CachedPayload
) {
  if (typeof sessionStorage === "undefined") return;
  try {
    const key = getCacheKey(locality, city, subLocality, lookingType, purpose, propertyType);
    const raw = sessionStorage.getItem(LOCALITY_TRENDS_CACHE_KEY);
    const store = (raw ? JSON.parse(raw) : {}) as Record<string, { data: CachedPayload; at: number }>;
    store[key] = { data, at: Date.now() };
    sessionStorage.setItem(LOCALITY_TRENDS_CACHE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

function pctChange(from: number, to: number) {
  if (!from || from <= 0) return null;
  return ((to - from) / from) * 100;
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function LocalityTrends(
  props: LocalityTrendsProps
): React.ReactElement | null {
  const { locality, city, subLocality, lookingType, purpose, propertyType, className = "" } = props;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [insight, setInsight] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [contextLabel, setContextLabel] = useState("");
  const [isPerSqft, setIsPerSqft] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!locality || !city || !mounted) return;

    const cached = getCachedTrends(locality, city, subLocality, lookingType, purpose, propertyType);
    if (cached) {
      setTrendData(Array.isArray(cached.trendData) ? cached.trendData : []);
      setInsight(cached.insight || "");
      setLocationLabel(cached.locality || [locality, city].join(", "));
      setContextLabel(cached.contextLabel ?? "");
      setIsPerSqft(cached.isPerSqft ?? false);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ locality, city });
    if (subLocality) params.set("subLocality", subLocality);
    if (lookingType) params.set("lookingType", lookingType);
    if (purpose) params.set("purpose", purpose);
    if (propertyType) params.set("propertyType", propertyType);

    fetch(`/api/locality-trends?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load trends");
        return res.json();
      })
      .then((data) => {
        const payload: CachedPayload = {
          trendData: Array.isArray(data.trendData) ? data.trendData : [],
          insight: data.insight || "",
          locality: data.locality || [locality, city].join(", "),
          contextLabel: data.contextLabel,
          isPerSqft: data.isPerSqft,
        };
        setTrendData(payload.trendData);
        setInsight(payload.insight);
        setLocationLabel(payload.locality);
        setContextLabel(payload.contextLabel ?? "");
        setIsPerSqft(payload.isPerSqft ?? false);
        setCachedTrends(locality, city, subLocality, lookingType, purpose, propertyType, payload);
      })
      .catch(() => setError("Could not load locality trends"))
      .finally(() => setLoading(false));
  }, [locality, city, subLocality, lookingType, purpose, propertyType, mounted]);

  const computed = useMemo(() => {
    const data = trendData || [];
    if (!data.length) return null;

    const values = data.map((d) => safeNum(d.value));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0];
    const last = values[values.length - 1];

    const change = pctChange(first, last);
    const direction =
      change === null ? "flat" : change > 0 ? "up" : change < 0 ? "down" : "flat";

    // Volatility proxy (simple): (max-min)/avg
    const avg = values.reduce((a, b) => a + b, 0) / values.length || 1;
    const volatility = ((max - min) / avg) * 100;

    return {
      min,
      max,
      first,
      last,
      change,
      direction,
      volatility,
      points: data.length,
      startYear: data[0]?.year,
      endYear: data[data.length - 1]?.year,
    };
  }, [trendData]);

  if (loading) {
    return (
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.08)]",
          className
        )}
      >
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 w-full">
              <div className="h-5 w-52 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-100" />
          </div>

          <div className="mt-4 h-[260px] animate-pulse rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100" />

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-2xl border border-gray-100 bg-white"
              />
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !trendData?.length || !computed) return null;

  const dirIcon =
    computed.direction === "up" ? (
      <TrendingUp className="h-4 w-4" />
    ) : computed.direction === "down" ? (
      <TrendingDown className="h-4 w-4" />
    ) : (
      <Minus className="h-4 w-4" />
    );

  const dirChipClass =
    computed.direction === "up"
      ? "bg-green-50 text-green-700 border-green-100"
      : computed.direction === "down"
        ? "bg-red-50 text-red-700 border-red-100"
        : "bg-gray-50 text-gray-700 border-gray-100";

  const changeText =
    computed.change === null
      ? "—"
      : `${computed.change > 0 ? "+" : ""}${computed.change.toFixed(1)}%`;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-gray-200 bg-white",
        "shadow-[0_12px_30px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {/* subtle glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-sky-200/20 blur-3xl" />

      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] md:text-[16px] font-extrabold tracking-tight text-gray-900">
                {contextLabel
                  ? `${contextLabel.charAt(0).toUpperCase() + contextLabel.slice(1)} trends – last 10 years`
                  : "Locality trend insight"}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                <Info className="h-3.5 w-3.5 text-gray-400" />
                Last {computed.points} yrs
              </span>
            </div>

            <p className="mt-1 flex items-center gap-2 text-[12px] md:text-[13px] font-semibold text-gray-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="truncate">{locationLabel}</span>
            </p>
          </div>

          {/* Direction chip */}
          <div
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl border px-3 py-2",
              dirChipClass
            )}
            title="Change from first to last year"
          >
            {dirIcon}
            <div className="leading-tight">
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-90">
                Growth
              </p>
              <p className="text-[13px] font-extrabold">{changeText}</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-4 rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-2 md:p-3">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3586FF" stopOpacity={0.28} />
                    <stop offset="80%" stopColor="#3586FF" stopOpacity={0.06} />
                    <stop offset="100%" stopColor="#3586FF" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" stroke="#eef2f7" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />

                <Tooltip
                  cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
                    fontWeight: 600,
                  }}
                  formatter={(value: number) =>
                    [isPerSqft ? `₹/sqft index ${value}` : `Index ${value}`, "Trend"]
                  }
                  labelFormatter={(label) => `Year ${formatYear(label)}`}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3586FF"
                  strokeWidth={2.5}
                  fill="url(#trendFill)"
                  dot={false}
                  activeDot={{ r: 5 }}
                  name="Trend"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI Tiles */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          <Kpi
            title="Start"
            value={`${computed.startYear ?? "—"} • ${computed.first}${isPerSqft ? " (₹/sqft index)" : ""}`}
            helper={isPerSqft ? "First data point (land rate index)" : "First data point"}
          />
          <Kpi
            title="Now"
            value={`${computed.endYear ?? "—"} • ${computed.last}${isPerSqft ? " (₹/sqft index)" : ""}`}
            helper={isPerSqft ? "Latest data point (land rate index)" : "Latest data point"}
          />
          <Kpi
            title="Range"
            value={`${computed.min} – ${computed.max}`}
            helper="Min to max"
          />
          <Kpi
            title="Volatility"
            value={`${computed.volatility.toFixed(1)}%`}
            helper="Range vs average"
          />
        </div>

        {/* Insight */}
        {insight ? (
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
            <p className="text-[13px] md:text-[14px] text-gray-700 font-semibold leading-relaxed">
              {insight}
            </p>
          </div>
        ) : null}

        {/* Footnote */}
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] text-gray-400 font-semibold">
            Trend index is illustrative. For current prices, check listed properties.
          </p>

          {/* optional CTA (doesn't break anything if you remove it) */}
          <button
            type="button"
            onClick={() => {
              // router.push(`/properties/buy/${city}?locality=${encodeURIComponent(generateSlug(locality))}`)
            }}
            className="inline-flex items-center gap-1 text-[12px] font-extrabold text-blue-700 hover:text-blue-800"
          >
            Explore listings <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Kpi({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <p className="text-[11px] font-extrabold tracking-wide text-gray-500">
        {title}
      </p>
      <p className="mt-1 text-[13px] md:text-[14px] font-extrabold text-gray-900 truncate">
        {value}
      </p>
      {helper ? (
        <p className="mt-1 text-[10px] font-semibold text-gray-400 truncate">
          {helper}
        </p>
      ) : null}
    </div>
  );
}