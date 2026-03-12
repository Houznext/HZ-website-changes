import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Calculator,
  Receipt,
  Gift,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/cost-estimator", label: "Quotation", icon: Calculator },
  { href: "/invoice", label: "Invoice", icon: Receipt },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/blogs", label: "Blogs", icon: FileText },
  { href: "/referandearn", label: "Houznext Rewards", icon: Gift },
];

export default function Sidebar() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0f2a44] text-slate-100 h-screen sticky top-0 relative">
      <div className="h-16 flex items-center px-6 border-b border-white/5 flex-shrink-0">
        <div className="relative w-40 h-10">
          <Image
            src="/images/Houznext Logo.png"
            alt="Houznext Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = router.pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#2f80ed]/15 text-white"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isActive ? "bg-[#2f80ed] text-white" : "bg-white/5 text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex-shrink-0">
        <button
          type="button"
          onClick={() => setIsProfileOpen((v) => !v)}
          className="w-full px-4 py-4 border-t border-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
        >
          <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
            H
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Houznext Admin</span>
            <span className="text-xs text-slate-300">Super Admin</span>
          </div>
        </button>
        {isProfileOpen && (
          <div className="absolute left-0 bottom-16 w-64 px-4 pb-4">
            <div className="bg-[#021220] rounded-xl shadow-lg border border-white/10 p-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push("/settings/user-profile");
                }}
                className="w-full text-left text-sm px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-100 transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Open Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  router.push("/settings");
                }}
                className="w-full text-left text-sm px-3 py-2 rounded-lg bg-transparent hover:bg-white/10 text-slate-100 transition-colors border border-white/10 flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Open Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="w-full text-left text-sm px-3 py-2 rounded-lg bg-transparent hover:bg-red-600/20 text-red-400 transition-colors border border-red-500/60 flex items-center gap-2 mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

