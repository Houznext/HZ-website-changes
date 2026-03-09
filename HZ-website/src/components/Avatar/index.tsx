import React, { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import Image from "next/image";
import Link from "next/link";
import {
  FiGrid,
  FiUser,
  FiShoppingCart,
  FiHeart,
  FiTool,
  FiSettings,
  FiCreditCard,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";
import { FaHome, FaBuilding } from "react-icons/fa";
import { MdBorderAll, MdReviews } from "react-icons/md";
import { LuCheckCircle } from "react-icons/lu";
import { signOut, useSession } from "next-auth/react";
import Button from "@/common/Button";
import { useCartStore } from "@/store/cart";
import apiClient from "@/utils/apiClient";
import { useWishlistStore } from "@/store/wishlist";
import { getUserRoleLabel } from "@/utils/roles";

interface AvatarProps {
  showAbove?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ showAbove = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const [user, setUser] = useState<any>();
  const { syncCartWithBackend, fetchCart } = useCartStore();
  const { syncWishlistWithBackend } = useWishlistStore();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (session?.status === "authenticated" && session.data?.user) {
      const sessionUser = session.data?.user;
      setUser(sessionUser);
      syncCartWithBackend(sessionUser.id);
      fetchCart(sessionUser.id);
      syncWishlistWithBackend(sessionUser.id);
    }
  }, [session?.status]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName) return "U";
    const firstInitial = firstName[0] || "";
    const lastInitial = lastName?.[0] || "";
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const menuItems = [
    { icon: <FiGrid size={14} />, label: "Dashboard", href: "/user/dashboard" },
    { icon: <FiUser size={14} />, label: "My Profile", href: "/user/profile" },
    {
      icon: <FaHome size={14} />,
      label: "Properties",
      href: "/user/properties",
    },
    {
      icon: <FaBuilding size={14} />,
      label: "Company Property",
      href: "/user/company-property",
    },
    { icon: <FiShoppingCart size={14} />, label: "Cart", href: "/cart" },
    { icon: <FiHeart size={14} />, label: "Wishlist", href: "/user/wishlist" },
    {
      icon: <FiTool size={14} />,
      label: "Custom Builder",
      href: "/user/custom-builder",
    },
    {
      icon: <MdReviews size={14} />,
      label: "Testimonials",
      href: "/user/testimonials",
    },
    {
      icon: <MdBorderAll size={14} />,
      label: "Orders",
      href: "/user/orders"

    },
    {
      icon: <LuCheckCircle size={14} />,
      label: "Referral Progress",
      href: "/user/referralprogress",
    },

    { icon: <FiSettings size={14} />, label: "Settings", href: "#" },
    { icon: <FiCreditCard size={14} />, label: "Wallet", href: "#" },
  ];
  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className={twMerge(
          "flex items-center gap-2 p-2 rounded-full cursor-pointer transition-all duration-200",
          isOpen ? "bg-blue-50 ring-2 ring-blue-100" : "hover:bg-gray-100"
        )}
      >
        {user?.profile ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <Image
              src={user?.profile}
              alt={user?.firstName || "Avatar"}
              fill className="object-cover"
            />
          </div>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-[#3586FF] flex items-center justify-center shadow-sm">
              <span className="text-white  text-sm font-bold">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            </div>
            <FiChevronDown
              className={`text-gray-500 -ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                }`}
              size={16}
            /></>
        )}
      </div>

      {isOpen && (
        <div
          className={twMerge(
            "absolute z-50 md:w-75 w-45 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden transition-all duration-200",
            showAbove
              ? "bottom-full mb-2 left-[1px] md:top-full md:mt-2 md:bottom-auto md:left-auto md:right-0"
              : "top-full mt-2 md:right-0 right-0"
          )}
        >
          <div className="md:px-4 px-3 md:py-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 md:mr-4 mr-1">
                {user?.profile ? (
                  <div className=" md:w-10  relative md:h-10 w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <Image
                      src={user?.profile}
                      alt={user?.firstName || "Avatar"}
                      layout="fill"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className=" w-10  h-10 rounded-full bg-[#3586FF] flex items-center justify-center shadow-md">
                    <span className="text-white font-medium md:text-base text-[12px]">
                      {getInitials(user?.firstName, user?.lastName)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="md:text-sm text-[12px] font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="md:text-xs text-[10px] text-gray-500 truncate md:max-w-[160px] max-w-[130px]">
                  {user?.email}
                </p>
                <p className="md:text-xs text-[10px] font-medium text-[#3586FF] md:mt-1 mt-0">
                  {getUserRoleLabel(user)}
                </p>
              </div>
            </div>
          </div>

          <div className="md:py-2 py-1 max-h-70 overflow-y-auto max-md:max-h-[250px]">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center md:px-6 px-3 md:py-2 border-b-[0.5px] border-gray-100 shadow-sm py-2 md:text-[12px] text-[10px] text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <span className="text-gray-500   mr-3">{item.icon}</span>
                <span className="font-medium ">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-100 py-2">
            <Button
              onClick={handleLogout}
              className="flex items-center w-full px-6 md:py-2 py-1 md:text-[12px] text-[10px] text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <FiLogOut className="text-red-500 mr-3" size={18} />
              <span className="font-medium ">Sign out</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
