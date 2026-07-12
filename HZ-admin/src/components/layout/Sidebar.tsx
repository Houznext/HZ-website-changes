import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  LayoutDashboard,
  Calculator,
  Receipt,
  FileText,
  Building2,
  MessageSquare,
  Inbox,
  Settings,
  GitBranch,
  ShieldCheck,
  LogOut,
  User,
  ChevronDown,
  LayoutTemplate,
  LayoutGrid,
  Image as CmsDesignIdeasIcon,
  Users,
  Star,
  Sparkles,
  MapPin,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebarBadges } from "@/src/hooks/useSidebarBadges";
import { usePermissionStore } from "@/src/stores/usePermissions";

type BadgeColor = "blue" | "green" | "orange" | "red" | "slate";

type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: "buildlive" | "blog" | "ga4" | "crmOverdue";
  requirePermission?: { resource: string; action: "view" | "create" | "edit" | "delete" };
};

type NavGroup = {
  id: string;
  title: string;
  links: NavLink[];
};

const SIDEBAR_SCROLL_KEY = "hz-admin-sidebar-scroll";
const SIDEBAR_OPEN_KEY = "hz-admin-sidebar-open";

function NavCalculatorLeadsIcon(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-3M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 7h6M9 12h6M9 16h4" />
    </svg>
  );
}

function NavProjectsIcon(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />
    </svg>
  );
}

function NavServicesCmsIcon(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zM9 22V12h6v10" />
    </svg>
  );
}

function NavHeroCarouselIcon(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  );
}

function NavSeoSettingsIcon(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}

function StoreProductsIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v3M2 9h20M4 9v10a2 2 0 002 2h12a2 2 0 002-2V9" />
    </svg>
  );
}
function StoreCategIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}
function StoreOrdersIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function StoreInventoryIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}
function StoreCouponsIcon(props: { className?: string }) {
  return (
    <svg className={props.className} viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14.25l6-6" />
      <circle cx="9.75" cy="9" r=".75" />
      <circle cx="14.25" cy="14.25" r=".75" />
      <path d="M3.5 12l-.878-.878a2 2 0 010-2.828l7.072-7.072a2 2 0 012.828 0L21 9.7a2 2 0 010 2.828L13.928 19.6a2 2 0 01-2.828 0L9.5 18" />
    </svg>
  );
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    title: "Overview",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badgeKey: "ga4" },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    links: [
      { href: "/cost-estimator", label: "Quotations", icon: Calculator },
      { href: "/invoice", label: "Invoices", icon: Receipt },
    ],
  },
  {
    id: "content",
    title: "Content",
    links: [
      { href: "/packages", label: "Int. Packages", icon: LayoutGrid },
      { href: "/blogs", label: "Blog", icon: FileText, badgeKey: "blog" },
      { href: "/projects", label: "Projects", icon: NavProjectsIcon },
      { href: "/services-cms", label: "Services CMS", icon: NavServicesCmsIcon },
      { href: "/interiors-cms", label: "Interiors CMS", icon: LayoutTemplate },
      { href: "/design-ideas-cms", label: "Design ideas CMS", icon: CmsDesignIdeasIcon },
      { href: "/about-us-cms", label: "About us CMS", icon: Users },
      { href: "/homepage-reviews", label: "Homepage reviews", icon: Star },
      { href: "/homepage-interiors-offers", label: "Interiors offers banner", icon: Sparkles },
      { href: "/hero-carousel", label: "Hero Carousel", icon: NavHeroCarouselIcon },
      { href: "/seo-settings", label: "SEO settings", icon: NavSeoSettingsIcon },
    ],
  },
  {
    id: "livebuild",
    title: "LiveBuild",
    links: [
      { href: "/livebuild", label: "Dashboard", icon: LayoutDashboard },
      { href: "/livebuild/projects", label: "All Projects", icon: Building2 },
      { href: "/livebuild/work-types", label: "Work Types", icon: LayoutTemplate },
      { href: "/livebuild/customers", label: "Customers", icon: Users },
      { href: "/livebuild/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    id: "crm",
    title: "CRM",
    links: [
      { href: "/crm", label: "CRM Leads", icon: MessageSquare, badgeKey: "crmOverdue" },
      { href: "/generalenquires", label: "Enquiries", icon: Inbox },
      { href: "/calculator-leads", label: "Calculator Leads", icon: NavCalculatorLeadsIcon },
    ],
  },
  {
    id: "landing",
    title: "Landing page",
    links: [
      { href: "/landing-pages/vikarabad", label: "Vikarabad", icon: MapPin },
      { href: "/landing-pages/mahabubnagar", label: "Mahabubnagar", icon: MapPin },
      { href: "/landing-pages/sangareddy", label: "Sangareddy", icon: MapPin },
      { href: "/landing-pages/siddipet", label: "Siddipet", icon: MapPin },
      { href: "/landing-pages/adilabad", label: "Adilabad", icon: MapPin },
      { href: "/landing-pages/suryapet", label: "Suryapet", icon: MapPin },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    links: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/settings/branches", label: "Branches", icon: GitBranch },
      {
        href: "/settings/roles",
        label: "Roles",
        icon: ShieldCheck,
        requirePermission: { resource: "role", action: "edit" },
      },
    ],
  },
  {
    id: "store",
    title: "Houznext Store",
    links: [
      { href: "/store-admin/products", label: "Products", icon: StoreProductsIcon },
      { href: "/store-admin/categories", label: "Categories", icon: StoreCategIcon },
      { href: "/store-admin/orders", label: "Store orders", icon: StoreOrdersIcon },
      { href: "/store-admin/inventory", label: "Inventory", icon: StoreInventoryIcon },
      { href: "/store-admin/coupons", label: "Coupons", icon: StoreCouponsIcon },
    ],
  },
];

const badgeStyles: Record<BadgeColor, string> = {
  blue: "bg-[#2f80ed]/20 text-[#7db8f5]",
  green: "bg-green-500/15 text-green-400",
  orange: "bg-[#f2994a]/15 text-[#f2994a]",
  red: "bg-red-500/15 text-red-400",
  slate: "bg-white/10 text-slate-400",
};

function isPathActive(pathname: string, href: string) {
  if (href === "/livebuild") return pathname === "/livebuild";
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupHasActiveLink(pathname: string, links: NavLink[]) {
  return links.some((link) => isPathActive(pathname, link.href));
}

function readStoredOpenSections(): Record<string, boolean> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SIDEBAR_OPEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return parsed && typeof parsed === "object" ? parsed : null;
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

export default function Sidebar() {
  const router = useRouter();
  const navRef = useRef<HTMLElement>(null);
  const scrollRestoredRef = useRef(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    buildDefaultOpenSections(router.pathname),
  );
  const { activeLiveCount, regularBlogCount, ga4Live, crmOverdueCount } = useSidebarBadges();
  const hasPermission = usePermissionStore((s) => s.hasPermission);
  const permissionsReady = usePermissionStore((s) => s.initialized && !s.isLoading);

  const saveScrollPosition = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
  }, []);

  const restoreScrollPosition = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const saved = sessionStorage.getItem(SIDEBAR_SCROLL_KEY);
    if (saved == null) return;
    const top = Number.parseInt(saved, 10);
    if (!Number.isFinite(top)) return;
    el.scrollTop = top;
  }, []);

  useEffect(() => {
    const stored = readStoredOpenSections();
    if (stored) {
      setOpenSections(stored);
      return;
    }
    setOpenSections(buildDefaultOpenSections(router.pathname));
  }, []);

  useEffect(() => {
    setOpenSections((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const group of NAV_GROUPS) {
        if (groupHasActiveLink(router.pathname, group.links) && !next[group.id]) {
          next[group.id] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [router.pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(openSections));
    } catch {
      /* ignore */
    }
  }, [openSections]);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    el.addEventListener("scroll", saveScrollPosition, { passive: true });
    return () => el.removeEventListener("scroll", saveScrollPosition);
  }, [saveScrollPosition]);

  useEffect(() => {
    if (scrollRestoredRef.current) return;
    restoreScrollPosition();
    scrollRestoredRef.current = true;
  }, [restoreScrollPosition]);

  useEffect(() => {
    const onRouteDone = () => {
      requestAnimationFrame(() => {
        restoreScrollPosition();
      });
    };
    router.events.on("routeChangeStart", saveScrollPosition);
    router.events.on("routeChangeComplete", onRouteDone);
    return () => {
      router.events.off("routeChangeStart", saveScrollPosition);
      router.events.off("routeChangeComplete", onRouteDone);
    };
  }, [router.events, restoreScrollPosition, saveScrollPosition]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resolveBadge = (
    key: NavLink["badgeKey"],
  ): { text: string; color: BadgeColor } | null => {
    if (!key) return null;

    if (key === "buildlive") {
      if (activeLiveCount > 0) return { text: `${activeLiveCount} live`, color: "green" };
      return null;
    }

    if (key === "blog") {
      if (regularBlogCount > 0) return { text: `${regularBlogCount} draft`, color: "orange" };
      return null;
    }

    if (key === "ga4") {
      if (ga4Live === null) return null;
      return ga4Live ? { text: "Live", color: "blue" } : { text: "Not live", color: "slate" };
    }

    if (key === "crmOverdue") {
      if (crmOverdueCount > 0) {
        return { text: `${crmOverdueCount} overdue`, color: "red" };
      }
      return null;
    }

    return null;
  };

  const visibleGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => {
      const links = group.links.filter((link) => {
        if (!link.requirePermission) return true;
        if (!permissionsReady) return false;
        return hasPermission(link.requirePermission.resource, link.requirePermission.action);
      });
      return { ...group, links };
    }).filter((group) => group.links.length > 0);
  }, [hasPermission, permissionsReady]);

  const renderNavLink = (link: NavLink) => {
    const isActive = isPathActive(router.pathname, link.href);
    const Icon = link.icon;
    const badge = resolveBadge(link.badgeKey);

    return (
      <Link
        key={link.href}
        href={link.href}
        scroll={false}
        onClick={saveScrollPosition}
        className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-[10px] text-[13px] font-medium transition-all duration-150 ${
          isActive
            ? "bg-[#2f80ed]/20 text-white border border-[#2f80ed]/30 shadow-[0_2px_10px_rgba(47,128,237,0.15)]"
            : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 border border-transparent"
        }`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
            isActive ? "bg-[#2f80ed] text-white" : "bg-white/[0.05] text-slate-400"
          }`}
        >
          <Icon className="w-[15px] h-[15px]" />
        </span>
        <span className="flex-1 truncate">{link.label}</span>
        {badge && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${badgeStyles[badge.color]}`}
          >
            {badge.text}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-[256px] bg-[#0f2a44] text-slate-100 h-screen sticky top-0 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 10%, rgba(47,128,237,0.13) 0%, transparent 55%), radial-gradient(ellipse at 85% 88%, rgba(242,153,74,0.06) 0%, transparent 45%)",
        }}
      />

      <div className="relative z-10 h-14 flex items-center px-5 border-b border-white/[0.06] flex-shrink-0">
        <div className="relative w-36 h-8">
          <Image src="/images/Houznext Logo.png" alt="Houznext" fill className="object-contain" />
        </div>
      </div>

      <nav
        ref={navRef}
        className="relative z-10 flex-1 overflow-y-auto px-2 py-3 space-y-[2px] scrollbar-none"
      >
        {visibleGroups.map((group) => {
          const isOpen = !!openSections[group.id];
          const sectionActive = groupHasActiveLink(router.pathname, group.links);

          return (
            <div key={group.id} className="mb-0.5">
              <button
                type="button"
                onClick={() => toggleSection(group.id)}
                className={`w-full flex items-center justify-between gap-2 pt-3 pb-1.5 px-2 rounded-md text-left transition-colors hover:bg-white/[0.04] ${
                  sectionActive ? "text-white/45" : "text-white/20"
                }`}
                aria-expanded={isOpen}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">
                  {group.title}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="space-y-[1px] pb-1">
                  {group.links.map((link) => renderNavLink(link))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="relative z-10 flex-shrink-0 border-t border-white/[0.06] p-2">
        <button
          onClick={() => setIsProfileOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] hover:bg-white/[0.07] transition-colors text-left"
        >
          <div className="h-8 w-8 rounded-full bg-[#2f80ed]/30 border border-[#2f80ed]/40 flex items-center justify-center text-[12px] font-bold text-[#90bdf0] flex-shrink-0">
            H
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-slate-200 truncate">Houznext Admin</p>
            <p className="text-[10.5px] text-slate-500">Super Admin</p>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform flex-shrink-0 ${
              isProfileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isProfileOpen && (
          <div className="absolute bottom-[60px] left-2 right-2 bg-[#021220] border border-white/10 rounded-xl shadow-xl p-2 space-y-1">
            <button
              onClick={() => {
                setIsProfileOpen(false);
                router.push("/settings/user-profile");
              }}
              className="w-full text-left text-[12.5px] px-3 py-2 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-slate-200 flex items-center gap-2"
            >
              <User className="w-3.5 h-3.5" /> Profile
            </button>
            <button
              onClick={() => {
                setIsProfileOpen(false);
                router.push("/settings");
              }}
              className="w-full text-left text-[12.5px] px-3 py-2 rounded-lg hover:bg-white/[0.07] text-slate-300 border border-white/10 flex items-center gap-2"
            >
              <Settings className="w-3.5 h-3.5" /> Settings
            </button>
            <button
              onClick={() => {
                setIsProfileOpen(false);
                signOut({ callbackUrl: "/login" });
              }}
              className="w-full text-left text-[12.5px] px-3 py-2 rounded-lg hover:bg-red-600/20 text-red-400 border border-red-500/40 flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
