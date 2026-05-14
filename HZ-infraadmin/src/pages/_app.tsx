import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { getToken, getUser, clearSession } from '@/lib/session';
import { useInfraPermissionStore } from '@/stores/useInfraPermissionStore';
import { ListingFormProvider } from '@/context/ListingFormContext';
import '@/styles/globals.css';

function AuthSync() {
  const initFromSession = useInfraPermissionStore((s) => s.initFromSession);
  const router = useRouter();
  const isLogin = router.pathname === '/login';

  useEffect(() => {
    if (isLogin) return;

    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      clearSession();
      window.location.href = '/login';
      return;
    }

    initFromSession(user.branchMemberships ?? [], user.role ?? '', user.email ?? '', user.kind ?? '');
  }, [isLogin, router.pathname, initFromSession]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const wizard = router.pathname.startsWith('/new-property');

  const inner = (
    <>
      <AuthSync />
      <Component {...pageProps} />
    </>
  );

  return (
    <>
      {wizard ? <ListingFormProvider>{inner}</ListingFormProvider> : inner}
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
    </>
  );
}
