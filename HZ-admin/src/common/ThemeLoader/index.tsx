"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineHome, HiOutlineTruck } from "react-icons/hi";
import { GiSofa, GiPaintRoller, GiSolarPower } from "react-icons/gi";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

interface UploadProgressLoaderProps {
    progress?: number;
    size?: number | string;
    logoSrc?: string;
    logoAlt?: string;
    orbitThreshold?: number;
    showFooter?: boolean;
    showGuide?: boolean;
    overlay?: boolean;
}

const RING_BORDER = "border-brand-primary";
const FILL_BLUE = "bg-brand-primary";

const icons = [
    { id: 1, Icon: HiOutlineHome, label: "Real Estate" },
    { id: 2, Icon: GiSofa, label: "Interiors" },
    { id: 3, Icon: GiPaintRoller, label: "Painting" },
    { id: 4, Icon: GiSolarPower, label: "Solar" },
    { id: 5, Icon: HiOutlineTruck, label: "Packers" },
];

const ThemeLoader: React.FC<UploadProgressLoaderProps> = ({
    progress = 0,
    size = "clamp(160px, 28vw, 220px)",
    logoSrc = "/images/houznext-logo.png",
    logoAlt = "Houznext",
    orbitThreshold = 20,
    showFooter = false,
    showGuide = true,
    overlay = true,
}) => {
    const [orbitStarted, setOrbitStarted] = useState(false);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        if (progress >= orbitThreshold) setOrbitStarted(true);
    }, [progress, orbitThreshold]);

    const sNum = typeof size === "number" ? size : undefined;
    const containerStyle: React.CSSProperties =
        typeof size === "number"
            ? { width: size, height: size }
            : { width: size as string, height: size as string };

    const radius = useMemo(() => Math.max(48, Math.floor((sNum ?? 200) * 0.27)), [sNum]);
    const circumference = 2 * Math.PI * 36;
    const dashOffset = circumference * 0.25;

    return (
        <div
            className={`${overlay
                ? "fixed inset-0 bg-white/50 backdrop-blur-[2px] z-[99999] flex items-center justify-center"
                : "relative"
                } transition-all duration-500`}
            role="status"
            aria-live="polite"
        >
            <div className="flex flex-col items-center justify-center p-4 relative">
                <div className="relative flex flex-col items-center gap-6">
                    <div className="relative flex items-center justify-center" style={containerStyle}>
                        {showGuide && (
                            <div className="absolute inset-0 rounded-full border border-dotted border-blue-200/40" />
                        )}

                        <motion.div
                            className={`absolute inset-0 rounded-full border ${RING_BORDER}/30`}
                            animate={orbitStarted && !prefersReducedMotion ? { rotate: 360 } : { rotate: 0 }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        />

                        <div className="relative" style={{ width: "58%", height: "58%" }}>
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="36" stroke="rgb(229 231 235)" strokeWidth="5" fill="none" />
                                <motion.circle
                                    cx="50"
                                    cy="50"
                                    r="36"
                                    fill="none"
                                    stroke="rgb(37 99 235)"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    className="drop-shadow-sm"
                                />
                            </svg>

                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{
                                    background:
                                        "conic-gradient(from 0deg, rgba(59,130,246,0.2), rgba(59,130,246,0) 40%)",
                                    WebkitMask: "radial-gradient(circle, transparent 58%, black 59%)",
                                    mask: "radial-gradient(circle, transparent 58%, black 59%)",
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            />

                            <div className="absolute inset-0 grid place-items-center">
                                <div className="rounded-full border border-blue-200/80 p-[5px] bg-white/95 shadow-md">
                                    <div
                                        className="relative"
                                        style={{
                                            width: "clamp(18px, 4.2vw, 26px)",
                                            height: "clamp(18px, 4.2vw, 26px)",
                                        }}
                                    >
                                        <Image
                                            src={logoSrc}
                                            alt={logoAlt}
                                            fill
                                            sizes="(max-width: 640px) 26px, 26px"
                                            className="object-contain"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {icons.map((item, i) => {
                            const angle = (i / icons.length) * 2 * Math.PI;
                            const x = Math.cos(angle) * radius;
                            const y = Math.sin(angle) * radius;
                            const Icon = item.Icon;
                            return (
                                <motion.div
                                    key={item.id}
                                    className="absolute"
                                    initial={{ x: 0, y: 0, opacity: 0 }}
                                    animate={
                                        orbitStarted
                                            ? {
                                                x,
                                                y,
                                                opacity: 1,
                                                rotate: prefersReducedMotion ? 0 : [0, 360],
                                            }
                                            : { x: 0, y: 0, opacity: 0.5, rotate: 0 }
                                    }
                                    transition={{
                                        x: { duration: 0.5, ease: "easeOut" },
                                        y: { duration: 0.5, ease: "easeOut" },
                                        rotate: prefersReducedMotion
                                            ? undefined
                                            : {
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "linear",
                                                delay: i * 0.08,
                                            },
                                    }}
                                >
                                    <div
                                        className={`p-1.5 md:p-2 rounded-[14px] bg-white/95 backdrop-blur-md shadow-[0_4px_18px_rgba(0,0,0,0.08)] border ${RING_BORDER}/20`}
                                    >
                                        <motion.div
                                            className={`${FILL_BLUE} text-white rounded-[10px] p-1`}
                                            animate={prefersReducedMotion ? undefined : { y: [0, -2, 0] }}
                                            transition={
                                                prefersReducedMotion
                                                    ? undefined
                                                    : {
                                                        duration: 2.2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: i * 0.1,
                                                    }
                                            }
                                        >
                                            <Icon className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    {showFooter && (
                        <div className="w-full max-w-md mt-4 space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                                <motion.div
                                    className={`h-2.5 rounded-full ${FILL_BLUE}`}
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                />
                            </div>
                            <p className="text-center text-[11px] md:text-[13px] text-gray-600 font-medium">
                                Getting your dream home ready…
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThemeLoader;
