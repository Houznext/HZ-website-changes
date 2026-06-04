import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider, useSession } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { initGA, trackPageView } from '@/lib/analytics';
import { InfraSeoRouter } from '@/components/seo/InfraSeoRouter';
import '@/styles/globals.css';

function InfraTokenSync() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status !== 'authenticated' || !session) return;
    const t = session.accessToken;
    if (t && typeof window !== 'undefined') {
      localStorage.setItem('infra_token', t);
    }
  }, [session, status]);
  return null;
}

export default function App({ Component, pageProps: { session, initialPageSeo, initialSeoGeo, ...pageProps } }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    initGA();
    trackPageView(router.asPath);
    const handleRouteChange = (url: string) => trackPageView(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, router.asPath]);

  return (
    <SessionProvider session={session}>
      <InfraTokenSync />
      <InfraSeoRouter initialPage={initialPageSeo ?? undefined} initialGeo={initialSeoGeo ?? undefined} />
      <div className="site-root max-w-[100vw] overflow-x-hidden">
        <Component {...pageProps} />
      </div>
      <Toaster position="bottom-right" />
    </SessionProvider>
  );
}
