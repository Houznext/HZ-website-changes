import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  LayoutDashboard,
  Calculator,
  Receipt,
  Home,
  FileText,
  Building2,
  Layers,
  MessageSquare,
  Headphones,
  Inbox,
  Settings,
  GitBranch,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebarBadges } from "@/src/hooks/useSidebarBadges";

type BadgeColor = "blue" | "green" | "orange" | "red" | "slate";

type NavSection = { section: string };
type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeKey?: "buildlive" | "blog" | "ga4";
};
type NavItem = NavSection | NavLink;

const NAV_STRUCTURE: NavItem[] = [
  { section: "Overview" },
  { href: "/dashboard",          label: "Dashboard",     icon: LayoutDashboard, badgeKey: "ga4"       },
  { section: "Finance" },
  { href: "/cost-estimator",     label: "Quotations",    icon: Calculator },
  { href: "/invoice",            label: "Invoices",      icon: Receipt },
  { section: "Content" },
  { href: "/interiors",          label: "BuildLive",     icon: Home,            badgeKey: "buildlive" },
  { href: "/blogs",              label: "Blog",          icon: FileText,        badgeKey: "blog"      },
  { href: "/property",           label: "Properties",    icon: Building2 },
  { href: "/projects",           label: "Projects",      icon: Layers },
  { section: "CRM" },
  { href: "/crm",                label: "CRM Leads",     icon: MessageSquare },
  { href: "/serviceleads",       label: "Service Leads", icon: Headphones },
  { href: "/generalenquires",    label: "Enquiries",     icon: Inbox },
  { section: "Settings" },
  { href: "/settings",           label: "Settings",      icon: Settings },
  { href: "/settings/branches",  label: "Branches",      icon: GitBranch },
];

const badgeStyles: Record<BadgeColor, string> = {
  blue:   "bg-[#2f80ed]/20 text-[#7db8f5]",
  green:  "bg-green-500/15 text-green-400",
  orange: "bg-[#f2994a]/15 text-[#f2994a]",
  red:    "bg-red-500/15 text-red-400",
  slate:  "bg-white/10 text-slate-400",
};

export default function Sidebar() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { activeLiveCount, regularBlogCount, ga4Live } = useSidebarBadges();

  /** Resolve dynamic badge text + color for a given badgeKey */
  const resolveBadge = (
    key: NavLink["badgeKey"]
  ): { text: string; color: BadgeColor } | null => {
    if (!key) return null;

    if (key === "buildlive") {
      if (activeLiveCount > 0)
        return { text: `${activeLiveCount} live`, color: "green" };
      return null;
    }

    if (key === "blog") {
      if (regularBlogCount > 0)
        return { text: `${regularBlogCount} draft`, color: "orange" };
      return null;
    }

    if (key === "ga4") {
      if (ga4Live === null) return null; // still loading
      return ga4Live
        ? { text: "Live", color: "blue" }
        : { text: "Not live", color: "slate" };
    }

    return null;
  };

  return (
    <aside className="hidden md:flex flex-col w-[256px] bg-[#0f2a44] text-slate-100 h-screen sticky top-0 overflow-hidden">

      {/* Decorative radial glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 15% 10%, rgba(47,128,237,0.13) 0%, transparent 55%), radial-gradient(ellipse at 85% 88%, rgba(242,153,74,0.06) 0%, transparent 45%)",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 h-14 flex items-center px-5 border-b border-white/[0.06] flex-shrink-0">
        <div className="relative w-36 h-8">
          <Image
            src="/images/Houznext Logo.png"
            alt="Houznext"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-2 py-3 space-y-[1px] scrollbar-none">
        {NAV_STRUCTURE.map((item, i) => {
          if ("section" in item) {
            return (
              <div
                key={i}
                className="pt-4 pb-1 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/20"
              >
                {item.section}
              </div>
            );
          }

          const isActive =
            router.pathname === item.href ||
            router.pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const badge = resolveBadge(item.badgeKey);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-[10px] text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#2f80ed]/20 text-white border border-[#2f80ed]/30 shadow-[0_2px_10px_rgba(47,128,237,0.15)]"
                  : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100 border border-transparent"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0 transition-colors ${
                  isActive
                    ? "bg-[#2f80ed] text-white"
                    : "bg-white/[0.05] text-slate-400"
                }`}
              >
                <Icon className="w-[15px] h-[15px]" />
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${badgeStyles[badge.color]}`}
                >
                  {badge.text}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer user */}
      <div className="relative z-10 flex-shrink-0 border-t border-white/[0.06] p-2">
        <button
          onClick={() => setIsProfileOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] hover:bg-white/[0.07] transition-colors text-left"
        >
          <div className="h-8 w-8 rounded-full bg-[#2f80ed]/30 border border-[#2f80ed]/40 flex items-center justify-center text-[12px] font-bold text-[#90bdf0] flex-shrink-0">
            H
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-slate-200 truncate">
              Houznext Admin
            </p>
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
