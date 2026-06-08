import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import type { Chart as ChartType } from "chart.js";

const API = (
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_LOCAL_API_ENDPOINT ||
  "http://localhost:4000/"
).replace(/\/?$/, "");

interface ICustomer {
  id: string;
  fullName: string;
  mobile: string;
}
interface IRep {
  fullName: string;
  mobile: string;
}
interface IDailyUpdate {
  id: string;
  updateDate: string;
  cumulativeProgress: number;
  workDoneToday?: string | null;
  createdAt: string;
}
interface ITradeMedia {
  id: string;
  s3Url: string | null;
  mediaType: string | null;
  createdAt: string;
}
interface ITrade {
  id: string;
  customName: string | null;
  overallProgress: number;
  status: string;
  lastUpdatedAt?: string | null;
  template: { name: string; slug: string };
  dailyUpdates?: IDailyUpdate[];
  media?: ITradeMedia[];
}
interface IMilestone {
  id: string;
  milestoneName: string;
  amount: number;
  status: string;
  sortOrder: number;
  dueDate?: string | null;
}
interface IProject {
  id: string;
  status: string;
  overallProgress: number;
  designStatus?: string | null;
  expectedStartDate?: string | null;
  expectedEndDate?: string | null;
  address: string;
  city: string;
  locality: string;
  bhk?: string;
  customer: ICustomer;
  rep?: IRep;
  trades?: ITrade[];
  paymentMilestones?: IMilestone[];
}

