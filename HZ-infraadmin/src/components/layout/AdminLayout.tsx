'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock,
  FileText,
  GitBranch,
  Home,
  Image,
  LayoutGrid,
  Inbox,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import adminApi from '@/lib/axios';

type NavCounts = { properties: number; pending: number; leads: number; enquiries: number; crmOverdue: number; crmVisits: number; dev: number; projects: number };

const iconProps = { size: 13, strokeWidth: 1.8, fill: 'none' as const };

function fmtCount(n: number) {
  return n.toLocaleString('en-IN');
}

export function AdminLayout({
  children,
  title,
  titleLeft,
  actions,
  header,
  hideSearch,
}: {
  children: React.ReactNode;
  title?: string;
  titleLeft?: ReactNode;
  actions?: ReactNode;
  /** When set, replaces the entire default top bar (title, search, actions). */
  header?: ReactNode;
  hideSearch?: boolean;
}) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [counts, setCounts] = useState<NavCounts>({ properties: 0, pending: 0, leads: 0, enquiries: 0, crmOverdue: 0, crmVisits: 0, dev: 0, projects: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [listRes, pendRes, crmStats, enqRes, projRes] = await Promise.all([
          adminApi.get('/admin/properties', { params: { page: 1, limit: 1 } }).catch(() => null),
          adminApi.get('/admin/properties/pending').catch(() => null),
          adminApi.get('/admin/crm/stats').catch(() => null),
          adminApi.get('/admin/enquiries').catch(() => null),
          adminApi.get('/admin/projects').catch(() => null),
        ]);
        if (cancelled) return;
        const total = listRes?.data?.total ?? 0;
        const pending = Array.isArray(pendRes?.data) ? pendRes.data.length : 0;
        const leads = Number(crmStats?.data?.totalLeads ?? 0);
        const crmOverdue = Number(crmStats?.data?.overdueCount ?? 0);
        const crmVisits = Number(crmStats?.data?.siteVisitsToday ?? 0);
        const enquiries = Array.isArray(enqRes?.data) ? enqRes.data.length : 0;
        const projects = Array.isArray(projRes?.data) ? projRes.data.length : 0;
        setCounts({ properties: total, pending, leads, enquiries, crmOverdue, crmVisits, dev: 0, projects });
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const path = router.pathname;

  const NavRow = ({
    href,
    label,
    icon: Icon,
    badge,
  badgeVariant = 'blue',
  active,
}: {
  href: string;
  label: string;
  icon: typeof Building2;
  badge?: number;
  badgeVariant?: 'blue' | 'amber' | 'accent' | 'red';
  active: boolean;
}) => (
  <Link href={href} className={`asi ${active ? 'on' : ''}`}>
    <span className="ic">
      <Icon {...iconProps} color="currentColor" />
    </span>
    {label}
    {badge != null && badge > 0 ? (
      <span
        className={
          badgeVariant === 'blue'
            ? 'nav-badge-blue'
            : badgeVariant === 'amber'
              ? 'nav-badge-amber'
              : badgeVariant === 'red'
                ? 'nav-badge-red'
                : 'nav-badge-accent'
        }
      >
        {fmtCount(badge)}
      </span>
    ) : null}
  </Link>
);

  const initials = (user?.name || user?.username || '?')
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="admin-root">
      <aside className="admin-sb">
        <div
          style={{
            padding: '0 14px',
            height: 54,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 16, fontWeight: 800, color: '#fff' }}>
            Houznext <span style={{ color: 'var(--accent)' }}>Infra</span>
          </span>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 4,
              background: 'var(--blue)',
              color: '#fff',
              fontFamily: 'Montserrat, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Admin
          </span>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <div className="asec">Overview</div>
          <NavRow
            href="/listings"
            label="All properties"
            icon={Building2}
            badge={counts.properties}
            badgeVariant="blue"
            active={path.startsWith('/listings')}
          />
          <NavRow
            href="/pending"
            label="Pending approval"
            icon={Clock}
            badge={counts.pending}
            badgeVariant="amber"
            active={path.startsWith('/pending')}
          />

          <div className="asec">Content</div>
          <NavRow
            href="/projects"
            label="Projects"
            icon={Home}
            badge={counts.projects}
            badgeVariant="blue"
            active={path.startsWith('/projects') && !path.startsWith('/projects/new')}
          />
          <NavRow href="/projects/new" label="Add project" icon={Plus} badgeVariant="blue" active={path.startsWith('/projects/new')} />
          <NavRow href="/rera-docs" label="RERA & documents" icon={FileText} badgeVariant="blue" active={path.startsWith('/rera-docs')} />
          <div className="asec">Website CMS</div>
          <NavRow
            href="/website-cms/hero"
            label="Website Hero"
            icon={Image}
            badgeVariant="blue"
            active={path.startsWith('/website-cms/hero')}
          />
          <NavRow
            href="/website-cms/browse-by-type"
            label="Browse by type"
            icon={LayoutGrid}
            badgeVariant="blue"
            active={path.startsWith('/website-cms/browse-by-type')}
          />

          <div className="asec">CRM</div>
          <NavRow
            href="/enquiries"
            label="Enquiries"
            icon={Inbox}
            badge={counts.enquiries}
            badgeVariant="blue"
            active={path.startsWith('/enquiries')}
          />
          <NavRow
            href="/crm"
            label="CRM"
            icon={MessageSquare}
            badge={counts.leads}
            badgeVariant="amber"
            active={path.startsWith('/crm')}
          />
          <NavRow
            href="/crm/site-visits"
            label="CRM site visits"
            icon={CalendarDays}
            badge={counts.crmVisits}
            badgeVariant="blue"
            active={path.startsWith('/crm/site-visits')}
          />
          <NavRow
            href="/crm/follow-ups"
            label="CRM follow-ups"
            icon={Bell}
            badge={counts.crmOverdue}
            badgeVariant="red"
            active={path.startsWith('/crm/follow-ups')}
          />

          <div className="asec">Team</div>
          <NavRow href="/users" label="Users" icon={Users} badgeVariant="blue" active={path.startsWith('/users')} />
          <NavRow href="/branches" label="Branches" icon={GitBranch} badgeVariant="blue" active={path.startsWith('/branches')} />
          <NavRow href="/roles" label="Roles" icon={Shield} badgeVariant="blue" active={path.startsWith('/roles')} />

          <div className="asec">System</div>
          <NavRow
            href="/developer-submissions"
            label="Developer submissions"
            icon={UserPlus}
            badge={counts.dev}
            badgeVariant="accent"
            active={path.startsWith('/developer-submissions')}
          />
          <NavRow href="/settings" label="Settings" icon={Settings} badgeVariant="blue" active={path.startsWith('/settings')} />
        </nav>

        <div style={{ padding: 10, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            type="button"
            onClick={() => signOut()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 10px',
              borderRadius: 9,
              cursor: 'pointer',
              width: '100%',
              border: 'none',
              background: 'transparent',
              color: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(47,128,237,0.25)',
                border: '1.5px solid rgba(47,128,237,0.4)',
                color: '#90bdf0',
                fontSize: 11,
                fontWeight: 700,
                fontFamily: 'Montserrat, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {initials}
            </span>
            <span style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{user?.name || user?.username || 'User'}</span>
              <span style={{ display: 'block', fontSize: 10.5, color: 'rgba(255,255,255,0.38)' }}>{user?.role || '—'}</span>
            </span>
            <ChevronDown size={14} strokeWidth={1.8} color="rgba(255,255,255,0.3)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
          </button>
        </div>
      </aside>

      <div className="admin-main-col">
        <header className="admin-tb">
          {header ? (
            header
          ) : (
            <>
              {titleLeft ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  {titleLeft}
                </div>
              ) : (
                <h1 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', flex: 1, margin: 0 }}>{title}</h1>
              )}
              {!hideSearch ? (
                <div className="search-wrap">
                  <Search size={14} strokeWidth={1.8} />
                  <input
                    type="search"
                    placeholder="Search…"
                    className="fi"
                    style={{ width: '100%' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void router.push(`/listings?q=${(e.target as HTMLInputElement).value}`);
                    }}
                  />
                </div>
              ) : null}
              {actions}
              <span style={{ fontSize: 12, color: 'var(--mu)', flexShrink: 0 }}>{user?.email}</span>
            </>
          )}
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}

