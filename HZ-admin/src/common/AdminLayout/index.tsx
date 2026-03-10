import {
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
  useRef,
  useCallback,
} from "react";
import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import {
  MdFlourescent,
  MdHomeFilled,
  MdRealEstateAgent,
  MdSettings,
  MdManageAccounts,
  MdOutlineEventAvailable,
  MdCheckCircle,
  MdMarkEmailRead,
} from "react-icons/md";
import { FaMicrochip } from "react-icons/fa";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { TbBrandBlogger } from "react-icons/tb";
import {
  PiBuildingApartmentLight,
  PiBuildings,
  PiGitBranch,
} from "react-icons/pi";
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import clsx from "clsx";
import { Building2, Bell, BellRing, Check, Sun } from "lucide-react";
import Avatar from "@/src/common/Avatar";
import {
  FaAccessibleIcon,
  FaUser,
  FaBuilding,
  FaBriefcase,
  FaCouch,
  FaFileInvoice,
  FaPaperPlane,
} from "react-icons/fa";
import {
  FiClipboard,
  FiGift,
  FiMessageCircle,
  FiMessageSquare,
} from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
import apiClient from "@/src/utils/apiClient";
import { useSession } from "next-auth/react";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import Button from "../Button";
import { DropDown } from "../PopOver";
import toast from "react-hot-toast";
import {
  usePermissionStore,
  BranchMembershipLite,
} from "@/src/stores/usePermissions";
import BranchBadge from "../BranchBadge";
import { getSocket } from "@/src/utils/chat/socket";

