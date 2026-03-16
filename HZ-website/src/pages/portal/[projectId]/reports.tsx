import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import PortalLayout from "../../../components/portal/PortalLayout";

interface IDpr {
  id: string;
  date: string;
  pdfUrl?: string;
}

interface IProjectMeta {
  id: string;
  bhk?: string;
  city: string;
  locality: string;
  address: string;
  customer: { fullName: string };
}

export default function ReportsPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [projectMeta, setProjectMeta] = useState<IProjectMeta | null>(null);
  const [reports, setReports] = useState<IDpr[]>([]);
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
      const [pRes, dRes] = await Promise.all([
        fetch(`${API}/interiors/projects/${projectId}`, { headers: h }),
        fetch(`${API}/interiors/projects/${projectId}/dpr`, { headers: h }),
      ]);
      if (!pRes.ok) throw new Error("Project not found");
      const meta = (await pRes.json()) as IProjectMeta;
      const data = (await dRes.json()) as IDpr[];
      setProjectMeta(meta);
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [projectId, API]);

  useEffect(() => {
    load();
  }, [load]);

  const pid = typeof projectId === "string" ? projectId : "";
  const addr =
    projectMeta && (projectMeta.city || projectMeta.locality)
      ? `${projectMeta.bhk ? `${projectMeta.bhk} · ` : ""}${
          projectMeta.city || projectMeta.locality
        }`
      : undefined;

  const content = () => {
    if (loading) {
      return (
        <div className="space-y-3 animate-pulse">
          <div className="h-8 bg-gray-100 rounded-xl" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
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

    if (reports.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-500">
          No daily progress reports yet.
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            Daily progress reports
          </p>
          <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
            Download full report
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {reports.map((r) => (
            <div
              key={r.id}
              className="px-4 py-3 flex items-center gap-3 text-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                📝
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900">
                  {new Date(r.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              {r.pdfUrl && (
                <a
                  href={r.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <PortalLayout
      activePage="reports"
      projectId={projectMeta?.id ?? pid}
      projectAddress={addr}
      customerName={projectMeta?.customer?.fullName}
    >
      {content()}
    </PortalLayout>
  );
}

