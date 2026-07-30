'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
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
  Inbox,
  LayoutGrid,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  UserPlus,
  Users,
} from 'lucide-react';

export type NavCounts = {
  properties: number;
  pending: number;
  leads: number;
  enquiries: number;
  crmOverdue: number;
  crmVisits: number;
  dev: number;
  projects: number;
};

const SIDEBAR_OPEN_KEY = 'infra-admin-sidebar-open';
const SIDEBAR_SCROLL_KEY = 'infra-admin-sidebar-scroll';

const iconProps = { size: 13, strokeWidth: 1.8, fill: 'none' as const };

type BadgeVariant = 'blue' | 'amber' | 'accent' | 'red';

type NavLinkDef = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: (counts: NavCounts) => number | undefined;
  badgeVariant?: BadgeVariant;
  match?: (path: string) => boolean;
};

type NavGroup = {
  id: string;
  title: string;
  links: NavLinkDef[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    title: 'Overview',
    links: [
      {
        href: '/listings',
        label: 'All properties',
        icon: Building2,
        badge: (c) => c.properties,
        badgeVariant: 'blue',
        match: (p) => p.startsWith('/listings'),
      },
      {
        href: '/pending',
        label: 'Pending approval',
        icon: Clock,
        badge: (c) => c.pending,
        badgeVariant: 'amber',
        match: (p) => p.startsWith('/pending'),
      },
    ],
  },
  {
    id: 'content',
    title: 'Content',
    links: [
      {
        href: '/projects',
        label: 'Projects',
        icon: Home,
        badge: (c) => c.projects,
        badgeVariant: 'blue',
        match: (p) => p.startsWith('/projects') && !p.startsWith('/projects/new'),
      },
      {
        href: '/projects/new',
        label: 'Add project',
        icon: Plus,
        badgeVariant: 'blue',
        match: (p) => p.startsWith('/projects/new'),
      },
      {
        href: '/rera-docs',
        label: 'RERA & documents',
        icon: FileText,
        badgeVariant: 'blue',
        match: (p) => p.startsWith('/rera-docs'),
      },
    ],
  },
  {
    id: 'website-cms',
    title: 'Website CMS',
    links: [
      { href: '/website-cms/hero', label: 'Website Hero', icon: Image, match: (p) => p.startsWith('/website-cms/hero') },
      { href: '/website-cms/browse-by-type', label: 'Browse by type', icon: LayoutGrid, match: (p) => p.startsWith('/website-cms/browse-by-type') },
      { href: '/website-cms/recent-listings', label: 'Recent listings', icon: Home, match: (p) => p.startsWith('/website-cms/recent-listings') },
      { href: '/website-cms/featured-projects', label: 'Featured projects', icon: Home, match: (p) => p.startsWith('/website-cms/featured-projects') },
      { href: '/website-cms/curated-properties', label: 'Curated for you', icon: LayoutGrid, match: (p) => p.startsWith('/website-cms/curated-properties') },
      { href: '/website-cms/browse-by-city', label: 'Browse by city', icon: LayoutGrid, match: (p) => p.startsWith('/website-cms/browse-by-city') },
      { href: '/website-cms/testimonials', label: 'Customer stories', icon: MessageSquare, match: (p) => p.startsWith('/website-cms/testimonials') },
      { href: '/website-cms/for-sellers', label: 'For sellers', icon: FileText, match: (p) => p.startsWith('/website-cms/for-sellers') },
      { href: '/website-cms/why-houznext', label: 'Why Houznext', icon: LayoutGrid, match: (p) => p.startsWith('/website-cms/why-houznext') },
      { href: '/website-cms/seo', label: 'SEO & GEO', icon: Search, match: (p) => p.startsWith('/website-cms/seo') },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    links: [
      {
        href: '/enquiries',
        label: 'Enquiries',
        icon: Inbox,
        badge: (c) => c.enquiries,
        badgeVariant: 'blue',
        match: (p) => p.startsWith('/enquiries'),
      },
      {
        href: '/crm',
        label: 'CRM',
        icon: MessageSquare,
        badge: (c) => c.leads,
        badgeVariant: 'amber',
        match: (p) => p === '/crm' || (p.startsWith('/crm/') && !p.startsWith('/crm/site-visits') && !p.startsWith('/crm/follow-ups')),
      },
      {
        href: '/crm/site-visits',
        label: 'CRM site visits',
        icon: CalendarDays,
        badge: (c) => c.crmVisits,
        badgeVariant: 'blue',
        match: (p) => p.startsWith('/crm/site-visits'),
      },
      {
        href: '/crm/follow-ups',
        label: 'CRM follow-ups',
        icon: Bell,
        badge: (c) => c.crmOverdue,
        badgeVariant: 'red',
        match: (p) => p.startsWith('/crm/follow-ups'),
      },
    ],
  },
  {
    id: 'team',
    title: 'Team',
    links: [
      { href: '/users', label: 'Users', icon: Users, match: (p) => p.startsWith('/users') },
      { href: '/branches', label: 'Branches', icon: GitBranch, match: (p) => p.startsWith('/branches') },
      { href: '/roles', label: 'Roles', icon: Shield, match: (p) => p.startsWith('/roles') },
    ],
  },
  {
    id: 'system',
    title: 'System',
    links: [
      {
        href: '/developer-submissions',
        label: 'Developer submissions',
        icon: UserPlus,
        badge: (c) => c.dev,
        badgeVariant: 'accent',
        match: (p) => p.startsWith('/developer-submissions'),
      },
      { href: '/settings', label: 'Settings', icon: Settings, match: (p) => p.startsWith('/settings') },
    ],
  },
];

function fmtCount(n: number) {
  return n.toLocaleString('en-IN');
}

function isLinkActive(path: string, link: NavLinkDef) {
  if (link.match) return link.match(path);
  return path === link.href || path.startsWith(`${link.href}/`);
}

function groupHasActiveLink(path: string, links: NavLinkDef[]) {
  return links.some((link) => isLinkActive(path, link));
}

function readStoredOpenSections(): Record<string, boolean> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SIDEBAR_OPEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function buildDefaultOpenSections(pathname: string): Record<string, boolean> {
  const open: Record<string, boolean> = {};
  for (const group of NAV_GROUPS) {
    open[group.id] = groupHasActiveLink(pathname, group.links);
  }
  return open;
}

function NavRow({
  href,
  label,
  icon: Icon,
  badge,
  badgeVariant = 'blue',
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeVariant?: BadgeVariant;
  active: boolean;
}) {
  return (
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
}

export function AdminSidebarNav({ counts }: { counts: NavCounts }) {
  const router = useRouter();
  const path = router.pathname;
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => buildDefaultOpenSections(path));

  const saveScrollPosition = useCallback(() => {
    const el = document.getElementById('infra-admin-sidebar-nav');
    if (!el) return;
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
  }, []);

  const restoreScrollPosition = useCallback(() => {
    const el = document.getElementById('infra-admin-sidebar-nav');
    if (!el) return;
    const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
    if (saved == null) return;
    const top = Number.parseInt(saved, 10);
    if (!Number.isFinite(top)) return;
    el.scrollTop = top;
  }, []);

  useEffect(() => {
    const stored = readStoredOpenSections();
    if (stored) setOpenSections(stored);
  }, []);

  useEffect(() => {
    setOpenSections((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const group of NAV_GROUPS) {
        if (groupHasActiveLink(path, group.links) && !next[group.id]) {
          next[group.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [path]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(openSections));
    } catch {
      /* ignore */
    }
  }, [openSections]);

  useEffect(() => {
    const el = document.getElementById('infra-admin-sidebar-nav');
    if (!el) return;
    const onScroll = () => saveScrollPosition();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [saveScrollPosition]);

  useEffect(() => {
    restoreScrollPosition();
    const onRouteDone = () => requestAnimationFrame(() => restoreScrollPosition());
    router.events.on('routeChangeStart', saveScrollPosition);
    router.events.on('routeChangeComplete', onRouteDone);
    return () => {
      router.events.off('routeChangeStart', saveScrollPosition);
      router.events.off('routeChangeComplete', onRouteDone);
    };
  }, [router.events, restoreScrollPosition, saveScrollPosition]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <nav id="infra-admin-sidebar-nav" style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
      {NAV_GROUPS.map((group) => {
        const isOpen = !!openSections[group.id];
        const sectionActive = groupHasActiveLink(path, group.links);

        return (
          <div key={group.id} className="nav-section">
            <button
              type="button"
              className={`nav-section-toggle${sectionActive ? ' on' : ''}`}
              onClick={() => toggleSection(group.id)}
              aria-expanded={isOpen}
            >
              <span>{group.title}</span>
              <ChevronDown size={14} strokeWidth={1.8} className="nav-chevron" color="currentColor" />
            </button>
            {isOpen ? (
              <div className="nav-section-body">
                {group.links.map((link) => (
                  <NavRow
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={link.icon}
                    badge={link.badge?.(counts)}
                    badgeVariant={link.badgeVariant}
                    active={isLinkActive(path, link)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
