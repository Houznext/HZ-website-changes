import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import PortalLayout from "../../../components/portal/PortalLayout";

interface IReferral {
  id: string;
  referredName: string;
  referredMobile: string;
  status: string;
  cashbackAmount?: number;
}

interface IProjectMeta {
  id: string;
  customer: { id: string; fullName: string };
  city: string;
  locality: string;
  address: string;
  bhk?: string;
}

export default function RewardsPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const [projectMeta, setProjectMeta] = useState<IProjectMeta | null>(null);
  const [referrals, setReferrals] = useState<IReferral[]>([]);
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
      const token = getToken();
      if (!token) throw new Error("Please login again");
      const h = { Authorization: `Bearer ${token}` };
      const projRes = await fetch(
        `${API}/interiors/projects/${projectId}`,
        { headers: h },
      );
      if (!projRes.ok) throw new Error("Project not found");
      const meta = (await projRes.json()) as IProjectMeta;
      setProjectMeta(meta);

      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      ) as { sub?: string };
      const customerId = payload.sub ?? meta.customer.id;

      const refRes = await fetch(
        `${API}/interiors/customers/${customerId}/referrals`,
        { headers: h },
      );
      if (!refRes.ok) throw new Error("Failed to load referrals");
      const data = (await refRes.json()) as IReferral[];
      setReferrals(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load rewards");
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

  const totalEarnings = referrals.reduce(
    (sum, r) => sum + (r.cashbackAmount ?? 0),
    0,
  );

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/houznext-rewards`
      : "";

  const content = () => {
    if (loading) {
      return (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-xl" />
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

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Houznext Rewards
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Share with friends and earn cashback when they book.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Total earned</p>
              <p className="text-lg font-semibold text-[#085041]">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: "Houznext LiveBuild Interiors",
                      text: "Track my project and start your own.",
                      url: shareLink,
                    })
                    .catch(() => undefined);
                } else if (navigator.clipboard) {
                  navigator.clipboard.writeText(shareLink).catch(() => undefined);
                }
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-[#1D9E75] text-[#085041] bg-[#E1F5EE] hover:bg-[#cff7e7]"
            >
              Share link
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">
              Your referrals
            </p>
          </div>
          {referrals.length === 0 ? (
            <p className="px-4 py-6 text-xs text-gray-500 text-center">
              No referrals yet. Share your link to get started.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {referrals.map((r) => (
                <div
                  key={r.id}
                  className="px-4 py-3 flex items-center gap-3 text-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-[#EBF3FF] flex items-center justify-center text-xs font-semibold text-[#1A56DB]">
                    {r.referredName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {r.referredName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {r.referredMobile}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {r.status}
                  </span>
                  <span className="text-xs font-medium text-[#085041]">
                    {r.cashbackAmount
                      ? `₹${r.cashbackAmount.toLocaleString("en-IN")}`
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <PortalLayout
      activePage="rewards"
      projectId={projectMeta?.id ?? pid}
      projectAddress={
        projectMeta
          ? `${projectMeta.bhk ? `${projectMeta.bhk} · ` : ""}${
              projectMeta.city || projectMeta.locality
            }`
          : undefined
      }
      customerName={projectMeta?.customer?.fullName}
    >
      {content()}
    </PortalLayout>
  );
}

