'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { isProjectSaved, toggleSavedProject } from '@/lib/projectListsLocal';
import { requireLogin } from '@/lib/requireLogin';

type Ref = {
  projectId: string;
  slug: string;
  name: string;
  city?: string | null;
  locality?: string | null;
};

export function useSaveProject(ref: Ref) {
  const router = useRouter();
  const { status } = useSession();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') setSaved(isProjectSaved(ref.slug));
    else setSaved(false);
  }, [status, ref.slug]);

  const toggle = useCallback(
    (e?: { preventDefault?: () => void; stopPropagation?: () => void }) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (status !== 'authenticated') {
        requireLogin(router, `/projects/${ref.slug}`);
        return;
      }
      const next = toggleSavedProject(ref);
      setSaved(next);
    },
    [status, router, ref],
  );

  return { saved, toggle, authed: status === 'authenticated' };
}
