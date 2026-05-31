import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { getToken, getUser, clearSession } from '@/lib/session';
import { useInfraPermissionStore } from '@/stores/useInfraPermissionStore';
import { ListingFormProvider } from '@/context/ListingFormContext';
import { ProjectFormProvider } from '@/context/ProjectFormContext';
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
  const isListingWizard = router.pathname.startsWith('/new-property') || /^\/listings\/[^/]+\/edit$/.test(router.pathname);
  const isProjectWizard = router.pathname.startsWith('/projects/new');

  const inner = (
    <>
      <AuthSync />
      <Component {...pageProps} />
    </>
  );

  let wrapped = inner;
  if (isListingWizard) wrapped = <ListingFormProvider>{wrapped}</ListingFormProvider>;
  if (isProjectWizard) wrapped = <ProjectFormProvider>{wrapped}</ProjectFormProvider>;

  return (
    <>
      {wrapped}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          className: 'crm-toast',
          style: {
            background: '#1f2933',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            borderLeft: '3px solid #22c55e',
          },
        }}
      />
    </>
  );
}
