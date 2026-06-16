'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Search, Settings, User } from 'lucide-react';
import adminApi from '@/lib/axios';
import { AdminSidebarNav, type NavCounts } from '@/components/layout/AdminSidebarNav';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

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
  const profileWrapRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [counts, setCounts] = useState<NavCounts>({
    properties: 0,
    pending: 0,
    leads: 0,
    enquiries: 0,
    crmOverdue: 0,
    crmVisits: 0,
    dev: 0,
    projects: 0,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
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

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!profileWrapRef.current?.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

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

        <AdminSidebarNav counts={counts} />

        <div ref={profileWrapRef} className="sb-profile-wrap">
          <button
            type="button"
            className="sb-profile-btn"
            aria-expanded={isProfileOpen}
            onClick={() => setIsProfileOpen((v) => !v)}
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
              <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                {user?.name || user?.username || 'User'}
              </span>
              <span style={{ display: 'block', fontSize: 10.5, color: 'rgba(255,255,255,0.38)' }}>{user?.role || '—'}</span>
            </span>
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              color="rgba(255,255,255,0.3)"
              className="sb-profile-chevron"
            />
          </button>

          {isProfileOpen ? (
            <div className="sb-profile-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="sb-profile-menu-item primary"
                onClick={() => {
                  setIsProfileOpen(false);
                  void router.push('/settings?tab=profile');
                }}
              >
                <User size={14} strokeWidth={1.8} />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className="sb-profile-menu-item"
                onClick={() => {
                  setIsProfileOpen(false);
                  void router.push('/settings?tab=security');
                }}
              >
                <Settings size={14} strokeWidth={1.8} />
                Settings
              </button>
              <button
                type="button"
                role="menuitem"
                className="sb-profile-menu-item danger"
                onClick={() => {
                  setIsProfileOpen(false);
                  setLogoutConfirmOpen(true);
                }}
              >
                <LogOut size={14} strokeWidth={1.8} />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="admin-main-col">
        <header className="admin-tb">
          {header ? (
            header
          ) : (
            <>
              {titleLeft ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>{titleLeft}</div>
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

      <ConfirmDialog
        open={logoutConfirmOpen}
        title="Log out?"
        message="Are you sure you want to log out of Infra admin?"
        confirmLabel="Yes"
        cancelLabel="No"
        danger
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          signOut();
        }}
      />
    </div>
  );
}
