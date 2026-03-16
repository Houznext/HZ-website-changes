import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import PortalLayout from "../../../components/portal/PortalLayout";

interface ITrade {
  id: string;
  customName: string | null;
  overallProgress: number;
  status: string;
  template: { name: string; slug: string };
}

interface IProject {
  id: string;
  status: string;
  overallProgress: number;
  city: string;
  locality: string;
  address: string;
  bhk?: string;
  customer: { fullName: string; mobile: string };
  trades?: ITrade[];
}

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

export default function TradesPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [project, setProject] = useState<IProject | null>(null);
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
      const res = await fetch(`${API}/interiors/projects/${projectId}`, {
        headers: h,
      });
      if (!res.ok) throw new Error("Failed to load trades");
      const data = (await res.json()) as IProject;
      setProject(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trades");
    } finally {
      setLoading(false);
    }
  }, [projectId, API]);

  useEffect(() => {
    load();
  }, [load]);

  const trades = project?.trades ?? [];

  const content = () => {
    if (loading) {
      return (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-gray-100 rounded-xl" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      );
    }

    if (trades.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-500">
          No trades started yet.
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">All trades</p>
        </div>
        <div className="divide-y divide-gray-50">
          {trades.map((t) => {
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
                <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${prog}%`, background: barColor }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-10 text-right flex-shrink-0">
                  {prog}%
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full flex-shrink-0 bg-gray-100 text-gray-600">
                  {t.status.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const pid = typeof projectId === "string" ? projectId : "";
  const addr =
    project && (project.city || project.locality)
      ? `${project.bhk ? `${project.bhk} · ` : ""}${
          project.city || project.locality
        }`
      : undefined;

  return (
    <PortalLayout
      activePage="trades"
      projectId={project?.id ?? pid}
      projectAddress={addr}
      customerName={project?.customer?.fullName}
    >
      {content()}
    </PortalLayout>
  );
}