interface INotif {
  id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

const TRADE_RING: Record<string, string> = {
  "modular-kitchen": "#2f80ed",
  wardrobes: "#16a34a",
  "false-ceiling": "#7c3aed",
  flooring: "#d97706",
  painting: "#dc2626",
  electrical: "#0891b2",
  plumbing: "#059669",
};

function Donut({ pct, color }: { pct: number; color: string }) {
  const c = 2 * Math.PI * 28;
  const off = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div className="text-center w-[70px] mx-auto">
      <svg width="70" height="70" viewBox="0 0 70 70" className="mx-auto block">
        <circle cx="35" cy="35" r="28" fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle
          cx="35"
          cy="35"
          r="28"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={String(c)}
          strokeDashoffset={off}
          transform="rotate(-90 35 35)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <p className="text-[13px] font-bold text-[#0f2a44] mt-1">{Math.round(pct)}%</p>
    </div>
  );
}

export default function CustomerPortalDashboard() {
  const router = useRouter();
  const { projectId } = router.query;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<ChartType | null>(null);

  const [project, setProject] = useState<IProject | null>(null);
  const [notifications, setNotifications] = useState<INotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ringPct, setRingPct] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadCore = useCallback(async () => {
    if (!projectId || typeof projectId !== "string") return;
    const tok = typeof window !== "undefined" ? localStorage.getItem("hz_customer_token") ?? "" : "";
    if (!tok) {
      void router.replace('/login?callbackUrl=/livebuild/dashboard');
      return;
    }
    setLoading(true);
    setError("");
    try {
      const h = { Authorization: `Bearer ${tok}` };
      const [fullRes, nRes] = await Promise.all([
        fetch(`${API}/interiors/projects/${projectId}/full`, { headers: h }),
        fetch(`${API}/interiors/projects/${projectId}/notifications`, { headers: h }),
      ]);
      if (fullRes.status === 401) {
        void router.replace('/login?callbackUrl=/livebuild/dashboard');
        return;
      }
      if (!fullRes.ok) throw new Error("Could not load project");
      const p = (await fullRes.json()) as IProject;
      setProject(p);
      setRingPct(0);
      requestAnimationFrame(() =>
        setRingPct(Math.min(100, Math.round(Number(p.overallProgress ?? 0)))),
      );
      const nBody = nRes.ok ? ((await nRes.json()) as INotif[]) : [];
      setNotifications(Array.isArray(nBody) ? nBody : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    if (mounted) void loadCore();
  }, [mounted, loadCore]);

  useEffect(() => {
    if (!projectId || typeof projectId !== "string") return;
    const t = setInterval(() => {
      void fetch(`${API}/interiors/projects/${projectId}/notifications`)
        .then((r) => r.json())
        .then((body) => {
          if (Array.isArray(body)) setNotifications(body as INotif[]);
        })
        .catch(() => undefined);
    }, 30000);
    return () => clearInterval(t);
  }, [projectId]);

  useEffect(() => {
    if (!project || !canvasRef.current) return;
    let cancelled = false;
    void import("chart.js").then(({ Chart, registerables }) => {
      if (cancelled || !canvasRef.current) return;
      Chart.register(...registerables);
      chartRef.current?.destroy();
      const start = project.expectedStartDate
        ? new Date(project.expectedStartDate)
        : null;
      const end = project.expectedEndDate ? new Date(project.expectedEndDate) : null;
      const totalDays =
        start && end && !Number.isNaN(+start) && !Number.isNaN(+end)
          ? Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000))
          : 30;
      const labels = Array.from({ length: Math.min(totalDays, 45) }, (_, i) => `D${i + 1}`);
      const planned = labels.map((_, i) => ((i + 1) / labels.length) * 100);
      const points: { x: number; y: number }[] = [];
      (project.trades ?? []).forEach((tr) => {
        (tr.dailyUpdates ?? []).forEach((u) => {
          if (!start || !u.updateDate) return;
          const d = new Date(u.updateDate);
          const dayIdx = Math.max(
            0,
            Math.min(labels.length - 1, Math.ceil((d.getTime() - start.getTime()) / 86400000)),
          );
          points.push({ x: dayIdx, y: Number(u.cumulativeProgress ?? 0) });
        });
      });
      const actualArr: (number | null)[] = labels.map((_, i) => {
        const hit = points.filter((p) => Math.round(p.x) === i);
        if (!hit.length) return null;
        return hit.reduce((s, p) => s + p.y, 0) / hit.length;
      });
      chartRef.current = new Chart(canvasRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Planned",
              data: planned,
              borderColor: "#e2e8f0",
              borderDash: [4, 3],
              tension: 0,
              pointRadius: 0,
            },
            {
              label: "Actual",
              data: actualArr,
              borderColor: "#2f80ed",
              tension: 0.25,
              spanGaps: true,
              pointRadius: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { min: 0, max: 100, ticks: { stepSize: 25 } },
          },
          plugins: { legend: { position: "bottom" } },
        },
      });
    });
    return () => {
      cancelled = true;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [project]);

  const openPannellum = (url: string) => {
    setViewerUrl(url);
    setViewerOpen(true);
  };

  useEffect(() => {
    if (!viewerOpen || !viewerUrl) return;
    const src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";
    const existing = document.querySelector(`script[data-pannellum="1"]`);
    const run = () => {
      const w = window as unknown as { pannellum?: { viewer: (id: string, cfg: object) => unknown } };
      if (w.pannellum && document.getElementById("pannellum-viewer")) {
        w.pannellum.viewer("pannellum-viewer", {
          type: "equirectangular",
          panorama: viewerUrl,
          autoLoad: true,
        });
      }
    };
    if (existing) {
      const t = window.setTimeout(run, 100);
      return () => window.clearTimeout(t);
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.dataset.pannellum = "1";
    s.onload = () => run();
    document.head.appendChild(s);
    return () => undefined;
  }, [viewerOpen, viewerUrl]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] p-4">
        <div className="max-w-md mx-auto bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-700">
          {error || "Not found"}
        </div>
      </div>
    );
  }

  const progress = Math.min(100, Math.round(Number(project.overallProgress ?? 0)));
  const trades = project.trades ?? [];
  const milestones = [...(project.paymentMilestones ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysUpdates = trades.flatMap((t) =>
    (t.dailyUpdates ?? [])
      .filter((u) => String(u.updateDate).slice(0, 10) === todayStr)
      .map((u) => ({ trade: t, u })),
  );
  const todaysMedia = trades.flatMap((t) =>
    (t.media ?? []).filter((m) => String(m.createdAt).slice(0, 10) === todayStr),
  );
  const has360 = todaysMedia.some((m) => m.mediaType === "360");

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-20">
      <header className="sticky top-0 z-50 h-[52px] bg-[#0f2a44] flex items-center px-3 sm:px-4 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white shrink-0">
            <path
              d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="text-white text-sm font-bold hidden sm:inline">LiveBuild</span>
        </div>
        <span className="text-white/90 text-[13px] truncate flex-1 text-center hidden md:block">
          {project.customer?.fullName ?? "Project"}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" className="p-1 text-white relative" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>
          <div className="w-7 h-7 rounded-full bg-white/15 text-white text-[11px] font-semibold flex items-center justify-center">
            {(project.customer?.fullName ?? "U")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        </div>
      </header>

      {notifications.length > 0 && (
        <div className="bg-[#1a3a5c] text-white text-xs px-4 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="flex-1 truncate">{notifications[0]?.title}</span>
        </div>
      )}

      <section className="bg-white border-b border-slate-200/80 px-4 py-5">
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row gap-5 items-center">
          <div className="relative w-[140px] h-[140px] sm:w-[160px] sm:h-[160px] shrink-0">
            <svg viewBox="0 0 140 140" className="w-full h-full">
              <circle cx="70" cy="70" r="60" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle
                cx="70"
                cy="70"
                r="60"
                fill="none"
                stroke="#2f80ed"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={(1 - ringPct / 100) * 2 * Math.PI * 60}
                transform="rotate(-90 70 70)"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[#0f2a44]">{progress}%</span>
              <span className="text-[10px] text-slate-500">complete</span>
            </div>
          </div>
          <div className="flex-1 w-full">
            <h1 className="text-sm font-bold text-[#0f2a44]">
              {project.bhk ? `${project.bhk} · ` : ""}
              {project.city || project.locality || project.address}
            </h1>
            <p className="text-xs text-slate-500 mt-1 capitalize">{project.status}</p>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="rounded-lg p-2 text-center bg-[#eff6ff]">
                <div className="text-base font-bold text-[#1e40af]">—</div>
                <div className="text-[10px] text-slate-500">Timeline</div>
              </div>
              <div className="rounded-lg p-2 text-center bg-[#f0fdf4]">
                <div className="text-base font-bold text-[#166534]">
                  {project.expectedEndDate
                    ? new Date(project.expectedEndDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—"}
                </div>
                <div className="text-[10px] text-slate-500">Est. finish</div>
              </div>
              <div className="rounded-lg p-2 text-center bg-[#fffbeb]">
                <div className="text-base font-bold text-[#92400e]">{trades.length}</div>
                <div className="text-[10px] text-slate-500">Trades</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 py-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-[13px] font-bold text-[#0f2a44]">Progress timeline</h2>
          </div>
          <div className="h-[180px] sm:h-[220px]">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </section>

      <section className="px-4 mt-3">
        <h2 className="text-sm font-bold text-[#0f2a44] mb-2">Room progress</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
          {trades.map((t) => {
            const slug = t.template?.slug ?? "";
            const col = TRADE_RING[slug] ?? "#2f80ed";
            const pct = Number(t.overallProgress ?? 0);
            const name = t.customName || t.template?.name || "Trade";
            return (
              <div
                key={t.id}
                className="min-w-[160px] bg-white border border-slate-200/80 rounded-xl p-3 transition hover:border-[#93c5fd] hover:-translate-y-0.5"
              >
                <Donut pct={pct} color={col} />
                <p className="text-xs font-bold text-[#0f2a44] text-center mt-2">{name}</p>
                <p className="text-[10px] text-slate-500 text-center mt-1">
                  {t.lastUpdatedAt
                    ? `Updated ${new Date(t.lastUpdatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}`
                    : "—"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 mt-3">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3">
          <h3 className="text-xs font-bold text-[#0f2a44] mb-2">Today&apos;s update</h3>
          {todaysUpdates.length === 0 ? (
            <p className="text-[13px] text-slate-500 leading-relaxed">
              No update added today. Your site supervisor will update shortly.
            </p>
          ) : (
            <>
              {todaysUpdates.map(({ trade, u }) => (
                <div key={u.id}>
                  <p className="text-xs font-semibold text-slate-700">{trade.template?.name}</p>
                  <p className="text-[13px] text-slate-600 leading-relaxed">{u.workDoneToday}</p>
                </div>
              ))}
              <div className="flex gap-2 overflow-x-auto mt-2">
                {todaysMedia
                  .filter((m) => m.mediaType !== "360" && m.s3Url)
                  .map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="relative shrink-0 rounded-lg overflow-hidden min-w-[120px] h-[90px] border border-slate-100"
                      onClick={() => m.s3Url && window.open(m.s3Url, "_blank", "noopener,noreferrer")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.s3Url!} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
              </div>
              {has360 && (
                <button
                  type="button"
                  className="mt-2 w-full py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-2"
                  style={{ background: "#6d28d9" }}
                  onClick={() => {
                    const u = todaysMedia.find((m) => m.mediaType === "360" && m.s3Url)?.s3Url;
                    if (u) openPannellum(u);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" />
                  </svg>
                  View in 360°
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <section className="px-4 mt-4">
        <h2 className="text-sm font-bold text-[#0f2a44] mb-2">Recent notifications</h2>
        <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-100">
          {notifications.slice(0, 5).map((n) => (
            <div key={n.id} className="px-4 py-2.5 flex gap-2">
              <span
                className="w-3 h-3 rounded-full mt-1 shrink-0"
                style={{
                  background:
                    n.type === "update"
                      ? "#2f80ed"
                      : n.type === "design"
                        ? "#7c3aed"
                        : n.type === "snag"
                          ? "#dc2626"
                          : "#16a34a",
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0f2a44]">{n.title}</p>
                <p className="text-[11px] text-slate-500">{n.body}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-4 mt-4">
        <div className="rounded-xl border border-amber-200 bg-[#fffbeb] p-3">
          <h3 className="text-xs font-bold text-amber-800 mb-2">Payments</h3>
          <div className="flex flex-wrap gap-2">
            {milestones.slice(0, 4).map((m) => (
              <span
                key={m.id}
                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                  m.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : m.status === "on_hold"
                      ? "bg-red-100 text-red-800"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {m.milestoneName} · ₹{Number(m.amount ?? 0).toLocaleString("en-IN")}
              </span>
            ))}
          </div>
          {milestones.some((m) => m.status === "pending" && m.dueDate) && project.rep?.mobile && (
            <div className="mt-3 text-xs text-amber-900">
              <a
                href={`https://wa.me/${String(project.rep.mobile).replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-[#25D366] text-white font-semibold"
              >
                WhatsApp designer
              </a>
            </div>
          )}
        </div>
      </section>

      {viewerOpen && viewerUrl && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col">
          <button
            type="button"
            className="self-end m-3 text-white text-sm px-3 py-1 rounded bg-white/10"
            onClick={() => setViewerOpen(false)}
          >
            Close
          </button>
          <div id="pannellum-viewer" className="flex-1 m-3 rounded-lg overflow-hidden bg-black" />
        </div>
      )}
    </div>
  );
}
