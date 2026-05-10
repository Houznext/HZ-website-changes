import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import Head from 'next/head';
import { clearAdminToken } from '@/lib/auth';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AdminLayout({
  children,
  title = 'Dashboard',
  subtitle = '',
  actions,
}: AdminLayoutProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f7fa',
          fontFamily: "'Inter', sans-serif",
          color: '#5a6a7e',
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title} — Houznext Infra Admin</title>
      </Head>
      <div style={{ display: 'grid', gridTemplateColumns: '252px 1fr', minHeight: '100vh' }}>
        <AdminSidebar />

        <div style={{ display: 'flex', flexDirection: 'column', background: '#f5f7fa' }}>
          <div
            style={{
              height: '54px',
              background: '#fff',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0f2a44',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {title}
              </div>
              {subtitle && <div style={{ fontSize: '11.5px', color: '#5a6a7e' }}>{subtitle}</div>}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {actions}
              <button
                type="button"
                onClick={() => {
                  clearAdminToken();
                  void signOut({ callbackUrl: '/login' });
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  background: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#5a6a7e',
                  cursor: 'pointer',
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Sign out
              </button>
            </div>
          </div>

          <div style={{ flex: 1, padding: '22px', overflowY: 'auto' }}>{children}</div>
        </div>
      </div>
    </>
  );
}
