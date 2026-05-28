'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Legacy route — hero CMS moved under Website CMS. */
export default function HeroCmsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/website-cms/hero');
  }, [router]);
  return null;
}
