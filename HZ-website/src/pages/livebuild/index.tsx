import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Legacy URL — no separate LiveBuild login; use profile entry → dashboard. */
export default function LivebuildIndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/livebuild/dashboard');
  }, [router]);
  return null;
}
