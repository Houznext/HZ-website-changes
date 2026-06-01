import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  LayoutGrid,
  Calendar,
  Box,
  CreditCard,
  MessageSquare,
  ChevronLeft,
  User,
  Bell,
} from 'lucide-react';
import ProgressRing from './ProgressRing';
import Navbar from '@/components/Navbar';
import { LivebuildToastProvider } from './ToastProvider';
import Badge from './Badge';
import Button from './Button';
import { lbIconProps } from './icons';
import { useLivebuildSession } from '../lib/useLivebuildSession';
import { projectLocation, statusBadgeClass, statusLabel } from '../lib/format';
import type { LbProjectSummary } from '../lib/types';

const MAIN_TABS = [
  { key: 'home', href: '', label: 'Home', Icon: LayoutGrid },
  { key: 'day-progress', href: '/day-progress', label: 'Day Progress', Icon: Calendar },
  { key: 'viz', href: '/viz', label: '3D', Icon: Box },
  { key: 'payments', href: '/payments', label: 'Payments', Icon: CreditCard },
  { key: 'queries', href: '/queries', label: 'Queries', Icon: MessageSquare },
] as const;

type Props = {
  project?: LbProjectSummary | null;
  children: React.ReactNode;
  showMainTabs?: boolean;
  showMobileNav?: boolean;
  queriesBadge?: number;
  loading?: boolean;
};

function tabActive(pathname: string, projectId: string, href: string): boolean {
  const base = `/livebuild/${projectId}`;
  if (!href) return pathname === base || pathname === `${base}/`;
  return pathname.startsWith(`${base}${href}`);
}

export default function LivebuildProjectLayout({
  project,
  children,
  showMainTabs = true,
  showMobileNav = true,
  queriesBadge = 0,
  loading,
}: Props) {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');
  const { ready, canAccess } = useLivebuildSession(true);

  useEffect(() => {
    if (projectId === 'dashboard') {
      void router.replace('/livebuild/dashboard');
    }
  }, [projectId, router]);

  if (!ready) {
    return (
      <div className="lb-root flex items-center justify-center min-h-[50vh]">
        <div className="live-dot" style={{ width: 12, height: 12 }} />
      </div>
    );
  }

  if (!canAccess) return null;

  const pathname = router.pathname;
  const pct = Math.round(project?.overallProgress ?? 0);

  return (
    <LivebuildToastProvider>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className={`lb-root ${showMobileNav ? 'lb-has-mob-nav' : ''}`}>
        <Navbar />
        <div className="lb-topbar">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void router.push('/livebuild/dashboard')}
            style={{ flexShrink: 0 }}
          >
            <ChevronLeft size={13} {...lbIconProps()} />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div style={{ minWidth: 0 }}>
            {loading ? (
              <div style={{ height: 32, width: 180, background: '#f1f5f9', borderRadius: 6 }} />
            ) : (
              <>
                <div
                  style={{
                    fontFamily: 'var(--m)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--ch)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project?.title ?? 'Project'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--mu)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {project && projectLocation(project)}
                  {project?.status && (
                    <Badge variant={statusBadgeClass(project.status)} style={{ fontSize: 8 }}>
                      {statusLabel(project.status)}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
          <div
            style={{
              marginLeft: 'auto',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontFamily: 'var(--m)', fontSize: 12, fontWeight: 700, color: 'var(--mu)' }}>
              {pct}%
            </span>
            <ProgressRing pct={pct} size={36} stroke={4} />
            <button
              type="button"
              aria-label="Notifications"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: 'var(--mu)',
              }}
            >
              <Bell size={18} {...lbIconProps()} />
            </button>
          </div>
        </div>

        {showMainTabs && (
          <nav className="ptabs">
            {MAIN_TABS.map(({ key, href, label, Icon }) => {
              const active = tabActive(pathname, projectId, href);
              return (
                <Link
                  key={key}
                  href={`/livebuild/${projectId}${href}`}
                  className={`ptab ${active ? 'on' : ''}`}
                >
                  <Icon size={14} {...lbIconProps()} />
                  {label}
                  {key === 'queries' && queriesBadge > 0 && (
                    <Badge variant="red" style={{ fontSize: 8, padding: '1px 5px' }}>
                      {queriesBadge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {children}

        {showMobileNav && (
          <nav className="mob-nav">
            <Link
              href={`/livebuild/${projectId}`}
              className={`mob-nav-item ${tabActive(pathname, projectId, '') ? 'on' : ''}`}
            >
              <LayoutGrid size={20} {...lbIconProps()} />
              Home
            </Link>
            <Link
              href={`/livebuild/${projectId}/day-progress`}
              className={`mob-nav-item ${tabActive(pathname, projectId, '/day-progress') ? 'on' : ''}`}
            >
              <Calendar size={20} {...lbIconProps()} />
              Progress
            </Link>
            <Link
              href={`/livebuild/${projectId}/viz`}
              className={`mob-nav-item ${tabActive(pathname, projectId, '/viz') ? 'on' : ''}`}
            >
              <Box size={20} {...lbIconProps()} />
              3D
            </Link>
            <Link
              href={`/livebuild/${projectId}/payments`}
              className={`mob-nav-item ${tabActive(pathname, projectId, '/payments') ? 'on' : ''}`}
            >
              <CreditCard size={20} {...lbIconProps()} />
              Payments
            </Link>
            <Link
              href={`/livebuild/${projectId}/queries`}
              className={`mob-nav-item ${tabActive(pathname, projectId, '/queries') ? 'on' : ''}`}
            >
              <MessageSquare size={20} {...lbIconProps()} />
              Queries
            </Link>
          </nav>
        )}
      </div>
    </LivebuildToastProvider>
  );
}

export function LivebuildDashboardShell({ children }: { children: React.ReactNode }) {
  const { ready, canAccess } = useLivebuildSession(true);
  const router = useRouter();

  if (!ready) {
    return (
      <div className="lb-root flex items-center justify-center min-h-[50vh]">
        <div className="live-dot" style={{ width: 12, height: 12 }} />
      </div>
    );
  }
  if (!canAccess) return null;

  return (
    <LivebuildToastProvider>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="lb-root lb-has-mob-nav">
        <Navbar />
        {children}
        <nav className="mob-nav">
          <Link href="/livebuild/dashboard" className={`mob-nav-item ${router.pathname === '/livebuild/dashboard' ? 'on' : ''}`}>
            <LayoutGrid size={20} {...lbIconProps()} />
            Projects
          </Link>
          <Link href="/my-account" className="mob-nav-item">
            <User size={20} {...lbIconProps()} />
            Profile
          </Link>
        </nav>
      </div>
    </LivebuildToastProvider>
  );
}
