import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/src/utils/apiClient";
import { GA4_ENABLED } from "@/src/lib/ga4Server";
import { getOverdueFollowUps } from "@/src/components/NewCrmView/types";
import type { Lead } from "@/src/components/NewCrmView/types";

export interface SidebarBadges {
  /** Number of projects currently in execution or design phase */
  activeLiveCount: number;
  /** Number of blogs with status 'Regular' (unpromoted / draft-equivalent) */
  regularBlogCount: number;
  /** true = GA4 is live, false = not configured, null = still loading */
  ga4Live: boolean | null;
  /** CRM follow-ups overdue (same rules as CRM dashboard) */
  crmOverdueCount: number;
}

export function useSidebarBadges(): SidebarBadges {
  const session = useSession();
  const [activeLiveCount, setActiveLiveCount] = useState(0);
  const [regularBlogCount, setRegularBlogCount] = useState(0);
  const [ga4Live, setGa4Live] = useState<boolean | null>(null);
  const [crmOverdueCount, setCrmOverdueCount] = useState(0);

  useEffect(() => {
    // ── Interior projects: count execution + design statuses ─────────────
    apiClient
      .get(`${apiClient.URLS.interiors}/projects`, {}, true)
      .then((res: any) => {
        const projects: any[] = Array.isArray(res?.body) ? res.body : [];
        const active = projects.filter((p: any) =>
          ["execution", "design"].includes(p.status)
        );
        setActiveLiveCount(active.length);
      })
      .catch(() => {});

    // ── Blogs: count Regular (unpromoted) blogs ───────────────────────────
    apiClient
      .get(apiClient.URLS.blogs, {}, true)
      .then((res: any) => {
        const blogs: any[] = Array.isArray(res?.body?.blogs)
          ? res.body.blogs
          : [];
        const regular = blogs.filter((b: any) => b.blogStatus === "Regular");
        setRegularBlogCount(regular.length);
      })
      .catch(() => {});

    // ── GA4 live: disabled project-wide
    if (!GA4_ENABLED) {
      setGa4Live(false);
    } else {
      fetch("/api/ga4data")
        .then((r) => r.json())
        .then((data: unknown) => {
          setGa4Live(Array.isArray(data) && (data as any[]).length > 0);
        })
        .catch(() => setGa4Live(false));
    }
  }, []);

  useEffect(() => {
    if (session.status !== "authenticated") return;
    const userId = session.data?.user?.id;
    const branchId = session.data?.user?.branchMemberships?.[0]?.branchId;
    if (!userId || !branchId) return;

    const applyOverdue = (leads: Lead[]) => {
      setCrmOverdueCount(getOverdueFollowUps(leads).length);
    };

    void apiClient
      .get(`${apiClient.URLS.crmlead}/overdue-count`, { userId, branchId }, true)
      .then((res: { status?: number; body?: { count?: number } }) => {
        if (res.status === 200 && typeof res.body?.count === "number") {
          setCrmOverdueCount(res.body.count);
          return;
        }
        throw new Error("no overdue-count");
      })
      .catch(() => {
        void apiClient
          .get(
            `${apiClient.URLS.crmlead}/by-user`,
            { userId, branchId },
            true,
          )
          .then((res: { status?: number; body?: Lead[] }) => {
            const leads = Array.isArray(res.body) ? res.body : [];
            applyOverdue(leads);
          })
          .catch(() => setCrmOverdueCount(0));
      });
  }, [session.status, session.data?.user?.id]);

  return { activeLiveCount, regularBlogCount, ga4Live, crmOverdueCount };
}
