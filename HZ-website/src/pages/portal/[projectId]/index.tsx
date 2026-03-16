import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import PortalLayout from "../../../components/portal/PortalLayout";

interface ICustomer { fullName: string; mobile: string; }
interface IRep { fullName: string; designation: string; mobile: string; email: string; }
interface ITrade {
  id: string;
  customName: string | null;
  overallProgress: number;
  status: string;
  template: { name: string; slug: string };
}
interface IMilestone {
  id: string;
  milestoneName: string;
  amount: number;
  status: string;
  sortOrder: number;
}
interface IProject {
  id: string;
  status: string;
  overallProgress: number;
  city: string;
  locality: string;
  address: string;
  bhk?: string;
  expectedEndDate?: string;
  customer: ICustomer;
  rep?: IRep;
  trades?: ITrade[];
}
interface ISnag { id: string; title: string; severity: string; }

const TRADE_EMOJI: Record<string, string> = {
  "modular-kitchen": "🍳",
  wardrobes: "🚪",
  "false-ceiling": "⬛",
  flooring: "🔲",
  painting: "🖌",
  electrical: "⚡",
  plumbing: "💧",
  "bathroom-remodel": "🚿",
  "tv-unit": "📺",
  "pooja-unit": "🪔",
  "study-unit": "📚",
  "shoe-rack": "👟",
};

const STATUS_BG: Record<string, string> = {
  in_progress: "#378ADD",
  not_started: "#9ca3af",
  on_hold: "#F59E0B",
  completed: "#1D9E75",
};

