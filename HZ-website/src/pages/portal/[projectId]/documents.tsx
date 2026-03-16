import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import PortalLayout from "../../../components/portal/PortalLayout";

interface IDocument {
  id: string;
  category: string;
  documentName: string;
  s3Url: string;
  createdAt?: string;
}

interface IProjectMeta {
  id: string;
  bhk?: string;
  city: string;
  locality: string;
  address: string;
  customer: { fullName: string };
}

type GroupedDocs = Record<string, IDocument[]>;

export default function DocumentsPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [projectMeta, setProjectMeta] = useState<IProjectMeta | null>(null);
  const [docs, setDocs] = useState<IDocument[]>([]);
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
        fetch(`${API}/interiors/projects/${projectId}/documents`, {
          headers: h,
        }),
      ]);
      if (!pRes.ok) throw new Error("Project not found");
      const meta = (await pRes.json()) as IProjectMeta;
      const data = (await dRes.json()) as IDocument[];
      setProjectMeta(meta);
      setDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [projectId, API]);

  useEffect(() => {
    load();
  }, [load]);

  const groupByCategory = (): GroupedDocs => {
    const groups: GroupedDocs = {};
    docs.forEach((d) => {
      const key = d.category || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return groups;
  };

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
              <div key={i} className="h-16 bg-gray-100 rounded-xl" />
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

    if (docs.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-500">
          No documents uploaded yet.
        </div>
      );
    }

    const grouped = groupByCategory();

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, list]) => (
          <div key={category} className="bg-white rounded-xl border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                {category}
              </p>
            </div>
            <div className="divide-y divide-gray-50">
              {list.map((d) => (
                <div
                  key={d.id}
                  className="px-4 py-3 flex items-center gap-3 text-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                    📄
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {d.documentName}
                    </p>
                    {d.createdAt && (
                      <p className="text-[10px] text-gray-400">
                        {new Date(d.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                  <a
                    href={d.s3Url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PortalLayout
      activePage="documents"
      projectId={projectMeta?.id ?? pid}
      projectAddress={addr}
      customerName={projectMeta?.customer?.fullName}
    >
      {content()}
    </PortalLayout>
  );
}

