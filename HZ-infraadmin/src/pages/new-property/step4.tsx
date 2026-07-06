'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Backward-compat redirect: old Step 4 (Photos) bookmarks → Step 5. */
export default function NewPropertyStep4Redirect() {
  const router = useRouter();
  useEffect(() => {
    if (router.isReady) void router.replace('/new-property/step5');
  }, [router, router.isReady]);
  return (
    <div style={{ padding: 40, textAlign: 'center', fontFamily: 'Inter, sans-serif', color: 'var(--mu)' }}>
      Redirecting…
    </div>
  );
}
