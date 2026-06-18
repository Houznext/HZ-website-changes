import { useMemo } from 'react';
import { useRouter } from 'next/router';

const RESERVED_SEGMENTS = new Set([
  'dashboard',
  'day-progress',
  'materials',
  'documents',
  'payments',
  'viz',
  'queries',
  'property-info',
  'rooms',
]);

/** Stable project id from route query or URL path (works during client transitions). */
export function useLbProjectId(): string {
  const router = useRouter();

  return useMemo(() => {
    const q = router.query.projectId;
    if (typeof q === 'string' && q.length > 0 && !RESERVED_SEGMENTS.has(q)) return q;
    if (Array.isArray(q) && q[0] && !RESERVED_SEGMENTS.has(q[0])) return q[0];

    const match = router.asPath.match(/^\/livebuild\/([^/?]+)/);
    const fromPath = match?.[1] ?? '';
    if (!fromPath || RESERVED_SEGMENTS.has(fromPath)) return '';
    return fromPath;
  }, [router.query.projectId, router.asPath]);
}
