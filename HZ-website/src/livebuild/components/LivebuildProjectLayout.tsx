import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  LayoutGrid,
  Calendar,
  Box,
  CreditCard,
  MessageSquare,
  ChevronLeft,
  Bell,
  Home,
  Tag,
  FolderOpen,
  MoreHorizontal,
  X,
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
  { key: 'property-info', href: '/property-info', label: 'Property Info', Icon: Home },
  { key: 'materials', href: '/materials', label: 'Materials', Icon: Tag },
  { key: 'documents', href: '/documents', label: 'Documents', Icon: FolderOpen },
] as const;

const MOBILE_PRIMARY = MAIN_TABS.slice(0, 5);
const MOBILE_MORE = MAIN_TABS.slice(5);

type Props = {
  project?: LbProjectSummary | null;
  children: React.ReactNode;
  showMainTabs?: boolean;
  showMobileNav?: boolean;
  queriesBadge?: number;
  loading?: boolean;
};

function normalizeLbPath(path: string): string {
  return path.split('?')[0].replace(/\/$/, '') || '/';
}

function tabActive(asPath: string, projectId: string, href: string): boolean {
  const path = normalizeLbPath(asPath);
  const base = `/livebuild/${projectId}`;

  if (!href) {
    if (path === base) return true;
    return path.startsWith(`${base}/rooms`);
  }

  const tabPath = `${base}${href}`;
  return path === tabPath || path.startsWith(`${tabPath}/`);
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
  const [moreOpen, setMoreOpen] = useState(false);
  const { ready, canAccess } = useLivebuildSession(true);

  useEffect(() => {
    if (projectId === 'dashboard') {
      void router.replace('/livebuild/dashboard');
    }
  }, [projectId, router]);

  useEffect(() => {
    setMoreOpen(false);
  }, [router.asPath]);

  if (!ready) {
    return (
      <div className="lb-root flex items-center justify-center min-h-[50vh]">
        <div className="live-dot" style={{ width: 12, height: 12 }} />
      </div>
    );
  }

  if (!canAccess) return null;

  const asPath = router.asPath;
  const pct = Math.round(project?.overallProgress ?? 0);
  const moreActive = MOBILE_MORE.some(({ href }) => tabActive(asPath, projectId, href));

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
            <span className="lb-hide-xs">Back</span>
          </Button>
          <div style={{ minWidth: 0, flex: 1 }}>
            {loading ? (
              <div style={{ height: 32, width: 180, background: '#f1f5f9', borderRadius: 6 }} />
            ) : (
              <>
                <div className="lb-topbar-title">{project?.title ?? 'Project'}</div>
                <div className="lb-topbar-sub">
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
          <div className="lb-topbar-actions">
            <ProgressRing pct={pct} size={40} stroke={4} labelColor="var(--ch)" trackColor="#e8eef5" />
          </div>
        </div>

        {showMainTabs && (
          <nav className="ptabs">
            {MAIN_TABS.map(({ key, href, label, Icon }) => {
              const active = tabActive(asPath, projectId, href);
              return (
                <Link
                  key={key}
                  href={`/livebuild/${projectId}${href}`}
                  className={`ptab ${active ? 'on' : ''}`}
                  aria-current={active ? 'page' : undefined}
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
          <>
            <nav className="mob-nav">
              {MOBILE_PRIMARY.map(({ key, href, label, Icon }) => {
                const active = tabActive(asPath, projectId, href);
                return (
                  <Link
                    key={key}
                    href={`/livebuild/${projectId}${href}`}
                    className={`mob-nav-item ${active ? 'on' : ''}`}
                  >
                    <Icon size={20} {...lbIconProps()} />
                    <span className="mob-nav-label">{label === 'Day Progress' ? 'Progress' : label}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                className={`mob-nav-item ${moreActive || moreOpen ? 'on' : ''}`}
                onClick={() => setMoreOpen(true)}
                aria-expanded={moreOpen}
                aria-haspopup="dialog"
              >
                <MoreHorizontal size={20} {...lbIconProps()} />
                <span className="mob-nav-label">More</span>
              </button>
            </nav>

            {moreOpen ? (
              <div className="lb-more-sheet-backdrop" onClick={() => setMoreOpen(false)} role="presentation">
                <div
                  className="lb-more-sheet"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-label="More project sections"
                >
                  <div className="lb-more-sheet-head">
                    <span style={{ fontFamily: 'var(--m)', fontWeight: 700, fontSize: 14 }}>More</span>
                    <button type="button" className="lb-more-close" onClick={() => setMoreOpen(false)} aria-label="Close">
                      <X size={18} {...lbIconProps()} />
                    </button>
                  </div>
                  <div className="lb-more-grid">
                    {MOBILE_MORE.map(({ key, href, label, Icon }) => {
                      const active = tabActive(asPath, projectId, href);
                      return (
                        <Link
                          key={key}
                          href={`/livebuild/${projectId}${href}`}
                          className={`lb-more-item ${active ? 'on' : ''}`}
                          onClick={() => setMoreOpen(false)}
                        >
                          <Icon size={18} {...lbIconProps()} />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </>
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
            <Home size={20} {...lbIconProps()} />
            Account
          </Link>
        </nav>
      </div>
    </LivebuildToastProvider>
  );
}
