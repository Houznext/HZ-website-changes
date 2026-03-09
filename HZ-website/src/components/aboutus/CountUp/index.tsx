import React, { useEffect, useRef, useState } from "react";

type Props = {
    end: number;            // target value
    start?: number;         // default 0
    duration?: number;      // ms, default 1200
    decimals?: number;      // decimal places
    prefix?: string;        // e.g. ""
    suffix?: string;        // e.g. "+", "h"
    className?: string;
};

function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
}

function useInView(ref: React.RefObject<Element>, threshold = 0.35) {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        const io = new IntersectionObserver(
            ([entry]) => entry.isIntersecting && setInView(true),
            { threshold }
        );
        io.observe(ref.current);
        return () => io.disconnect();
    }, [ref, threshold]);
    return inView;
}

export function CountUp({
    end,
    start = 0,
    duration = 1200,
    decimals = 0,
    prefix = "",
    suffix = "",
    className,
}: Props) {
    const elRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(elRef, 0.35);
    const [val, setVal] = useState(start);

    const reduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    useEffect(() => {
        if (!inView) return;
        if (reduced || duration <= 0) {
            setVal(end);
            return;
        }
        let raf = 0;
        const t0 = performance.now();
        const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = easeOutCubic(p);
            setVal(start + (end - start) * eased);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, end, start, duration, reduced]);

    const formatted =
        decimals > 0
            ? (Math.round(val * 10 ** decimals) / 10 ** decimals).toFixed(decimals)
            : Math.round(val).toString();

    return (
        <span ref={elRef} className={className}>
            {prefix}
            {formatted}
            {suffix}
        </span>
    );
}


const IMPACT = [
    { label: "Homes Matched", end: 200, suffix: "+" },
    { label: "Cities Covered", end: 8, suffix: "+" },
    { label: "Avg. TAT", end: 48, suffix: "h" },
    { label: "Partner Network", end: 100, suffix: "+" },
];

export function ImpactStrip() {
    return (
        <section className="max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-8">
            <div className="text-center md:mb-6 mb-4">
                <h2 className="font-bold text-2xl md:text-[28px] text-[#3586FF]">Our Impact</h2>
                <p className="md:text-sm md:text-[12px] text-[#5E6470]">
                    OneCasa by the numbers.
                </p>
            </div>
            <div className="rounded-2xl bg-white border border-[#E9EEF7] overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#EEF2FA]">
                    {IMPACT.map((s) => (
                        <div key={s.label} className="md:px-8 px-4 md:py-4 py-2 text-center">
                            <div className="text-2xl md:text-3xl font-bold text-[#0b1220]">
                                <CountUp end={s.end} suffix={s.suffix} />
                            </div>
                            <div className="mt-2 text-xs md:text-sm font-medium text-[#6A7385]">
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

