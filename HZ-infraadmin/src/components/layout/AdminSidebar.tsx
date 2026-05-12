import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  Clock,
  FileText,
  GitBranch,
  HardHat,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  MessageCircle,
  Settings,
  Shield,
  Users,
} from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  badge?: string;
};

type NavGroup = { section: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    section: 'Overview',
    items: [
      { href: '/listings', label: 'All listings', Icon: Home, badge: '48' },
      { href: '/pending', label: 'Pending approval', Icon: Clock, badge: '48' },
    ],
  },
  {
    section: 'Leads',
    items: [
      { href: '/crm', label: 'CRM leads', Icon: MessageCircle, badge: '24 new' },
      { href: '/site-visits', label: 'Site visits', Icon: Calendar, badge: '8 today' },
    ],
  },
  {
    section: 'Content',
    items: [
      { href: '/projects', label: 'Projects', Icon: LayoutGrid },
      { href: '/rera-docs', label: 'RERA & docs', Icon: FileText },
      { href: '/developer-submissions', label: 'Developer submissions', Icon: HardHat, badge: '3 new' },
      { href: '/hero-cms', label: 'Hero image CMS', Icon: ImageIcon },
    ],
  },
  {
    section: 'Organization',
    items: [
      { href: '/users', label: 'Users', Icon: Users },
      { href: '/branches', label: 'Branches', Icon: GitBranch },
      { href: '/roles', label: 'Roles & permissions', Icon: Shield },
    ],
  },
  {
    section: 'System',
    items: [{ href: '/settings', label: 'Settings', Icon: Settings }],
  },
];

function isActivePath(pathname: string, href: string) {
  if (pathname === href) return true;
  if (href !== '/' && pathname.startsWith(`${href}/`)) return true;
  return false;
}

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = router.pathname;

  return (
    <div className="flex min-h-screen flex-col bg-navy">
      <div className="flex h-[54px] flex-shrink-0 items-center gap-2 border-b border-white/[0.07] px-4">
        <span className="font-montserrat text-base font-extrabold text-white">
          Houznext <span className="text-hz-accent">Infra</span>
        </span>
        <span className="rounded px-[7px] py-0.5 font-montserrat text-[8px] font-bold uppercase tracking-wider text-white bg-hz-blue">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.section} className="mb-1">
            <div className="px-[13px] pb-1 pt-3 font-montserrat text-[9.5px] font-bold uppercase tracking-wider text-white/30">
              {group.section}
            </div>
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link key={item.href} href={item.href} className="block no-underline">
                  <motion.div
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className={[
                      'mx-[7px] mb-0.5 flex cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 font-inter text-[12.5px] font-medium transition-colors',
                      active
                        ? 'border-l-2 border-hz-blue bg-hz-blue/20 pl-[10px] text-white'
                        : 'border-l-2 border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white/90',
                    ].join(' ')}
                  >
                    <item.Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="whitespace-nowrap rounded-full bg-hz-accent/20 px-2 py-0.5 font-montserrat text-[9.5px] font-bold text-hz-accent">
                        {item.badge}
                      </span>
                    ) : null}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