export default function CustomerDashboard() {
  const router = useRouter();
  const { projectId } = router.query;
  const [project, setProject] = useState<IProject | null>(null);
  const [milestones, setMilestones] = useState<IMilestone[]>([]);
  const [snags, setSnags] = useState<ISnag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("hz_customer_token") ?? ""
      : "";

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== "string") return;
    setLoading(true);
    setError("");
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const [pRes, mRes, sRes] = await Promise.all([
        fetch(`${API}/interiors/projects/${projectId}`, { headers: h }),
        fetch(`${API}/interiors/projects/${projectId}/milestones`, {
          headers: h,
        }),
        fetch(`${API}/interiors/projects/${projectId}/snags?status=open`, {
          headers: h,
        }),
      ]);
      if (!pRes.ok) throw new Error("Project not found — please login again");
      const [p, m, s] = (await Promise.all([
        pRes.json(),
        mRes.json(),
        sRes.json(),
      ])) as [IProject, IMilestone[], ISnag[]];
      setProject(p);
      setMilestones(Array.isArray(m) ? m : []);
      setSnags(Array.isArray(s) ? s : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      if (e instanceof Error && e.message.includes("login")) {
        setTimeout(() => router.push("/portal/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, API, router]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <PortalLayout
        activePage="dashboard"
        projectId={(projectId as string) ?? ""}
      >
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </PortalLayout>
    );
  }

  if (error) {
    return (
      <PortalLayout
        activePage="dashboard"
        projectId={(projectId as string) ?? ""}
      >
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      </PortalLayout>
    );
  }

  if (!project) return null;

  const progress = Math.round(project.overallProgress ?? 0);
  const trades = project.trades ?? [];
  const circumference = 2 * Math.PI * 26;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <PortalLayout
      activePage="dashboard"
      projectId={project.id}
      projectAddress={`${project.bhk ? `${project.bhk} · ` : ""}${
        project.city || project.locality
      }`}
      customerName={project.customer?.fullName}
    >
      {/* Progress hero */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3 flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="5"
            />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#1D9E75"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 32 32)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-900">
              {progress}%
            </span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Overall progress</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {project.bhk ? `${project.bhk} · ` : ""}
            {project.city || project.locality || project.address}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] bg-[#EBF3FF] text-[#1A56DB] px-2 py-0.5 rounded-full font-medium">
              {project.status}
            </span>
            {project.expectedEndDate && (
              <span className="text-[10px] text-gray-400">
                Target:{" "}
                {new Date(project.expectedEndDate).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" },
                )}
              </span>
            )}
          </div>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex-shrink-0">
          Download report
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="bg-[#1A56DB] rounded-xl p-3 text-white">
          <p className="text-[10px] opacity-75 mb-1">Budget used</p>
          <p className="text-xl font-medium">—</p>
          <p className="text-[9px] opacity-60 mt-1">% of total budget</p>
        </div>
        <div className="bg-[#0891B2] rounded-xl p-3 text-white">
          <p className="text-[10px] opacity-75 mb-1">Trades active</p>
          <p className="text-xl font-medium">
            {trades.filter((t) => t.status === "in_progress").length}/
            {trades.length}
          </p>
        </div>
        <div className="bg-[#D97706] rounded-xl p-3 text-white">
          <p className="text-[10px] opacity-75 mb-1">Open snags</p>
          <p className="text-xl font-medium">{snags.length}</p>
          {snags.length > 0 && (
            <p className="text-[9px] opacity-75 mt-1">Needs attention</p>
          )}
        </div>
        <div className="bg-[#059669] rounded-xl p-3 text-white">
          <p className="text-[10px] opacity-75 mb-1">Milestones</p>
          <p className="text-xl font-medium">
            {milestones.filter((m) => m.status === "paid").length}/
            {milestones.length}
          </p>
          <p className="text-[9px] opacity-60 mt-1">paid</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Trades list */}
        <div className="col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">All trades</p>
              <p className="text-xs text-gray-400">Click for full detail</p>
            </div>
            <div className="divide-y divide-gray-50">
              {trades.length === 0 ? (
                <p className="px-4 py-6 text-xs text-gray-400 text-center">
                  No trades started yet
                </p>
              ) : (
                trades.map((t) => {
                  const name = t.customName ?? t.template?.name ?? "Trade";
                  const slug = t.template?.slug ?? "";
                  const emoji = TRADE_EMOJI[slug] ?? "🔧";
                  const barColor = STATUS_BG[t.status] ?? "#9ca3af";
                  const prog = Math.round(t.overallProgress ?? 0);
                  return (
                    <div
                      key={t.id}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                        {emoji}
                      </div>
                      <span className="text-xs font-medium text-gray-900 flex-1">
                        {name}
                      </span>
                      <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${prog}%`, background: barColor }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 w-8 text-right flex-shrink-0">
                        {prog}%
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                          t.status === "completed"
                            ? "bg-[#E1F5EE] text-[#085041]"
                            : t.status === "in_progress"
                              ? "bg-[#EBF3FF] text-[#1A56DB]"
                              : t.status === "on_hold"
                                ? "bg-[#FFFBEB] text-[#92400E]"
                                : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Rep card */}
          {project.rep && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-medium text-gray-900 mb-2">
                Your designer
              </p>
              <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-2">
                <div className="w-8 h-8 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[10px] font-semibold text-[#085041] flex-shrink-0">
                  {project.rep.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {project.rep.fullName}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {project.rep.designation}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <a
                      href={`https://wa.me/91${project.rep.mobile}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#1A56DB] hover:underline"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${project.rep.mobile}`}
                      className="text-[10px] text-[#1A56DB] hover:underline"
                    >
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-medium text-gray-900 mb-2">
                Payment milestones
              </p>
              <div className="space-y-2">
                {[...milestones]
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((m) => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          m.status === "paid"
                            ? "bg-[#1D9E75]"
                            : m.status === "requested"
                              ? "bg-[#1A56DB]"
                              : "bg-gray-200"
                        }`}
                      />
                      <span className="text-[11px] text-gray-700 flex-1">
                        {m.milestoneName}
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          m.status === "paid"
                            ? "text-[#085041]"
                            : m.status === "requested"
                              ? "text-[#1A56DB]"
                              : "text-gray-400"
                        }`}
                      >
                        {m.amount > 0
                          ? `₹${m.amount.toLocaleString("en-IN")}`
                          : "—"}
                        {m.status === "paid" ? " ✓" : ""}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Rewards CTA */}
          <div
            className="bg-[#E1F5EE] rounded-xl p-3 cursor-pointer hover:bg-[#d1efe4] transition-colors"
            onClick={() => router.push(`/portal/${project.id}/rewards`)}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🎁</span>
              <div>
                <p className="text-xs font-medium text-[#085041]">
                  Houznext Rewards
                </p>
                <p className="text-[10px] text-[#0F6E56]">
                  Refer friends, earn cashback
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

