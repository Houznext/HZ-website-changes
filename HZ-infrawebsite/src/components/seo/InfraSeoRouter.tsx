'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/lib/axios';
import type { InfraPageSeoPublic } from '@/lib/fetchPageSeo';
import type { InfraSeoGeo } from '@/lib/fetchSeoGeo';
import { InfraSeoHead } from '@/components/seo/InfraSeoHead';

function normalizePath(asPath: string): string {
  const p = asPath.split('?')[0].split('#')[0] || '/';
  return p.startsWith('/') ? p : `/${p}`;
}

/** Dynamic detail pages manage their own Head */
function shouldSkipManagedSeo(path: string): boolean {
  if (path.startsWith('/property/')) return true;
  if (/^\/projects\/[^/]+$/.test(path)) return true;
  if (/^\/news\/[^/]+$/.test(path)) return true;
  return false;
}

type Props = {
  initialPage?: InfraPageSeoPublic | null;
  initialGeo?: InfraSeoGeo | null;
};

export function InfraSeoRouter({ initialPage, initialGeo }: Props) {
  const router = useRouter();
  const path = useMemo(() => normalizePath(router.asPath), [router.asPath]);
  const [page, setPage] = useState<InfraPageSeoPublic | null>(initialPage ?? null);
  const [geo, setGeo] = useState<InfraSeoGeo | null>(initialGeo ?? null);
  const geoFetched = useRef(!!initialGeo);

  useEffect(() => {
    if (geoFetched.current) return;
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<InfraSeoGeo>('/site-config/seo-geo', { signal: ac.signal });
        setGeo(res.data);
        geoFetched.current = true;
      } catch {
        /* ignore */
      }
    })();
    return () => ac.abort();
  }, [initialGeo]);

  useEffect(() => {
    if (shouldSkipManagedSeo(path)) return;
    const ac = new AbortController();
    void (async () => {
      try {
        const res = await api.get<InfraPageSeoPublic>('/page-seo/public/by-path', {
          params: { path },
          signal: ac.signal,
        });
        setPage(res.data);
      } catch {
        /* ignore */
      }
    })();
    return () => ac.abort();
  }, [path]);

  if (shouldSkipManagedSeo(path) || !page || !geo) return null;

  return <InfraSeoHead page={page} geo={geo} canonicalPath={path} />;
}
