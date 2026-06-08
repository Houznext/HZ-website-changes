import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Legacy route — redirects to main LiveBuild login flow. */
export default function PortalLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/login?callbackUrl=/livebuild/dashboard');
  }, [router]);
  return null;
}
