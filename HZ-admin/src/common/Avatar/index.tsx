import React, { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { LogoutIcon } from "../Icons";
import { signOut, useSession } from "next-auth/react";
import Button from "../Button";
import { FiGrid, FiSettings, FiUser, FiChevronDown } from "react-icons/fi";
import { getSignedImageUrl } from "@/src/utils/uploadFile";

const Avatar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedImg, setResolvedImg] = useState("");
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const [user, setUser] = useState<any>();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (session?.status === "authenticated") {
      setUser(session.data?.user);
    }
  }, [session?.status]);

  useEffect(() => {
    if (user?.profile) {
      getSignedImageUrl(user.profile).then((url) => {
        setResolvedImg(url);
        setImgError(false);
      });
    }
  }, [user?.profile]);

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
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const avatarImg = resolvedImg && !imgError ? (
    <img
      src={resolvedImg}
      alt={user?.firstName || "Avatar"}
      className="w-full h-full object-cover"
      onError={() => setImgError(true)}
    />
  ) : null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        className={twMerge(
          "flex items-center gap-3 p-2 rounded-lg cursor-pointer",
          "transition-all duration-200 hover:bg-gray-100",
          isOpen ? "bg-gray-100" : "bg-transparent"
        )}
      >
        <div className="relative flex-shrink-0">
          {avatarImg ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
              {avatarImg}
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#5297ff] flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-semibold">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <p className="font-medium text-gray-800 text-sm leading-tight">
            {user?.firstName ? user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1) : "User"}
          </p>
          <p className="text-xs text-gray-500 font-regular">
            {user?.roleName || "Admin"}
          </p>
        </div>

        <FiChevronDown
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          size={16}
        />
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 w-64 mt-2 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                {avatarImg ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                    {avatarImg}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#5297ff] flex items-center justify-center shadow-md">
                    <span className="text-white text-base font-semibold">
                      {getInitials(user?.firstName, user?.lastName)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName ? user.firstName + (user.lastName ? ` ${user.lastName}` : '') : "User"}
                </p>
                <p className="text-xs font-regular text-gray-500 truncate max-w-[160px]">
                  {user?.email}
                </p>
                <p className="text-xs font-medium text-[#3586FF] mt-1">
                  {user?.roleName || "Administrator"}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <FiGrid className="w-4 h-4 text-gray-500 mr-3" />
              <span className="font-medium">Dashboard</span>
            </Link>

            <Link
              href="/settings/user-profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <FiUser className="w-4 h-4 text-gray-500 mr-3" />
              <span className="font-medium">My Profile</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              onClick={() => setIsOpen(false)}
            >
              <FiSettings className="w-4 h-4 text-gray-500 mr-3" />
              <span className="font-medium">Settings</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 py-2">
            <Button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <LogoutIcon />
              <span className="font-medium">Sign out</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Avatar;
