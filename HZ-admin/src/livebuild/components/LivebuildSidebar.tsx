import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Building2,
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import livebuildApi from '../lib/api';

const NAV = [
  { section: 'Overview' },
  { href: '/livebuild', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { section: 'Projects' },
  { href: '/livebuild/projects', label: 'All Projects', icon: Building2, key: 'projects', countKey: 'projects' as const },
  { section: 'Configuration' },
  { href: '/livebuild/work-types', label: 'Work Types', icon: Wrench, key: 'worktypes' },
  { section: 'People' },
  { href: '/livebuild/customers', label: 'Customers', icon: Users, key: 'customers' },
  { section: 'System' },
  { href: '/livebuild/settings', label: 'Settings', icon: Settings, key: 'settings' },
];

function isActive(pathname: string, href: string) {
  if (href === '/livebuild') return pathname === '/livebuild';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function LivebuildSidebar() {
  const router = useRouter();
  const pathname = router.pathname;
  const [projectCount, setProjectCount] = useState<number | null>(null);

  useEffect(() => {
    livebuildApi
      .listProjects()
      .then((list) => setProjectCount(Array.isArray(list) ? list.length : 0))
      .catch(() => setProjectCount(null));
  }, [pathname]);

  return (
    <nav className="lb-sb">
      <div className="lb-sb-logo">
        <Home size={22} strokeWidth={1.6} color="#fff" />
        <div className="lb-sb-logo-text">
          Live<span>Build</span>
        </div>
        <span className="lb-sb-badge">Admin</span>
      </div>
      <div className="lb-sb-nav">
        {NAV.map((item, i) => {
          if ('section' in item && item.section) {
            return (
              <div key={`s-${i}`} className="lb-sb-section">
                {item.section}
              </div>
            );
          }
          const row = item as {
            href: string;
            label: string;
            icon: typeof LayoutDashboard;
            key: string;
            countKey?: 'projects';
          };
          const Icon = row.icon;
          const on = isActive(pathname, row.href);
          return (
            <Link
              key={row.href}
              href={row.href}
              className={`lb-sb-item ${on ? 'on' : ''}`}
            >
              <span className="lb-sb-ic">
                <Icon size={13} strokeWidth={1.8} />
              </span>
              {row.label}
              {row.countKey === 'projects' && projectCount != null ? (
                <span className="lb-sb-cnt">{projectCount}</span>
              ) : null}
            </Link>
          );
        })}
        {pathname.includes('/livebuild/projects/') &&
        pathname !== '/livebuild/projects' ? (
          <>
            <div className="lb-sb-section">Current project</div>
            <div className="lb-sb-item on">
              <span className="lb-sb-ic">
                <FileText size={13} strokeWidth={1.8} />
              </span>
              Project detail
            </div>
          </>
        ) : null}
      </div>
      <div className="lb-sb-foot">
        <div className="lb-sb-user">
          <div className="lb-sb-av">A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.9)' }}>
              Admin
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.38)' }}>LiveBuild</div>
          </div>
          <ChevronDown
            size={12}
            strokeWidth={1.8}
            style={{ marginLeft: 'auto', color: 'rgba(255,255,255,.3)' }}
          />
        </div>
      </div>
    </nav>
  );
}
