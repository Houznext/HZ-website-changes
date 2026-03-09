"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiHome, FiUser } from "react-icons/fi";
import { MdApartment } from "react-icons/md";
import { IoCartOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";

const BottomNav = () => {
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();
    const activeClass = "text-[#3586FF] font-medium";
    const inactiveClass = "text-gray-500 font-medium";
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around shadow-2xl items-center py-[9px] md:hidden z-50">
            <Link href="/">
                <div className="flex flex-col items-center footer-text">
                    <FiHome
                        className={`text-xl ${router.pathname === "/" ? activeClass : inactiveClass}`}
                    />
                    <span
                        className={`text-[10px] ${router.pathname === "/" ? activeClass : inactiveClass}`}
                    >
                        Home
                    </span>
                </div>
            </Link>

            <Link href="/properties">
                <div className="flex flex-col items-center footer-text">
                    <MdApartment
                        className={`text-xl ${router.pathname.startsWith("/properties") ? activeClass : inactiveClass
                            }`}
                    />
                    <span
                        className={`text-[10px] ${router.pathname.startsWith("/properties") ? activeClass : inactiveClass
                            }`}
                    >
                        Properties
                    </span>
                </div>
            </Link>

            <Link href="/user/custom-builder">
                <div className="flex flex-col items-center footer-text">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`text-xl ${router.pathname.startsWith("/user/custom-builder")
                            ? activeClass
                            : inactiveClass
                            }`}
                    >
                        <path d="M12 2L4 8v12h6v-6h4v6h6V8z" />
                        <circle cx="12" cy="10" r="3" />
                        <path d="M12 13v6" />
                    </svg>
                    <span
                        className={`text-[10px] ${router.pathname.startsWith("/user/custom-builder")
                            ? activeClass
                            : inactiveClass
                            }`}
                    >
                        TrackHome
                    </span>
                </div>
            </Link>
            <Link href="/cart">
                <div className="flex flex-col items-center footer-text">
                    <IoCartOutline
                        className={`text-xl ${router.pathname.startsWith("/cart") ? activeClass : inactiveClass
                            }`}
                    />
                    <span
                        className={`text-[10px] ${router.pathname.startsWith("/cart") ? activeClass : inactiveClass
                            }`}
                    >
                        Cart
                    </span>
                </div>
            </Link>

            <Link href="/user/profile">
                <div className="flex flex-col items-center footer-text">
                    <FiUser
                        className={`text-xl ${router.pathname.startsWith("/profile") ? activeClass : inactiveClass
                            }`}
                    />
                    <span
                        className={`text-[10px] ${router.pathname.startsWith("/profile") ? activeClass : inactiveClass
                            }`}
                    >
                        Profile
                    </span>
                </div>
            </Link>
        </div>

    );
};

export default BottomNav;