TimeAgo.addDefaultLocale(en);

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface Notification {
  id: number;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const RightNav = ({ items, isMobile = false, onItemClick }) => {
  const router = useRouter();
  const initialOpen = items.findIndex(
    (item: any) =>
      item.subLink?.some((sub: any) => sub.link === router.pathname)
  );
  const [openIndex, setOpenIndex] = useState<number | null>(
    initialOpen >= 0 ? initialOpen : null
  );

  return (
    <ul role="list" className="space-y-0.5 px-2">
      {items.map((item, index) => (
        <li key={`${index}-${item.name}-link`} className="relative group">
          {item.subLink ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (isMobile && onItemClick) onItemClick();
                  setOpenIndex(openIndex === index ? null : index);
                }}
                className={clsx(
                  "w-full flex items-center gap-x-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border-l-2",
                  item.isActive
                    ? "bg-brand-primary/10 text-brand-primary border-brand-primary"
                    : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                <span className={clsx(
                  "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[15px] transition-colors",
                  item.isActive
                    ? "bg-brand-primary text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                )}>
                  {item.icon}
                </span>
                <span className="md:block hidden flex-1 text-left">{item.name}</span>
              </button>
              {openIndex === index && (
                <ul className="mt-0.5 ml-4 pl-2 border-l-2 border-slate-200 space-y-0.5">
                  {item.subLink.map((subItem, subIdx) => (
                    <li key={subIdx}>
                      <Link
                        href={subItem.link}
                        onClick={() => isMobile && onItemClick?.()}
                        className={clsx(
                          "flex items-center gap-x-2 px-2.5 py-2 rounded-lg text-[12px] font-medium transition-colors",
                          router.pathname === subItem.link
                            ? "bg-brand-primary/10 text-brand-primary"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        )}
                      >
                        <span className="w-6 h-6 rounded-md flex items-center justify-center bg-slate-100 text-slate-500 text-[12px]">
                          {subItem.icon}
                        </span>
                        <span>{subItem.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <Link
              href={item.link}
              onClick={() => isMobile && onItemClick?.()}
              className={clsx(
                "flex items-center gap-x-2.5 px-2.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 border-l-2",
                item.isActive
                  ? "bg-brand-primary/10 text-brand-primary border-brand-primary"
                  : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              <span className={clsx(
                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[15px] transition-colors",
                item.isActive
                  ? "bg-brand-primary text-white"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
              )}>
                {item.icon}
              </span>
              <span className="md:block hidden">{item.name}</span>
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
};

function AdminLayout({
  page,
}: {
  page: ReactElement;
}) {
  const router = useRouter();
  const session = useSession() as any;
  const { data } = session
  const [user, setUser] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const {
    permissions,
    initFromSession,
    hasPermission,
    userRole,
  } = usePermissionStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  const navItems = [
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: <MdOutlineSpaceDashboard className="text-[16px]" />,
      isActive: router.pathname === "/dashboard",
    },
    {
      name: "Attendance",
      link: "/attendance",
      icon: <MdOutlineEventAvailable className="text-[16px]" />,
      isActive: router.pathname === "/attendance",
    },
    {
      name: "Premises",
      link: "/company-property",
      icon: <FaBuilding className="text-[16px]" />,
      table: "company_property",
      isActive: router.pathname.startsWith("/company-property"),
    },
    {
      name: "Branches",
      link: "/branches",
      icon: <Building2 className="text-[16px]" />,
      table: "branches",
      isActive: router.pathname === "/branches",
    },
    {
      name: "Blogs",
      link: "/blogs",
      icon: <TbBrandBlogger className="text-[16px]" />,
      table: "blog",
      isActive: router.pathname === "/blogs",
    },
    {
      name: "Property",
      link: "/property",
      icon: <MdRealEstateAgent className="text-[16px]" />,
      table: "property",
      isActive: router.pathname.startsWith("/property"),
    },
    {
      name: "Projects",
      link: "/projects",
      icon: <PiBuildingApartmentLight className="text-[16px]" />,
      isActive: router.pathname.startsWith("/projects"),
      table: "project",
    },
    {
      name: "Home Decor",
      link: "/home-decors",
      icon: <MdFlourescent className="text-[16px]" />,
      isActive: router.pathname.startsWith("/home-decors"),
      table: "home_decors",
    },
    {
      name: "Electronics",
      link: "/electronics",
      icon: <FaMicrochip className="text-[16px]" />,
      table: "electronics",
    },
    {
      name: "Furnitures",
      link: "/furnitures",
      icon: <FaCouch className="text-[16px]" />,
      table: "furniture",
    },
    {
      name: "Custom Builder",
      link: "/custom-builder",
      icon: <MdHomeFilled className="text-[16px]" />,
      table: "custom_builder",
      isActive: router.pathname.startsWith("/custom-builder"),
    },
    {
      name: "Cost Estimator",
      link: "/cost-estimator",
      icon: <RiMoneyRupeeCircleFill className="text-[16px]" />,
      table: "cost_estimator",
      isActive: router.pathname.startsWith("/cost-estimator"),
    },
    {
      name: "CRM",
      link: "/crm",
      icon: <LuUsers className="text-[16px]" />,
      table: "crm",
    },
    {
      name: "Chat",
      link: "/chat",
      icon: <FaPaperPlane className="text-[16px]" />,
      // table: "chat",
    },
    {
      name: "Invoice",
      link: "/invoice",
      icon: <FaFileInvoice className="text-[16px]" />,
      table: "invoice_estimator",
      isActive: router.pathname.startsWith("/invoice"),
    },
    {
      name: "Service Leads",
      link: "/serviceleads",
      icon: <FiClipboard className="text-[16px]" />,
      table: "service_leads",
      isActive: router.pathname.startsWith("/serviceleads"),
    },
    {
      name: "Houznext Rewards",
      link: "/referandearn",
      icon: <FiGift className="text-[16px]" />,
      table: "referrals",
      isActive: router.pathname.startsWith("/referandearn"),
    },
    {
      name: "General Queries",
      link: "/generalenquires",
      icon: <FiMessageCircle className="text-[16px]" />,
      table: "general_queries",
      isActive: router.pathname.startsWith("/generalenquires"),
    },
    {
      name: "Testimonials",
      link: "/testimonials",
      icon: <FiMessageSquare className="text-[16px]" />,
      table: "testimonials",
      isActive: router.pathname.startsWith("/testimonials"),
    },
    {
      name: "Human Resource",
      link: "/human-resource",
      icon: <MdManageAccounts className="text-[16px]" />,
      // table: "hr",
      isActive: router.pathname === "/human-resource",
    },
    {
      name: "Legal Services",
      link: "/legal-services",
      icon: <FaBriefcase className="text-[16px]" />,
      table: "legal_service",
      isActive: router.pathname.startsWith("/legal-services"),
    },
    {
      name: "Solar",
      link: "/solar",
      icon: <Sun className="w-4 h-4" />,
      table: "solar",
      isActive: router.pathname.startsWith("/solar"),
    },
    {
      name: "Orders Portal",
      link: "/orders",
      icon: <MdManageAccounts className="text-[16px]" />,
      table: "orders",
      isActive: router.pathname === "/orders",
    },

    {
      name: "Settings",
      link: "/settings",
      icon: <MdSettings className="text-[16px]" />,
      isActive: router.pathname.startsWith("/settings"),
      subLink: [
        {
          name: "User Control",
          link: "/settings/user-management",
          icon: <FaUser className="text-[16px]" />,
          table: "user",
        },
        {
          name: "Careers",
          link: "/settings/careersAdmin",
          icon: <PiBuildings className="text-[16px]" />,
          table: "careers",
        },
        {
          name: "Access Control",
          link: "/settings/access-control",
          icon: <FaAccessibleIcon className="text-[16px]" />,
          table: "role",
        },
        {
          name: "Branch Control",
          link: "/settings/branches",
          icon: <PiGitBranch className="text-[16px]" />,
          table: "branches",
        }
      ],
    },
  ];

  const [finalNavItems, setFinalNavItems] = useState<any>([
    {
      name: "User Profile",
      link: "/settings/user-profile",
      icon: <CgProfile className="text-[16px]" />,
      table: "user",
    },


  ]);

  const phaseOneSidebarLinks = new Set([
    "/dashboard",
    "/blogs",
    "/cost-estimator",
    "/invoice",
    "/referandearn",
  ]);

  const getDefaultSidebarWidth = () => {
    if (typeof window === "undefined") return 240;
    if (window.innerWidth < 768) return 0;
    if (window.innerWidth < 1024) return 140;
    return 240;
  };

  const [sidebarWidth, setSidebarWidth] = useState(getDefaultSidebarWidth());

  useEffect(() => {
    const handleResize = () => {
      setSidebarWidth(getDefaultSidebarWidth());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth > 120 && newWidth < 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const markAllAsRead = async () => {
    try {
      if (!user?.id) return;
      await apiClient.patch(
        `${apiClient.URLS.notifications}/mark-all/${user.id}`,
        {}
      );
      const updated = notifications.map((n) => ({ ...n, isRead: true }));
      setNotifications(updated);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.patch(
        `${apiClient.URLS.notifications}/${notificationId}/read`,
        {}
      );
      const updated = notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      );
      setNotifications(updated);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.notifications}/${user?.id}`,
        {}
      );
      if (res.status === 200 && res.body) {
        setNotifications(res.body);
      }
    } catch (error) {
      console.log("error is ", error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (session.status === "authenticated") {
      const currentUser: any = session.data?.user;
      setUser(currentUser);
      const memberships: BranchMembershipLite[] =
        currentUser?.branchMemberships ?? [];
      initFromSession(memberships, currentUser?.role);
    }
  }, [session.status, session.data, initFromSession]);

  useEffect(() => {
    if (user?.id) {
      getNotifications();
    }
  }, [user, getNotifications]);

  useEffect(() => {
    if (!user?.id) return;
    const token = (session.data as any)?.token;
    const socket = getSocket({ userId: user.id, token });
    if (!socket) return;
    socketRef.current = socket;

    const onNotificationNew = (payload: Notification) => {
      if (!payload?.id) return;
      setNotifications((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev];
      });
    };

    const onNotificationSync = () => {
      getNotifications();
    };

    socket.on("notification:new", onNotificationNew);
    socket.on("notification:sync", onNotificationSync);

    return () => {
      socket.off("notification:new", onNotificationNew);
      socket.off("notification:sync", onNotificationSync);
    };
  }, [user?.id, (session.data as any)?.token, getNotifications]);

  useEffect(() => {
    if (!user) return;

    const filtered = navItems
      .map((item) => {
        const newItem: any = { ...item };
        if (newItem.link === "/dashboard") {
          return newItem;
        }

        if (newItem.link === "/settings" && Array.isArray(newItem.subLink)) {
          const hiddenSettingsLinks = new Set([
            "/settings/careersAdmin",
            "/settings/branches",
            "/settings/attendance-management",
          ]);
          const filteredSubLinks = newItem.subLink.filter((sub: any) => {
            if (hiddenSettingsLinks.has(sub.link)) return false;
            if (!sub.table) return true;
            return hasPermission(sub.table, "view");
          });
          newItem.subLink = filteredSubLinks;
          return filteredSubLinks.length > 0 ? newItem : null;
        }

        if (newItem.table) {
          return hasPermission(newItem.table, "view") ? newItem : null;
        }

        return newItem;
      })
      .filter(Boolean);

    const phaseOneItems = filtered.filter((item: any) =>
      phaseOneSidebarLinks.has(item.link)
    );

    setFinalNavItems(phaseOneItems);
  }, [permissions, user, router.pathname, hasPermission, userRole]);


  const displayedNotifications = showAll
    ? notifications
    : notifications?.slice(0, 3);

  const CommonNavItem = () => (
    <div className="flex h-full flex-col bg-white border-r border-slate-200 shadow-sm">
      {/* Logo Section */}
      <div className="flex-shrink-0 px-3 py-4 border-b border-slate-100 bg-slate-50/50">
        <Link href={"/"}>
          <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-transparent flex-shrink-0">
              <Image
                src="/images/houznext-logo.png"
                alt="Houznext"
                fill
                className="object-contain"
              />
            </div>
            <div className="hidden md:flex md:flex-col font-bold leading-tight">
              <p className="flex gap-1">
                <span className="text-[16px] text-[#2f80ed]">HOUZ</span>
                <span className="text-[16px] text-slate-800">NEXT</span>
              </p>
              <p className="text-[9px] font-medium text-slate-500 text-nowrap">
                Premium Interior Living
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto custom-scrollbar">
        <RightNav items={finalNavItems} isMobile={false} onItemClick={null} />
      </nav>
    </div>
  );

  const MobileNavItem = () => (
    <div className="flex flex-col h-full bg-white max-w-[260px] z-[1000000000]">
      {/* Mobile Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-100">
        <Link href={"/"} onClick={() => setIsMobileMenuOpen(false)}>
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden">
              <Image
                src="/images/houznext-logo.png"
                alt="Houznext"
                fill
                className="absolute object-cover"
              />
            </div>
            <div className="flex flex-col font-bold leading-tight">
              <p className="flex gap-1">
                <span className="text-[16px] text-[#2f80ed]">HOUZ</span>
                <span className="text-[16px] text-slate-800">NEXT</span>
              </p>
              <p className="text-[9px] font-medium text-slate-500">
                Premium Interior Living
              </p>
            </div>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <RxCross2 size={18} />
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <RightNav
          items={finalNavItems}
          isMobile={true}
          onItemClick={() => setIsMobileMenuOpen(false)}
        />
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute z-[100000000] left-0 top-0 h-full w-80 max-w-[250px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <MobileNavItem />
          </div>
        </div>
      )}

      <div className="grid min-h-[100vh] w-full grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_1fr]">
        {/* Sidebar */}
        <div
          ref={sidebarRef}
          className="hidden md:flex flex-col lg:h-screen h-screen sticky top-0 bottom-0 z-40 overflow-y-auto bg-white"
          style={{ width: `${sidebarWidth}px` }}
        >
          <CommonNavItem />
          <div
            ref={resizeHandleRef}
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-200 active:bg-blue-300"
            onMouseDown={() => setIsResizing(true)}
          />
        </div>

        {/* Main Content Area */}
        <div className="w-full h-full flex flex-col overflow-y-auto">
          {/* Top Header */}
          <div className="flex min-w-full h-14 items-center sticky top-0 z-30 justify-between px-3 md:px-5 bg-white border-b border-slate-200 shadow-sm">
            <div className="flex gap-4 items-center">
              {/* Mobile Menu Button */}
              <Button
                className="lg:hidden text-gray-600"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <RxHamburgerMenu size={22} />
              </Button>

              {/* Admin Panel Title */}
              <div className="flex items-center gap-2">
                <MdOutlineAdminPanelSettings className="text-gray-700 text-[18px]" />
                <span className="text-black font-medium text-[14px] md:text-[16px]">
                  Admin Panel
                </span>
                {(userRole === "ADMIN" || userRole === "SuperAdmin") && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-primary/15 text-brand-primary rounded-full uppercase tracking-wide">
                    Super Admin
                  </span>
                )}
                <BranchBadge memberships={data?.user?.branchMemberships} />
              </div>
            </div>

            {/* Right Side - Notifications & Avatar */}
            <div className="flex items-center gap-1">
              {/* Notifications */}
              <DropDown
                placement="right-start"
                buttonElement={
                  <div className="relative p-2 cursor-pointer hover:bg-gray-100 rounded-xl transition-all duration-200 group">
                    {unreadCount > 0 ? (
                      <BellRing className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    ) : (
                      <Bell className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                }
                isOpen={isDropdownOpen}
                setIsOpen={setIsDropdownOpen}
              >
                <div className="flex flex-col w-[340px] sm:w-[400px] bg-white rounded-2xl max-h-[480px] shadow-2xl border border-gray-100 overflow-hidden">
                  {/* Notification Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Bell className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold text-gray-900">
                          Notifications
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          {unreadCount > 0
                            ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                            : "All caught up!"}
                        </p>
                      </div>
                    </div>
                    {unreadCount > 0 && (
                      <Button
                        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 text-[12px] font-medium hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={async () => {
                          await markAllAsRead();
                        }}
                      >
                        <MdMarkEmailRead className="w-4 h-4" />
                        Mark all read
                      </Button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="flex-1 overflow-y-auto">
                    {displayedNotifications?.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {displayedNotifications?.map((notification: any) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsRead(notification.id);
                              }
                            }}
                            className={clsx(
                              "flex items-start gap-3 px-5 py-4 transition-all duration-200 cursor-pointer group",
                              !notification.isRead
                                ? "bg-blue-50/50 hover:bg-blue-50"
                                : "hover:bg-gray-50"
                            )}
                          >
                            {/* Avatar with status indicator */}
                            <div className="relative flex-shrink-0">
                              <div
                                className={clsx(
                                  "w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-semibold transition-colors",
                                  !notification.isRead
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-600"
                                )}
                              >
                                {user?.firstName?.[0]}
                                {user?.lastName?.[0]}
                              </div>
                              {!notification.isRead && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={clsx(
                                  "text-[13px] text-gray-800 leading-relaxed line-clamp-2",
                                  !notification.isRead
                                    ? "font-semibold"
                                    : "font-normal"
                                )}
                              >
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span
                                  className={clsx(
                                    "text-[11px]",
                                    !notification.isRead
                                      ? "text-blue-600 font-medium"
                                      : "text-gray-400"
                                  )}
                                >
                                  <ReactTimeAgo
                                    date={notification?.createdAt}
                                    locale="en-US"
                                  />
                                </span>
                                {notification.isRead && (
                                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                    <Check className="w-3 h-3" />
                                    Read
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Mark as read button */}
                            {!notification.isRead && (
                              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                                  <MdCheckCircle className="w-4 h-4 text-blue-500" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 px-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                          <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-900 font-semibold text-[15px] mb-1">
                          No notifications yet
                        </p>
                        <p className="text-gray-500 text-[13px] text-center">
                          When you receive notifications, they will appear here
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications?.length > 3 && (
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                      <Button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[13px] font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        {showAll
                          ? "Show Less"
                          : `View All (${notifications.length})`}
                      </Button>
                    </div>
                  )}
                </div>
              </DropDown>

              {/* Avatar */}
              <div>
                <Avatar />
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 min-h-[calc(100%-56px)] bg-slate-50/80 overflow-auto">
            {page}
          </div>
        </div>
      </div>
    </>
  );
}

function withAdminLayout(c: any) {
  c.getLayout = (page: ReactElement, props: any) => (
    <AdminLayout {...props} page={page} />
  );
  return c;
}
export default withAdminLayout;
