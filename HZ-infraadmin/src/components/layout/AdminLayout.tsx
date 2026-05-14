'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import {
  Building2,
  CalendarDays,
  Clock,
  FileText,
  GitBranch,
  Home,
  Image,
  MessageSquare,
  Search,
  Settings,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';
import adminApi from '@/lib/axios';

type NavCounts = { properties: number; pending: number; leads: number; dev: number };

const iconProps = { size: 13, strokeWidth: 1.8, fill: 'none' as const };

export function AdminLayout({
  children,
  title,
  actions,
}: {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [counts, setCounts] = useState<NavCounts>({ properties: 0, pending: 0, leads: 0, dev: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [listRes, pendRes, crmRes] = await Promise.all([
          adminApi.get('/admin/properties', { params: { page: 1, limit: 1 } }).catch(() => null),
          adminApi.get('/admin/properties/pending').catch(() => null),
          adminApi.get('/admin/crm/leads').catch(() => null),
        ]);
        if (cancelled) return;
        const total = listRes?.data?.total ?? 0;
        const pending = Array.isArray(pendRes?.data) ? pendRes.data.length : 0;
        const leads = Array.isArray(crmRes?.data) ? crmRes.data.length : 0;
        setCounts({ properties: total, pending, leads, dev: 0 });
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
    active,
  }: {
    href: string;
    label: string;
    icon: typeof Building2;
    badge?: number;
    active: boolean;
  }) => (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 13px',
        borderRadius: 10,
        margin: '1px 7px',
        color: active ? '#fff' : 'rgba(255,255,255,0.56)',
        fontSize: 12.5,
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 140ms',
        background: active ? 'rgba(47,128,237,0.2)' : 'transparent',
        borderLeft: active ? '2px solid #2f80ed' : '2px solid transparent',
        paddingLeft: active ? 11 : 13,
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: active ? '#2f80ed' : 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon {...iconProps} color="currentColor" />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && badge > 0 ? (
        <span className="bdg b-amber" style={{ marginLeft: 'auto' }}>
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );

  const section = (label: string) => (
    <div
      key={label}
      style={{
        padding: '14px 13px 4px',
        fontSize: 9,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.24)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: 'Montserrat, sans-serif',
      }}
    >
      {label}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          background: '#0f2a44',
          width: 248,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '18px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>
            Houznext <span style={{ color: '#f2994a' }}>Infra</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>Admin</div>
        </div>

        {section('Overview')}
        <NavRow
          href="/listings"
          label="All properties"
          icon={Building2}
          badge={counts.properties}
          active={path.startsWith('/listings')}
        />
        <NavRow
          href="/pending"
          label="Pending approval"
          icon={Clock}
          badge={counts.pending}
          active={path.startsWith('/pending')}
        />

        {section('Content')}
        <NavRow href="/projects" label="Projects" icon={Home} active={path.startsWith('/projects')} />
        <NavRow href="/rera-docs" label="RERA & documents" icon={FileText} active={path.startsWith('/rera-docs')} />
        <NavRow href="/hero-cms" label="Hero image CMS" icon={Image} active={path.startsWith('/hero-cms')} />

        {section('CRM')}
        <NavRow
          href="/crm"
          label="CRM leads"
          icon={MessageSquare}
          badge={counts.leads}
          active={path.startsWith('/crm')}
        />
        <NavRow
          href="/site-visits"
          label="Site visits"
          icon={CalendarDays}
          active={path.startsWith('/site-visits')}
        />

        {section('Team')}
        <NavRow href="/users" label="Users" icon={Users} active={path.startsWith('/users')} />
        <NavRow href="/branches" label="Branches" icon={GitBranch} active={path.startsWith('/branches')} />
        <NavRow href="/roles" label="Roles" icon={Shield} active={path.startsWith('/roles')} />

        {section('System')}
        <NavRow
          href="/developer-submissions"
          label="Developer submissions"
          icon={UserPlus}
          badge={counts.dev}
          active={path.startsWith('/developer-submissions')}
        />
        <NavRow href="/settings" label="Settings" icon={Settings} active={path.startsWith('/settings')} />

        <div style={{ padding: 16, marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.15)' }}
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            height: 54,
            background: '#fff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '0 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <h1 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Montserrat, sans-serif', flex: 1 }}>{title}</h1>
          <input
            type="search"
            placeholder="Search…"
            className="fi"
            style={{ maxWidth: 220 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void router.push(`/listings?q=${(e.target as HTMLInputElement).value}`);
            }}
          />
          {actions}
          <span style={{ fontSize: 12, color: '#5a6a7e' }}>{user?.email}</span>
        </header>
        <main style={{ flex: 1, padding: 22, background: '#f5f7fa' }}>{children}</main>
      </div>
    </div>
  );
}
