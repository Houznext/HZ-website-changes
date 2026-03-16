import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import PortalLayout from "../../../components/portal/PortalLayout";

interface IGalleryItem {
  id: string;
  tradeId?: string;
  tradeName?: string;
  takenAt?: string;
  caption?: string;
}

interface IProjectMeta {
  id: string;
  bhk?: string;
  city: string;
  locality: string;
  address: string;
  customer: { fullName: string };
}

type GroupedGallery = Record<string, IGalleryItem[]>;

export default function GalleryPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [projectMeta, setProjectMeta] = useState<IProjectMeta | null>(null);
  const [items, setItems] = useState<IGalleryItem[]>([]);
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
      const [pRes, gRes] = await Promise.all([
        fetch(`${API}/interiors/projects/${projectId}`, { headers: h }),
        fetch(`${API}/interiors/projects/${projectId}/gallery`, {
          headers: h,
        }),
      ]);
      if (!pRes.ok) throw new Error("Project not found");
      const meta = (await pRes.json()) as IProjectMeta;
      const data = (await gRes.json()) as IGalleryItem[];
      setProjectMeta(meta);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [projectId, API]);

  useEffect(() => {
    load();
  }, [load]);

  const groupByDate = (): GroupedGallery => {
    const groups: GroupedGallery = {};
    items.forEach((item) => {
      const key = item.takenAt
        ? new Date(item.takenAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "Unsorted";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
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
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
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

    if (items.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-500">
          No photos have been uploaded yet.
        </div>
      );
    }

    const grouped = groupByDate();

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, group]) => (
          <div key={date}>
            <h2 className="text-xs font-medium text-gray-500 mb-2">
              {date}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {group.map((g) => (
                <div
                  key={g.id}
                  className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col gap-2"
                >
                  <div className="h-28 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-xl">
                    🏗
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {g.tradeName && (
                      <p className="font-medium text-gray-800">
                        {g.tradeName}
                      </p>
                    )}
                    {g.caption && <p className="mt-0.5">{g.caption}</p>}
                  </div>
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
      activePage="gallery"
      projectId={projectMeta?.id ?? pid}
      projectAddress={addr}
      customerName={projectMeta?.customer?.fullName}
    >
      {content()}
    </PortalLayout>
  );
}

