'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  LayoutGrid,
  Users,
  Columns2,
  MapPin,
  CalendarDays,
  BarChart2,
} from 'lucide-react';
import adminApi from '@/lib/axios';
import clsx from 'clsx';

const ic = { size: 15, strokeWidth: 1.8 as const, fill: 'none' as const };

type Stats = {
  totalLeads?: number;
  siteVisitsToday?: number;
  overdueCount?: number;
};

export function CrmLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = router.pathname;
  const [stats, setStats] = useState<Stats>({});

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await adminApi.get<Stats>('/admin/crm/stats');
        if (!c && res.data) setStats(res.data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const tabs = [
    { href: '/crm', label: 'Dashboard', icon: LayoutGrid, badge: undefined as number | undefined },
    { href: '/crm/leads', label: 'All Leads', icon: Users, badge: stats.totalLeads },
    { href: '/crm/pipeline', label: 'Pipeline', icon: Columns2 },
    { href: '/crm/site-visits', label: 'Site Visits', icon: MapPin, badge: stats.siteVisitsToday },
    { href: '/crm/follow-ups', label: 'Follow-ups', icon: CalendarDays, badge: stats.overdueCount, badgeRed: true },
    { href: '/crm/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <nav className="crm-tab-bar">
        {tabs.map((t) => {
          const Icon = t.icon;
          const on =
            t.href === '/crm' ? path === '/crm' : path === t.href || path.startsWith(`${t.href}/`);
          return (
            <Link key={t.href} href={t.href} className={clsx('crm-tab', on && 'on')}>
              <Icon {...ic} color="currentColor" />
              {t.label}
              {t.badge != null && t.badge > 0 ? (
                <span
                  className={clsx(
                    'ml-1 rounded-full px-1.5 py-0.5 font-montserrat text-[9px] font-bold',
                    t.badgeRed ? 'bg-red-500/15 text-red-600' : 'bg-[#e8f1fd] text-[#2f80ed]',
                  )}
                >
                  {t.badge > 99 ? '99+' : t.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div style={{ flex: 1, padding: '18px 22px 28px' }}>{children}</div>
    </div>
  );
}
