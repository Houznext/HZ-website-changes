import { useEffect, useState } from "react";
import apiClient from "@/src/utils/apiClient";

export interface SidebarBadges {
  /** Number of projects currently in execution or design phase */
  activeLiveCount: number;
  /** Number of blogs with status 'Regular' (unpromoted / draft-equivalent) */
  regularBlogCount: number;
  /** true = GA4 is live, false = not configured, null = still loading */
  ga4Live: boolean | null;
}

export function useSidebarBadges(): SidebarBadges {
  const [activeLiveCount, setActiveLiveCount] = useState(0);
  const [regularBlogCount, setRegularBlogCount] = useState(0);
  const [ga4Live, setGa4Live] = useState<boolean | null>(null);

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

    // ── GA4 live: /api/ga4data returns an array when active, object when disabled
    fetch("/api/ga4data")
      .then((r) => r.json())
      .then((data: unknown) => {
        setGa4Live(Array.isArray(data) && (data as any[]).length > 0);
      })
      .catch(() => setGa4Live(false));
  }, []);

  return { activeLiveCount, regularBlogCount, ga4Live };
}
