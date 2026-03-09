"use client";
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import ReactTimeAgo from "react-time-ago";
import type { NextPage } from "next";
import { INavItems } from "@/utils/interfaces";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { RxCross2 } from "react-icons/rx";
import { LuCheckCircle } from "react-icons/lu";
import { MdReviews } from "react-icons/md";
import clsx from "clsx";
import { Popover, Portal, Transition } from "@headlessui/react";
import { IoChevronDown } from "react-icons/io5";
import { usePopper } from "react-popper";
import Avatar from "@/components/Avatar";
import { DropDown } from "@/common/PopOver";
import { IoMdNotificationsOutline } from "react-icons/io";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import Button from "@/common/Button";
import { FiGrid, FiUser, FiHeart, FiTool, FiMenu, FiX, FiLogOut, FiShoppingCart, FiMail, FiMessageCircle } from "react-icons/fi";
import { HiOutlineCheck } from "react-icons/hi";
import { FaHome, FaBuilding } from "react-icons/fa";
import apiClient from "@/utils/apiClient";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cart";
import { getUserRoleLabel, isAdmin, isStaff, isSeller, isAgent, isServiceProvider } from "@/utils/roles";

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

function UserLayout({
  page,
  showAll,
  setShowAll,
}: {
  page: ReactElement;
  showAll: boolean;
  setShowAll: (value: boolean) => void;
}) {
  const router = useRouter();
  const session = useSession();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const displayedNotifications = showAll
    ? notifications
    : notifications?.slice(0, 3);
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const cartItems = useCartStore((state) => state.items ?? []);




  const sessionUser = session?.data?.user as any;
  const userIsAdmin = isAdmin(sessionUser);
  const userIsStaff = isStaff(sessionUser);
  const userIsSeller = isSeller(sessionUser);
  const userIsAgent = isAgent(sessionUser);
  const showCustomerItems = !userIsStaff || userIsAdmin;

  const navMenuItems: INavItems[] = [
    {
      name: "Dashboard",
      link: "/user/dashboard",
      icon: <FiGrid className="text-[18px]" />,
      isActive: router.asPath.startsWith("/user/dashboard"),
    },
    {
      name: "Interior Projects",
      link: "/user/custom-builder",
      icon: <FiTool className="text-[18px]" />,
      isActive: router.asPath.startsWith("/user/custom-builder"),
    },
    {
      name: "Interior Tracking",
      link: "/user/custom-builder",
      icon: <FaHome className="text-[18px]" />,
      isActive: router.asPath.startsWith("/user/custom-builder"),
    },
    {
      name: "Referral Progress",
      link: "/user/referralprogress",
      icon: <LuCheckCircle className="text-[18px]" />,
      isActive: router.pathname === "/user/referralprogress",
    },
    {
      name: "User Profile",
      link: "/user/profile",
      icon: <FiUser className="text-[18px]" />,
      isActive: router.asPath.startsWith("/user/profile"),
    },
  ];

  const logo_place_holder = {
    imageUrl: "/images/logobb.png",
    link: "/",
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/?auth=1" });
    } catch (e) {
      toast.error("Logout failed");
    }
  };


  const fetchNotifications = async (userId: string) => {
    if (!userId) return;
    try {
      setNotificationsLoading(true);
      const res = await apiClient.get(
        `${apiClient.URLS.notifications}/${userId}`,
        {},
        true
      );
      if (res.status === 200) {
        const list = Array.isArray(res.body) ? res.body : [];
        setNotifications(list);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || unreadCount === 0) return;
    try {
      await apiClient.patch(
        `${apiClient.URLS.notifications}/mark-all/${user.id}`,
        {},
        true
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const markOneAsRead = async (notificationId: number) => {
    try {
      await apiClient.patch(
        `${apiClient.URLS.notifications}/${notificationId}/read`,
        {},
        true
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    if (isDropdownOpen && user?.id) fetchNotifications(user.id);
  }, [isDropdownOpen]);


  useEffect(() => {
    if (session.status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(router.asPath);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [session.status, router]);

  useEffect(() => {
    if (session.status === "authenticated" && session.data?.user?.id) {
      setUser(session.data.user);
      fetchNotifications(session?.data?.user.id);
    }
  }, [session.status, session?.data?.user?.id]);


  const CommonNavItem = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`flex h-full flex-col max-h-screen ${isMobile ? 'md:p-4 p-4' : 'lg:px-4 px-2 lg:py-6 py-4'} bg-white`}>
      <div className="z-[99999] mb-2">
        <Link href={"/"} className="flex items-center justify-start gap-2 cursor-pointer">
          <span className="relative block w-[40px] h-[40px] md:min-h-[40px] min-h-[30px]">
            <Image
              src={logo_place_holder.imageUrl}
              alt="dreamcasa-logo"
              fill
              className="absolute object-cover"
            />
          </span>
          <span className="md:block font-bold leading-tight">
            <span className="flex gap-1">
              <span className="text-[18px] text-[#3586FF]">HOUZ</span>
              <span className="text-[18px] text-gray-900">NEXT</span>
            </span>
            <span className="block text-[11px] font-medium text-gray-600">
              Premium Interior Living
            </span>
          </span>
        </Link>
      </div>

      <nav className="flex flex-col  justify-between">
        <NavigationMenu items={navMenuItems} isMobile={isMobile} />
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          className={clsx(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "text-red-600 hover:bg-red-50 hover:text-red-700"
          )}
        >
          <span className="text-lg">
            <FiLogOut className="text-[18px]" />
          </span>
          <span>Logout</span>
        </Button>
      </div>

      {/* User info for mobile */}
      {isMobile && user && (
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-[#3586FF] font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs font-medium text-[#3586FF]">{getUserRoleLabel(user)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[280px] bg-white transform transition-transform duration-300 ease-in-out">
            <div className="flex justify-end items-center p-2 border-b border-gray-200">
              <Button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700"
              >
                <RxCross2 size={24} />
              </Button>
            </div>
            <CommonNavItem isMobile={true} />
          </div>
        </div>
      )}

      <div className="max-h-screen bg-gray-50 flex w-full overflow-x-hidden">

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-64 bg-white shadow-lg z-40">
          <CommonNavItem />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between md:px-6 px-3 py-2">
              <div className="flex items-center gap-4">
                <Button
                  className="lg:hidden text-gray-600 p-2 rounded-md hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <FiMenu size={24} />
                </Button>
                <h1 className="text-xl font-bold text-gray-900">
                  {router.pathname === "/user/orders"
                    ? "My Orders"
                    : router.pathname === "/user/dashboard"
                    ? "Dashboard"
                    : router.pathname === "/user/profile"
                    ? "User Profile"
                    : router.pathname === "/user/properties"
                    ? "My Properties"
                    : router.pathname === "/user/wishlist"
                    ? "Wishlist"
                    : router.pathname.startsWith("/user/custom-builder")
                    ? "Interior Tracking"
                    : router.pathname === "/user/company-property"
                    ? "Company Property"
                    : router.pathname === "/user/testimonials"
                    ? "Testimonials"
                    : router.pathname === "/user/referralprogress"
                    ? "Referral Progress"
                    : router.pathname === "/user/support"
                    ? "Support"
                    : "Client Dashboard"}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href="/cart"
                  className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200 group"
                  aria-label="Go to cart"
                >
                  <FiShoppingCart className="text-gray-600 w-6 h-6 group-hover:text-gray-800 transition-colors" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 bg-[#3586FF] rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                      {cartItems.length > 99 ? "99+" : cartItems.length}
                    </span>
                  )}
                </Link>

                <DropDown
                  placement="bottom-end"
                  buttonElement={
                    <div className="relative p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200 group">
                      <div className="relative">
                        <IoMdNotificationsOutline className="text-gray-600 w-6 h-6 group-hover:text-gray-800 transition-colors" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  }
                  isOpen={isDropdownOpen}
                  setIsOpen={setIsDropdownOpen}
                >
                  <div className="md:w-[24rem] w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col max-h-[32rem] overflow-hidden">
                    {/* Header: bell icon + title + unread count + Mark all read */}
                    <div className="flex items-start gap-3 md:p-4 p-3 border-b border-gray-100">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <IoMdNotificationsOutline className="text-[#3586FF] w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-base">
                              Notifications
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {unreadCount > 0 ? `${unreadCount} unread messages` : "All caught up"}
                            </p>
                          </div>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllAsRead}
                              className="flex items-center gap-1.5 text-[#3586FF] hover:text-blue-700 text-xs font-medium whitespace-nowrap"
                            >
                              <FiMail className="w-3.5 h-3.5" />
                              Mark all read
                            </button>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    </div>

                    {/* List: card-style items */}
                    <div className="flex-1 overflow-y-auto min-h-[8rem] p-3 space-y-2">
                      {notificationsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4">
                          <div className="w-10 h-10 border-2 border-[#3586FF] border-t-transparent rounded-full animate-spin mb-3" />
                          <p className="text-sm text-gray-500">Loading notifications…</p>
                        </div>
                      ) : displayedNotifications?.length > 0 ? (
                        displayedNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={clsx(
                              "rounded-xl p-3 transition-colors cursor-pointer flex items-start gap-3",
                              !notification.isRead
                                ? "bg-blue-50/70 hover:bg-blue-50"
                                : "bg-gray-50 hover:bg-gray-100"
                            )}
                            onClick={() => {
                              if (!notification.isRead) markOneAsRead(notification.id);
                            }}
                          >
                            {/* Avatar block with optional unread dot */}
                            <div className="relative flex-shrink-0 w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                              <span className="text-[#3586FF] font-semibold text-xs uppercase">
                                {user?.firstName?.[0] && user?.lastName?.[0]
                                  ? `${user.firstName[0]}${user.lastName[0]}`
                                  : "DC"}
                              </span>
                              {!notification.isRead && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#3586FF] border-2 border-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={clsx(
                                  "text-sm leading-snug break-words",
                                  !notification.isRead ? "font-medium text-gray-900" : "text-gray-700"
                                )}
                              >
                                {notification?.message?.length > 100
                                  ? `${notification.message.slice(0, 100)}…`
                                  : notification?.message ?? ""}
                              </p>
                              <p className="text-xs text-[#3586FF] mt-1">
                                <ReactTimeAgo
                                  date={notification.createdAt}
                                  locale="en-US"
                                  timeStyle="round-minute"
                                />
                              </p>
                            </div>
                            {notification.isRead && (
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                <HiOutlineCheck className="text-[#3586FF] w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <IoMdNotificationsOutline className="text-gray-400 w-7 h-7" />
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm mb-1">No notifications yet</h4>
                          <p className="text-xs text-gray-500 max-w-[12rem]">
                            We&apos;ll notify you when something important happens
                          </p>
                        </div>
                      )}
                    </div>

                    {/* View All button */}
                    {!notificationsLoading && notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setShowAll(!showAll)}
                          className={clsx(
                            "w-full py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2",
                            showAll
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-gray-900 text-white hover:bg-gray-800"
                          )}
                        >
                          {showAll ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              Show less
                            </>
                          ) : (
                            <>View All ({notifications?.length ?? 0})</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </DropDown>

                <div className="ml-2">
                  <Avatar showAbove={false} />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 md:p-6 p-2 overflow-auto">
            {page}
          </main>
        </div>
      </div>
    </>
  );
}

interface INavigationMenuProps {
  items: Array<INavItems>;
  isMobile?: boolean;
}

const NavigationMenu = ({ items, isMobile = false }: INavigationMenuProps) => {
  const popperElRef = useRef<any>(null);
  let [referenceElement, setReferenceElement] = useState<any>(null);
  let [popperElement, setPopperElement] = useState<any>(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "right-start",
    modifiers: [
      {
        name: "flip",
        options: {
          fallbackPlacements: ["right-start", "right", "top-end", "auto"],
        },
      },
      {
        name: "preventOverflow",
        options: {
          rootBoundary: "document",
          padding: 4,
        },
      },
    ],
    strategy: "fixed",
  });

  return (
    <ul role="list" className="space-y-2">
      {items.map((item, index) => (
        <li key={`${index}-${item.name}-link`}>
          {item.link && !item.subLink ? (
            <Link
              href={item.link}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                {
                  "text-[#3586FF] bg-blue-50 border-r-2 border-blue-600":
                    item.isActive,
                  "text-gray-700 hover:text-[#3586FF] hover:bg-blue-50":
                    !item.isActive,
                }
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ) : (
            <>
              {item.subLink && item.subLink.length > 0 && (
                <Popover className="relative">
                  {({ open }) => (
                    <>
                      <Popover.Button
                        as="div"
                        ref={setReferenceElement}
                        className="w-full"
                      >
                        <Button
                          className={clsx(
                            "flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            {
                              "text-[#3586FF] bg-blue-50": item.isActive || open,
                              "text-gray-700 hover:text-[#3586FF] hover:bg-blue-50":
                                !item.isActive && !open,
                            }
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.name}</span>
                          </div>
                          <IoChevronDown
                            className={clsx("transition-transform", {
                              "rotate-180": open,
                            })}
                          />
                        </Button>
                      </Popover.Button>

                      {referenceElement && (
                        <Portal>
                          <div
                            ref={popperElRef}
                            style={styles.popper}
                            className="z-[999999]"
                            {...attributes.popper}
                          >
                            <Transition
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                              beforeEnter={() =>
                                setPopperElement(popperElRef.current)
                              }
                              afterLeave={() => setPopperElement(null)}
                            >
                              {popperElement && (
                                <Popover.Panel className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px] py-2">
                                  {item.subLink && (
                                    <NavigationMenu
                                      items={item.subLink}
                                      isMobile={isMobile}
                                    />
                                  )}
                                </Popover.Panel>
                              )}
                            </Transition>
                          </div>
                        </Portal>
                      )}
                    </>
                  )}
                </Popover>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

function withUserLayout(c: any) {
  c.getLayout = (page: ReactElement, props: any) => (
    <UserLayout {...props} page={page} />
  );
  return c;
}
export default withUserLayout;