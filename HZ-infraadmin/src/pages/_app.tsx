import type { AppProps } from 'next/app';
import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { InfraSessionSync } from '@/components/InfraSessionSync';
import { InfraOrgRehydrate } from '@/components/InfraOrgRehydrate';
import '@/styles/globals.css';

function SessionTokenSync() {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (status === 'unauthenticated') {
      sessionStorage.removeItem('infra_admin_token');
      return;
    }
    if (status === 'authenticated' && session?.accessToken) {
      sessionStorage.setItem('infra_admin_token', session.accessToken);
    }
  }, [session, status]);
  return null;
}

export default function AdminApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <InfraOrgRehydrate />
      <InfraSessionSync />
      <SessionTokenSync />
      <Component {...pageProps} />
      <Toaster position="top-right" />
      <Analytics />
    </SessionProvider>
  );
}
