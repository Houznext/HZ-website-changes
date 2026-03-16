import { useRouter } from "next/router";
import Link from "next/link";
import type { ReactNode } from "react";

interface PortalLayoutProps {
  children: ReactNode;
  activePage:
    | "dashboard"
    | "designs"
    | "trades"
    | "gallery"
    | "documents"
    | "reports"
    | "rewards";
  projectId: string;
  projectAddress?: string;
  customerName?: string;
}

const NAV_ITEMS: {
  href: (id: string) => string;
  label: string;
  page: PortalLayoutProps["activePage"];
  icon: string;
}[] = [
  { href: (id) => `/portal/${id}`, label: "Dashboard", page: "dashboard", icon: "⊞" },
  { href: (id) => `/portal/${id}/designs`, label: "3D Designs", page: "designs", icon: "◧" },
  { href: (id) => `/portal/${id}/trades`, label: "Trades", page: "trades", icon: "⚙" },
  { href: (id) => `/portal/${id}/gallery`, label: "Gallery", page: "gallery", icon: "⊟" },
  { href: (id) => `/portal/${id}/documents`, label: "Documents", page: "documents", icon: "📁" },
  { href: (id) => `/portal/${id}/reports`, label: "Reports", page: "reports", icon: "📊" },
];

export default function PortalLayout(props: PortalLayoutProps) {
  const { children, activePage, projectId, projectAddress, customerName } = props;
  const router = useRouter();
  const initials =
    customerName
      ? customerName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "HZ";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hz_customer_token");
    }
    router.push("/portal/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-[#1D9E75] flex items-center justify-center text-white text-xs font-semibold mr-2">
            HZ
          </div>
          <span className="text-sm font-medium text-gray-900">Houznext</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2.5 overflow-y-auto">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-2 mb-2 mt-1">
            My project
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.page;
            return (
              <Link key={item.page} href={item.href(projectId)}>
                <div
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors ${
                    isActive
                      ? "bg-[#EBF3FF] text-[#1A56DB]"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm w-4 text-center flex-shrink-0">
                    {item.icon}
                  </span>
                  <span
                    className={`text-xs ${isActive ? "font-medium" : ""}`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}

          <div className="mt-4">
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-2 mb-2">
              Account
            </p>
            <Link href={`/portal/${projectId}/rewards`}>
              <div
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors ${
                  activePage === "rewards"
                    ? "bg-[#E1F5EE] text-[#1D9E75]"
                    : "text-[#1D9E75] hover:bg-[#f0fdf8]"
                }`}
              >
                <span className="text-sm w-4 text-center">🎁</span>
                <span className="text-xs font-medium">
                  Houznext Rewards
                </span>
              </div>
            </Link>
          </div>
        </nav>

        {/* User row */}
        <div className="p-2.5 border-t border-gray-100">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[9px] font-semibold text-[#085041] flex-shrink-0">
              {initials}
            </div>
            <span className="text-xs text-gray-600 flex-1 truncate">
              {customerName ?? "Customer"}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-300 hover:text-gray-500 text-xs"
            >
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
        {/* Topbar */}
        <div className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-3 flex-shrink-0">
          <span className="text-xs text-gray-400 truncate">
            {projectAddress ?? "Your project"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
              Download report
            </button>
            <div className="w-7 h-7 rounded-full bg-[#E1F5EE] flex items-center justify-center text-[10px] font-semibold text-[#085041]">
              {initials}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5">{children}</div>
      </main>
    </div>
  );
}

